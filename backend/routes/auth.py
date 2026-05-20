from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

from auth import create_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    token: str


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    if body.password != os.getenv("APP_PASSWORD", "0408"):
        raise HTTPException(status_code=401, detail="密碼錯誤")
    return LoginResponse(token=create_token())
