import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Review } from '../types';

interface AnalysisPanelProps {
  reviews: Review[];
  keywords?: { word: string; count?: number }[];
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ reviews, keywords }) => {
  const sentimentData = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    const snippets = { positive: '', neutral: '', negative: '' };
    
    reviews.forEach(r => {
      counts[r.sentiment]++;
      if (!snippets[r.sentiment]) snippets[r.sentiment] = r.snippet;
    });

    return [
      { name: 'Positive', value: counts.positive, color: '#39ff14', snippet: snippets.positive },
      { name: 'Neutral', value: counts.neutral, color: '#ffb300', snippet: snippets.neutral },
      { name: 'Negative', value: counts.negative, color: '#ff0055', snippet: snippets.negative }
    ].filter(d => d.value > 0);
  }, [reviews]);

  const ratingData = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => counts[r.rating as keyof typeof counts]++);
    return [1, 2, 3, 4, 5].map(star => ({
      star: `${star} Star`,
      count: counts[star as keyof typeof counts]
    }));
  }, [reviews]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cyber-card" style={{ padding: '1rem', minWidth: '200px', boxShadow: `0 0 15px ${data.color || 'var(--accent-primary)'}` }}>
          <p style={{ fontWeight: 600, color: data.color || 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.name || data.star}</p>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>COUNT: <span style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>{data.value || data.count}</span></p>
          {data.snippet && <p style={{ fontStyle: 'italic', marginTop: '0.5rem', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>"{data.snippet}"</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="cyber-card-wrapper">
        <div className="cyber-card" style={{ padding: '1.5rem', flex: 1, border: '1px solid rgba(255,255,255,0.05)', borderRight: '2px solid #00e5ff', borderTop: '2px solid #00e5ff' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>Sentiment Distribution</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="cyber-card-wrapper">
        <div className="cyber-card" style={{ padding: '1.5rem', flex: 1, border: '1px solid rgba(255,255,255,0.05)', borderBottom: '2px solid #00e5ff', borderLeft: '2px solid #00e5ff' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>Rating Distribution</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData}>
                <XAxis dataKey="star" stroke="var(--text-secondary)" fontSize={12} tick={{ fontFamily: 'var(--font-mono)' }} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} tick={{ fontFamily: 'var(--font-mono)' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {keywords && keywords.length > 0 && (
        <div className="cyber-card-wrapper">
          <div className="cyber-card" style={{ padding: '1.5rem', flex: 1, border: '1px solid rgba(255,255,255,0.05)', borderRight: '2px solid #ffb300', borderTop: '2px solid #ffb300' }}>
            <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>Top Keywords</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {keywords.map((k, i) => (
                <span
                  key={`${k.word}-${i}`}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '16px',
                    border: '1px solid var(--accent-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)'
                  }}
                >
                  {k.word}{typeof k.count === 'number' ? ` (${k.count})` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};