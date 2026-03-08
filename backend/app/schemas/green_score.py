"""schemas/green_score.py"""
from datetime import datetime
from pydantic import BaseModel


class GreenScoreRead(BaseModel):
    id:             int
    user_id:        int
    period:         str
    waste_diverted: float
    co2_saved:      float
    water_saved:    float
    energy_saved:   float
    score:          float
    created_at:     datetime

    model_config = {"from_attributes": True}
