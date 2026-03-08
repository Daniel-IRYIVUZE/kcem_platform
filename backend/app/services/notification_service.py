"""services/notification_service.py — High-level notification helpers."""
from sqlalchemy.orm import Session
from app.crud.notification import crud_notification
from app.models.notification import NotificationType


def notify(db: Session, *, user_id: int, title: str, body: str,
           type: NotificationType = NotificationType.system,
           link: str | None = None) -> None:
    """Fire-and-forget notification push."""
    crud_notification.push(
        db,
        user_id=user_id,
        title=title,
        body=body,
        notif_type=type,
        link=link,
    )


def notify_bid_placed(db: Session, *, hotel_user_id: int, recycler_name: str,
                      listing_title: str, amount: float, listing_id: int) -> None:
    notify(db, user_id=hotel_user_id, title="New Bid Received",
           body=f"{recycler_name} placed a bid of RWF {amount:,.0f} on your listing '{listing_title}'.",
           type=NotificationType.new_bid, link=f"/listings/{listing_id}")


def notify_bid_accepted(db: Session, *, recycler_user_id: int, hotel_name: str,
                        listing_title: str, bid_id: int) -> None:
    notify(db, user_id=recycler_user_id, title="Bid Accepted!",
           body=f"{hotel_name} accepted your bid on '{listing_title}'.",
           type=NotificationType.bid_accepted, link=f"/bids/{bid_id}")


def notify_collection_status(db: Session, *, user_id: int, status: str,
                             collection_id: int) -> None:
    labels = {
        "en_route": "Driver is on the way",
        "arrived": "Driver has arrived",
        "collected": "Waste collected",
        "verified": "Collection verified",
        "completed": "Collection completed",
        "failed": "Collection failed",
    }
    label = labels.get(status, f"Status: {status}")
    ntype = NotificationType.collection_completed if status == "completed" else NotificationType.driver_en_route
    notify(db, user_id=user_id, title="Collection Update",
           body=label, type=ntype, link=f"/collections/{collection_id}")


def notify_payment_received(db: Session, *, user_id: int, amount: float,
                            transaction_id: int) -> None:
    notify(db, user_id=user_id, title="Payment Received",
           body=f"You received RWF {amount:,.0f}.",
           type=NotificationType.payment_received,
           link=f"/transactions/{transaction_id}")


def notify_driver_assigned(db: Session, *, driver_user_id: int, hotel_name: str,
                          waste_type: str, volume: float, collection_id: int) -> None:
    """Notify driver when assigned to a collection."""
    notify(db, user_id=driver_user_id, title="New Collection Assigned",
           body=f"{hotel_name} — {waste_type} ({volume}kg) needs collection.",
           type=NotificationType.collection_scheduled,
           link=f"/collections/{collection_id}")


def notify_bid_rejected(db: Session, *, recycler_user_id: int, hotel_name: str,
                        listing_title: str, reason: str | None = None) -> None:
    """Notify recycler when bid is rejected."""
    body = f"{hotel_name} rejected your bid on '{listing_title}'."
    if reason:
        body += f" {reason}"
    notify(db, user_id=recycler_user_id, title="Bid Rejected",
           body=body, type=NotificationType.bid_rejected)


