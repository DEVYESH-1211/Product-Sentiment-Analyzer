import axios from 'axios';
import type { ApiReview, ApiSummary, ApiKeyword } from './types';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

export default API;

export const searchProduct = (product: string) =>
  API.post('/search', { product });

export const getReviews = (product: string) =>
  API.get<ApiReview[]>(`/reviews/${encodeURIComponent(product)}`);

export const getSummary = (product: string) =>
  API.get<ApiSummary>(`/summary/${encodeURIComponent(product)}`);

export const getKeywords = (product: string) =>
  API.get<ApiKeyword[]>(`/keywords/${encodeURIComponent(product)}`);