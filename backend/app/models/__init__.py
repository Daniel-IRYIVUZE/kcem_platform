"""models/__init__.py — Export all models for easy import."""
from app.models.user import User, Role, UserDocument
from app.models.hotel import Hotel
from app.models.recycler import Recycler
from app.models.driver import Driver, Vehicle
from app.models.listing import WasteListing, ListingImage
from app.models.bid import Bid
from app.models.collection import Collection, CollectionProof
from app.models.route import Route, RouteStop
from app.models.transaction import Transaction, Payment
from app.models.notification import Notification
from app.models.message import Message, Conversation
from app.models.review import Review
from app.models.inventory import InventoryItem
from app.models.green_score import GreenScore
from app.models.audit_log import AuditLog
from app.models.system_settings import SystemSettings
from app.models.blog import BlogPost

__all__ = [
    "User", "Role", "UserDocument",
    "Hotel",
    "Recycler",
    "Driver", "Vehicle",
    "WasteListing", "ListingImage",
    "Bid",
    "Collection", "CollectionProof",
    "Route", "RouteStop",
    "Transaction", "Payment",
    "Notification",
    "Message", "Conversation",
    "Review",
    "InventoryItem",
    "GreenScore",
    "AuditLog",
    "SystemSettings",
    "BlogPost",
]
