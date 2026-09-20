'use client';

import { useEffect, useRef, useState } from 'react';

export default function QuestsTodayRing({ done = 0, total = 0, size = 72 }) {
  const safeTotal = Math.max(0, Number(total) || 0);
  const n = Math.max(0, Number(done) || 0);
  const pct = safeTotal > 0 ? Math.min(100, Math.round((n / safeTotal) * 100)) : 0;
  const clear = safeTotal > 0 && n >= safeTotal;
  const wasClear = useRef(clear);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (clear && !wasClear.current) {
      setBurst(true);
      const t = setTimeout(() => setBurst(false), 800);
      wasClear.current = true;
      return () => clearTimeout(t);
    }
    wasClear.current = clear;
  }, [clear]);

  return (
    <div
      className={`quests-today-ring${clear ? ' is-clear' : ''}${burst ? ' is-burst' : ''}`}
      style={{ '--quests-ring-size': `${size}px` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="quests-today-ring-svg">
        <circle cx="50" cy="50" r="38" className="quests-today-ring-track" />
        <circle
          cx="50"
          cy="50"
          r="38"
          className="quests-today-ring-arc"
          pathLength="100"
          stroke={clear ? '#c8920a' : 'var(--primary)'}
          strokeDasharray={`${pct} 100`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="quests-today-ring-center">
        <strong>{n}</strong>
        <span>of {safeTotal || 0}</span>
      </div>
      {burst && Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="quests-today-spark" style={{ '--spark-i': i }} />
      ))}
    </div>
  );
}
