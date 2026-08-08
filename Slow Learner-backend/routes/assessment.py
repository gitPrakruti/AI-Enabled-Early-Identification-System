from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
import traceback

from schemas.dashboard_schema import DashboardResponse
from schemas.history_schema import AssessmentHistoryResponse
from schemas.detail_schema import AssessmentDetailResponse
from database.database import assessments_collection
from ml.predict import predict_student
from schemas.assessment_schema import AssessmentRequest
from schemas.result_schema import AssessmentResponse
from utils.dependencies import get_current_user


router = APIRouter(prefix="/assessment", tags=["Assessment"])


def generate_recommendations(data: dict) -> list[str]:
    recommendations = []

    if data.get("attendance_rate", 100) < 75:
        recommendations.append("Improve class attendance.")

    if data.get("study_hours", 0) < 2:
        recommendations.append("Increase daily study hours.")

    if data.get("previous_grade", 100) < 50:
        recommendations.append("Revise previous concepts.")

    if str(data.get("parental_support", "")).lower() == "low":
        recommendations.append(
            "Seek guidance from mentors or teachers."
        )

    if str(data.get("online_classes_taken", "")).lower() == "no":
        recommendations.append(
            "Use online learning resources."
        )

    return recommendations


# ============================================================
# SUBMIT ASSESSMENT
# ============================================================

@router.post("/submit", response_model=AssessmentResponse)
async def submit_assessment(
    assessment: AssessmentRequest,
    current_user=Depends(get_current_user)
):
    try:
        assessment_data = assessment.model_dump()

        print("\n========== ASSESSMENT DATA ==========")
        print(assessment_data)

        # predict_student accepts ONLY assessment_data
        gender = current_user.get("gender")

        result = predict_student(
    assessment_data,
    gender
)

        print("Prediction Result:", result)

        prediction = result["prediction"]
        confidence = float(result["confidence"])

        if prediction == "Slow Learner":
            risk_score = confidence
        else:
            risk_score = round(100 - confidence, 2)

        recommendations = generate_recommendations(
            assessment_data
        )

        document = {
            "user_id": str(current_user["_id"]),
            "assessment": assessment_data,
            "prediction": prediction,
            "confidence": confidence,
            "risk_score": risk_score,
            "recommendations": recommendations,
            "created_at": datetime.utcnow(),
        }

        print("Document:", document)

        assessments_collection.insert_one(document)

        print("Assessment saved successfully.")
        print("====================================\n")

        return {
            "prediction": prediction,
            "confidence": confidence,
            "risk_score": risk_score,
            "recommendations": recommendations,
        }

    except Exception as error:
        print("\n========== REAL ERROR ==========")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR MESSAGE:", str(error))
        traceback.print_exc()
        print("================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# ASSESSMENT HISTORY
# ============================================================

@router.get(
    "/history",
    response_model=AssessmentHistoryResponse
)
async def get_history(
    current_user=Depends(get_current_user)
):
    try:
        assessments = assessments_collection.find(
            {
                "user_id": str(current_user["_id"])
            }
        ).sort(
            "created_at",
            -1
        )

        history = []

        for assessment in assessments:
            history.append(
                {
                    "id": str(assessment["_id"]),
                    "prediction": assessment["prediction"],
                    "confidence": float(
                        assessment["confidence"]
                    ),
                    "risk_score": float(
                        assessment["risk_score"]
                    ),
                    "recommendations": assessment.get(
                        "recommendations",
                        []
                    ),
                    "created_at": assessment[
                        "created_at"
                    ].isoformat(),
                    "assessment": assessment[
                        "assessment"
                    ],
                }
            )

        return {
            "history": history
        }

    except Exception as error:
        print("\n========== HISTORY ERROR ==========")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR MESSAGE:", str(error))
        traceback.print_exc()
        print("===================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# DASHBOARD STATS
# ============================================================

@router.get("/dashboard/stats")
async def dashboard_stats(
    current_user=Depends(get_current_user)
):
    try:
        assessments = list(
            assessments_collection.find(
                {
                    "user_id": str(
                        current_user["_id"]
                    )
                }
            )
        )

        total = len(assessments)

        slow = sum(
            1
            for assessment in assessments
            if assessment["prediction"] == "Slow Learner"
        )

        fast = total - slow

        average_risk = (
            round(
                sum(
                    float(
                        assessment["risk_score"]
                    )
                    for assessment in assessments
                ) / total,
                2
            )
            if total > 0
            else 0
        )

        return {
            "total_assessments": total,
            "slow_learners": slow,
            "fast_learners": fast,
            "average_risk_score": average_risk
        }

    except Exception as error:
        print("\n========== DASHBOARD STATS ERROR ==========")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR MESSAGE:", str(error))
        traceback.print_exc()
        print("===========================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# RECENT ASSESSMENTS
# ============================================================

@router.get("/recent")
async def recent_assessments(
    current_user=Depends(get_current_user)
):
    try:
        recent = assessments_collection.find(
            {
                "user_id": str(
                    current_user["_id"]
                )
            }
        ).sort(
            "created_at",
            -1
        ).limit(5)

        response = []

        for assessment in recent:
            response.append(
                {
                    "prediction": assessment["prediction"],
                    "confidence": float(
                        assessment["confidence"]
                    ),
                    "created_at": str(
                        assessment["created_at"]
                    )
                }
            )

        return {
            "recent": response
        }

    except Exception as error:
        print("\n========== RECENT ERROR ==========")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR MESSAGE:", str(error))
        traceback.print_exc()
        print("==================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# DASHBOARD
# ============================================================

@router.get(
    "/dashboard",
    response_model=DashboardResponse
)
async def get_dashboard(
    current_user=Depends(get_current_user)
):
    try:
        assessments = list(
            assessments_collection.find(
                {
                    "user_id": str(
                        current_user["_id"]
                    )
                }
            )
        )

        total = len(assessments)

        slow = sum(
            1
            for assessment in assessments
            if assessment["prediction"] == "Slow Learner"
        )

        fast = total - slow

        if total > 0:
            average_risk = round(
                sum(
                    float(
                        assessment["risk_score"]
                    )
                    for assessment in assessments
                ) / total,
                2
            )
        else:
            average_risk = 0

        return {
            "total_assessments": total,
            "slow_predictions": slow,
            "fast_predictions": fast,
            "average_risk_score": average_risk
        }

    except Exception as error:
        print("\n========== DASHBOARD ERROR ==========")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR MESSAGE:", str(error))
        traceback.print_exc()
        print("=====================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# GET SINGLE ASSESSMENT
# ============================================================

@router.get(
    "/{assessment_id}",
    response_model=AssessmentDetailResponse
)
async def get_assessment(
    assessment_id: str,
    current_user=Depends(get_current_user)
):
    try:
        try:
            object_id = ObjectId(assessment_id)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid assessment ID"
            )

        assessment = assessments_collection.find_one(
            {
                "_id": object_id,
                "user_id": str(
                    current_user["_id"]
                )
            }
        )

        if assessment is None:
            raise HTTPException(
                status_code=404,
                detail="Assessment not found"
            )

        return {
            "id": str(assessment["_id"]),
            "prediction": assessment["prediction"],
            "confidence": float(
                assessment["confidence"]
            ),
            "risk_score": float(
                assessment["risk_score"]
            ),
            "recommendations": assessment.get(
                "recommendations",
                []
            ),
            "created_at": assessment[
                "created_at"
            ].isoformat(),
            "assessment": assessment[
                "assessment"
            ],
        }

    except HTTPException:
        raise

    except Exception as error:
        print("\n========== GET ASSESSMENT ERROR ==========")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR MESSAGE:", str(error))
        traceback.print_exc()
        print("==========================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# DELETE ASSESSMENT
# ============================================================

@router.delete("/{assessment_id}")
async def delete_assessment(
    assessment_id: str,
    current_user=Depends(get_current_user)
):
    try:
        try:
            object_id = ObjectId(assessment_id)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid assessment ID"
            )

        result = assessments_collection.delete_one(
            {
                "_id": object_id,
                "user_id": str(
                    current_user["_id"]
                )
            }
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Assessment not found"
            )

        return {
            "message": "Assessment deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as error:
        print("\n========== DELETE ERROR ==========")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR MESSAGE:", str(error))
        traceback.print_exc()
        print("==================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )