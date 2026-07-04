# Product Sentiment Analyzer

A full-stack web application that scrapes product reviews, performs sentiment analysis, stores the processed data in MongoDB, and visualizes insights through an interactive React dashboard.

---

# Features

* 🔍 Search products and scrape reviews from Flipkart
* 😊 Automatic sentiment analysis (Positive, Neutral, Negative)
* 📊 Interactive analytics dashboard
* ☁️ MongoDB Atlas integration
* 🔑 Keyword extraction from reviews
* 📈 Sentiment summary and statistics
* ⚡ RESTful Flask API
* 🎨 Modern React + TypeScript frontend

---

# Tech Stack

## Frontend

* React (Vite)
* TypeScript
* Axios
* Recharts
* Framer Motion
* Lucide React

## Backend

* Python
* Flask
* Flask-CORS

## Database

* MongoDB Atlas

## Web Scraping

* Selenium
* BeautifulSoup
* Undetected ChromeDriver

## Natural Language Processing

* NLTK VADER
* Custom fallback sentiment analyzer

---

# System Architecture

```
                 React Frontend
                        │
                        ▼
                 Flask REST API
                        │
      ┌───────────┬────────────┬────────────┐
      ▼           ▼            ▼            ▼
  Scraper    Sentiment NLP   Analytics   MongoDB
      │
      ▼
 Flipkart Reviews
```

All communication flows through the Flask backend (`app.py`), which coordinates scraping, sentiment analysis, analytics, and database operations.

---

# Project Structure

```
Product-Sentiment-Analyzer/

├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── API_DOCUMENTATION.md
│   ├── POSTMAN_GUIDE.md
│   ├── scraper/
│   ├── nlp/
│   ├── db/
│   ├── utils/
│   └── README.md
│
└── README.md
```

---

# How It Works

1. The user searches for a product from the React frontend.
2. The frontend sends a request to the Flask backend.
3. The backend checks whether reviews already exist in MongoDB.
4. If reviews exist, they are returned immediately.
5. Otherwise:

   * Reviews are scraped from Flipkart.
   * Sentiment analysis is performed.
   * Keywords are extracted.
   * Results are stored in MongoDB.
6. The frontend fetches:

   * Reviews
   * Sentiment summary
   * Keywords
7. The dashboard displays the results.

---

# Prerequisites

* Node.js 18+
* Python 3.10+
* MongoDB Atlas (or local MongoDB)
* Google Chrome / Chromium

---

# Installation

## Clone the Repository

```bash
git clone <your-repository-url>
cd Product-Sentiment-Analyzer
```

---

## Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment:

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
HOST=0.0.0.0
PORT=5000
DEBUG=False
SECRET_KEY=your-secret-key

MONGO_URI=your-mongodb-uri
MONGO_DB_NAME=product_sentiment_db

CORS_ORIGINS=http://localhost:5173
```

Run the backend:

```bash
python app.py
```

The backend will be available at:

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

# REST API

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| GET    | `/health`                  | Health check              |
| POST   | `/search`                  | Search and scrape reviews |
| GET    | `/reviews/<product_name>`  | Retrieve stored reviews   |
| GET    | `/summary/<product_name>`  | Sentiment summary         |
| GET    | `/keywords/<product_name>` | Top extracted keywords    |

For complete API documentation, see:

```
backend/API_DOCUMENTATION.md
```

For Postman testing:

```
backend/POSTMAN_GUIDE.md
```

---

# Deployment

Recommended deployment architecture:

```
React Frontend
        │
        ▼
     Vercel
        │
        ▼
 Flask Backend
   (Render)
        │
        ▼
 MongoDB Atlas
```

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

# Future Enhancements

* User authentication
* Product search history
* Multiple e-commerce platforms
* Advanced NLP models
* Interactive keyword visualizations
* Export reports (PDF/CSV)
* Review trend analysis
* Product comparison dashboard

---

# Contributors

Developed as a collaborative full-stack project.

---

# License

This project is intended for educational purposes. 