"""services/green_score_service.py — CO₂ savings & green score calculator.

GreenScore formula (per user request):
  score = min(100.0, total_waste_diverted_kg / 100.0)
  i.e. every 100 kg/L of waste collected = 1 point, capped at 100.
"""
from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.green_score import GreenScore

# kg of CO₂ saved per kg of waste type recycled
CO2_FACTORS: dict[str, float] = {
    "UCO":            2.85,
    "Glass":          0.26,
    "Paper_Cardboard":0.91,
    "Plastic":        1.53,
    "Metal":          1.80,
    "Organic":        0.50,
    "Electronic":     2.00,
    "Textile":        3.60,
    "Mixed":          0.80,
    "Other":          0.50,
}


def _co2_for_kg(waste_type: str, kg: float) -> float:
    factor = CO2_FACTORS.get(waste_type, 0.50)
    return round(factor * kg, 3)


def _current_period() -> str:
    """Return the current month as 'YYYY-MM', used as the period key."""
    now = datetime.now(timezone.utc)
    return f"{now.year}-{now.month:02d}"


def update_score(db: Session, user_id: int, waste_type: str, kg: float) -> GreenScore:
    """
    Add kg of waste to this user's current-month green score entry.
    score = min(100, cumulative_waste_diverted / 100) — 1 pt per 100 kg/L.
    """
    period = _current_period()
    co2 = _co2_for_kg(waste_type, kg)

    score_row = (
        db.query(GreenScore)
        .filter(GreenScore.user_id == user_id, GreenScore.period == period)
        .first()
    )

    if not score_row:
        new_waste = kg
        score_row = GreenScore(
            user_id=user_id,
            period=period,
            waste_diverted=new_waste,
            co2_saved=co2,
            water_saved=0.0,
            energy_saved=0.0,
            score=min(100.0, new_waste / 100.0),
        )
        db.add(score_row)
    else:
        score_row.waste_diverted = (score_row.waste_diverted or 0.0) + kg
        score_row.co2_saved = (score_row.co2_saved or 0.0) + co2
        score_row.score = min(100.0, score_row.waste_diverted / 100.0)

    db.commit()
    db.refresh(score_row)
    return score_row


def get_or_create(db: Session, user_id: int) -> GreenScore:
    period = _current_period()
    row = (
        db.query(GreenScore)
        .filter(GreenScore.user_id == user_id, GreenScore.period == period)
        .first()
    )
    if not row:
        row = GreenScore(
            user_id=user_id,
            period=period,
            waste_diverted=0.0,
            co2_saved=0.0,
            water_saved=0.0,
            energy_saved=0.0,
            score=0.0,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def leaderboard(db: Session, limit: int = 10) -> list[GreenScore]:
    return db.query(GreenScore).order_by(GreenScore.score.desc()).limit(limit).all()
