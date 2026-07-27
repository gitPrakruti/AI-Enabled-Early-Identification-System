from pydantic import BaseModel
from typing import List


class AssessmentHistoryItem(BaseModel):
    id: str
    prediction: str
    confidence: float
    risk_score: float
    created_at: str


class AssessmentHistoryResponse(BaseModel):
    history: List[AssessmentHistoryItem]