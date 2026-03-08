"""crud/support.py — Support ticket CRUD operations."""
from sqlalchemy.orm import Session
from app.models.support import SupportTicket, TicketResponse
from app.schemas.support import SupportTicketCreate, SupportTicketUpdate, TicketResponseCreate


def create(db: Session, user_id: int, user_name: str, obj_in: SupportTicketCreate) -> SupportTicket:
    ticket = SupportTicket(
        user_id=user_id,
        subject=obj_in.subject,
        message=obj_in.message,
        priority=obj_in.priority or "medium",
    )
    db.add(ticket)
    db.flush()
    # Attach user_name as transient attribute for the response
    ticket.user_name = user_name
    db.commit()
    db.refresh(ticket)
    return ticket


def get(db: Session, ticket_id: int) -> SupportTicket | None:
    return db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()


def list_all(db: Session, status: str | None = None, priority: str | None = None,
             skip: int = 0, limit: int = 100) -> list[SupportTicket]:
    q = db.query(SupportTicket)
    if status:
        q = q.filter(SupportTicket.status == status)
    if priority:
        q = q.filter(SupportTicket.priority == priority)
    return q.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()


def list_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> list[SupportTicket]:
    return (db.query(SupportTicket)
            .filter(SupportTicket.user_id == user_id)
            .order_by(SupportTicket.created_at.desc())
            .offset(skip).limit(limit).all())


def update(db: Session, ticket_id: int, obj_in: SupportTicketUpdate) -> SupportTicket | None:
    ticket = get(db, ticket_id)
    if not ticket:
        return None
    if obj_in.status is not None:
        ticket.status = obj_in.status
    if obj_in.priority is not None:
        ticket.priority = obj_in.priority
    db.commit()
    db.refresh(ticket)
    return ticket


def add_response(db: Session, ticket_id: int, obj_in: TicketResponseCreate) -> TicketResponse:
    resp = TicketResponse(
        ticket_id=ticket_id,
        from_name=obj_in.from_name,
        message=obj_in.message,
    )
    db.add(resp)
    # Update ticket status to in_progress if still open
    ticket = get(db, ticket_id)
    if ticket and ticket.status == "open":
        ticket.status = "in_progress"
    db.commit()
    db.refresh(resp)
    return resp
