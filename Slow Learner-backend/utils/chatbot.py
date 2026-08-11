import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=GEMINI_API_KEY)


def get_chatbot_response(message: str):

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"""
You are PaceIQ's AI learning assistant.

The user asked:

{message}

Give a helpful, concise and student-friendly response.
Focus on practical educational advice.
Do not diagnose medical or psychological conditions.
"""
    )

    return response.text