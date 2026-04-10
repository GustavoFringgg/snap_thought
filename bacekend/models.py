from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    year: int
    week: int
    dayKey: str
    content: str
    tag: Optional[str] = None


class NoteUpdate(BaseModel):
    content: str


class NoteResponse(BaseModel):
    id: str
    content: str
    createdAt: str
    updatedAt: Optional[str] = None
    tag: Optional[str] = None


class WeekNotesResponse(BaseModel):
    year: int
    week: int
    days: dict[str, list[NoteResponse]]

class HealthResponse(BaseModel):
    status: str