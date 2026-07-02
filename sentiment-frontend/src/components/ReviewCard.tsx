import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Review } from '../data';
import { Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getSentimentGlow = () => {
    if (review.sentiment === 'positive') return 'var(--glow-positive)';
    if (review.sentiment === 'negative') return 'var(--glow-negative)';
    return 'var(--glow-neutral)';
  };

  const getSentimentIcon = () => {
    if (review.sentiment === 'positive') return <ThumbsUp size={20} color="#10b981" />;
    if (review.sentiment === 'negative') return <ThumbsDown size={20} color="#ef4444" />;
    return <Minus size={20} color="#f59e0b" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
      style={{ perspective: 1000, height: '220px', cursor: 'pointer' }} 
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front side */}
        <div className="cyber-card" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '2px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={28} fill={i < review.rating ? "#facc15" : "transparent"} color="#facc15" strokeWidth={1.5} />
            ))}
          </div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.4rem 1.5rem', 
            borderRadius: '24px', 
            border: `1px solid ${getSentimentGlow()}`,
            boxShadow: `0 0 10px ${getSentimentGlow()}40`
          }}>
            {getSentimentIcon()}
            <span style={{ fontWeight: 600, color: 'white', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>{review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}</span>
          </div>
        </div>

        {/* Back side */}
        <div className="cyber-card" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${getSentimentGlow()}`,
          boxShadow: `inset 0 0 20px ${getSentimentGlow()}30`,
          overflowY: 'auto'
        }}>
          <p style={{ fontStyle: 'italic', flex: 1, fontSize: '0.9rem', color: 'var(--text-primary)' }}>"{review.text}"</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>{review.reviewerName}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{review.date}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
