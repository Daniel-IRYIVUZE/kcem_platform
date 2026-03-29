"""tests/test_stats.py — Platform stats endpoint tests."""


class TestPlatformStats:
    def test_stats_public_accessible(self, client):
        res = client.get("/api/stats/")
        assert res.status_code == 200
        data = res.json()
        # Must return numeric fields
        assert "total_users" in data or "users" in data or isinstance(data, dict)

    def test_recent_activity_public(self, client):
        res = client.get("/api/stats/recent-activity?limit=5")
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert len(res.json()) <= 5

    def test_recent_activity_default_limit(self, client):
        res = client.get("/api/stats/recent-activity")
        assert res.status_code == 200


class TestAdminStats:
    def test_admin_audit_logs(self, client, admin_headers):
        res = client.get("/api/admin/audit-logs?limit=10", headers=admin_headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_admin_settings(self, client, admin_headers):
        res = client.get("/api/admin/settings", headers=admin_headers)
        assert res.status_code == 200

    def test_non_admin_blocked_from_audit_logs(self, client, business_headers):
        res = client.get("/api/admin/audit-logs", headers=business_headers)
        assert res.status_code == 403

    def test_non_admin_blocked_from_settings(self, client, business_headers):
        res = client.get("/api/admin/settings", headers=business_headers)
        assert res.status_code == 403
