"""
fill_missing_profile_fields.py — Fills empty/null fields for Hotel and Recycler profiles.
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.hotel import Hotel
from app.models.recycler import Recycler

DEFAULTS = {
    'website': 'https://example.com',
    'tin_number': '000000000',
}

def fill_hotels(db: Session):
    hotels = db.query(Hotel).all()
    for hotel in hotels:
        changed = False
        for field, value in DEFAULTS.items():
            if getattr(hotel, field, None) in (None, '', ' '):
                setattr(hotel, field, value)
                changed = True
        if changed:
            print(f"Updated Hotel ID {hotel.id}")
    db.commit()

def fill_recyclers(db: Session):
    recyclers = db.query(Recycler).all()
    for recycler in recyclers:
        changed = False
        for field, value in DEFAULTS.items():
            if getattr(recycler, field, None) in (None, '', ' '):
                setattr(recycler, field, value)
                changed = True
        if changed:
            print(f"Updated Recycler ID {recycler.id}")
    db.commit()

def main():
    db = SessionLocal()
    fill_hotels(db)
    fill_recyclers(db)
    db.close()

if __name__ == "__main__":
    main()
