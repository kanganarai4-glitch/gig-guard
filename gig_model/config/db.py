import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Get URL from env
MONGO_URL = os.getenv("MONGO_URL")

# Connect
client = MongoClient(MONGO_URL)

# Database
db = client["test"]   # change if needed
drivers_collection = db["drivers"]