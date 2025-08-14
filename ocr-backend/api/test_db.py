import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_connection():
    MONGO_URI = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(MONGO_URI)

    try:
        print("Available databases:")
        dbs = await client.list_database_names()
        print(dbs)

        # Try accessing your DB
        db = client["ocr-db"]
        collections = await db.list_collection_names()
        print("Collections in 'ocr-db':", collections)

    except Exception as e:
        print("Connection failed:", e)

asyncio.run(test_connection())
