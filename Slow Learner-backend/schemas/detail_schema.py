from pydantic import BaseModel
from typing import List, Dict, Any


class AssessmentDetailResponse(BaseModel):
    assessment: Dict[str, Any]
    prediction: str
    confidence: float
    risk_score: float
    recommendations: List[str]
    created_at: str