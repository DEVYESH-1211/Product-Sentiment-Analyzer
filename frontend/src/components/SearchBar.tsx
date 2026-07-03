import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (productName: string) => void;
  loading?: boolean;
}

const placeholders = ["Search Samsung Galaxy S25...", "Search iPhone 16 Pro...", "Search Sony WH-1000XM6..."];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitSearch();
    }
  };

  return (
    <div className="search-container" style={{ position: 'relative', zIndex: 50 }}>
      <div className="cyber-card-wrapper" style={{ display: 'block' }}>
        <div
          className="cyber-card"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            transition: 'all 0.3s ease',
            boxShadow: isFocused ? '0 0 20px var(--accent-primary)' : 'none',
            border: isFocused ? '1px solid var(--accent-primary)' : '1px solid transparent',
            opacity: loading ? 0.7 : 1
          }}
        >
          <Search
            size={24}
            style={{ marginRight: '1rem', color: 'var(--accent-primary)', cursor: loading ? 'default' : 'pointer' }}
            onClick={submitSearch}
          />
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
              disabled={loading}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={handleKeyDown}
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
        {isFocused && query && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            [ press enter or click the search icon ]
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};