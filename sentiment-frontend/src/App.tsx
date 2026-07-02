import { useState, useMemo, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { mockProducts } from './data';
import { SearchBar } from './components/SearchBar';
import { ReviewCard } from './components/ReviewCard';
import { AnalysisPanel } from './components/AnalysisPanel';
import { SummaryPanel } from './components/SummaryPanel';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const selectedProduct = useMemo(() => 
    mockProducts.find(p => p.id === selectedProductId), 
    [selectedProductId]
  );

  const reviews = selectedProduct?.reviews || [];
  
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

  return (
    <div className="app-container">
      <div className="bg-grid"></div>
      <div className="bg-overlay"></div>
      <div className="scanlines"></div>
      <div className="ambient-glow"></div>
      
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem', position: 'relative', zIndex: 10 }}>
        {!selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="glitch-text" data-text="ReviewSight" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '4px' }}>ReviewSight</h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '0.2rem' }}>[ SYS.ACTIVE // SENTIMENT_ANALYZER_v2.0 ]</span>
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

      <SearchBar onSelectProduct={setSelectedProductId} />

      {selectedProduct ? (
        <>
          <SummaryPanel reviews={reviews} />
          
          <div className="main-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            
            <aside>
              <AnalysisPanel reviews={reviews} />
            </aside>
          </div>
        </>
      ) : (
        <div className="cyber-card-wrapper" style={{ marginTop: '2rem' }}>
          <div className="cyber-card" style={{ padding: '4rem', textAlign: 'center', alignItems: 'center' }}>
            <h2 style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 'normal', letterSpacing: '2px' }}>[ WAITING FOR SYSTEM INPUT // NO DATA LOADED ]</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
