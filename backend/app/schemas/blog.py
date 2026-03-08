"""schemas/blog.py — Blog post schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    excerpt: Optional[str] = None
    content: str = Field(..., min_length=1)
    featured_image: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    tags: Optional[str] = None
    is_published: bool = False
    is_featured: bool = False
    author_display_name: Optional[str] = None  # public display name override


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    excerpt: Optional[str] = None
    content: Optional[str] = Field(None, min_length=1)
    featured_image: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    tags: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    author_display_name: Optional[str] = None


class BlogPostRead(BlogPostBase):
    id: int
    author_id: int
    view_count: int
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Nested author info
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    author_display_name: Optional[str] = None

    class Config:
        from_attributes = True
