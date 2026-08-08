from pydantic import BaseModel, Field
from typing import List, Literal


class AssessmentRequest(BaseModel):

    previous_grade: float = Field(..., ge=0, le=100)

    attendance_rate: float = Field(..., ge=0, le=100)

    study_hours: float = Field(..., ge=0)


    parental_support: Literal["Low", "Medium", "High"]

    online_classes_taken: Literal["Yes", "No"]

    difficulty_checklist: List[str]