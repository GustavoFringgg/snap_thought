from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import create_indexes
from routes.notes import router as notes_router
from routes.health import router as health_router


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
    allow_origins=[
        "http://localhost:5173",
        "https://snap-thought.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes_router)
app.include_router(health_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
