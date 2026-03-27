from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

client = AsyncIOMotorClient(MONGODB_URI)
db = client["SnopThought"]
notes_collection = db["notes"]


async def create_indexes():
    await notes_collection.create_index(
        [("year", 1), ("isoWeek", 1), ("dayKey", 1)]
    )
