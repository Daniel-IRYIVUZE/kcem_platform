"""crud/message.py — Messaging CRUD."""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.message import Message, Conversation
from app.schemas.message import MessageCreate
from pydantic import BaseModel


class _ConvCreate(BaseModel):
    pass


class CRUDMessage(CRUDBase[Message, MessageCreate, MessageCreate]):

    def get_or_create_conversation(self, db: Session, *, listing_id: int | None,
                                   subject: str | None) -> Conversation:
        conv = None
        if listing_id:
            conv = db.query(Conversation).filter(Conversation.listing_id == listing_id).first()
        if not conv:
            conv = Conversation(listing_id=listing_id, subject=subject)
            db.add(conv)
            db.commit()
            db.refresh(conv)
        return conv

    def send(self, db: Session, *, sender_id: int, obj_in: MessageCreate) -> Message:
        conv = self.get_or_create_conversation(
            db, listing_id=obj_in.listing_id, subject=obj_in.subject
        )
        if obj_in.conversation_id:
            conv = db.query(Conversation).get(obj_in.conversation_id) or conv

        msg = Message(
            conversation_id=conv.id,
            sender_id=sender_id,
            recipient_id=obj_in.recipient_id,
            body=obj_in.body,
        )
        db.add(msg)
        # update conversation timestamp
        conv.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(msg)
        return msg

    def get_conversation(self, db: Session, conv_id: int) -> Conversation | None:
        return db.query(Conversation).filter(Conversation.id == conv_id).first()

    def get_user_conversations(self, db: Session, user_id: int, *, skip: int = 0, limit: int = 20) -> list[Conversation]:
        return (db.query(Conversation)
                .join(Message, Message.conversation_id == Conversation.id)
                .filter((Message.sender_id == user_id) | (Message.recipient_id == user_id))
                .distinct()
                .order_by(Conversation.updated_at.desc())
                .offset(skip).limit(limit).all())

    def mark_read(self, db: Session, *, conv_id: int, user_id: int) -> int:
        count = (db.query(Message)
                 .filter(Message.conversation_id == conv_id, Message.recipient_id == user_id,
                         Message.is_read == False)
                 .update({"is_read": True, "read_at": datetime.now(timezone.utc)}))
        db.commit()
        return count

    def unread_count(self, db: Session, user_id: int) -> int:
        return db.query(Message).filter(
            Message.recipient_id == user_id, Message.is_read == False
        ).count()


crud_message = CRUDMessage(Message)
