from fastapi import APIRouter

from schemas.chatbot import *

from utils.chatbot import *

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

@router.post(
    "/chat",
    response_model=ChatResponse
)
async def chat(data: ChatRequest):

    reply = generate_reply(
        data.message
    )

    return ChatResponse(
        reply=reply
    )