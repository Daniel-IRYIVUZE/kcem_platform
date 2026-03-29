"""routes/blog.py — Blog post endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostRead
from app.crud.blog import crud_blog
from app.auth.dependencies import get_current_user, require_role, require_admin

router = APIRouter(prefix="/blog", tags=["Blog"])


# ── Helper ────────────────────────────────────────────────────────────────────

def _to_read(post: BlogPost) -> BlogPostRead:
    """Convert BlogPost ORM object → BlogPostRead schema.
    `author_display_name` (if set) takes priority over the user's real name."""
    d = {k: v for k, v in post.__dict__.items() if not k.startswith("_")}
    public_name = post.author_display_name or (
        post.author.full_name if post.author else "EcoTrade Team"
    )
    return BlogPostRead(
        **d,
        author_name=public_name,
        author_email=post.author.email if post.author else "",
    )


# ── Public Routes ─────────────────────────────────────────────────────────────

@router.get("/", response_model=List[BlogPostRead])
def get_blog_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured_only: bool = False,
    db: Session = Depends(get_db),
):
    """Get published blog posts (public)."""
    posts = crud_blog.get_published(
        db,
        skip=skip,
        limit=limit,
        category=category,
        search=search,
        featured_only=featured_only,
    )
    return [_to_read(p) for p in posts]


@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Get all blog categories (public)."""
    return crud_blog.get_categories(db)


@router.get("/admin/all", response_model=List[BlogPostRead], dependencies=[Depends(require_admin)])
def get_all_posts_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Get all blog posts including unpublished (admin only)."""
    posts = crud_blog.get_multi(db, skip=skip, limit=limit)
    return [_to_read(p) for p in posts]


@router.get("/slug/{slug}", response_model=BlogPostRead)
def get_post_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get blog post by slug (public)."""
    post = crud_blog.get_by_slug(db, slug=slug)
    if not post or not post.is_published:
        raise HTTPException(status_code=404, detail="Blog post not found")
    crud_blog.increment_views(db, post_id=post.id)
    return _to_read(post)


@router.get("/{post_id}", response_model=BlogPostRead)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get blog post by ID."""
    post = crud_blog.get(db, id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return _to_read(post)


# ── Admin Routes ─────────────────────────────────────────────────────────────


@router.post("/", response_model=BlogPostRead, status_code=201, dependencies=[Depends(require_admin)])
def create_post(
    post_in: BlogPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new blog post (admin only)."""
    # Auto-generate slug from title if not provided
    import re
    if not post_in.slug:
        post_in.slug = re.sub(r'[^a-z0-9]+', '-', post_in.title.lower()).strip('-')

    # Check if slug already exists
    existing = crud_blog.get_by_slug(db, slug=post_in.slug)
    if existing:
        # Append a counter to make it unique
        base_slug = post_in.slug
        counter = 1
        while existing:
            post_in.slug = f"{base_slug}-{counter}"
            existing = crud_blog.get_by_slug(db, slug=post_in.slug)
            counter += 1
    
    post = crud_blog.create(db, obj_in=post_in, author_id=current_user.id)
    return _to_read(post)


@router.patch("/{post_id}", response_model=BlogPostRead, dependencies=[Depends(require_admin)])
def update_post(
    post_id: int,
    post_in: BlogPostUpdate,
    db: Session = Depends(get_db),
):
    """Update a blog post (admin only)."""
    post = crud_blog.get(db, id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Check slug uniqueness if being updated
    if post_in.slug and post_in.slug != post.slug:
        existing = crud_blog.get_by_slug(db, slug=post_in.slug)
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")
    
    updated = crud_blog.update(db, db_obj=post, obj_in=post_in)
    return _to_read(updated)


@router.delete("/{post_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a blog post (admin only)."""
    post = crud_blog.get(db, id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    crud_blog.remove(db, id=post_id)
    return Response(status_code=204)


@router.post("/{post_id}/publish", response_model=BlogPostRead, dependencies=[Depends(require_admin)])
def publish_post(post_id: int, db: Session = Depends(get_db)):
    """Publish a blog post (admin only)."""
    post = crud_blog.publish(db, post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return _to_read(post)


@router.post("/{post_id}/unpublish", response_model=BlogPostRead, dependencies=[Depends(require_admin)])
def unpublish_post(post_id: int, db: Session = Depends(get_db)):
    """Unpublish a blog post (admin only)."""
    post = crud_blog.unpublish(db, post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return _to_read(post)


@router.post("/{post_id}/toggle-featured", response_model=BlogPostRead, dependencies=[Depends(require_admin)])
def toggle_featured(post_id: int, db: Session = Depends(get_db)):
    """Toggle featured status (admin only)."""
    post = crud_blog.toggle_featured(db, post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return _to_read(post)



