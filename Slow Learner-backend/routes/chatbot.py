from fastapi import APIRouter
from fastapi import APIRouter, Depends
from schemas.chatbot import *
from utils.dependencies import get_current_user
from utils.chatbot import get_chatbot_response


from utils.chatbot import *

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

@router.post("/chat")
async def chat(
    data: ChatRequest,
    current_user=Depends(get_current_user)
):
    reply = get_chatbot_response(
        data.message
    )

    return ChatResponse(
        reply=reply
    )