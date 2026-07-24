"""Backend tests focused on the new pricing (7/12/22, 5$ juices 300ml, combo 10$/9$)
and Nancy's new delivery scope (Sorel-Tracy 5 km, minimum 30 $)."""
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


@pytest.fixture(scope="module")
def products(session):
    r = session.get(f"{API}/products", timeout=30)
    assert r.status_code == 200
    return {p["id"]: p for p in r.json()}


# ===== MIKATÉ PRICING =====
MIKATE_IDS = [
    "mikate-sucre", "mikate-sale", "mikate-sucre-impalpable",
    "mikate-chocolat", "mikate-cannelle", "mikate-arachide",
]

EXPECTED_MIKATE_OPTIONS = {
    "5 mikatés": 7.0,
    "10 mikatés": 12.0,
    "20 mikatés": 22.0,
}


@pytest.mark.parametrize("pid", MIKATE_IDS)
def test_mikate_has_three_options_with_new_prices(products, pid):
    assert pid in products, f"Missing mikaté product {pid}"
    p = products[pid]
    opts = p["options"]
    assert len(opts) == 3, f"{pid} should have exactly 3 options, got {len(opts)}: {opts}"
    labels_to_price = {o["label"]: float(o["price_cad"]) for o in opts}
    assert labels_to_price == EXPECTED_MIKATE_OPTIONS, (
        f"{pid} options mismatch. Got {labels_to_price}"
    )
    # Ensure no old prices remain
    prices = set(labels_to_price.values())
    for forbidden in (5.0, 9.0, 17.0):
        assert forbidden not in prices, f"{pid} still has old price {forbidden}"


# ===== JUICE FORMAT + PRICE =====
JUICE_IDS = ["bissap-royal", "jus-tropical", "jus-gingembre"]


@pytest.mark.parametrize("pid", JUICE_IDS)
def test_juice_is_300ml_at_5cad(products, pid):
    assert pid in products, f"Missing juice product {pid}"
    p = products[pid]
    assert p.get("unit_note") == "300 ml", (
        f"{pid} unit_note should be '300 ml', got {p.get('unit_note')!r}"
    )
    opts = p["options"]
    assert len(opts) == 1, f"{pid} should have 1 option, got {len(opts)}"
    assert opts[0]["label"] == "300 ml"
    assert float(opts[0]["price_cad"]) == 5.0
    # Explicit no 355 anywhere
    text = (p.get("description") or "") + " " + (p.get("unit_note") or "")
    assert "355" not in text, f"{pid} still references 355: {text}"
    # No 4$ price residue
    assert float(opts[0]["price_cad"]) != 4.0


# ===== COMBOS =====
def test_combo_decouverte_10cad_bissap_300ml(products):
    p = products["combo-decouverte"]
    opts = p["options"]
    assert len(opts) == 1
    assert opts[0]["label"] == "5 Mikatés + 1 Bissap 300 ml"
    assert float(opts[0]["price_cad"]) == 10.0
    assert "300 ml" in p["description"]


def test_combo_gingembre_9cad_gingembre_300ml(products):
    p = products["combo-gingembre"]
    opts = p["options"]
    assert len(opts) == 1
    assert opts[0]["label"] == "5 Mikatés + 1 Gingembre 300 ml"
    assert float(opts[0]["price_cad"]) == 9.0
    assert "300 ml" in p["description"]


# ===== GLOBAL SANITY: no 355 ml or old numeric prices anywhere =====
def test_catalog_has_no_355ml_or_old_juice_prices(products):
    for pid, p in products.items():
        blob = (p.get("description") or "") + " " + (p.get("unit_note") or "") + " " + \
               " ".join(o["label"] for o in p["options"])
        assert "355" not in blob, f"{pid} still contains 355: {blob}"
        # Combos aside, no option should be priced at old bissap price 4.0
        if p["category"] == "Boissons":
            for o in p["options"]:
                assert float(o["price_cad"]) != 4.0, f"{pid} still priced at 4 $"


# ===== NANCY PROMPT — PRICE ANSWER =====
def test_nancy_returns_new_prices_no_355ml(session):
    payload = {
        "session_id": "qa-price-check",
        "message": "Quels sont vos prix pour les mikatés et le bissap ?",
        "history": [],
    }
    r = session.post(f"{API}/chat", json=payload, timeout=60)
    if r.status_code == 503:
        pytest.skip("EMERGENT_LLM_KEY not configured — skipping Nancy check")
    assert r.status_code == 200, r.text
    reply = r.json().get("reply", "")
    assert reply, "Empty reply from Nancy"
    print("\n[Nancy price reply]\n", reply)
    # Must mention new prices
    assert ("7 $" in reply) or ("7,00 $" in reply) or ("7$" in reply), \
        f"Missing 7$ in Nancy reply: {reply}"
    assert "12" in reply, f"Missing 12 (mikatés x10 price) in Nancy reply: {reply}"
    assert "22" in reply, f"Missing 22 (mikatés x20 price) in Nancy reply: {reply}"
    assert ("5 $" in reply) or ("5,00 $" in reply) or ("5$" in reply), \
        f"Missing 5$ (bissap price) in Nancy reply: {reply}"
    # Must NOT mention old prices with $ sign, nor 355 ml
    for forbidden in ("4 $", "4,00 $", "8 $", "8,00 $", "17 $", "17,00 $", "355 ml", "355ml"):
        assert forbidden not in reply, f"Nancy still mentions old value {forbidden!r}: {reply}"


# ===== NANCY PROMPT — DELIVERY ANSWER (updated: two-tier scope) =====
def test_nancy_delivery_answer_mentions_sorel_tracy_local_scope(session):
    """Nancy must mention Sorel-Tracy as the local regular scope. Extended
    zones (Rive-Sud, Rive-Nord, Montréal) are now allowed for events / large orders,
    so we no longer forbid them here."""
    payload = {
        "session_id": "qa-delivery-check",
        "message": "Où livrez-vous ?",
        "history": [],
    }
    r = session.post(f"{API}/chat", json=payload, timeout=60)
    if r.status_code == 503:
        pytest.skip("EMERGENT_LLM_KEY not configured — skipping Nancy check")
    assert r.status_code == 200, r.text
    reply = r.json().get("reply", "")
    assert reply, "Empty reply from Nancy"
    print("\n[Nancy delivery reply]\n", reply)
    assert "Sorel-Tracy" in reply, f"Missing 'Sorel-Tracy' in Nancy delivery reply: {reply}"
    # Laval / Longueuil should still NOT appear (never re-introduced)
    for forbidden in ("Laval", "Longueuil"):
        assert forbidden not in reply, f"Nancy mentions removed zone {forbidden!r}: {reply}"


# ===== ORDER SUBMISSION with new prices =====
def test_order_with_new_unit_prices_persists(session):
    payload = {
        "customer_name": "TEST_QA_Prix",
        "phone": "438-555-0500",
        "address": "Sorel-Tracy",
        "preferred_delivery_date": "2026-07-30",
        "items": [
            {
                "product_id": "combo-decouverte",
                "product_name": "Combo Découverte",
                "option_label": "5 Mikatés + 1 Bissap 300 ml",
                "quantity": 1,
                "unit_price_cad": 10.0,
            },
            {
                "product_id": "mikate-sucre",
                "product_name": "Mikaté Sucré",
                "option_label": "5 mikatés",
                "quantity": 1,
                "unit_price_cad": 7.0,
            },
        ],
    }
    r = session.post(f"{API}/orders", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["items"][0]["unit_price_cad"] == 10.0
    assert data["items"][1]["unit_price_cad"] == 7.0
    # Verify admin can list it back
    r2 = session.get(f"{API}/orders", headers={"X-Admin-Password": "mikate2025"}, timeout=30)
    assert r2.status_code == 200
    ids = [o["id"] for o in r2.json()]
    assert data["id"] in ids
