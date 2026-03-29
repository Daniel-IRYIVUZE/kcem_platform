"""tests/test_notifications.py — Notification endpoint tests."""
from app.models.notification import Notification, NotificationType


def _seed_notification(db, user_id: int, message="Test notification",
                       notif_type="system"):
    notif = Notification(
        user_id=user_id,
        type=NotificationType(notif_type),
        title="Test notification",
        body=message,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


class TestListNotifications:
    def test_authenticated_can_list(self, client, business_user, business_headers, db):
        _seed_notification(db, business_user.id, "Hello notification")
        res = client.get("/api/notifications", headers=business_headers)
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert any(n["body"] == "Hello notification" for n in data)

    def test_unauthenticated_blocked(self, client):
        assert client.get("/api/notifications").status_code == 401

    def test_only_own_notifications(self, client, business_user, recycler_user,
                                     business_headers, db):
        _seed_notification(db, recycler_user.id, "Recycler only notif")
        res = client.get("/api/notifications", headers=business_headers)
        assert res.status_code == 200
        bodies = [n["body"] for n in res.json()]
        assert "Recycler only notif" not in bodies


class TestUnreadCount:
    def test_unread_count(self, client, business_user, business_headers, db):
        _seed_notification(db, business_user.id, "Unread 1")
        _seed_notification(db, business_user.id, "Unread 2")
        res = client.get("/api/notifications/unread-count", headers=business_headers)
        assert res.status_code == 200
        assert res.json()["count"] >= 2

    def test_requires_auth(self, client):
        assert client.get("/api/notifications/unread-count").status_code == 401


class TestMarkRead:
    def test_mark_single_read(self, client, business_user, business_headers, db):
        notif = _seed_notification(db, business_user.id, "Mark me read")
        res = client.post(f"/api/notifications/{notif.id}/read", headers=business_headers)
        assert res.status_code == 200

    def test_mark_all_read(self, client, business_user, business_headers, db):
        _seed_notification(db, business_user.id, "N1")
        _seed_notification(db, business_user.id, "N2")
        res = client.post("/api/notifications/read-all", headers=business_headers)
        assert res.status_code == 200
        data = res.json()
        assert "marked" in data

    def test_mark_other_users_notification_blocked(self, client, recycler_user,
                                                    business_headers, db):
        notif = _seed_notification(db, recycler_user.id, "Not yours")
        res = client.post(f"/api/notifications/{notif.id}/read", headers=business_headers)
        assert res.status_code in (403, 404)
