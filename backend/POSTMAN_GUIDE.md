# Postman Testing Guide
## Product Sentiment Analyzer — Backend

This guide walks through testing every API endpoint in Postman, including both happy-path and error scenarios. A ready-to-import collection file (`postman_collection.json`) is included alongside this guide.

---

## 0. Setup

1. Open Postman and click **Import** → select `postman_collection.json`.
2. Create a Postman **Environment** named `Local` with:

   | Variable | Value |
   |---|---|
   | `base_url` | `http://localhost:5000` |

3. Select the `Local` environment from the top-right dropdown before running any requests.
4. Make sure the Flask server is running (`python app.py`) before testing.

---

## 1. Health Check

**Request:** `GET {{base_url}}/health`

**Test Case: Successful request**
- No body needed.
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  { "success": true, "data": { "status": "ok", "database": "connected" } }
  ```

---

## 2. Search Product — `POST /search`

**Test Case 1: Successful request**
- Body (raw JSON):
  ```json
  { "product_name": "iPhone 15" }
  ```
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  { "success": true, "data": { "product_name": "iPhone 15", "reviews_collected": 45, "status": "search_complete" } }
  ```

**Test Case 2: Missing JSON body**
- Send the request with **no body** at all (not even `{}`).
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  { "success": false, "error": "Request body is required" }
  ```

**Test Case 3: Empty product name**
- Body:
  ```json
  { "product_name": "" }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  { "success": false, "error": "product_name cannot be empty" }
  ```

**Test Case 4: Missing `product_name` field**
- Body:
  ```json
  { }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  { "success": false, "error": "product_name is required" }
  ```

**Test Case 5: Invalid JSON syntax**
- Body (malformed, e.g. trailing comma or unquoted key):
  ```
  { product_name: "iPhone 15", }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  { "success": false, "error": "Invalid JSON format" }
  ```

**Test Case 6: Internal server error (simulated)**
- Trigger by pointing `MONGO_URI` to an unreachable database, or by stopping MongoDB before sending the request.
- **Expected Status:** `500 Internal Server Error`
- **Expected Response:**
  ```json
  { "success": false, "error": "Internal server error" }
  ```

---

## 3. Get Reviews — `GET /reviews/<product_name>`

**Test Case 1: Successful request**
- URL: `{{base_url}}/reviews/iPhone 15`
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  { "success": true, "data": { "product_name": "iPhone 15", "review_count": 45, "reviews": [ { "review_id": "r001", "text": "Great battery life.", "rating": 5, "sentiment": "positive" } ] } }
  ```

**Test Case 2: Empty product name**
- URL: `{{base_url}}/reviews/` (trailing slash, no name)
- **Expected Status:** `400 Bad Request` (or `404` if the route itself doesn't match — confirm against actual `app.py` routing)
- **Expected Response:**
  ```json
  { "success": false, "error": "product_name cannot be empty" }
  ```

**Test Case 3: Product not found**
- URL: `{{base_url}}/reviews/NonexistentProductXYZ`
- **Expected Status:** `404 Not Found`
- **Expected Response:**
  ```json
  { "success": false, "error": "Product not found" }
  ```

**Test Case 4: Internal server error (simulated)**
- Simulate by disconnecting MongoDB.
- **Expected Status:** `500 Internal Server Error`
- **Expected Response:**
  ```json
  { "success": false, "error": "Internal server error" }
  ```

---

## 4. Get Sentiment Summary — `GET /summary/<product_name>`

**Test Case 1: Successful request**
- URL: `{{base_url}}/summary/iPhone 15`
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  { "success": true, "data": { "product_name": "iPhone 15", "total_reviews": 45, "positive": 30, "negative": 8, "neutral": 7, "overall_sentiment": "positive", "average_score": 0.42 } }
  ```

**Test Case 2: Empty product name**
- URL: `{{base_url}}/summary/`
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  { "success": false, "error": "product_name cannot be empty" }
  ```

**Test Case 3: Product not found**
- URL: `{{base_url}}/summary/NonexistentProductXYZ`
- **Expected Status:** `404 Not Found`
- **Expected Response:**
  ```json
  { "success": false, "error": "Product not found" }
  ```

**Test Case 4: Internal server error (simulated)**
- Simulate by disconnecting MongoDB.
- **Expected Status:** `500 Internal Server Error`
- **Expected Response:**
  ```json
  { "success": false, "error": "Internal server error" }
  ```

---

## 5. Get Keywords — `GET /keywords/<product_name>`

**Test Case 1: Successful request**
- URL: `{{base_url}}/keywords/iPhone 15`
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  { "success": true, "data": { "product_name": "iPhone 15", "keywords": [ { "term": "battery life", "count": 18 } ] } }
  ```

**Test Case 2: Empty product name**
- URL: `{{base_url}}/keywords/`
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  { "success": false, "error": "product_name cannot be empty" }
  ```

**Test Case 3: Product not found**
- URL: `{{base_url}}/keywords/NonexistentProductXYZ`
- **Expected Status:** `404 Not Found`
- **Expected Response:**
  ```json
  { "success": false, "error": "Product not found" }
  ```

**Test Case 4: Internal server error (simulated)**
- Simulate by disconnecting MongoDB.
- **Expected Status:** `500 Internal Server Error`
- **Expected Response:**
  ```json
  { "success": false, "error": "Internal server error" }
  ```

---

## 6. Suggested Postman Test Scripts

Add this to the **Tests** tab of each request to auto-validate status codes:

```javascript
pm.test("Status code is as expected", function () {
    pm.response.to.have.status(pm.expectedStatus || 200);
});

pm.test("Response has 'success' field", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("success");
});
```

For error-case requests, override the expected status per request using a pre-request script variable, e.g.:
```javascript
pm.variables.set("expectedStatus", 400);
```

---

## 7. Test Case Summary Table

| # | Endpoint | Scenario | Expected Status |
|---|---|---|---|
| 1 | `GET /health` | Successful | 200 |
| 2 | `POST /search` | Successful | 200 |
| 3 | `POST /search` | Missing JSON body | 400 |
| 4 | `POST /search` | Empty `product_name` | 400 |
| 5 | `POST /search` | Missing `product_name` field | 400 |
| 6 | `POST /search` | Internal server error | 500 |
| 7 | `GET /reviews/<product_name>` | Successful | 200 |
| 8 | `GET /reviews/<product_name>` | Empty product name | 400 |
| 9 | `GET /reviews/<product_name>` | Product not found | 404 |
| 10 | `GET /reviews/<product_name>` | Internal server error | 500 |
| 11 | `GET /summary/<product_name>` | Successful | 200 |
| 12 | `GET /summary/<product_name>` | Empty product name | 400 |
| 13 | `GET /summary/<product_name>` | Product not found | 404 |
| 14 | `GET /summary/<product_name>` | Internal server error | 500 |
| 15 | `GET /keywords/<product_name>` | Successful | 200 |
| 16 | `GET /keywords/<product_name>` | Empty product name | 400 |
| 17 | `GET /keywords/<product_name>` | Product not found | 404 |
| 18 | `GET /keywords/<product_name>` | Internal server error | 500 |