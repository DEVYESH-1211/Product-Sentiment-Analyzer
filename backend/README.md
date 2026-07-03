# Product Sentiment Analyzer — Backend

## 1. Project Overview

The Product Sentiment Analyzer backend is a Flask-based REST API that:

- Accepts a product name and scrapes related reviews from the web (using Selenium and BeautifulSoup).
- Stores collected reviews in MongoDB.
- Runs NLP-based sentiment analysis on reviews to classify them as positive, negative, or neutral.
- Extracts common keywords/themes from review text.
- Exposes all of the above through a clean set of REST API endpoints for a frontend client to consume.

This backend is intended to be simple to run locally, easy to configure via environment variables, and straightforward to extend with new data sources or NLP models.

---

## 2. Folder Structure

```
backend/
├── app.py                     # Flask app: routes, validation, error handling (already implemented)
├── config.py                  # Centralized configuration (HOST, PORT, MongoDB URI, etc.)
├── requirements.txt           # Python dependencies
├── README.md                  # This file
├── API_DOCUMENTATION.md       # Full API reference
├── POSTMAN_GUIDE.md           # Postman testing guide with sample requests/responses
│
├── scraper/                   # Selenium + BeautifulSoup scraping logic
│   └── ...
├── nlp/                       # Sentiment analysis & keyword extraction logic
│   └── ...
├── db/                        # MongoDB connection & data access helpers
│   └── ...
└── utils/                     # Shared helper functions
    └── ...
```

> Note: `app.py` and its supporting business logic modules are already implemented as part of this project. This README documents how to set up and run the backend as a whole.

---

## 3. Installation

### Prerequisites

- Python 3.10+
- MongoDB (local instance or a hosted cluster, e.g. MongoDB Atlas)
- Google Chrome or Chromium (required for Selenium-based scraping)

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate      # macOS/Linux
   venv\Scripts\activate         # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Create a `.env` file in the project root (or export these in your shell):
   ```env
   HOST=0.0.0.0
   PORT=5000
   DEBUG=False
   SECRET_KEY=your-production-secret-key
   MONGO_URI=mongodb://localhost:27017
   MONGO_DB_NAME=product_sentiment_db
   CORS_ORIGINS=http://localhost:3000
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

---

## 4. Running the Server

### Development mode
```bash
python app.py
```

### Production mode (using Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Once running, the API will be available at:
```
http://localhost:5000
```

Verify it's working:
```bash
curl http://localhost:5000/health
```

---

## 5. Required Packages

All dependencies are listed in `requirements.txt`, grouped by purpose:

- **Web framework:** Flask, Flask-Cors, Werkzeug
- **Database:** pymongo, dnspython
- **Scraping:** selenium, webdriver-manager, beautifulsoup4, lxml, requests
- **NLP:** nltk, vaderSentiment, textblob, scikit-learn, spacy
- **Data handling:** numpy, pandas
- **Production server:** gunicorn

Install everything with:
```bash
pip install -r requirements.txt
```

---

## 6. Configuration

All configuration lives in `config.py` and is overridable via environment variables. Key settings include:

| Setting | Description | Default |
|---|---|---|
| `HOST` | Server bind address | `0.0.0.0` |
| `PORT` | Server port | `5000` |
| `DEBUG` | Enable Flask debug mode | `False` |
| `SECRET_KEY` | Flask secret key | `dev-secret-key-change-me` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGO_DB_NAME` | Database name | `product_sentiment_db` |
| `CORS_ORIGINS` | Allowed frontend origins | `*` |
| `SELENIUM_HEADLESS` | Run Chrome headless | `True` |
| `MAX_REVIEWS_PER_SEARCH` | Cap on reviews scraped per search | `100` |

See `config.py` for the full list of configurable constants.

**Production checklist:**
- Set a strong, unique `SECRET_KEY`.
- Set `DEBUG=False`.
- Restrict `CORS_ORIGINS` to your actual frontend domain(s).
- Use a managed MongoDB instance with authentication enabled.

---

## 7. API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check for server and database |
| `POST` | `/search` | Search and scrape reviews for a product |
| `GET` | `/reviews/<product_name>` | Get all stored reviews for a product |
| `GET` | `/summary/<product_name>` | Get aggregated sentiment summary for a product |
| `GET` | `/keywords/<product_name>` | Get top keywords extracted from a product's reviews |

For full request/response details, see **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**.

For a step-by-step Postman testing walkthrough, see **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)**.

---

## 8. License

This project is provided as-is for internal/educational use. Add your license of choice here.