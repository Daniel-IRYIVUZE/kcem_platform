"""routes/support.py — Support ticket endpoints."""
from fastapi import APIRouter, Depends, HTTPException
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

router = APIRouter(prefix="/support", tags=["Support"])


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
    return {
        "id": resp.id,
        "ticket_id": resp.ticket_id,
        "from_name": resp.from_name,
        "message": resp.message,
        "created_at": resp.created_at.isoformat(),
    }
