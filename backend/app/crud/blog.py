"""crud/blog.py — CRUD operations for blog posts."""
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate
from app.crud.base import CRUDBase


class CRUDBlogPost(CRUDBase[BlogPost, BlogPostCreate, BlogPostUpdate]):
    def get_published(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None,
        featured_only: bool = False,
    ) -> List[BlogPost]:
        """Get published blog posts with filters."""
        query = db.query(BlogPost).filter(BlogPost.is_published == True)
        
        if category:
            query = query.filter(BlogPost.category == category)
        
        if search:
            query = query.filter(
                or_(
                    BlogPost.title.ilike(f"%{search}%"),
                    BlogPost.excerpt.ilike(f"%{search}%"),
                    BlogPost.content.ilike(f"%{search}%"),
                )
            )
        
        if featured_only:
            query = query.filter(BlogPost.is_featured == True)
        
        return query.order_by(desc(BlogPost.published_at)).offset(skip).limit(limit).all()
    
    def get_by_slug(self, db: Session, *, slug: str) -> Optional[BlogPost]:
        """Get blog post by slug."""
        return db.query(BlogPost).filter(BlogPost.slug == slug).first()
    
    def increment_views(self, db: Session, *, post_id: int) -> BlogPost:
        """Increment view count."""
        post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
        if post:
            post.view_count += 1
            db.commit()
            db.refresh(post)
        return post
    
    def publish(self, db: Session, *, post_id: int) -> BlogPost:
        """Publish a blog post."""
        post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
        if post:
            post.is_published = True
            post.published_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(post)
        return post
    
    def unpublish(self, db: Session, *, post_id: int) -> BlogPost:
        """Unpublish a blog post."""
        post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
        if post:
            post.is_published = False
            db.commit()
            db.refresh(post)
        return post
    
    def toggle_featured(self, db: Session, *, post_id: int) -> BlogPost:
        """Toggle featured status."""
        post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
        if post:
            post.is_featured = not post.is_featured
            db.commit()
            db.refresh(post)
        return post
    
    def get_categories(self, db: Session) -> List[str]:
        """Get all unique categories."""
        return [row[0] for row in db.query(BlogPost.category).distinct().all()]


crud_blog = CRUDBlogPost(BlogPost)
