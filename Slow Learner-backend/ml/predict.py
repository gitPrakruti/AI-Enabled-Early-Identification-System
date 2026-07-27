import joblib
import pandas as pd
from pathlib import Path

from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "learner_type_model.pkl"

model = joblib.load(MODEL_PATH)

def predict_student(data):
    df = pd.DataFrame([{

    "Prev_Grade": data["previous_grade"],

    "Avg_Study_Hours": data["study_hours"],

    "Attendance_Rate": data["attendance_rate"],

    "Gender": data["gender"],

    "Parental_Support": data["parental_support"],

    "Online_Classes_Taken": data["online_classes_taken"]

}])
    prediction = model.predict(df)[0]

    probability = model.predict_proba(df)[0]

    confidence = round(max(probability) * 100, 2)
    return {
        "prediction": prediction,
        "confidence": confidence
    }