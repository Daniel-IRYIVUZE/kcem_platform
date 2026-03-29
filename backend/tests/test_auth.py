"""tests/test_auth.py — Authentication endpoint tests."""
import pytest
from tests.conftest import make_user, auth_headers
from app.models.user import UserRole, UserStatus


class TestRegister:
    def test_register_success(self, client):
        res = client.post("/api/auth/register", json={
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "securepass123",
            "phone": "0788111111",
            "role": "business",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["email"] == "newuser@example.com"
        assert data["role"] == "business"
        assert "password_hash" not in data

    def test_register_duplicate_email(self, client, db):
        make_user(db, email="dup@example.com")
        res = client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "full_name": "Dup User",
            "password": "securepass123",
            "phone": "0788222222",
        })
        assert res.status_code in (400, 409)

    def test_register_short_password(self, client):
        res = client.post("/api/auth/register", json={
            "email": "short@example.com",
            "full_name": "Short Pass",
            "password": "short",
            "phone": "0788333333",
        })
        assert res.status_code == 422

    def test_register_invalid_phone(self, client):
        res = client.post("/api/auth/register", json={
            "email": "badphone@example.com",
            "full_name": "Bad Phone",
            "password": "goodpassword",
            "phone": "123",           # not 10 digits
        })
        assert res.status_code == 422

    def test_register_missing_fields(self, client):
        res = client.post("/api/auth/register", json={"email": "only@example.com"})
        assert res.status_code == 422


class TestLogin:
    def test_login_success(self, client, db):
        make_user(db, email="login@example.com", password="mypassword")
        res = client.post("/api/auth/login", json={
            "email": "login@example.com",
            "password": "mypassword",
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, db):
        make_user(db, email="wrongpw@example.com", password="correct")
        res = client.post("/api/auth/login", json={
            "email": "wrongpw@example.com",
            "password": "wrong",
        })
        assert res.status_code == 401

    def test_login_nonexistent_user(self, client):
        res = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "anypassword",
        })
        assert res.status_code == 401

    def test_login_suspended_user(self, client, db):
        make_user(db, email="suspended@example.com", password="pass1234",
                  status=UserStatus.suspended)
        res = client.post("/api/auth/login", json={
            "email": "suspended@example.com",
            "password": "pass1234",
        })
        # Login may succeed but accessing protected routes should fail
        assert res.status_code in (200, 403)


class TestGetMe:
    def test_get_me_authenticated(self, client, business_user, business_headers):
        res = client.get("/api/auth/me", headers=business_headers)
        assert res.status_code == 200
        assert res.json()["email"] == business_user.email

    def test_get_me_unauthenticated(self, client):
        res = client.get("/api/auth/me")
        assert res.status_code == 401

    def test_get_me_invalid_token(self, client):
        res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert res.status_code == 401


class TestRefreshToken:
    def test_refresh_token(self, client, db):
        make_user(db, email="refresh@example.com", password="pass1234")
        login = client.post("/api/auth/login", json={
            "email": "refresh@example.com", "password": "pass1234"
        })
        refresh_token = login.json()["refresh_token"]
        res = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_refresh_invalid_token(self, client):
        res = client.post("/api/auth/refresh", json={"refresh_token": "bad.token"})
        assert res.status_code == 401


class TestChangePassword:
    def test_change_password_success(self, client, db):
        u = make_user(db, email="chpw@example.com", password="oldpassword")
        headers = auth_headers(u)
        res = client.post("/api/auth/change-password", json={
            "current_password": "oldpassword",
            "new_password": "newpassword123",
        }, headers=headers)
        assert res.status_code == 200

    def test_change_password_wrong_current(self, client, db):
        u = make_user(db, email="chpw2@example.com", password="oldpassword")
        headers = auth_headers(u)
        res = client.post("/api/auth/change-password", json={
            "current_password": "wrongcurrent",
            "new_password": "newpassword123",
        }, headers=headers)
        assert res.status_code in (400, 401, 422)

    def test_change_password_unauthenticated(self, client):
        res = client.post("/api/auth/change-password", json={
            "current_password": "old", "new_password": "newpassword123"
        })
        assert res.status_code == 401
