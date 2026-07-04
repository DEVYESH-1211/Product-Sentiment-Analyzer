import re
from collections import Counter

_STOPWORDS = {
    "the", "a", "an", "is", "it", "this", "that", "and", "or", "but",
    "to", "of", "in", "on", "for", "with", "as", "was", "were", "be",
    "been", "being", "i", "we", "you", "they", "he", "she", "my", "our",
    "your", "are", "at", "by", "not", "no", "very", "so", "too", "just",
    "really", "have", "has", "had", "will", "would", "can", "could",
    "do", "does", "did", "than", "then", "from", "its", "im", "ive",
    "if", "all", "out", "up", "me", "good", "bad", "product", "item",
}


def _normalize_sentiment(value: str) -> str:
    """Map any case/format of sentiment string to 'positive'/'neutral'/'negative'/'unknown'."""
    if not value:
        return "unknown"
    value = value.strip().lower()
    if value in ("positive", "neutral", "negative"):
        return value
    return "unknown"


def _extract_words(text: str) -> list:
    """Lowercase, strip punctuation, split into words, drop stopwords/short tokens."""
    if not text:
        return []
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return [w for w in words if w not in _STOPWORDS and len(w) > 2]



def get_summary(reviews: list) -> dict:
    """
    Compute summary analytics for a list of reviews.

    Returns:
    {
        "total_reviews": int,
        "average_rating": float,
        "positive": int,
        "neutral": int,
        "negative": int
    }
    """
    total = len(reviews)

    if total == 0:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "positive": 0,
            "neutral": 0,
            "negative": 0,
        }

    sentiment_counts = Counter()
    rating_sum = 0
    rating_count = 0

    for r in reviews:
        sentiment_counts[_normalize_sentiment(r.get("sentiment"))] += 1

        rating = r.get("rating")
        if isinstance(rating, (int, float)):
            rating_sum += rating
            rating_count += 1

    average_rating = round(rating_sum / rating_count, 2) if rating_count else 0

    return {
        "total_reviews": total,
        "average_rating": average_rating,
        "positive": sentiment_counts.get("positive", 0),
        "neutral": sentiment_counts.get("neutral", 0),
        "negative": sentiment_counts.get("negative", 0),
    }


def get_rating_distribution(reviews: list) -> dict:
    """
    Count how many reviews fall under each star rating (1-5).
    Useful for rendering a Rating Bar Chart on the frontend.

    Returns:
    {
        "1": 2,
        "2": 0,
        "3": 5,
        "4": 8,
        "5": 12
    }
    Keys are strings so the dict serializes cleanly to JSON and maps
    directly to chart labels on the frontend.
    """
    distribution = {str(i): 0 for i in range(1, 6)}

    for r in reviews:
        rating = r.get("rating")
        if isinstance(rating, (int, float)) and 1 <= rating <= 5:
            key = str(int(round(rating)))
            distribution[key] += 1

    return distribution


def get_sentiment_distribution(reviews: list) -> dict:
    """
    Count how many reviews fall under each sentiment label.
    Useful for rendering a Sentiment Pie Chart on the frontend.

    Returns:
    {
        "positive": 12,
        "neutral": 5,
        "negative": 3
    }
    Reviews with a missing/unrecognized sentiment are not counted here
    (use get_summary() if you need an "unknown" bucket too).
    """
    distribution = {"positive": 0, "neutral": 0, "negative": 0}

    for r in reviews:
        sentiment = _normalize_sentiment(r.get("sentiment"))
        if sentiment in distribution:
            distribution[sentiment] += 1

    return distribution


def get_keywords(reviews: list, top_n: int = 10) -> list:
    """
    Extract the most frequent meaningful keywords across all reviews.

    Returns a list of dicts, most frequent first:
    [
        {"keyword": "battery", "count": 14},
        {"keyword": "camera", "count": 9},
        ...
    ]
    """
    if not reviews:
        return []

    word_counter = Counter()
    for r in reviews:
        word_counter.update(_extract_words(r.get("review", "")))

    most_common = word_counter.most_common(top_n)
    return [{"keyword": word, "count": count} for word, count in most_common]


# ---------------------------------------------------------------------
# Quick manual test (only runs when this file is executed directly,
# never when imported by app.py)
# ---------------------------------------------------------------------
if __name__ == "__main__":
    sample_reviews = [
        {"review": "Excellent battery life and great camera.", "rating": 5, "sentiment": "Positive"},
        {"review": "Battery drains too fast, disappointing.", "rating": 2, "sentiment": "Negative"},
        {"review": "Average phone, camera is okay.", "rating": 3, "sentiment": "Neutral"},
        {"review": "Best battery I've used, amazing camera quality.", "rating": 5, "sentiment": "Positive"},
    ]

    print("Summary:", get_summary(sample_reviews))
    print("Rating Distribution:", get_rating_distribution(sample_reviews))
    print("Sentiment Distribution:", get_sentiment_distribution(sample_reviews))
    print("Keywords:", get_keywords(sample_reviews, top_n=5))