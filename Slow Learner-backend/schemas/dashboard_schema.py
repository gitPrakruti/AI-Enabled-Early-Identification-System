from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_assessments: int
    slow_predictions: int
    fast_predictions: int
    average_risk_score: float