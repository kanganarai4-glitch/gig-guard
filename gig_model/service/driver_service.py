from config.db import drivers_collection
from bson import ObjectId


def get_driver_data(user_id: str):
    driver = drivers_collection.find_one({"_id": ObjectId(user_id)})

    if not driver:
        return None

    return driver