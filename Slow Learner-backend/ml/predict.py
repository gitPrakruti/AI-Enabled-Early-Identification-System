import joblib
import pandas as pd
from pathlib import Path


MODEL_PATH = Path(__file__).resolve().parent / "learner_type_model.pkl"

model = joblib.load(MODEL_PATH)


def predict_student(data, gender):
    df = pd.DataFrame([{
        "Prev_Grade": data["previous_grade"],
        "Avg_Study_Hours": data["study_hours"],
        "Attendance_Rate": data["attendance_rate"],
        "Gender": gender,
        "Parental_Support": data["parental_support"],
        "Online_Classes_Taken": data["online_classes_taken"]
    }])


    print("MODEL INPUT:")
    print(df)

    prediction = model.predict(df)[0]

    probability = model.predict_proba(df)[0]

    confidence = round(float(max(probability)) * 100, 2)

    return {
        "prediction": str(prediction),
        "confidence": confidence
    }