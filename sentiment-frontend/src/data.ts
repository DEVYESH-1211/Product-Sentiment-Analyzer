export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Review {
  id: string;
  reviewerName: string;
  date: string;
  rating: number; // 1-5
  sentiment: Sentiment;
  text: string;
  snippet: string;
}

export interface Product {
  id: string;
  name: string;
  reviews: Review[];
}

export const mockProducts: Product[] = [];
