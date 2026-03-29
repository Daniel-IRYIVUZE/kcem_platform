"""tests/test_listings.py — Waste listing endpoint tests."""
import pytest
from tests.conftest import make_user, auth_headers
from app.models.user import UserRole

LISTING_PAYLOAD = {
    "title": "Plastic Waste Batch",
    "waste_type": "Plastic",
    "volume": 50.0,
    "unit": "kg",
    "min_bid": 5000.0,
    "description": "Clean plastic waste",
}


class TestCreateListing:
    def test_business_can_create(self, client, business_headers):
        res = client.post("/api/listings/", json=LISTING_PAYLOAD, headers=business_headers)
        assert res.status_code == 201
        data = res.json()
        assert data["waste_type"] == "Plastic"
        assert data["volume"] == 50.0
        assert data["min_bid"] == 5000.0

    def test_recycler_cannot_create(self, client, recycler_headers):
        res = client.post("/api/listings/", json=LISTING_PAYLOAD, headers=recycler_headers)
        assert res.status_code == 403

    def test_unauthenticated_cannot_create(self, client):
        res = client.post("/api/listings/", json=LISTING_PAYLOAD)
        assert res.status_code == 401

    def test_missing_waste_type(self, client, business_headers):
        payload = {k: v for k, v in LISTING_PAYLOAD.items() if k != "waste_type"}
        res = client.post("/api/listings/", json=payload, headers=business_headers)
        assert res.status_code == 422


class TestListListings:
    def test_public_can_list(self, client):
        res = client.get("/api/listings/")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_list_with_filters(self, client):
        res = client.get("/api/listings/?waste_type=Plastic&status=open")
        assert res.status_code == 200

    def test_list_with_pagination(self, client):
        res = client.get("/api/listings/?skip=0&limit=10")
        assert res.status_code == 200


class TestGetListing:
    def test_get_existing_listing(self, client, business_headers):
        create = client.post("/api/listings/", json=LISTING_PAYLOAD, headers=business_headers)
        listing_id = create.json()["id"]
        res = client.get(f"/api/listings/{listing_id}")
        assert res.status_code == 200
        assert res.json()["id"] == listing_id

    def test_get_nonexistent_listing(self, client):
        res = client.get("/api/listings/99999")
        assert res.status_code == 404


class TestUpdateListing:
    def test_owner_can_update(self, client, business_headers):
        create = client.post("/api/listings/", json=LISTING_PAYLOAD, headers=business_headers)
        lid = create.json()["id"]
        res = client.patch(f"/api/listings/{lid}",
                           json={"description": "Updated description"},
                           headers=business_headers)
        assert res.status_code == 200
        assert res.json()["description"] == "Updated description"

    def test_other_user_cannot_update(self, client, db, business_headers):
        create = client.post("/api/listings/", json=LISTING_PAYLOAD, headers=business_headers)
        lid = create.json()["id"]
        other = make_user(db, email="other@example.com", phone="0788100200",
                          role=UserRole.business)
        other_headers = auth_headers(other)
        res = client.patch(f"/api/listings/{lid}", json={"description": "Hack"},
                           headers=other_headers)
        assert res.status_code in (403, 404)


class TestDeleteListing:
    def test_owner_can_delete(self, client, business_headers):
        create = client.post("/api/listings/", json=LISTING_PAYLOAD, headers=business_headers)
        lid = create.json()["id"]
        res = client.delete(f"/api/listings/{lid}", headers=business_headers)
        assert res.status_code == 204

    def test_delete_nonexistent(self, client, business_headers):
        res = client.delete("/api/listings/99999", headers=business_headers)
        assert res.status_code == 404


class TestMyListings:
    def test_get_own_listings(self, client, business_headers):
        client.post("/api/listings/", json=LISTING_PAYLOAD, headers=business_headers)
        res = client.get("/api/listings/mine", headers=business_headers)
        assert res.status_code == 200
        assert len(res.json()) >= 1

    def test_requires_auth(self, client):
        assert client.get("/api/listings/mine").status_code == 401
