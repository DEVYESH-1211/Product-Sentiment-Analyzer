import type { Review, Sentiment } from '../types';

/**
 * Raw shapes returned by the Flask backend.
 *
 * These are intentionally kept separate from `src/types.ts` (the shapes
 * every component actually renders). If your backend's field names turn
 * out to differ from what's guessed here, this is the ONE file to edit —
 * nothing in App.tsx or the components needs to change.
 */

export interface ApiReview {
  product?: string;
  review: string;
  rating: number;
  sentiment: string; // e.g. "Positive" | "Neutral" | "Negative"
  confidence?: number;
  date?: string;      // e.g. "2026-07-04"
  reviewer?: string;  // e.g. "Kesab Pradhan"
  source?: string;    // e.g. "Flipkart"
}

export interface ApiSummary {
  total_reviews?: number;
  average_rating?: number;
  positive_count?: number;
  neutral_count?: number;
  negative_count?: number;
  // Backend field names for /summary weren't specified — this index
  // signature keeps TypeScript happy if the real payload has more/other
  // fields. Tighten this up once you've confirmed the actual response.
  [key: string]: unknown;
}

export type ApiKeyword =
  | string
  | {
      keyword: string;
      count?: number;
    };

function normalizeSentiment(raw: string | undefined): Sentiment {
  const value = (raw || '').toLowerCase();
  if (value === 'positive' || value === 'neutral' || value === 'negative') {
    return value;
  }
  return 'neutral';
}

/**
 * Converts one raw backend review (`{ review, rating, sentiment, confidence,
 * date, reviewer, source }`) into the normalized `Review` shape every
 * component expects (`{ text, rating, sentiment, snippet, reviewerName,
 * date, source, ... }`).
 */
export function mapApiReviewToReview(apiReview: ApiReview, index: number): Review {
  const text = apiReview.review ?? '';
  return {
    id: `${apiReview.product ?? 'review'}-${index}`,
    rating: apiReview.rating,
    sentiment: normalizeSentiment(apiReview.sentiment),
    text,
    snippet: text.length > 90 ? `${text.slice(0, 90)}…` : text,
    confidence: apiReview.confidence,
    reviewerName: apiReview.reviewer,
    date: apiReview.date,
    source: apiReview.source,
  };
}

/**
 * The backend sends `{ keyword, count }`. Internally the app renders
 * `{ word, count }`, so the field is renamed here — this is the one place
 * that translation happens.
 */
export function normalizeKeyword(keyword: ApiKeyword): { word: string; count?: number } {
  return typeof keyword === 'string'
    ? { word: keyword }
    : { word: keyword.keyword, count: keyword.count };
}