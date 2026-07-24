"""Tests for the new preferred_delivery_date field on /api/orders (iteration 4)."""
import os
import datetime as dt
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
ADMIN_PASSWORD = "mikate2025"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "X-Admin-Password": ADMIN_PASSWORD})
    return s


def _base_regular_payload(name: str = "TEST_QA_Date"):
    return {
        "customer_name": name,
        "phone": "438-555-0300",
        "address": "Sorel-Tracy",
        "order_type": "regular",
        "items": [
            {"product_id": "mikate-sucre", "product_name": "Mikaté Sucré",
             "quantity": 1, "option_label": "5 mikatés", "unit_price_cad": 5.0}
        ],
    }


def test_create_regular_order_with_preferred_date(session, admin_session):
    """POST /api/orders with preferred_delivery_date persists correctly + GET verifies."""
    target = (dt.date.today() + dt.timedelta(days=5)).isoformat()
    payload = _base_regular_payload("TEST_QA_Date_Present")
    payload["preferred_delivery_date"] = target

    r = session.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["preferred_delivery_date"] == target
    assert body["order_type"] == "regular"
    order_id = body["id"]

    # GET via admin to verify DB persistence
    r2 = admin_session.get(f"{API}/orders?limit=200")
    assert r2.status_code == 200
    matches = [o for o in r2.json() if o["id"] == order_id]
    assert len(matches) == 1
    assert matches[0]["preferred_delivery_date"] == target

    # cleanup
    admin_session.delete(f"{API}/orders/{order_id}")


def test_create_regular_order_without_preferred_date_null(session):
    """Optional field: omitting preferred_delivery_date returns null (200 OK)."""
    r = session.post(f"{API}/orders", json=_base_regular_payload("TEST_QA_Date_Empty"))
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("preferred_delivery_date") in (None, "")


def test_event_order_ignores_preferred_delivery_date(session):
    """Event orders should not carry preferred_delivery_date."""
    payload = _base_regular_payload("TEST_QA_Event_NoDate")
    payload["order_type"] = "event"
    payload["preferred_delivery_date"] = None  # frontend sends null for events
    payload["event_info"] = {
        "event_type": "Mariage",
        "attendees": 40,
        "event_date": "2026-09-15",
        "comments": "test",
    }
    r = session.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["order_type"] == "event"
    assert body.get("preferred_delivery_date") in (None, "")


def test_admin_login_ok():
    """Admin password mikate2025 is accepted."""
    r = requests.post(
        f"{API}/admin/login",
        headers={"X-Admin-Password": ADMIN_PASSWORD, "Content-Type": "application/json"},
    )
    assert r.status_code == 200
    assert r.json().get("ok") is True
