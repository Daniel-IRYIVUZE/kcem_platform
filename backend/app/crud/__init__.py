"""crud/__init__.py — Central exports for all CRUD instances."""
from app.crud.user import crud_user
from app.crud.hotel import crud_hotel
from app.crud.recycler import crud_recycler
from app.crud.driver import crud_driver, crud_vehicle
from app.crud.listing import crud_listing
from app.crud.bid import crud_bid
from app.crud.collection import crud_collection
from app.crud.transaction import crud_transaction
from app.crud.notification import crud_notification
from app.crud.message import crud_message
from app.crud.review import crud_review
from app.crud.inventory import crud_inventory
from app.crud.audit_log import crud_audit_log

__all__ = [
    "crud_user",
    "crud_hotel",
    "crud_recycler",
    "crud_driver",
    "crud_vehicle",
    "crud_listing",
    "crud_bid",
    "crud_collection",
    "crud_transaction",
    "crud_notification",
    "crud_message",
    "crud_review",
    "crud_inventory",
    "crud_audit_log",
]
