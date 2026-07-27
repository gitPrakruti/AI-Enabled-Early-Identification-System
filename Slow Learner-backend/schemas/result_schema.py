from pydantic import BaseModel
from typing import List


class AssessmentResponse(BaseModel):

    prediction: str

    confidence: float

    risk_score: float

    recommendations: List[str]