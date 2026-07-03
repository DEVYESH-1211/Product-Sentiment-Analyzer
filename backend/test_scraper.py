from scraper import scrape_product
from sentiment import analyze_reviews
from analytics import get_summary, get_keywords

reviews = scrape_product("iPhone 15")

print(f"Scraped {len(reviews)} reviews")

reviews = analyze_reviews(reviews)

summary = get_summary(reviews)
keywords = get_keywords(reviews)

print(summary)
print(keywords)