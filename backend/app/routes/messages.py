"""routes/messages.py — Messaging endpoints (frontend-compatible)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_message
from app.auth.dependencies import get_current_active_user
from app.schemas.message import MessageCreate, MessageRead
from app.models.user import User
from app.models.message import Message as MessageModel, Conversation

router = APIRouter(prefix="/messages", tags=["Messages"])


def _format_message(msg: MessageModel, include_replies: bool = False) -> dict:
    """Format a DB message to the frontend-expected shape."""
    conv_subject = msg.conversation.subject if msg.conversation else "Message"
    replies = []
    if include_replies and msg.conversation:
        for r in msg.conversation.messages:
            if r.id != msg.id:
                replies.append({
                    "id": r.id,
                    "message_id": msg.id,
                    "from_user_id": r.sender_id,
                    "from_name": r.sender.full_name if r.sender else "Unknown",
                    "body": r.body,
                    "created_at": r.created_at.isoformat(),
                })
    return {
        "id": msg.id,
        "from_user_id": msg.sender_id,
        "from_name": msg.sender.full_name if msg.sender else "Unknown",
        "to_user_id": msg.recipient_id,
        "to_name": msg.recipient.full_name if msg.recipient else "Unknown",
        "subject": conv_subject or "Message",
        "body": msg.body,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat(),
        "replies": replies,
    }


@router.get("/")
def list_messages(skip: int = 0, limit: int = 50,
                  db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    """List inbox messages (conversations where user is sender or recipient)."""
    # Get first message of each conversation where user participates
    from sqlalchemy import or_
    msgs = (db.query(MessageModel)
            .filter(or_(MessageModel.sender_id == current_user.id,
                        MessageModel.recipient_id == current_user.id))
            .order_by(MessageModel.created_at.desc())
            .offset(skip).limit(limit).all())
    # Deduplicate by conversation
    seen = set()
    result = []
    for msg in msgs:
        if msg.conversation_id not in seen:
            seen.add(msg.conversation_id)
            result.append(_format_message(msg))
    return result


@router.get("/conversations")
def list_conversations(skip: int = 0, limit: int = 20,
                       db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_active_user)):
    return crud_message.get_user_conversations(db, user_id=current_user.id,
                                               skip=skip, limit=limit)


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    return {"count": crud_message.unread_count(db, user_id=current_user.id)}


@router.post("/", status_code=201)
def send_message(payload: dict,
                 db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    """Accept both {recipient_id/body} and {to_user_id/subject/body} formats."""
    from app.schemas.message import MessageCreate
    # Normalise field names from frontend format
    recipient_id = payload.get("recipient_id") or payload.get("to_user_id")
    if not recipient_id:
        raise HTTPException(400, "recipient_id or to_user_id required.")
    body = payload.get("body", "")
    subject = payload.get("subject") or payload.get("to_name")
    create_payload = MessageCreate(
        recipient_id=int(recipient_id),
        body=body,
        subject=subject,
    )
    msg = crud_message.send(db, sender_id=current_user.id, obj_in=create_payload)
    db.refresh(msg)
    return _format_message(msg)


@router.get("/{message_id}")
def get_message(message_id: int, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_active_user)):
    msg = db.query(MessageModel).filter(MessageModel.id == message_id).first()
    if not msg:
        raise HTTPException(404, "Message not found.")
    if msg.sender_id != current_user.id and msg.recipient_id != current_user.id:
        raise HTTPException(403, "Access denied.")
    return _format_message(msg, include_replies=True)


@router.post("/{message_id}/replies", status_code=201)
def reply_to_message(message_id: int, payload: dict,
                     db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_active_user)):
    orig = db.query(MessageModel).filter(MessageModel.id == message_id).first()
    if not orig:
        raise HTTPException(404, "Message not found.")
    body = payload.get("body", "")
    if not body:
        raise HTTPException(400, "body is required.")
    reply = MessageModel(
        conversation_id=orig.conversation_id,
        sender_id=current_user.id,
        recipient_id=orig.sender_id if orig.sender_id != current_user.id else orig.recipient_id,
        body=body,
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return {
        "id": reply.id,
        "message_id": message_id,
        "from_user_id": reply.sender_id,
        "from_name": current_user.full_name,
        "body": reply.body,
        "created_at": reply.created_at.isoformat(),
    }


@router.post("/{message_id}/read")
def mark_message_read(message_id: int, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_active_user)):
    msg = db.query(MessageModel).filter(MessageModel.id == message_id).first()
    if not msg:
        raise HTTPException(404, "Message not found.")
    if msg.recipient_id != current_user.id:
        raise HTTPException(403, "Access denied.")
    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return _format_message(msg)


@router.get("/conversations/{conv_id}")
def get_conversation_messages(conv_id: int, skip: int = 0, limit: int = 50,
                               db: Session = Depends(get_db),
                               current_user: User = Depends(get_current_active_user)):
    msgs = (db.query(MessageModel)
            .filter(MessageModel.conversation_id == conv_id)
            .order_by(MessageModel.created_at.asc())
            .offset(skip).limit(limit).all())
    return msgs


@router.post("/conversations/{conv_id}/read", status_code=200)
def mark_conversation_read(conv_id: int, db: Session = Depends(get_db),
                            current_user: User = Depends(get_current_active_user)):
    count = crud_message.mark_read(db, conv_id=conv_id, user_id=current_user.id)
    return {"marked": count}
