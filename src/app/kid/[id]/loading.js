'use client';

import { useEffect, useState } from 'react';

const THEME_COLORS = {
  'seedling':       '#4ade80',
  'bubblegum':      '#f472b6',
  'ocean':          '#38bdf8',
  'morning-sky':    '#7dd3fc',
  'lavender-mist':  '#c084fc',
  'golden-hour':    '#fbbf24',
  'mint':           '#34d399',
  'coral':          '#fb7185',
  'sunny':          '#facc15',
  'forest-deep':    '#059669',
  'sky':            '#0ea5e9',
  'violet':         '#8b5cf6',
  'crimson':        '#e11d48',
  'teal':           '#14b8a6',
  'stone':          '#94a3b8',
  'candle-flame':   '#f59e0b',
  'indigo':         '#6366f1',
  'ruby':           '#be123c',
  'emerald':        '#10b981',
  'sapphire':       '#1d4ed8',
  'amethyst':       '#7e22ce',
  'neon-pink':      '#ff00ff',
  'neon-cyan':      '#00ffff',
  'electric-blue':  '#2563eb',
  'plasma':         '#39ff14',
  'sunset-split':   '#f97316',
  'midnight-split': '#4338ca',
  'galactic':       '#9d174d',
  'magma':          '#ea580c',
  'rainbow':        '#00ffcc',
  'everlight':      '#fbbf24',
};

export default function Loading() {
  const [color, setColor] = useState('#f5c518');

  useEffect(() => {
    try {
      const theme = localStorage.getItem('kaeluma_kid_theme') || 'seedling';
      setColor(THEME_COLORS[theme] ?? '#f5c518');
    } catch {}
  }, []);

  const toRgba = (hex, a) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const c0 = toRgba(color, 0.08);
  const c1 = toRgba(color, 0.22);

  const css = `
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .sk {
      background: linear-gradient(90deg, ${c0} 0%, ${c1} 40%, ${c0} 80%);
      background-size: 250% 100%;
      animation: shimmer 1.8s ease-in-out infinite;
      flex-shrink: 0;
    }
  `;

  const S = ({ w = '100%', h = 16, r = 8, style = {} }) => (
    <div className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />
  );

  return (
    <div className="quests-app" style={{ minHeight: '100dvh', overflow: 'hidden', position: 'relative' }}>
      <style>{css}</style>
      <div className="kaeluma-bg" />

      <div className="page-enter" style={{ position: 'relative', zIndex: 1, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(28,28,30,0.08)',
        }}>
          <S w={120} h={22} r={8} />
          <S w={88} h={32} r={20} />
        </div>

        <div style={{ padding: '24px 16px 0' }}>
          <div style={{
            background: '#fff',
            border: '1px solid rgba(28,28,30,0.08)',
            borderRadius: 28,
            boxShadow: '0 10px 28px rgba(28,28,30,0.06)',
            padding: '28px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              border: `3px solid ${c1}`,
              marginBottom: 16,
              overflow: 'hidden',
            }}>
              <div className="sk" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>
            <S w={120} h={22} r={8} style={{ marginBottom: 10 }} />
            <S w={80} h={14} r={20} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <S w={72} h={28} r={20} />
              <S w={56} h={28} r={20} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', marginBottom: 18,
              padding: '12px 14px', borderRadius: 20,
              background: '#f5f5f7',
            }}>
              <div className="sk" style={{ width: 76, height: 76, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <S w={72} h={16} r={6} />
                <S w={96} h={12} r={6} />
              </div>
            </div>
            <div style={{ width: '100%', height: 8, borderRadius: 10, background: '#f5f5f7', overflow: 'hidden' }}>
              <div className="sk" style={{ width: '45%', height: '100%', borderRadius: 10 }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <S w={180} h={22} r={8} style={{ marginBottom: 6 }} />
          {[0.95, 1, 0.9].map((opacity, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 18,
              background: '#fff',
              border: '1px solid rgba(28,28,30,0.06)',
              borderLeft: `4px solid ${c1}`,
              opacity,
            }}>
              <div className="sk" style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <S w={`${45 + i * 10}%`} h={15} r={6} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <S w={62} h={22} r={20} />
                  <S w={62} h={22} r={20} />
                </div>
              </div>
              <S w={86} h={36} r={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
