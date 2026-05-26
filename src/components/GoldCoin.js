'use client';

import { useId } from 'react';

/**
 * GoldCoin — a pure-SVG gold coin icon that renders consistently
 * across Windows, Android, iOS, and the web. Replaces the 🪙 emoji
 * which looks silver/grey on most platforms.
 *
 * Usage:
 *   <GoldCoin />             → 1em inline coin (matches text)
 *   <GoldCoin size={24} />   → 24px coin
 *   <GoldCoin size="1.2rem" />
 */
export default function GoldCoin({ size = '1em', style, className, ...rest }) {
  const uid = useId();
  const outerId = `coinOuter-${uid}`;
  const innerId = `coinInner-${uid}`;
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      className={className}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: '-0.125em', flexShrink: 0, ...style }}
      aria-hidden="true"
      {...rest}
    >
      {/* Outer ring — dark gold */}
      <circle cx="32" cy="32" r="30" fill={`url(#${outerId})`} stroke="#b8860b" strokeWidth="2" />
      {/* Inner raised face */}
      <circle cx="32" cy="32" r="24" fill={`url(#${innerId})`} />
      {/* Shine highlight */}
      <ellipse cx="24" cy="22" rx="10" ry="8" fill="rgba(255,255,255,0.3)" />
      {/* Star emblem */}
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="24"
        fontWeight="900"
        fill="#92400e"
        opacity="0.7"
      >
        ★
      </text>

      <defs>
        {/* Outer gradient — rich gold */}
        <radialGradient id={outerId} cx="0.35" cy="0.3" r="0.65">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        {/* Inner gradient — lighter gold face */}
        <radialGradient id={innerId} cx="0.4" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
    </svg>
  );
}

