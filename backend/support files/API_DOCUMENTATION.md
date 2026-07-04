# Backend API Documentation
## Product Sentiment Analyzer

Base URL (local development):
```
http://localhost:5000
```

All responses are returned as JSON. Successful responses use a common
envelope of the form:

```json
{
  "success": true,
  "data": { }
}
```

Error responses use:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## 1. Health Check

### `GET /health`

**Description**
Checks whether the API server and its database connection are up and running. Useful for uptime monitoring and load balancer health checks.

**Request Body**
None.

**Success Response**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```
**HTTP Status Code:** `200 OK`

**Error Responses**

| Scenario | Status Code | Response |
|---|---|---|
| Database unreachable | `503 Service Unavailable` | `{"success": false, "error": "Database connection failed"}` |
| Unexpected server error | `500 Internal Server Error` | `{"success": false, "error": "Internal server error"}` |

---

## 2. Search Product

### `POST /search`

**Description**
Triggers a search-and-scrape operation for a given product name. Collects reviews from configured sources and stores them for later analysis.

**Request Body**
```json
{
  "product_name": "iPhone 15"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `product_name` | string | Yes | Must be a non-empty string |

**Success Response**
```json
{
  "success": true,
  "data": {
    "product_name": "iPhone 15",
    "reviews_collected": 45,
    "status": "search_complete"
  }
}
```
**HTTP Status Code:** `200 OK`

**Error Responses**

| Scenario | Status Code | Response |
|---|---|---|
| Missing JSON body | `400 Bad Request` | `{"success": false, "error": "Request body is required"}` |
| Empty `product_name` | `400 Bad Request` | `{"success": false, "error": "product_name cannot be empty"}` |
| `product_name` missing from body | `400 Bad Request` | `{"success": false, "error": "product_name is required"}` |
| Scraper/internal failure | `500 Internal Server Error` | `{"success": false, "error": "Internal server error"}` |

---

## 3. Get Reviews

### `GET /reviews/<product_name>`

**Description**
Retrieves all stored reviews for a given product name.

**Request Body**
None. `product_name` is passed as a URL path parameter.

**Example Request**
```
GET /reviews/iPhone%2015
```

**Success Response**
```json
{
  "success": true,
  "data": {
    "product_name": "iPhone 15",
    "review_count": 45,
    "reviews": [
      {
        "review_id": "r001",
        "text": "Great battery life and camera quality.",
        "rating": 5,
        "sentiment": "positive"
      }
    ]
  }
}
```
**HTTP Status Code:** `200 OK`

**Error Responses**

| Scenario | Status Code | Response |
|---|---|---|
| Empty `product_name` in path | `400 Bad Request` | `{"success": false, "error": "product_name cannot be empty"}` |
| Product not found | `404 Not Found` | `{"success": false, "error": "Product not found"}` |
| Internal/database error | `500 Internal Server Error` | `{"success": false, "error": "Internal server error"}` |

---

## 4. Get Sentiment Summary

### `GET /summary/<product_name>`

**Description**
Returns an aggregated sentiment summary (positive/negative/neutral breakdown) for a given product.

**Request Body**
None.

**Example Request**
```
GET /summary/iPhone%2015
```

**Success Response**
```json
{
  "success": true,
  "data": {
    "product_name": "iPhone 15",
    "total_reviews": 45,
    "positive": 30,
    "negative": 8,
    "neutral": 7,
    "overall_sentiment": "positive",
    "average_score": 0.42
  }
}
```
**HTTP Status Code:** `200 OK`

**Error Responses**

| Scenario | Status Code | Response |
|---|---|---|
| Empty `product_name` in path | `400 Bad Request` | `{"success": false, "error": "product_name cannot be empty"}` |
| Product not found | `404 Not Found` | `{"success": false, "error": "Product not found"}` |
| Internal/database error | `500 Internal Server Error` | `{"success": false, "error": "Internal server error"}` |

---

## 5. Get Keywords

### `GET /keywords/<product_name>`

**Description**
Returns the top extracted keywords/phrases mentioned in reviews for a given product, useful for surfacing common themes.

**Request Body**
None.

**Example Request**
```
GET /keywords/iPhone%2015
```

**Success Response**
```json
{
  "success": true,
  "data": {
    "product_name": "iPhone 15",
    "keywords": [
      { "term": "battery life", "count": 18 },
      { "term": "camera quality", "count": 15 },
      { "term": "price", "count": 9 }
    ]
  }
}
```
**HTTP Status Code:** `200 OK`

**Error Responses**

| Scenario | Status Code | Response |
|---|---|---|
| Empty `product_name` in path | `400 Bad Request` | `{"success": false, "error": "product_name cannot be empty"}` |
| Product not found | `404 Not Found` | `{"success": false, "error": "Product not found"}` |
| Internal/database error | `500 Internal Server Error` | `{"success": false, "error": "Internal server error"}` |

---

## Status Code Summary

| Code | Meaning | Used When |
|---|---|---|
| `200` | OK | Request succeeded |
| `400` | Bad Request | Invalid, missing, or empty input |
| `404` | Not Found | Requested product/resource does not exist |
| `500` | Internal Server Error | Unhandled exception on the server |
| `503` | Service Unavailable | Dependent service (e.g. database) is down |