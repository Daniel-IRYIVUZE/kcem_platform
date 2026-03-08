"""models/blog.py — Blog posts and news articles."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id           = Column(Integer, primary_key=True, index=True)
    author_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title        = Column(String(255), nullable=False)
    slug         = Column(String(255), unique=True, nullable=False, index=True)
    excerpt      = Column(Text, nullable=True)
    content      = Column(Text, nullable=False)
    featured_image = Column(String(500), nullable=True)
    category     = Column(String(100), nullable=False)  # sustainability, recycling, news, case-study
    tags         = Column(Text, nullable=True)  # comma-separated
    is_published = Column(Boolean, default=False)
    is_featured  = Column(Boolean, default=False)
    view_count   = Column(Integer, default=0)
    author_display_name = Column(String(150), nullable=True)  # override author shown publicly
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), default=utc_now)
    updated_at   = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    author = relationship("User", back_populates="blog_posts")
