"""tests/test_support.py — Support ticket endpoint tests."""
import pytest

TICKET_PAYLOAD = {
    "subject": "My waste pickup was delayed",
    "message": "The driver never showed up for the scheduled collection.",
    "category": "collections",
}

PUBLIC_PAYLOAD = {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "0788123456",
    "subject": "Inquiry about registration",
    "message": "How do I register as a recycler?",
}


class TestPublicContactForm:
    def test_public_can_submit(self, client):
        res = client.post("/api/support/public", json=PUBLIC_PAYLOAD)
        assert res.status_code == 201

    def test_missing_required_fields(self, client):
        res = client.post("/api/support/public", json={"name": "Only Name"})
        assert res.status_code == 422


class TestCreateTicket:
    def test_authenticated_user_can_create(self, client, business_headers):
        res = client.post("/api/support/", json=TICKET_PAYLOAD, headers=business_headers)
        assert res.status_code == 201
        data = res.json()
        assert data["subject"] == TICKET_PAYLOAD["subject"]

    def test_unauthenticated_cannot_create(self, client):
        assert client.post("/api/support/", json=TICKET_PAYLOAD).status_code == 401


class TestListTickets:
    def test_admin_lists_all_tickets(self, client, admin_headers, business_headers):
        client.post("/api/support/", json=TICKET_PAYLOAD, headers=business_headers)
        res = client.get("/api/support/", headers=admin_headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_user_lists_own_tickets(self, client, business_headers):
        client.post("/api/support/", json=TICKET_PAYLOAD, headers=business_headers)
        res = client.get("/api/support/", headers=business_headers)
        assert res.status_code == 200

    def test_unauthenticated_blocked(self, client):
        assert client.get("/api/support/").status_code == 401


class TestGetTicket:
    def test_get_own_ticket(self, client, business_headers):
        ticket = client.post("/api/support/", json=TICKET_PAYLOAD,
                              headers=business_headers).json()
        res = client.get(f"/api/support/{ticket['id']}", headers=business_headers)
        assert res.status_code == 200
        assert res.json()["id"] == ticket["id"]

    def test_get_nonexistent_returns_404(self, client, business_headers):
        assert client.get("/api/support/99999", headers=business_headers).status_code == 404


class TestTicketResponse:
    def test_admin_can_respond(self, client, admin_headers, business_headers):
        ticket = client.post("/api/support/", json=TICKET_PAYLOAD,
                              headers=business_headers).json()
        res = client.post(f"/api/support/{ticket['id']}/responses",
                          json={"message": "We are looking into this."},
                          headers=admin_headers)
        assert res.status_code == 201

    def test_non_admin_cannot_respond(self, client, business_headers):
        ticket = client.post("/api/support/", json=TICKET_PAYLOAD,
                              headers=business_headers).json()
        res = client.post(f"/api/support/{ticket['id']}/responses",
                          json={"message": "Hack response"},
                          headers=business_headers)
        assert res.status_code == 403


class TestContactInfo:
    def test_contact_info_public(self, client):
        res = client.get("/api/support/contact-info")
        assert res.status_code == 200
