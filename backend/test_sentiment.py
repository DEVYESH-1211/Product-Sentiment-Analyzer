import unittest
import sys
import os

# Add the current directory to sys.path to resolve local imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import sentiment

class TestSentimentModule(unittest.TestCase):
    def setUp(self):
        # Sample reviews based on schemas in the project documents
        self.sample_reviews = [
            {
                "product": "Samsung Galaxy S25",
                "review": "Excellent battery life and smooth performance 👌.",
                "rating": 5,
                "reviewer": "John Doe",
                "date": "2026-06-26",
                "source": "Amazon"
            },
            {
                "product": "Samsung Galaxy S25",
                "review": "This is a bad and terrible product, a total waste of money! <br> Avoid it.",
                "rating": 1,
                "reviewer": "Jane Doe",
                "date": "2026-06-27",
                "source": "BestBuy"
            },
            {
                "product": "Samsung Galaxy S25",
                "review": "It is okay, nothing special but it works. Average build.",
                "rating": 3,
                "reviewer": "Bob Smith",
                "date": "2026-06-28",
                "source": "Amazon"
            }
        ]

    def test_preprocess_reviews(self):
        cleaned = sentiment.preprocess_reviews(self.sample_reviews)
        self.assertEqual(len(cleaned), len(self.sample_reviews))
        
        # Emoji removed from first review, and double spaces resolved
        self.assertNotIn("👌", cleaned[0]["review"])
        self.assertIn("Excellent battery life and smooth performance.", cleaned[0]["review"])
        
        # HTML tag removed from second review
        self.assertNotIn("<br>", cleaned[1]["review"])
        self.assertNotIn("<br >", cleaned[1]["review"])
        self.assertIn("Avoid it.", cleaned[1]["review"])

    def test_analyze_reviews_default(self):
        # Runs using either NLTK VADER or Fallback depending on environment
        cleaned = sentiment.preprocess_reviews(self.sample_reviews)
        analyzed = sentiment.analyze_reviews(cleaned)
        
        for idx, review in enumerate(analyzed):
            self.assertIn("sentiment", review)
            self.assertIn("confidence", review)
            self.assertIsInstance(review["sentiment"], str)
            self.assertIsInstance(review["confidence"], float)
            self.assertTrue(0.0 <= review["confidence"] <= 1.0)
            
        self.assertEqual(analyzed[0]["sentiment"], "Positive")
        self.assertEqual(analyzed[1]["sentiment"], "Negative")

    def test_fallback_analyzer(self):
        # Force the fallback analyzer to run
        sentiment._vader_initialized = False
        sentiment.SentimentIntensityAnalyzer = None
        
        cleaned = sentiment.preprocess_reviews(self.sample_reviews)
        analyzed = sentiment.analyze_reviews(cleaned)
        
        # Verify fallback classifies sentiment properly
        self.assertEqual(analyzed[0]["sentiment"], "Positive")
        self.assertEqual(analyzed[1]["sentiment"], "Negative")
        
        # Verify basic negation logic in fallback
        negated_review = [{"review": "The camera is not good, very disappointing."}]
        negated_analyzed = sentiment.analyze_reviews(negated_review)
        self.assertEqual(negated_analyzed[0]["sentiment"], "Negative")
        
        # Verify "not bad" triggers positive
        not_bad_review = [{"review": "It is actually not bad."}]
        not_bad_analyzed = sentiment.analyze_reviews(not_bad_review)
        self.assertEqual(not_bad_analyzed[0]["sentiment"], "Positive")

        # Reset initialized state
        sentiment._vader_initialized = False

if __name__ == "__main__":
    unittest.main()
