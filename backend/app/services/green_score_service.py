"""services/green_score_service.py — CO₂ savings & green score calculator."""
from __future__ import annotations
from sqlalchemy.orm import Session
from app.models.green_score import GreenScore
from app.models.collection import Collection, CollectionStatus

# kg of CO₂ saved per kg of waste type recycled
CO2_FACTORS: dict[str, float] = {
    "UCO": 2.85,           # used cooking oil → biodiesel
    "Glass": 0.26,
    "Paper_Cardboard": 0.91,
    "Plastic": 1.53,
    "Metal": 1.80,
    "Organic": 0.50,
    "Electronic": 2.00,
    "Textile": 3.60,
    "Mixed": 0.80,
    "Other": 0.50,
}

SCORE_PER_KG = 10.0          # score points per kg collected
SCORE_PER_COLLECTION = 50.0  # bonus per completed collection


def _co2_for_kg(waste_type: str, kg: float) -> float:
    factor = CO2_FACTORS.get(waste_type, 0.50)
    return round(factor * kg, 3)


def update_score(db: Session, user_id: int, waste_type: str, kg: float) -> GreenScore:
    score_row = db.query(GreenScore).filter(GreenScore.user_id == user_id).first()
    co2 = _co2_for_kg(waste_type, kg)
    points = kg * SCORE_PER_KG + SCORE_PER_COLLECTION

    if not score_row:
        score_row = GreenScore(
            user_id=user_id,
            total_waste_kg=kg,
            co2_saved_kg=co2,
            score=points,
            collections_count=1,
        )
        db.add(score_row)
    else:
        score_row.total_waste_kg = (score_row.total_waste_kg or 0.0) + kg
        score_row.co2_saved_kg = (score_row.co2_saved_kg or 0.0) + co2
        score_row.score = (score_row.score or 0.0) + points
        score_row.collections_count = (score_row.collections_count or 0) + 1

    db.commit()
    db.refresh(score_row)
    return score_row


def get_or_create(db: Session, user_id: int) -> GreenScore:
    row = db.query(GreenScore).filter(GreenScore.user_id == user_id).first()
    if not row:
        row = GreenScore(user_id=user_id, total_waste_kg=0.0, co2_saved_kg=0.0,
                         score=0.0, collections_count=0)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def leaderboard(db: Session, limit: int = 10) -> list[GreenScore]:
    return db.query(GreenScore).order_by(GreenScore.score.desc()).limit(limit).all()
