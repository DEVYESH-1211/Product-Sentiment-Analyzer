import os
from datetime import timedelta
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")
# ---------------------------------------------------------------------------
# Server Configuration
# ---------------------------------------------------------------------------
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 5000))

# DEBUG should always be False in production.
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "yes")

# ---------------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------------
# IMPORTANT: Override SECRET_KEY via environment variable in production.
# Never commit a real production secret key to version control.
SECRET_KEY = os.environ.get("SECRET_KEY")

# ---------------------------------------------------------------------------
# MongoDB Configuration
# ---------------------------------------------------------------------------
MONGO_URI = os.environ.get("MONGO_URI")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME")

# Collection names (kept centralized so they're easy to rename later)
MONGO_COLLECTION_REVIEWS = os.environ.get("MONGO_COLLECTION_REVIEWS", "reviews")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is required")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is required")

# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------
# Comma-separated list of allowed origins. Use "*" only in development.
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

# ---------------------------------------------------------------------------
# Scraping / Selenium Configuration
# ---------------------------------------------------------------------------
SELENIUM_HEADLESS = os.environ.get("SELENIUM_HEADLESS", "True").lower() in ("true", "1", "yes")
SELENIUM_IMPLICIT_WAIT_SECONDS = int(os.environ.get("SELENIUM_IMPLICIT_WAIT_SECONDS", 10))
SELENIUM_PAGE_LOAD_TIMEOUT_SECONDS = int(os.environ.get("SELENIUM_PAGE_LOAD_TIMEOUT_SECONDS", 30))
SCRAPER_USER_AGENT = os.environ.get(
    "SCRAPER_USER_AGENT",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
)
MAX_REVIEWS_PER_SEARCH = int(os.environ.get("MAX_REVIEWS_PER_SEARCH", 100))

# ---------------------------------------------------------------------------
# NLP / Sentiment Analysis Configuration
# ---------------------------------------------------------------------------
SENTIMENT_POSITIVE_THRESHOLD = float(os.environ.get("SENTIMENT_POSITIVE_THRESHOLD", 0.05))
SENTIMENT_NEGATIVE_THRESHOLD = float(os.environ.get("SENTIMENT_NEGATIVE_THRESHOLD", -0.05))
KEYWORD_EXTRACTION_TOP_N = int(os.environ.get("KEYWORD_EXTRACTION_TOP_N", 10))

# ---------------------------------------------------------------------------
# Caching / Rate Limiting (optional, extend as needed)
# ---------------------------------------------------------------------------
CACHE_TIMEOUT = timedelta(hours=int(os.environ.get("CACHE_TIMEOUT_HOURS", 6)))
RATE_LIMIT_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_MINUTE", 60))

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
LOG_FILE = os.environ.get("LOG_FILE", "app.log")

# ---------------------------------------------------------------------------
# Pagination Defaults
# ---------------------------------------------------------------------------
DEFAULT_PAGE_SIZE = int(os.environ.get("DEFAULT_PAGE_SIZE", 20))
MAX_PAGE_SIZE = int(os.environ.get("MAX_PAGE_SIZE", 100))