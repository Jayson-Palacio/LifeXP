'use client';

import { useEffect, useState } from 'react';

// All theme → hex primary color mappings (mirrors variables.css)
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
  const [color, setColor] = useState('#6366f1'); // fallback: indigo

  useEffect(() => {
    try {
      const theme = localStorage.getItem('lifexp_kid_theme') || 'seedling';
      setColor(THEME_COLORS[theme] ?? '#6366f1');
    } catch {}
  }, []);

  // Derive rgba variants from the hex color
  const toRgba = (hex, a) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const c0 = toRgba(color, 0.07);
  const c1 = toRgba(color, 0.22);
  const c2 = toRgba(color, 0.35);
  const c3 = toRgba(color, 0.15);
  const c4 = toRgba(color, 0.12);

  const css = `
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 0 0 ${toRgba(color, 0)}; }
      50%       { box-shadow: 0 0 0 14px ${toRgba(color, 0.12)}; }
    }
    @keyframes cosmicGradient {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes floatAvatar {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-7px); }
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
    <div style={{ minHeight: '100dvh', background: '#0a0814', overflow: 'hidden', position: 'relative' }}>
      <style>{css}</style>

      {/* Cosmic animated background — tinted with the kid's color */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #0d0d14, #000000)',
        backgroundSize: '400% 400%',
        animation: 'cosmicGradient 15s ease infinite',
      }} />
      {/* Radial bloom in kid's color */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${c2} 0%, transparent 70%)`,
        transition: 'background 0.5s ease',
      }} />

      <div className="page-enter" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Top nav bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: `1px solid ${c3}`,
          backdropFilter: 'blur(8px)',
          background: 'rgba(10,8,20,0.4)',
        }}>
          <S w={90} h={32} r={20} />
          <S w={130} h={32} r={20} />
          <S w={90} h={32} r={20} />
        </div>

        {/* ── Floating avatar with kid-colored glow ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '36px 20px 24px', textAlign: 'center',
        }}>
          {/* Avatar ring */}
          <div style={{
            width: 118, height: 118, borderRadius: '50%',
            background: `linear-gradient(135deg, ${c4}, ${c2})`,
            border: `3px solid ${c2}`,
            animation: 'floatAvatar 3s ease-in-out infinite, pulseGlow 2.5s ease-in-out infinite',
            marginBottom: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="sk" style={{ width: 88, height: 88, borderRadius: '50%' }} />
          </div>

          <S w={150} h={28} r={10} style={{ marginBottom: 10 }} />
          <S w={100} h={18} r={20} style={{ marginBottom: 18 }} />

          {/* XP bar */}
          <div style={{
            width: '75%', height: 10, borderRadius: 10,
            background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 6,
          }}>
            <div className="sk" style={{ width: '55%', height: '100%', borderRadius: 10 }} />
          </div>
          <S w={120} h={12} r={6} style={{ marginBottom: 20 }} />

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[80, 72, 76].map((w, i) => (
              <div key={i} className="sk" style={{
                width: w, height: 34, borderRadius: 20,
                border: `1px solid ${c3}`,
              }} />
            ))}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{
          display: 'flex', gap: 4, margin: '0 16px 24px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12, padding: 4,
          border: `1px solid ${c3}`,
        }}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} className={i === 0 ? '' : 'sk'} style={{
              flex: 1, height: 38, borderRadius: 9,
              ...(i === 0 ? {
                background: `linear-gradient(90deg, ${toRgba(color, 0.4)} 0%, ${toRgba(color, 0.25)} 100%)`,
                border: `1px solid ${c2}`,
              } : {}),
            }} />
          ))}
        </div>

        {/* ── Mission cards ── */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0.95, 1, 0.85, 0.7].map((opacity, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${c3}`,
              borderLeft: `4px solid ${c2}`,
              backdropFilter: 'blur(8px)',
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
