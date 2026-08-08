from fastapi import APIRouter, HTTPException, Depends
from schemas.user_schema import User
from database.database import users_collection
from utils.security import hash_password, verify_password
from schemas.login_schema import LoginUser
from pymongo import DESCENDING
from utils.jwt_handler import create_access_token
from utils.dependencies import get_current_user
from database.database import assessments_collection
from datetime import datetime
router = APIRouter(

    tags=["Authentication"]
)

@router.post("/signup")
def signup(user: User):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    user_data = user.model_dump()
    user_data["password"] = hash_password(user_data["password"])
    user_data["created_at"] = datetime.utcnow()

    users_collection.insert_one(user_data)

    return {
        "message": "User Registered Successfully"
    }

@router.post("/login")
def login(user: LoginUser):

    existing_user = users_collection.find_one(
        {
            "email": user.email
        }
    )

    if existing_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    access_token = create_access_token(
        {
            "email": existing_user["email"]
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/profile")
def profile(
    current_user = Depends(get_current_user)
):
    return {
        "name": current_user.get("name", ""),
        "email": current_user["email"],
        "gender": current_user.get("gender", ""),
        "joined_at": str(
            current_user.get("created_at", "")
        )
    }
