from pydantic import BaseModel
from typing import List, Dict, Any


class AssessmentHistoryItem(BaseModel):
    id: str
    prediction: str
    confidence: float
    risk_score: float

    recommendations: List[str]

    created_at: str

    assessment: Dict[str, Any]


class AssessmentHistoryResponse(BaseModel):
    history: List[AssessmentHistoryItem]