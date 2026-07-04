import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { SearchBar } from './components/SearchBar';
import { ReviewCard } from './components/ReviewCard';
import { AnalysisPanel } from './components/AnalysisPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { searchProduct, getReviews, getSummary, getKeywords } from './api/api';
import { mapApiReviewToReview, normalizeKeyword } from './api/types';
import type { ApiSummary } from './api/types';
import type { Review } from './types';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();

  const [product, setProduct] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ApiSummary | null>(null);
  const [keywords, setKeywords] = useState<{ word: string; count?: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const showConfetti = useMemo(() => {
    if (reviews.length === 0) return false;
    const positiveCount = reviews.filter(r => r.sentiment === 'positive').length;
    return positiveCount / reviews.length > 0.5;
  }, [reviews]);

  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = async (productName: string) => {
    const trimmed = productName.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // Step 1: tell the backend which product to (re)scrape/index.
      await searchProduct(trimmed);

      // Step 2: pull reviews, summary, and keywords for that product.
      const [reviewsRes, summaryRes, keywordsRes] = await Promise.all([
        getReviews(trimmed),
        getSummary(trimmed),
        getKeywords(trimmed),
      ]);

      setReviews(reviewsRes.data.map(mapApiReviewToReview));
      setSummary(summaryRes.data);
      setKeywords(keywordsRes.data.map(normalizeKeyword));
      setProduct(trimmed);
    } catch (err) {
      setReviews([]);
      setSummary(null);
      setKeywords([]);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) {
          setError(`No reviews found for "${trimmed}".`);
        } else if (status === 400) {
          setError('That request was invalid — try a different product name.');
        } else if (status === 500) {
          setError('The server hit an error processing that request. Please try again.');
        } else {
          setError('Unable to reach the server. Is the Flask API running?');
        }
      } else {
        setError('Something unexpected went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasResults = hasSearched && !loading && !error && reviews.length > 0;

  return (
    <div className="app-container">
      <style>{`
        @keyframes reviewsight-spin { to { transform: rotate(360deg); } }
        .reviewsight-spin { animation: reviewsight-spin 1s linear infinite; }
      `}</style>

      <div className="bg-grid"></div>
      <div className="bg-overlay"></div>
      <div className="scanlines"></div>
      <div className="ambient-glow"></div>
      
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem', position: 'relative', zIndex: 10 }}>
        {!hasResults ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="glitch-text" data-text="ReviewSight" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '4px' }}>ReviewSight</h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '0.2rem' }}>[ SYS.ACTIVE // SENTIMENT_ANALYZER_v2.0 ]</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '2px' }}>{product}</h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '0.2rem' }}>[ ANALYSIS COMPLETE // {reviews.length} REVIEWS ]</span>
          </div>
        )}
        <button 
          onClick={toggleTheme}
          className="cyber-card-wrapper"
          style={{ 
            padding: '0', 
            cursor: 'pointer', 
            background: 'transparent',
            border: 'none',
            marginLeft: 'auto'
          }}
        >
          <div className="cyber-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? <Sun size={24} color="var(--accent-tertiary)" /> : <Moon size={24} color="var(--accent-primary)" />}
          </div>
        </button>
      </header>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="cyber-card-wrapper" style={{ marginTop: '2rem' }}>
          <div className="cyber-card" style={{ padding: '4rem', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Loader2 size={32} color="var(--accent-primary)" className="reviewsight-spin" />
            <h2 style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 'normal', letterSpacing: '2px' }}>[ FETCHING DATA // ANALYZING REVIEWS ]</h2>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="cyber-card-wrapper" style={{ marginTop: '2rem' }}>
          <div className="cyber-card" style={{ padding: '4rem', textAlign: 'center', alignItems: 'center' }}>
            <h2 style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 'normal', letterSpacing: '2px' }}>[ ERROR // {error} ]</h2>
          </div>
        </div>
      )}

      {hasResults ? (
        <>
          <SummaryPanel reviews={reviews} summary={summary} />
          
          <div className="main-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            
            <aside>
              <AnalysisPanel reviews={reviews} keywords={keywords} />
            </aside>
          </div>
        </>
      ) : (
        !loading && !error && (
          <div className="cyber-card-wrapper" style={{ marginTop: '2rem' }}>
            <div className="cyber-card" style={{ padding: '4rem', textAlign: 'center', alignItems: 'center' }}>
              <h2 style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 'normal', letterSpacing: '2px' }}>[ WAITING FOR SYSTEM INPUT // NO DATA LOADED ]</h2>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;