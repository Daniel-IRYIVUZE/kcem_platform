"""models/route.py — Route and RouteStop models."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, String, Enum as SAEnum, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class RouteStatus(str, enum.Enum):
    planned    = "planned"
    active     = "active"
    completed  = "completed"
    cancelled  = "cancelled"


class Route(Base):
    __tablename__ = "routes"

    id               = Column(Integer, primary_key=True, index=True)
    driver_id        = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    date             = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    status           = Column(SAEnum(RouteStatus), default=RouteStatus.planned)
    total_stops      = Column(Integer, default=0)
    completed_stops  = Column(Integer, default=0)
    total_distance   = Column(Float, nullable=True)       # km
    estimated_time   = Column(Integer, nullable=True)     # minutes
    actual_start     = Column(DateTime(timezone=True), nullable=True)
    actual_end       = Column(DateTime(timezone=True), nullable=True)
    notes            = Column(Text, nullable=True)
    created_at       = Column(DateTime(timezone=True), default=utc_now)
    updated_at       = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    driver      = relationship("Driver", back_populates="routes")
    stops       = relationship("RouteStop", back_populates="route", cascade="all, delete-orphan",
                               order_by="RouteStop.stop_order")
    collections = relationship("Collection", back_populates=None,
                               primaryjoin="Route.id == foreign(Collection.route_id)")


class StopStatus(str, enum.Enum):
    pending   = "pending"
    en_route  = "en_route"
    arrived   = "arrived"
    collected = "collected"
    skipped   = "skipped"


class RouteStop(Base):
    __tablename__ = "route_stops"

    id            = Column(Integer, primary_key=True, index=True)
    route_id      = Column(Integer, ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=True)
    stop_order    = Column(Integer, nullable=False)
    hotel_name    = Column(String(255), nullable=True)
    address       = Column(String(500), nullable=True)
    latitude      = Column(Float, nullable=True)
    longitude     = Column(Float, nullable=True)
    status        = Column(SAEnum(StopStatus), default=StopStatus.pending)
    estimated_arrival = Column(DateTime(timezone=True), nullable=True)
    actual_arrival    = Column(DateTime(timezone=True), nullable=True)
    distance_from_prev = Column(Float, nullable=True)   # km
    notes         = Column(Text, nullable=True)
    created_at    = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    route = relationship("Route", back_populates="stops")
