"""tests/test_bids.py — Bid lifecycle endpoint tests."""
import pytest
from tests.conftest import make_user, auth_headers
from app.models.user import UserRole, UserStatus

LISTING_PAYLOAD = {
    "title": "Glass Waste Batch",
    "waste_type": "Glass",
    "volume": 100.0,
    "unit": "kg",
    "min_bid": 3000.0,
}


@pytest.fixture()
def open_listing(client, business_headers):
    res = client.post("/api/listings/", json=LISTING_PAYLOAD, headers=business_headers)
    assert res.status_code == 201
    return res.json()


class TestPlaceBid:
    def test_recycler_can_bid(self, client, open_listing, recycler_headers):
        res = client.post("/api/bids/", json={
            "listing_id": open_listing["id"],
            "amount": 5000.0,
        }, headers=recycler_headers)
        assert res.status_code == 201
        data = res.json()
        assert data["amount"] == 5000.0
        assert data["status"] == "active"

    def test_business_cannot_bid(self, client, open_listing, business_headers):
        res = client.post("/api/bids/", json={
            "listing_id": open_listing["id"],
            "amount": 5000.0,
        }, headers=business_headers)
        assert res.status_code == 403

    def test_bid_below_min_rejected(self, client, open_listing, recycler_headers):
        res = client.post("/api/bids/", json={
            "listing_id": open_listing["id"],
            "amount": 100.0,   # below min_bid of 3000
        }, headers=recycler_headers)
        assert res.status_code in (400, 422)

    def test_bid_on_nonexistent_listing(self, client, recycler_headers):
        res = client.post("/api/bids/", json={
            "listing_id": 99999,
            "amount": 5000.0,
        }, headers=recycler_headers)
        assert res.status_code in (400, 404, 422)

    def test_unauthenticated_cannot_bid(self, client, open_listing):
        res = client.post("/api/bids/", json={
            "listing_id": open_listing["id"],
            "amount": 5000.0,
        })
        assert res.status_code == 401


class TestGetMyBids:
    def test_recycler_sees_own_bids(self, client, open_listing, recycler_headers):
        client.post("/api/bids/", json={"listing_id": open_listing["id"], "amount": 5000.0},
                    headers=recycler_headers)
        res = client.get("/api/bids/mine", headers=recycler_headers)
        assert res.status_code == 200
        assert len(res.json()) >= 1

    def test_requires_auth(self, client):
        assert client.get("/api/bids/mine").status_code == 401


class TestGetBidsForListing:
    def test_get_bids_for_listing(self, client, open_listing, recycler_headers):
        client.post("/api/bids/", json={"listing_id": open_listing["id"], "amount": 6000.0},
                    headers=recycler_headers)
        lid = open_listing["id"]
        res = client.get(f"/api/bids/listing/{lid}", headers=recycler_headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)


class TestAcceptBid:
    def test_business_can_accept_bid(self, client, open_listing,
                                      business_headers, recycler_headers):
        bid = client.post("/api/bids/", json={
            "listing_id": open_listing["id"], "amount": 5000.0
        }, headers=recycler_headers).json()
        res = client.post(f"/api/bids/{bid['id']}/accept", headers=business_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "accepted"

    def test_recycler_cannot_accept_bid(self, client, open_listing, recycler_headers):
        bid = client.post("/api/bids/", json={
            "listing_id": open_listing["id"], "amount": 5000.0
        }, headers=recycler_headers).json()
        res = client.post(f"/api/bids/{bid['id']}/accept", headers=recycler_headers)
        assert res.status_code == 403


class TestRejectBid:
    def test_business_can_reject_bid(self, client, open_listing,
                                      business_headers, recycler_headers):
        bid = client.post("/api/bids/", json={
            "listing_id": open_listing["id"], "amount": 5000.0
        }, headers=recycler_headers).json()
        res = client.post(f"/api/bids/{bid['id']}/reject", headers=business_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "rejected"

    def test_recycler_cannot_reject(self, client, open_listing, recycler_headers):
        bid = client.post("/api/bids/", json={
            "listing_id": open_listing["id"], "amount": 5000.0
        }, headers=recycler_headers).json()
        res = client.post(f"/api/bids/{bid['id']}/reject", headers=recycler_headers)
        assert res.status_code == 403


class TestWithdrawBid:
    def test_recycler_can_withdraw(self, client, open_listing, recycler_headers):
        bid = client.post("/api/bids/", json={
            "listing_id": open_listing["id"], "amount": 5000.0
        }, headers=recycler_headers).json()
        res = client.post(f"/api/bids/{bid['id']}/withdraw", headers=recycler_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "withdrawn"

    def test_business_cannot_withdraw(self, client, open_listing,
                                       business_headers, recycler_headers):
        bid = client.post("/api/bids/", json={
            "listing_id": open_listing["id"], "amount": 5000.0
        }, headers=recycler_headers).json()
        res = client.post(f"/api/bids/{bid['id']}/withdraw", headers=business_headers)
        assert res.status_code == 403


class TestIncreaseBid:
    def test_recycler_can_increase_bid(self, client, open_listing, recycler_headers):
        bid = client.post("/api/bids/", json={
            "listing_id": open_listing["id"], "amount": 5000.0
        }, headers=recycler_headers).json()
        res = client.patch(f"/api/bids/{bid['id']}/increase",
                           json={"amount": 7000.0}, headers=recycler_headers)
        assert res.status_code == 200
        assert res.json()["amount"] == 7000.0

    def test_cannot_decrease_via_increase(self, client, open_listing, recycler_headers):
        bid = client.post("/api/bids/", json={
            "listing_id": open_listing["id"], "amount": 5000.0
        }, headers=recycler_headers).json()
        res = client.patch(f"/api/bids/{bid['id']}/increase",
                           json={"amount": 1000.0}, headers=recycler_headers)
        assert res.status_code in (400, 422)
