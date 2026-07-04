export type Sentiment = 'positive' | 'neutral' | 'negative';

// This is now the app's internal, normalized review shape.
// Every component only ever sees this shape — backend field-name
// mismatches are resolved once, in src/api/types.ts.
export interface Review {
  id: string;
  rating: number; // 1-5
  sentiment: Sentiment;
  text: string;
  snippet: string;
  reviewerName?: string; // sent by the backend as "reviewer"
  date?: string;         // sent by the backend as "date"
  source?: string;       // sent by the backend as "source", e.g. "Flipkart"
  confidence?: number;   // sent by the backend (0-1) — optional in case it's ever missing
}

// Kept for compatibility with anything still referencing a "Product" shape.
// Safe to delete once you've confirmed nothing else imports it.
export interface Product {
  id: string;
  name: string;
  reviews: Review[];
}