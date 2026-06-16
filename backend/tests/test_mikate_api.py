"""Backend tests for Délices Mikaté Royal API."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # fallback for backend test environment
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


# ===== Health / root =====
def test_root_message(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# ===== Products =====
def test_products_list(session):
    r = session.get(f"{API}/products")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 6
    names = {p["name"] for p in data}
    expected = {"Mikaté Sucré", "Mikaté Salé", "Bissap Royal",
                "Jus Tropical", "Gingembre Citron", "Plateau Découverte"}
    assert expected.issubset(names)
    for p in data:
        assert {"id", "name", "category", "description", "price_xof", "image_url"} <= set(p.keys())
        assert isinstance(p["price_xof"], int) and p["price_xof"] > 0


# ===== Testimonials =====
def test_testimonials_list(session):
    r = session.get(f"{API}/testimonials")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 3
    for t in data:
        assert {"id", "name", "role", "quote", "avatar_url", "rating"} <= set(t.keys())


# ===== Orders =====
def test_create_order_success(session):
    payload = {
        "customer_name": "TEST_Aminata",
        "phone": "+22912345678",
        "email": "test_amina@example.com",
        "address": "Cotonou, quartier Cadjehoun",
        "items": [
            {"product_id": "mikate-sucre", "product_name": "Mikaté Sucré", "quantity": 2},
            {"product_id": "bissap-royal", "product_name": "Bissap Royal", "quantity": 1},
        ],
        "message": "Livraison samedi"
    }
    r = session.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
    assert data["customer_name"] == "TEST_Aminata"
    assert data["email_sent"] is False  # placeholder Resend key
    assert data["status"] == "pending"
    assert len(data["items"]) == 2
    # store for next test
    pytest.created_order_id = data["id"]


def test_create_order_empty_body_422(session):
    r = session.post(f"{API}/orders", json={})
    assert r.status_code == 422


def test_create_order_empty_items_422(session):
    payload = {
        "customer_name": "TEST_NoItems",
        "phone": "+22900000000",
        "address": "Adresse test",
        "items": []
    }
    r = session.post(f"{API}/orders", json=payload)
    assert r.status_code == 422


def test_list_orders_contains_created(session):
    r = session.get(f"{API}/orders")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Newest first
    created_id = getattr(pytest, "created_order_id", None)
    if created_id:
        assert data[0]["id"] == created_id
    # Ensure no _id leak
    for o in data:
        assert "_id" not in o
