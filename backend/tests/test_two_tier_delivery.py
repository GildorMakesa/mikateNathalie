"""Iteration 6 — two-tier delivery scope:
   Tier 1 : Local Sorel-Tracy (~5 km, minimum 30 $)
   Tier 2 : Extended (Rive-Sud, Rive-Nord, Montréal, autres régions) for events/large orders,
            fees by distance/volume/needs.

Also acts as a regression on pricing + order submission.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL'):
                BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
                break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ============ Regression: pricing catalog still correct ============
def test_products_pricing_regression(session):
    r = session.get(f"{API}/products", timeout=30)
    assert r.status_code == 200
    data = r.json()
    prods = {p["id"]: p for p in data}
    # Mikatés 7/12/22
    for pid in [
        "mikate-sucre", "mikate-sale", "mikate-sucre-impalpable",
        "mikate-chocolat", "mikate-cannelle", "mikate-arachide",
    ]:
        opts = {o["label"]: float(o["price_cad"]) for o in prods[pid]["options"]}
        assert opts == {"5 mikatés": 7.0, "10 mikatés": 12.0, "20 mikatés": 22.0}, (pid, opts)
    # Juices 300 ml @ 5
    for pid in ["bissap-royal", "jus-tropical", "jus-gingembre"]:
        p = prods[pid]
        assert p["unit_note"] == "300 ml"
        assert len(p["options"]) == 1
        assert p["options"][0]["label"] == "300 ml"
        assert float(p["options"][0]["price_cad"]) == 5.0
    # Combos
    combo_d = prods["combo-decouverte"]
    assert float(combo_d["options"][0]["price_cad"]) == 10.0
    combo_g = prods["combo-gingembre"]
    assert float(combo_g["options"][0]["price_cad"]) == 9.0


# ============ Nancy — Montréal question -> should NOT flat-refuse ============
def test_nancy_montreal_answer_mentions_events_or_large_orders(session):
    payload = {
        "session_id": "qa-delivery-v2",
        "message": "Est-ce que vous livrez à Montréal ?",
        "history": [],
    }
    r = session.post(f"{API}/chat", json=payload, timeout=60)
    if r.status_code == 503:
        pytest.skip("EMERGENT_LLM_KEY not configured")
    assert r.status_code == 200, r.text
    reply = r.json().get("reply", "")
    print("\n[Nancy Montréal reply]\n", reply)
    assert reply, "Empty reply"

    low = reply.lower()

    # Must NOT flat-out refuse (e.g., "non, nous ne livrons qu'à Sorel-Tracy")
    forbidden_phrases = [
        "nous ne livrons qu'à sorel-tracy",
        "uniquement à sorel-tracy",
        "seulement à sorel-tracy",
        "uniquement dans un rayon",
        "limitée au rayon",
    ]
    for fp in forbidden_phrases:
        assert fp not in low, f"Nancy gave a restrictive answer containing {fp!r}: {reply}"

    # Must indicate that events / large orders are possible → look for at least ONE marker
    event_markers = [
        "événement", "evenement", "grande commande", "grandes commandes",
        "entreprise", "entreprises", "groupe", "groupes", "occasion",
    ]
    assert any(m in low for m in event_markers), (
        f"Nancy reply must reference events/large orders: {reply}"
    )

    # Should indicate distance/volume/besoins-based pricing OR "soumission"
    pricing_markers = ["distance", "volume", "besoin", "soumission", "sur demande", "personnalis"]
    assert any(m in low for m in pricing_markers), (
        f"Nancy reply must mention custom pricing/quote basis: {reply}"
    )


# ============ Nancy — small local order -> should push toward 30 $ minimum ============
def test_nancy_small_order_mentions_30_minimum(session):
    payload = {
        "session_id": "qa-delivery-v2-small",
        "message": "Livraison à Sorel-Tracy pour une commande de 4 mikatés ?",
        "history": [],
    }
    r = session.post(f"{API}/chat", json=payload, timeout=60)
    if r.status_code == 503:
        pytest.skip("EMERGENT_LLM_KEY not configured")
    assert r.status_code == 200, r.text
    reply = r.json().get("reply", "")
    print("\n[Nancy small-order reply]\n", reply)
    assert reply, "Empty reply"

    assert "Sorel-Tracy" in reply or "sorel-tracy" in reply.lower(), (
        f"Nancy reply must mention Sorel-Tracy: {reply}"
    )
    assert ("30 $" in reply) or ("30,00 $" in reply) or ("30$" in reply) or \
        ("30\u00a0$" in reply) or ("30 dollars" in reply.lower()), (
        f"Nancy reply must mention 30 $ minimum: {reply}"
    )


# ============ Order submission regression ============
def test_order_submit_regression(session):
    payload = {
        "customer_name": "TEST_QA Livraison v2",
        "phone": "438-555-0777",
        "address": "Sorel-Tracy",
        "preferred_delivery_date": "2026-08-15",
        "items": [
            {
                "product_id": "combo-decouverte",
                "product_name": "Combo Découverte",
                "option_label": "5 Mikatés + 1 Bissap 300 ml",
                "quantity": 1,
                "unit_price_cad": 10.0,
            },
        ],
    }
    r = session.post(f"{API}/orders", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["items"][0]["unit_price_cad"] == 10.0
    assert data["customer_name"] == "TEST_QA Livraison v2"
    assert "id" in data and data["id"]

    # Verify persistence
    r2 = session.get(
        f"{API}/orders", headers={"X-Admin-Password": "mikate2025"}, timeout=30
    )
    assert r2.status_code == 200
    ids = [o["id"] for o in r2.json()]
    assert data["id"] in ids, "Order not persisted"
