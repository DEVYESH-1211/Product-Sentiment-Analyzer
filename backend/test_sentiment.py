from database import save_reviews, get_reviews

sample_reviews = [
    {
        "product": "Test Phone",
        "review": "Great!",
        "rating": 5,
        "sentiment": "Positive"
    }
]

save_reviews(sample_reviews)

print(get_reviews("Test Phone"))