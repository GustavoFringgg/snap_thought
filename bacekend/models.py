from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class NoteCreate(BaseModel):
    year: int
    week: int
    dayKey: str
    content: str
    tags: Optional[List[str]] = None


class NoteUpdate(BaseModel):
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteResponse(BaseModel):
    id: str
    content: str
    createdAt: str
    updatedAt: Optional[str] = None
    tags: Optional[List[str]] = None


class WeekNotesResponse(BaseModel):
    year: int
    week: int
    days: dict[str, list[NoteResponse]]


class NoteWithContext(BaseModel):
    id: str
    content: str
    createdAt: str
    updatedAt: Optional[str] = None
    tags: Optional[List[str]] = None
    year: int
    isoWeek: int
    dayKey: str


class TagNotesResponse(BaseModel):
    total: int
    notes: List[NoteWithContext]


class HealthResponse(BaseModel):
    status: str
