import re
import logging
from typing import List, Dict

import nltk

logger = logging.getLogger(__name__)

try:
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
except ImportError:
    # If NLTK is not installed, we define a placeholder and use fallback
    SentimentIntensityAnalyzer = None

# Regex to match emojis and supplementary Unicode plane symbols
EMOJI_PATTERN = re.compile(
    r"["
    r"\U00010000-\U0010FFFF"  # Supplementary Planes (emojis, etc.)
    r"\u2600-\u27BF"          # Miscellaneous Symbols and Dingbats
    r"\u2300-\u23FF"          # Miscellaneous Technical
    r"\u2b50"                 # Star emoji
    r"\u2934-\u2935"          # Arrows
    r"]+", flags=re.UNICODE
)

class FallbackSentimentAnalyzer:
    """
    A lightweight, rule-based sentiment analyzer that acts as a zero-dependency fallback
    when NLTK VADER cannot be loaded or downloaded.
    """
    def __init__(self):
        # Curated lexicons for common product review sentiments
        self.positive_words = {
            'good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome',
            'perfect', 'nice', 'wonderful', 'outstanding', 'fantastic', 'satisfied',
            'superb', 'happy', 'smooth', 'impressed', 'cool', 'well', 'easy',
            'fast', 'beautiful', 'recommend', 'perfectly', 'worth', 'glad', 'fine',
            'pleased', 'reliable', 'sturdy', 'exceptional', 'brilliant', 'durable'
        }
        self.negative_words = {
            'bad', 'worst', 'terrible', 'awful', 'hate', 'disappointed', 'poor',
            'useless', 'broken', 'waste', 'slow', 'fail', 'defect', 'problem',
            'issue', 'horrible', 'difficult', 'annoying', 'expensive', 'sucks',
            'suck', 'cheap', 'return', 'returned', 'refund', 'junk', 'disappointment',
            'lag', 'laggy', 'faulty', 'flimsy', 'poorly', 'regret', 'broke', 'useless'
        }
        
    def polarity_scores(self, text: str) -> dict:
        """
        Calculates polarity scores similarly to VADER: pos, neg, neu, compound.
        """
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        if not words:
            return {'pos': 0.0, 'neg': 0.0, 'neu': 1.0, 'compound': 0.0}
            
        negations = {'not', 'no', 'never', 'neither', 'nor', 'dont', "don't", 'cant', "can't", 'wasnt', "wasn't, isn't, aren't, won't, shouldn't, couldn't, didn't, doesn't"}
        pos_count = 0
        neg_count = 0
        
        for idx, word in enumerate(words):
            if word in self.positive_words:
                # Check for preceding negation within 2 words
                is_negated = False
                for prev_idx in range(max(0, idx - 2), idx):
                    if words[prev_idx] in negations:
                        is_negated = True
                        break
                if is_negated:
                    neg_count += 1
                else:
                    pos_count += 1
            elif word in self.negative_words:
                is_negated = False
                for prev_idx in range(max(0, idx - 2), idx):
                    if words[prev_idx] in negations:
                        is_negated = True
                        break
                if is_negated:
                    pos_count += 1  # e.g., "not bad" is positive
                else:
                    neg_count += 1
                    
        total = pos_count + neg_count
        if total == 0:
            return {'pos': 0.0, 'neg': 0.0, 'neu': 1.0, 'compound': 0.0}
            
        # compound score represents overall valence: -1.0 to 1.0
        compound = (pos_count - neg_count) / total
        
        pos_ratio = pos_count / len(words)
        neg_ratio = neg_count / len(words)
        neu_ratio = 1.0 - pos_ratio - neg_ratio
        
        return {
            'pos': pos_ratio,
            'neg': neg_ratio,
            'neu': neu_ratio,
            'compound': compound
        }


# Lazy loaded VADER or Fallback analyzer
_sia = None
_vader_initialized = False

def _init_analyzer():
    global _sia, _vader_initialized
    if _vader_initialized:
        return
        
    if SentimentIntensityAnalyzer is not None:
        try:
            # Check if vader_lexicon is already available. We deliberately do NOT
            # call nltk.download() here: downloading dependencies at runtime is
            # unreliable in production/deployed environments (no network access,
            # read-only filesystem, etc.). The lexicon should be installed ahead
            # of time as part of the build/deploy process.
            nltk.data.find('sentiment/vader_lexicon.zip')
            _sia = SentimentIntensityAnalyzer()
        except LookupError:
            logger.warning(
                "NLTK vader_lexicon not found. Run `python -m nltk.downloader "
                "vader_lexicon` as part of your build step. Falling back to the "
                "built-in lexicon-based analyzer for now."
            )
            _sia = FallbackSentimentAnalyzer()
        except Exception:
            logger.exception("Failed to initialize VADER; using fallback analyzer.")
            _sia = FallbackSentimentAnalyzer()
    else:
        # Fall back to custom lexicon if nltk vader is not importable
        _sia = FallbackSentimentAnalyzer()
        
    _vader_initialized = True


def clean_text(text: str) -> str:
    """
    Cleans raw review text by removing HTML tags, emojis, and normalizing whitespace.
    """
    if not isinstance(text, str):
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    # Remove emojis
    text = EMOJI_PATTERN.sub('', text)
    # Normalize multiple whitespaces (spaces, newlines, tabs) to a single space
    text = re.sub(r'\s+', ' ', text)
    # Remove spacing before punctuation marks (like " ." -> ".")
    text = re.sub(r'\s+([.,!?])', r'\1', text)
    return text.strip()


def preprocess_reviews(reviews: List[Dict]) -> List[Dict]:
    """
    Clean review text.
    
    Accepts a list of review dictionaries and modifies/returns them with cleaned text.
    Each review dictionary should contain a "review" key with the raw text.
    """
    if not isinstance(reviews, list):
        return []
        
    cleaned_reviews = []
    for item in reviews:
        if not isinstance(item, dict):
            continue
        cleaned_item = item.copy()
        raw_text = cleaned_item.get("review", "")
        cleaned_item["review"] = clean_text(raw_text)
        cleaned_reviews.append(cleaned_item)
        
    return cleaned_reviews


def analyze_reviews(reviews: List[Dict]) -> List[Dict]:
    """
    Predict sentiment for every review.

    Accepts a list of review dictionaries, cleans and analyzes their "review"
    text, and returns the list with "sentiment" and "confidence" keys added.
    Cleaning (HTML/emoji stripping, whitespace normalization) is performed
    internally via preprocess_reviews(), so callers only need to call this
    one function.

    Sentiment labels: "Positive", "Neutral", "Negative"
    Confidence score: Float (0.0 to 1.0)
    """
    if not isinstance(reviews, list):
        return []

    _init_analyzer()

    cleaned_reviews = preprocess_reviews(reviews)

    analyzed_reviews = []
    for cleaned_item in cleaned_reviews:
        text = cleaned_item.get("review", "")

        # Default behavior for empty or blank review text
        if not text.strip():
            cleaned_item["sentiment"] = "Neutral"
            cleaned_item["confidence"] = 0.50
            analyzed_reviews.append(cleaned_item)
            continue
            
        scores = _sia.polarity_scores(text)
        compound = scores.get('compound', 0.0)
        
        # Map compound scores to categories:
        # compound >= 0.05 -> Positive
        # compound <= -0.05 -> Negative
        # otherwise -> Neutral
        if compound >= 0.05:
            sentiment = "Positive"
            # Map compound [0.05, 1.0] linearly to confidence [0.5, 1.0]
            confidence = 0.5 + 0.5 * compound
        elif compound <= -0.05:
            sentiment = "Negative"
            # Map compound [-1.0, -0.05] linearly to confidence [0.5, 1.0]
            confidence = 0.5 + 0.5 * abs(compound)
        else:
            sentiment = "Neutral"
            # Map compound close to 0 to confidence close to 1.0
            confidence = 1.0 - 2.0 * abs(compound)
            confidence = max(0.5, min(1.0, confidence))
            
        cleaned_item["sentiment"] = sentiment
        cleaned_item["confidence"] = round(confidence, 2)
        analyzed_reviews.append(cleaned_item)
        
    return analyzed_reviews