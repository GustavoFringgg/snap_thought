from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import create_indexes
from routes.notes import router as notes_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await create_indexes()
    except Exception as e:
        print(f"WARNING: Failed to create indexes: {e}")
    yield


app = FastAPI(title="Snop Thought API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes_router)
