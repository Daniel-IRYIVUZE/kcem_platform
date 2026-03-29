"""tests/test_blog.py — Blog endpoint tests."""
import pytest

POST_PAYLOAD = {
    "title": "Test Blog Post",
    "slug": "test-blog-post",
    "content": "This is the content of the test blog post. It is long enough.",
    "excerpt": "Short excerpt",
    "category": "Sustainability",
    "author_display_name": "EcoTrade Team",
    "is_published": True,
}


@pytest.fixture()
def blog_post(client, admin_headers):
    res = client.post("/api/blog/", json=POST_PAYLOAD, headers=admin_headers)
    assert res.status_code == 201, res.text
    return res.json()


class TestListBlogPosts:
    def test_public_can_list(self, client, blog_post):
        res = client.get("/api/blog/")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_list_only_returns_published(self, client, admin_headers):
        # Create unpublished post
        client.post("/api/blog/", json={**POST_PAYLOAD,
                                         "slug": "unpublished-post",
                                         "title": "Unpublished",
                                         "is_published": False},
                    headers=admin_headers)
        res = client.get("/api/blog/")
        assert all(p["is_published"] for p in res.json())


class TestGetBlogPost:
    def test_get_by_id(self, client, blog_post):
        res = client.get(f"/api/blog/{blog_post['id']}")
        assert res.status_code == 200
        assert res.json()["title"] == POST_PAYLOAD["title"]

    def test_get_by_slug(self, client, blog_post):
        res = client.get(f"/api/blog/slug/{POST_PAYLOAD['slug']}")
        assert res.status_code == 200
        assert res.json()["slug"] == POST_PAYLOAD["slug"]

    def test_nonexistent_returns_404(self, client):
        assert client.get("/api/blog/99999").status_code == 404

    def test_nonexistent_slug_returns_404(self, client):
        assert client.get("/api/blog/slug/no-such-slug").status_code == 404


class TestGetCategories:
    def test_categories_endpoint(self, client, blog_post):
        res = client.get("/api/blog/categories")
        assert res.status_code == 200
        assert isinstance(res.json(), list)


class TestCreateBlogPost:
    def test_admin_can_create(self, client, admin_headers):
        res = client.post("/api/blog/", json={**POST_PAYLOAD, "slug": "new-unique-slug"},
                          headers=admin_headers)
        assert res.status_code == 201
        assert res.json()["title"] == POST_PAYLOAD["title"]

    def test_non_admin_cannot_create(self, client, business_headers):
        res = client.post("/api/blog/", json=POST_PAYLOAD, headers=business_headers)
        assert res.status_code == 403

    def test_unauthenticated_cannot_create(self, client):
        assert client.post("/api/blog/", json=POST_PAYLOAD).status_code == 401


class TestUpdateBlogPost:
    def test_admin_can_update(self, client, blog_post, admin_headers):
        res = client.patch(f"/api/blog/{blog_post['id']}",
                           json={"title": "Updated Title"},
                           headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["title"] == "Updated Title"

    def test_non_admin_cannot_update(self, client, blog_post, business_headers):
        res = client.patch(f"/api/blog/{blog_post['id']}",
                           json={"title": "Hack"}, headers=business_headers)
        assert res.status_code == 403


class TestPublishUnpublish:
    def test_admin_can_publish(self, client, admin_headers):
        post = client.post("/api/blog/",
                           json={**POST_PAYLOAD, "slug": "draft-to-pub", "is_published": False},
                           headers=admin_headers).json()
        res = client.post(f"/api/blog/{post['id']}/publish", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["is_published"] is True

    def test_admin_can_unpublish(self, client, blog_post, admin_headers):
        res = client.post(f"/api/blog/{blog_post['id']}/unpublish", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["is_published"] is False


class TestDeleteBlogPost:
    def test_admin_can_delete(self, client, admin_headers):
        post = client.post("/api/blog/",
                           json={**POST_PAYLOAD, "slug": "to-delete"},
                           headers=admin_headers).json()
        res = client.delete(f"/api/blog/{post['id']}", headers=admin_headers)
        assert res.status_code == 204

    def test_non_admin_cannot_delete(self, client, blog_post, business_headers):
        assert client.delete(f"/api/blog/{blog_post['id']}",
                             headers=business_headers).status_code == 403


class TestAdminAllPosts:
    def test_admin_all_returns_published_and_drafts(self, client, admin_headers):
        client.post("/api/blog/", json={**POST_PAYLOAD, "slug": "draft-all",
                                         "is_published": False}, headers=admin_headers)
        res = client.get("/api/blog/admin/all", headers=admin_headers)
        assert res.status_code == 200
        statuses = {p["is_published"] for p in res.json()}
        assert False in statuses  # drafts included

    def test_non_admin_blocked(self, client, business_headers):
        assert client.get("/api/blog/admin/all",
                          headers=business_headers).status_code == 403
