from fastapi import APIRouter, HTTPException
from models import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])

@router.head("/",response_model=HealthResponse)
async def health_check():
    return {"status": "ok"}