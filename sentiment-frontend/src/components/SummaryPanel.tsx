import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Review } from '../data';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface SummaryPanelProps {
  reviews: Review[];
}

const AnimatedCounter: React.FC<{ value: number, isDecimal?: boolean }> = ({ value, isDecimal }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    if (value === 0) {
        setCount(0);
        return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{isDecimal ? count.toFixed(1) : Math.floor(count)}</span>;
};

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ reviews }) => {
  const total = reviews.length || 1;
  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 0;
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const neutral = reviews.filter(r => r.sentiment === 'neutral').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;

  const stats = [
    { 
      label: 'Avg Rating', 
      value: avgRating, 
      icon: null, 
      isDecimal: true, 
      color: '#00e5ff', // Cyan
      percentage: (avgRating / 5) * 100 
    },
    { 
      label: 'Positive', 
      value: positive, 
      icon: <ThumbsUp size={20} color="#39ff14" />, 
      color: '#39ff14', // Green
      percentage: (positive / total) * 100 
    },
    { 
      label: 'Neutral', 
      value: neutral, 
      icon: <Minus size={20} color="#ffb300" />, 
      color: '#ffb300', // Yellow
      percentage: (neutral / total) * 100 
    },
    { 
      label: 'Negative', 
      value: negative, 
      icon: <ThumbsDown size={20} color="#ff0055" />, 
      color: '#ff0055', // Pink
      percentage: (negative / total) * 100 
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
          className="cyber-card-wrapper"
        >
          <div 
            className="cyber-card" 
            style={{ 
              padding: '1.25rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              border: `1px solid rgba(255,255,255,0.05)`,
              borderBottom: `2px solid ${stat.color}`,
              borderLeft: `2px solid ${stat.color}`,
              boxShadow: `inset -10px 10px 30px rgba(0,0,0,0.5), inset 0 0 10px ${stat.color}20, 0 5px 15px rgba(0,0,0,0.3)`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              {stat.icon && (
                <div style={{ padding: '0.5rem', border: `1px solid ${stat.color}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.25rem' }}>{stat.label}</p>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '2.5rem', margin: 0, fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  <AnimatedCounter value={stat.value} isDecimal={stat.isDecimal} />
                </h2>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span style={{ letterSpacing: '1px' }}>SYSTEM GAUGE</span>
                <span>{Math.round(stat.percentage)}%</span>
              </div>
              <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                <div 
                  style={{ 
                    position: 'absolute',
                    top: '-1px', left: 0,
                    height: '5px',
                    width: `${stat.percentage}%`, 
                    backgroundColor: stat.color,
                    boxShadow: `0 0 10px ${stat.color}`
                  }} 
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
