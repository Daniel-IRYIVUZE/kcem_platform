"""tests/test_users.py — User management endpoint tests."""
from tests.conftest import make_user, auth_headers
from app.models.user import UserRole, UserStatus


class TestGetMe:
    def test_get_own_profile(self, client, business_user, business_headers):
        res = client.get("/api/users/me", headers=business_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == business_user.email
        assert data["role"] == "business"

    def test_requires_auth(self, client):
        assert client.get("/api/users/me").status_code == 401


class TestUpdateMe:
    def test_update_name(self, client, business_user, business_headers):
        res = client.patch("/api/users/me", json={"full_name": "Updated Name"},
                           headers=business_headers)
        assert res.status_code == 200
        assert res.json()["full_name"] == "Updated Name"

    def test_update_phone(self, client, business_user, business_headers):
        res = client.patch("/api/users/me", json={"phone": "0788999888"},
                           headers=business_headers)
        assert res.status_code == 200


class TestAdminListUsers:
    def test_admin_can_list_users(self, client, admin_headers, business_user):
        res = client.get("/api/users?limit=50", headers=admin_headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_non_admin_cannot_list_users(self, client, business_headers):
        res = client.get("/api/users?limit=50", headers=business_headers)
        assert res.status_code == 403

    def test_unauthenticated_cannot_list_users(self, client):
        assert client.get("/api/users?limit=50").status_code == 401

    def test_list_users_with_role_filter(self, client, admin_headers, recycler_user):
        res = client.get("/api/users?role=recycler&limit=50", headers=admin_headers)
        assert res.status_code == 200
        users = res.json()
        assert all(u["role"] == "recycler" for u in users)


class TestAdminGetUser:
    def test_admin_can_get_user(self, client, admin_headers, business_user):
        res = client.get(f"/api/users/{business_user.id}", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["id"] == business_user.id

    def test_admin_get_nonexistent_user(self, client, admin_headers):
        res = client.get("/api/users/99999", headers=admin_headers)
        assert res.status_code == 404

    def test_non_admin_blocked(self, client, business_headers, recycler_user):
        res = client.get(f"/api/users/{recycler_user.id}", headers=business_headers)
        assert res.status_code == 403


class TestAdminUpdateUser:
    def test_admin_can_update_user(self, client, db, admin_headers):
        u = make_user(db, email="toupdate@example.com", phone="0788111222")
        res = client.put(f"/api/users/{u.id}", json={"full_name": "Admin Updated"},
                         headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["full_name"] == "Admin Updated"


class TestAdminApproveUser:
    def test_admin_approve_user(self, client, db, admin_headers):
        u = make_user(db, email="pending@example.com", phone="0788333444",
                      status=UserStatus.pending)
        res = client.post(f"/api/users/{u.id}/approve", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "active"

    def test_non_admin_cannot_approve(self, client, db, business_headers):
        u = make_user(db, email="pending2@example.com", phone="0788555666",
                      status=UserStatus.pending)
        res = client.post(f"/api/users/{u.id}/approve", headers=business_headers)
        assert res.status_code == 403


class TestAdminSuspendUser:
    def test_admin_suspend_user(self, client, db, admin_headers):
        u = make_user(db, email="tosuspend@example.com", phone="0788777888")
        res = client.post(f"/api/users/{u.id}/suspend", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "suspended"


class TestAdminDeleteUser:
    def test_admin_delete_user(self, client, db, admin_headers):
        u = make_user(db, email="todelete@example.com", phone="0788000099")
        res = client.delete(f"/api/users/{u.id}", headers=admin_headers)
        assert res.status_code == 204

    def test_delete_nonexistent_returns_404(self, client, admin_headers):
        res = client.delete("/api/users/99999", headers=admin_headers)
        assert res.status_code == 404
