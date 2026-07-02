import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Smartphone, Headphones } from 'lucide-react';
import { mockProducts } from '../data';

interface SearchBarProps {
  onSelectProduct: (productId: string) => void;
}

const placeholders = ["Search Samsung Galaxy S25...", "Search iPhone 16 Pro...", "Search Sony WH-1000XM6..."];

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectProduct }) => {
  const [query, setQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = mockProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="search-container" style={{ position: 'relative', zIndex: 50 }}>
      <div className="cyber-card-wrapper" style={{ display: 'block' }}>
        <div 
          className={`cyber-card`}
          style={{ 
            display: 'flex', 
            flexDirection: 'row',
            alignItems: 'center', 
            padding: '1.25rem 1.5rem', 
            transition: 'all 0.3s ease',
            boxShadow: isFocused ? '0 0 20px var(--accent-primary)' : 'none',
            border: isFocused ? '1px solid var(--accent-primary)' : '1px solid transparent'
          }}
        >
          <Search size={24} style={{ marginRight: '1rem', color: 'var(--accent-primary)' }} />
          <div style={{ position: 'relative', flex: 1, height: '24px' }}>
            <AnimatePresence mode="wait">
              {!query && (
                <motion.div
                  key={placeholderIdx}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ position: 'absolute', top: 0, left: 0, color: 'var(--text-secondary)', pointerEvents: 'none', lineHeight: '24px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  {placeholders[placeholderIdx]}
                </motion.div>
              )}
            </AnimatePresence>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)} 
              style={{ 
                width: '100%', 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '1rem',
                lineHeight: '24px',
                position: 'relative',
                zIndex: 1
              }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && query && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="cyber-card-wrapper"
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '1rem' }}
          >
            <div className="cyber-card" style={{ maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
              {filteredProducts.length > 0 ? filteredProducts.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => {
                    onSelectProduct(p.id);
                    setQuery(p.name);
                    setIsFocused(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', padding: '1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s ease', fontFamily: 'var(--font-heading)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.1)'; e.currentTarget.style.textShadow = '0 0 8px var(--accent-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.textShadow = 'none'; }}
                >
                  {p.name.includes('Sony') ? <Headphones size={20} style={{ marginRight: '1rem', color: 'var(--accent-secondary)' }} /> : <Smartphone size={20} style={{ marginRight: '1rem', color: 'var(--accent-secondary)' }} />}
                  <span style={{ fontWeight: 500, letterSpacing: '1px' }}>{p.name}</span>
                </div>
              )) : (
                <div style={{ padding: '1.5rem', color: 'var(--accent-secondary)', textAlign: 'center', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>[ NO DATA FOUND ]</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
