"""routes/support.py — Support ticket endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Any
from app.database import get_db
from app.crud import support as crud_support
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.support import (
    SupportTicketCreate, SupportTicketUpdate,
    TicketResponseCreate,
)
from app.models.user import User, UserRole
from app.services.email_service import (
    send_support_ticket_created_email,
    send_support_ticket_response_email,
)
from app.config import settings

router = APIRouter(prefix="/support", tags=["Support"])


class PublicContactPayload(BaseModel):
    name: str
    email: str
    phone: str | None = None
    user_type: str | None = None
    subject: str
    message: str


def _ticket_to_dict(ticket) -> dict:
    return {
        "id": ticket.id,
        "user_id": ticket.user_id,
        "user_name": ticket.user.full_name if ticket.user else "Unknown",
        "subject": ticket.subject,
        "message": ticket.message,
        "status": ticket.status,
        "priority": ticket.priority,
        "created_at": ticket.created_at.isoformat(),
        "updated_at": ticket.updated_at.isoformat(),
        "responses": [
            {
                "id": r.id,
                "ticket_id": r.ticket_id,
                "from_name": r.from_name,
                "message": r.message,
                "created_at": r.created_at.isoformat(),
            }
            for r in ticket.responses
        ],
    }


@router.post("/public", status_code=201)
def create_public_ticket(payload: PublicContactPayload, db: Session = Depends(get_db)) -> Any:
    """Public contact form — no authentication required.

    Creates a support ticket as a guest user and notifies the admin by email.
    """
    # Determine priority from subject keywords
    priority = "low"
    subj_lower = payload.subject.lower()
    if "urgent" in subj_lower:
        priority = "urgent"
    elif "billing" in subj_lower:
        priority = "high"
    elif payload.user_type in ("Business/Restaurant", "Recycling Company"):
        priority = "medium"

    # Enrich the message with sender context
    context = f"[From: {payload.name} <{payload.email}>]"
    if payload.phone:
        context += f" [Phone: {payload.phone}]"
    if payload.user_type:
        context += f" [Type: {payload.user_type}]"
    full_message = f"{context}\n\n{payload.message}"

    ticket = crud_support.create(
        db,
        user_id=None,  # guest — no user account
        user_name=payload.name,
        obj_in=SupportTicketCreate(
            subject=payload.subject,
            message=full_message,
            priority=priority,
        ),
    )

    # Email admin
    admin_email = getattr(settings, "ADMIN_EMAIL", settings.EMAIL_FROM)
    if admin_email:
        send_support_ticket_created_email(
            admin_email=admin_email,
            ticket_id=ticket.id,
            user_name=payload.name,
            user_email=payload.email,
            subject=payload.subject,
            message=payload.message,
            priority=priority,
        )

    return {"id": ticket.id, "status": ticket.status, "message": "Ticket created successfully."}


@router.get("/")
def list_tickets(
    status: str | None = None,
    priority: str | None = None,
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    if current_user.role == UserRole.admin:
        tickets = crud_support.list_all(db, status=status, priority=priority, skip=skip, limit=limit)
    else:
        tickets = crud_support.list_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return [_ticket_to_dict(t) for t in tickets]


@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_active_user)) -> Any:
    ticket = crud_support.get(db, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found.")
    if current_user.role != UserRole.admin and ticket.user_id != current_user.id:
        raise HTTPException(403, "Access denied.")
    return _ticket_to_dict(ticket)


@router.post("/", status_code=201)
def create_ticket(
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    ticket = crud_support.create(db, user_id=current_user.id,
                                  user_name=current_user.full_name, obj_in=payload)
    # Notify admin by email
    admin_email = getattr(settings, "ADMIN_EMAIL", settings.EMAIL_FROM)
    if admin_email:
        send_support_ticket_created_email(
            admin_email=admin_email,
            ticket_id=ticket.id,
            user_name=current_user.full_name,
            user_email=current_user.email,
            subject=payload.subject,
            message=payload.message,
            priority=ticket.priority,
        )
    return _ticket_to_dict(ticket)


@router.put("/{ticket_id}", dependencies=[Depends(require_role(UserRole.admin))])
def update_ticket(ticket_id: int, payload: SupportTicketUpdate,
                  db: Session = Depends(get_db)) -> Any:
    ticket = crud_support.update(db, ticket_id, payload)
    if not ticket:
        raise HTTPException(404, "Ticket not found.")
    return _ticket_to_dict(ticket)


@router.post("/{ticket_id}/responses", status_code=201,
             dependencies=[Depends(require_role(UserRole.admin))])
def add_response(ticket_id: int, payload: TicketResponseCreate,
                 db: Session = Depends(get_db)) -> Any:
    ticket = crud_support.get(db, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found.")
    resp = crud_support.add_response(db, ticket_id, payload)
    # Email the ticket owner if they have an account with an email
    if ticket.user and ticket.user.email:
        send_support_ticket_response_email(
            user_email=ticket.user.email,
            user_name=ticket.user.full_name,
            ticket_id=ticket.id,
            ticket_subject=ticket.subject,
            response_message=payload.message,
            from_name=payload.from_name,
        )
    return {
        "id": resp.id,
        "ticket_id": resp.ticket_id,
        "from_name": resp.from_name,
        "message": resp.message,
        "created_at": resp.created_at.isoformat(),
    }
