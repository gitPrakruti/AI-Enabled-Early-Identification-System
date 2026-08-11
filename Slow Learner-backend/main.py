from routes.user import router as user_router
from fastapi import FastAPI
from database.database import client
from routes.assessment import router as assessment_router
from routes.chatbot import router as chatbot_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-enabled-early-identification-system-05dw.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return {
        "message": "Backend is running"
    }


@app.get("/test-db")
def test_db():

    try:
        client.admin.command("ping")

        return {
            "message": "MongoDB Connected Successfully!"
        }

    except Exception as e:

        return {
            "error": str(e)
        }

@app.get("/")
def home():
    return {
        "message": "AI Enabled Early Identification System API",
        "status": "Running"
    }


