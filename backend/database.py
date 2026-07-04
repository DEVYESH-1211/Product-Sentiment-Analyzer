import logging
from pymongo import MongoClient
from config import MONGO_URI, MONGO_DB_NAME, MONGO_COLLECTION_REVIEWS

# Setup logging
logger = logging.getLogger(__name__)

_client = None


def get_collection():
    """
    Establish connection to MongoDB and return the reviews collection.
    """
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
        _client.admin.command("ping")
        logger.info("Connected to MongoDB successfully.")
    db = _client[MONGO_DB_NAME]
    return db[MONGO_COLLECTION_REVIEWS]


def save_reviews(reviews: list) -> bool:
    """
    Save reviews into MongoDB.
    """
    if not isinstance(reviews, list) or len(reviews) == 0:
        logger.warning("save_reviews: Input is not a non-empty list.")
        return False

    try:
        col = get_collection()
        required_fields = {
            "product",
            "review",
            "rating",
            "reviewer",
            "date",
            "source",
            "sentiment",
            "confidence",
        }

        for review in reviews:
            if not required_fields.issubset(review):
                logger.error("Invalid review document.")
                return False

        product_name = reviews[0]["product"]
        delete_reviews(product_name)
        col.insert_many(reviews)
        logger.info(f"Successfully saved {len(reviews)} reviews to database.")
        return True
    except Exception as e:
        logger.error(f"Error saving reviews: {e}")
        return False


def get_reviews(product_name: str) -> list:
    """
    Return all reviews for a product.
    """
    if not product_name or not product_name.strip():
        logger.warning("get_reviews: Product name is empty.")
        return []

    try:
        col = get_collection()
        reviews = list(col.find({"product": product_name}, {"_id":0}))

        # Convert ObjectId to string for JSON serialization
        for r in reviews:
            if "_id" in r:
                r["_id"] = str(r["_id"])

        return reviews
    except Exception as e:
        logger.error(f"Error retrieving reviews: {e}")
        return []


def delete_reviews(product_name: str) -> bool:
    """
    Delete all stored reviews of a product.
    """
    if not product_name or not product_name.strip():
        logger.warning("delete_reviews: Product name is empty.")
        return False

    try:
        col = get_collection()
        result = col.delete_many({"product": product_name})
        logger.info(
            f"Deleted {result.deleted_count} reviews for product '{product_name}'."
        )
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"Error deleting reviews: {e}")
        return False


def product_exists(product_name: str) -> bool:
    """
    Check whether reviews for a product already exist.
    """
    if not product_name or not product_name.strip():
        return False

    try:
        col = get_collection()
        return col.count_documents({"product": product_name}, limit=1) > 0

    except Exception as e:
        logger.error(f"Error checking product existence: {e}")
        return False
