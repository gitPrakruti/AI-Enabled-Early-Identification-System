from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from pathlib import Path
from fastapi import HTTPException, status

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES"))
print("JWT_EXPIRE_MINUTES =", ACCESS_TOKEN_EXPIRE_MINUTES)
print("SECRET_KEY =", SECRET_KEY)
print("ALGORITHM =", ALGORITHM)


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    print("NOW:", datetime.now(timezone.utc))
    print("EXPIRES:", expire)
    print("TOKEN PAYLOAD:", jwt.get_unverified_claims(encoded_jwt))

    return encoded_jwt


def verify_access_token(token: str):
    print("Received token:", token)

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("Decoded payload:", payload)
        return payload

    except JWTError as e:
        print("JWT ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )