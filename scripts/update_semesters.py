from pymongo import MongoClient

# MongoDB URI
MONGO_URI = "mongodb://localhost:27017"  # <-- Replace with your actual URI

# Connect to MongoDB
client = MongoClient(MONGO_URI)

db = client["cmrit"]
profile_collection = db["studentprofiles"]

# Mapping of old semester to new semester
sem_updates = {
    5: 6,
    7: 8,
    3: 4
}

updated_count = 0
for old_sem, new_sem in sem_updates.items():
    result = profile_collection.update_many({"sem": old_sem}, {"$set": {"sem": new_sem}})
    print(f"Updated {result.modified_count} profiles from sem {old_sem} to {new_sem}")
    updated_count += result.modified_count

print(f"Total profiles updated: {updated_count}")
