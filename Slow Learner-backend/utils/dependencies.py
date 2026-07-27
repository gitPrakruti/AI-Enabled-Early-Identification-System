from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from utils.oauth2 import security
from utils.jwt_handler import verify_access_token
from database.database import users_collection


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_access_token(token)

    email = payload.get("email")

    user = users_collection.find_one(
        {
            "email": email
        }
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user