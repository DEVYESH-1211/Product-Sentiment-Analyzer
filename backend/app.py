"""
=========================================================
Product Sentiment Analyzer
Flask Backend Integration Layer

Author  : Backend Team
Module  : app.py
Purpose :
    This file acts as the integration layer between the
    React frontend and backend modules.

NOTE:
    This file intentionally contains NO business logic.

    All processing is delegated to:

        scraper.py
        sentiment.py
        database.py
        analytics.py

=========================================================
"""

from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS

import config

from scraper import scrape_product
from sentiment import analyze_reviews
from database import (
    save_reviews,
    get_reviews,
)

from analytics import (
    get_summary,
    get_keywords,
)

##########################################################################
# Flask Application Initialization
##########################################################################

app = Flask(__name__)

# Load configuration
app.config.from_object(config)

# Enable CORS
CORS(app)

##########################################################################
# Helper Functions
##########################################################################


def success_response(
    data: Any,
    status_code: int = 200
):
    """
    Standard successful response.

    Returns
    -------
    {
        success: true,
        data: ...
    }
    """

    return (
        jsonify(
            {
                "success": True,
                "data": data
            }
        ),
        status_code
    )


def error_response(
    message: str,
    status_code: int
):
    """
    Standard error response.

    Returns
    -------
    {
        success: false,
        error: "..."
    }
    """

    return (
        jsonify(
            {
                "success": False,
                "error": message
            }
        ),
        status_code
    )


def validate_product_name(
    payload: Dict
):
    """
    Validate incoming POST payload.

    Expected JSON

    {
        "product_name": "Samsung Galaxy S25"
    }

    Returns
    -------
    None if valid

    otherwise

    Flask JSON response
    """

    if payload is None:
        return error_response(
            "Missing JSON request body.",
            400
        )

    if not isinstance(payload, dict):
        return error_response(
            "Invalid JSON data.",
            400
        )

    if "product_name" not in payload:
        return error_response(
            "Missing product_name field.",
            400
        )

    product = payload.get("product_name")

    if not isinstance(product, str):
        return error_response(
            "product_name must be a string.",
            400
        )

    if product.strip() == "":
        return error_response(
            "Product name cannot be empty.",
            400
        )

    return None


##########################################################################
# Health Check API
##########################################################################

@app.route("/health", methods=["GET"])
def health():
    """
    Health Check Endpoint

    GET /health

    Returns
    -------
    {
        success: true,
        message: "Backend is running"
    }
    """

    return (
        jsonify(
            {
                "success": True,
                "message": "Backend is running"
            }
        ),
        200
    )


##########################################################################
# Search API
##########################################################################

@app.route("/search", methods=["POST"])
def search_product():
    """
    POST /search

    Workflow

        Receive Product Name

                ↓

        scrape_product()

                ↓

        analyze_reviews()

                ↓

        save_reviews()

                ↓

        Return JSON Response
    """

    try:

        ###############################################################
        # Validate Request
        ###############################################################

        payload = request.get_json(
            silent=True
        )

        validation = validate_product_name(payload)

        if validation:
            return validation

        product_name = payload["product_name"].strip()

        ###############################################################
        # Step 1
        # Scrape Reviews
        ###############################################################

        reviews = scrape_product(product_name)

        if reviews is None:

            return error_response(
                "Scraper returned no data.",
                500
            )

        if len(reviews) == 0:

            return error_response(
                "No reviews found for the given product.",
                404
            )

        ###############################################################
        # Step 2
        # Sentiment Analysis
        ###############################################################

        processed_reviews = analyze_reviews(
            reviews
        )

        if processed_reviews is None:

            return error_response(
                "Sentiment analysis failed.",
                500
            )

        ###############################################################
        # Step 3
        # Save Reviews
        ###############################################################

        saved = save_reviews(
            processed_reviews
        )

        if not saved:

            return error_response(
                "Unable to save reviews.",
                500
            )

        ###############################################################
        # Success Response
        ###############################################################

        response = {
            "product": product_name,
            "count": len(processed_reviews),
            "data": processed_reviews
        }

        return success_response(
            response,
            200
        )

    except Exception as exception:

        app.logger.exception(exception)

        return error_response(
            "Unable to process request.",
            500
        )


##########################################################################
# Reviews API
##########################################################################

@app.route("/reviews/<string:product_name>", methods=["GET"])
def reviews(product_name: str):
    """
    GET /reviews/<product_name>

    Workflow

        database.get_reviews(product_name)

                    ↓

            Return JSON Response
    """

    try:

        product_name = product_name.strip()

        if not product_name:
            return error_response(
                "Product name cannot be empty.",
                400
            )

        reviews = get_reviews(product_name)

        if reviews is None:
            return error_response(
                "Unable to retrieve reviews.",
                500
            )

        if len(reviews) == 0:
            return error_response(
                "No reviews found.",
                404
            )

        response = {
            "product": product_name,
            "count": len(reviews),
            "data": reviews
        }

        return success_response(response)

    except Exception as exception:

        app.logger.exception(exception)

        return error_response(
            "Unable to retrieve reviews.",
            500
        )


##########################################################################
# Summary API
##########################################################################

@app.route("/summary/<string:product_name>", methods=["GET"])
def summary(product_name: str):
    """
    GET /summary/<product_name>

    Workflow

        database.get_reviews(product)

                    ↓

        analytics.get_summary(reviews)

                    ↓

            Return JSON Response
    """

    try:

        product_name = product_name.strip()

        if not product_name:
            return error_response(
                "Product name cannot be empty.",
                400
            )

        reviews = get_reviews(product_name)

        if reviews is None:
            return error_response(
                "Unable to retrieve reviews.",
                500
            )

        if len(reviews) == 0:
            return error_response(
                "No reviews found.",
                404
            )

        summary_data = get_summary(reviews)

        response = {
            "product": product_name,
            "summary": summary_data
        }

        return success_response(response)

    except Exception as exception:

        app.logger.exception(exception)

        return error_response(
            "Unable to generate summary.",
            500
        )


##########################################################################
# Keywords API
##########################################################################

@app.route("/keywords/<string:product_name>", methods=["GET"])
def keywords(product_name: str):
    """
    GET /keywords/<product_name>

    Workflow

        database.get_reviews(product)

                    ↓

        analytics.get_keywords(reviews)

                    ↓

            Return JSON Response
    """

    try:

        product_name = product_name.strip()

        if not product_name:
            return error_response(
                "Product name cannot be empty.",
                400
            )

        reviews = get_reviews(product_name)

        if reviews is None:
            return error_response(
                "Unable to retrieve reviews.",
                500
            )

        if len(reviews) == 0:
            return error_response(
                "No reviews found.",
                404
            )

        keywords_data = get_keywords(reviews)

        response = {
            "product": product_name,
            "keywords": keywords_data
        }

        return success_response(response)

    except Exception as exception:

        app.logger.exception(exception)

        return error_response(
            "Unable to extract keywords.",
            500
        )


##########################################################################
# Global Error Handlers
##########################################################################

@app.errorhandler(400)
def bad_request(error):
    """
    HTTP 400
    """

    return error_response(
        "Bad Request.",
        400
    )


@app.errorhandler(404)
def not_found(error):
    """
    HTTP 404
    """

    return error_response(
        "Resource not found.",
        404
    )


@app.errorhandler(405)
def method_not_allowed(error):
    """
    HTTP 405
    """

    return error_response(
        "Method not allowed.",
        405
    )


@app.errorhandler(500)
def internal_server_error(error):
    """
    HTTP 500
    """

    return error_response(
        "Internal server error.",
        500
    )


##########################################################################
# Main Entry Point
##########################################################################

if __name__ == "__main__":

    app.run(
        host=app.config.get("HOST", "0.0.0.0"),
        port=app.config.get("PORT", 5000),
        debug=app.config.get("DEBUG", True)
    )
