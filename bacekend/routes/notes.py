from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime, timezone

from database import notes_collection
from models import NoteCreate, NoteUpdate, NoteResponse, WeekNotesResponse

router = APIRouter(prefix="/api/v1/notes", tags=["notes"])

DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"]


def doc_to_response(doc: dict) -> NoteResponse:
    return NoteResponse(
        id=str(doc["_id"]),
        content=doc["content"],
        createdAt=doc["createdAt"],
        updatedAt=doc.get("updatedAt"),
        tag=doc.get("tag"),
    )


@router.get("", response_model=WeekNotesResponse)
async def get_week_notes(
    year: int = Query(...),
    week: int = Query(...),
):
    cursor = notes_collection.find({"year": year, "isoWeek": week})
    days: dict[str, list[NoteResponse]] = {key: [] for key in DAY_KEYS}

    async for doc in cursor:
        day = doc.get("dayKey")
        if day in days:
            days[day].append(doc_to_response(doc))

    return WeekNotesResponse(year=year, week=week, days=days)


@router.post("", response_model=NoteResponse, status_code=201)
async def create_note(body: NoteCreate):
    if body.dayKey not in DAY_KEYS:
        raise HTTPException(status_code=400, detail=f"Invalid dayKey: {body.dayKey}")

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    doc = {
        "year": body.year,
        "isoWeek": body.week,
        "dayKey": body.dayKey,
        "content": body.content,
        "tag": body.tag,
        "createdAt": now,
        "updatedAt": now,
    }

    result = await notes_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_response(doc)


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: str):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=400, detail="Invalid note_id")

    result = await notes_collection.delete_one({"_id": ObjectId(note_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, body: NoteUpdate):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=400, detail="Invalid note_id")

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    result = await notes_collection.find_one_and_update(
        {"_id": ObjectId(note_id)},
        {"$set": {"content": body.content, "updatedAt": now}},
        return_document=True,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Note not found")

    return doc_to_response(result)
