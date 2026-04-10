"use client";

import React from 'react';

// Common base wrapper for tier crests ensuring consistent sizing and animation hooks
const CrestWrapper = ({ children, className = '', glowColor = 'var(--primary)', isAnimated = true }) => {
  return (
    <div 
      className={`tier-crest-wrapper ${className} ${isAnimated ? 'crest-animate' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        height: '100%',
        filter: `drop-shadow(0 0 10px ${glowColor})`,
        aspectRatio: '1/1' // Keep it square
      }}
    >
      <div className="crest-svg-container" style={{ width: '80%', height: '80%', position: 'relative' }}>
          {children}
      </div>
    </div>
  );
};

// I: The Beginning
const CrestSeedling = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg crest-sway">
    {/* Ground */}
    <path d="M 20 85 Q 50 80 80 85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    {/* Stem */}
    <path d="M 50 85 C 50 60 40 40 45 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    {/* Leaf Left */}
    <path d="M 45 45 C 20 40 10 60 45 65" fill="currentColor" fillOpacity="0.8" />
    {/* Leaf Right */}
    <path d="M 47 30 C 70 20 80 50 45 45" fill="currentColor" fillOpacity="0.8" />
    {/* Sparkles */}
    <circle cx="30" cy="20" r="3" fill="currentColor" className="crest-pulse" style={{animationDelay: '0ms'}}/>
    <circle cx="70" cy="35" r="4" fill="currentColor" className="crest-pulse" style={{animationDelay: '400ms'}}/>
  </svg>
);

// II: The Seeker
const CrestCompass = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="crest-spin-slow" />
    <path d="M 50 15 L 60 50 L 50 85 L 40 50 Z" fill="currentColor" opacity="0.6" className="crest-spin-needle"/>
    <path d="M 50 15 L 60 50 L 50 50 Z" fill="currentColor"/>
    <circle cx="50" cy="50" r="5" fill="currentColor" />
  </svg>
);

// III: The Grower
const CrestLeaf = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg crest-pulse-slow">
    {/* Central Vine */}
    <path d="M 50 90 C 30 60 50 30 60 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    {/* Leaves */}
    <path d="M 45 65 C 10 60 15 35 50 45" fill="currentColor" opacity="0.9" />
    <path d="M 55 45 C 90 40 85 15 50 25" fill="currentColor" opacity="0.7" />
    <path d="M 40 35 C 15 30 20 15 52 20" fill="currentColor" opacity="0.5" />
    <circle cx="80" cy="20" r="3" fill="currentColor" className="crest-pulse" />
    <circle cx="20" cy="40" r="4" fill="currentColor" className="crest-pulse" style={{animationDelay: '300ms'}}/>
  </svg>
);

// IV: The Aware
const CrestEye = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
    <path d="M 10 50 Q 50 10 90 50 Q 50 90 10 50" stroke="currentColor" strokeWidth="4" fill="currentColor" fillOpacity="0.2" className="crest-blink"/>
    <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="10" fill="currentColor" />
    <path d="M 50 5 L 50 15 M 50 95 L 50 85 M 5 50 L 15 50 M 95 50 L 85 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="crest-spin-slow" style={{transformOrigin: '50px 50px'}}/>
  </svg>
);

// V: The Steady
const CrestMountain = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
    {/* Back Peak */}
    <path d="M 20 85 L 50 40 L 80 85" fill="currentColor" opacity="0.4" />
    {/* Front Peak */}
    <path d="M 10 85 L 35 45 L 60 85" fill="currentColor" opacity="0.7" />
    <path d="M 40 85 L 65 30 L 90 85" fill="currentColor" />
    {/* Snow Caps */}
    <path d="M 65 30 L 58 45 L 65 50 L 72 45 Z" fill="currentColor" opacity="0.3" />
    <path d="M 35 45 L 30 53 L 35 56 L 40 53 Z" fill="currentColor" opacity="0.3" />
    {/* Cloud line */}
    <path d="M 15 35 Q 30 30 45 40 Q 60 30 85 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" className="crest-drift"/>
  </svg>
);

// VI: The Wise
const CrestFlame = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
    {/* Candle Base */}
    <rect x="40" y="60" width="20" height="30" rx="2" fill="currentColor" opacity="0.5" />
    {/* Wick */}
    <line x1="50" y1="60" x2="50" y2="52" stroke="currentColor" strokeWidth="3" />
    {/* Flame Inner/Outer */}
    <path d="M 50 15 C 65 35 65 50 50 55 C 35 50 35 35 50 15" fill="currentColor" className="crest-flicker" />
    <path d="M 50 25 C 58 38 58 48 50 52 C 42 48 42 38 50 25" fill="currentColor" opacity="0.6" className="crest-flicker" style={{animationDelay: '100ms'}} />
    {/* Aura rings */}
    <circle cx="50" cy="40" r="30" stroke="currentColor" strokeWidth="1" opacity="0.3" className="crest-pulse-slow" />
    <circle cx="50" cy="40" r="40" stroke="currentColor" strokeWidth="1" opacity="0.1" className="crest-pulse-slow" style={{animationDelay: '500ms'}} />
  </svg>
);

// VII: The Chosen
const CrestStar = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
    <path d="M 50 5 Q 50 45 95 50 Q 50 55 50 95 Q 50 55 5 50 Q 50 45 50 5" fill="currentColor" className="crest-pulse-slow" />
    <path d="M 50 25 Q 50 45 75 50 Q 50 55 50 75 Q 50 55 25 50 Q 50 45 50 25" fill="currentColor" opacity="0.6" transform="rotate(45 50 50)" className="crest-pulse-slow" style={{animationDelay: '300ms'}} />
    <circle cx="50" cy="50" r="10" fill="currentColor" className="crest-pulse" />
  </svg>
);

// VIII: The Devoted
const CrestWater = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
    {/* Deep Water Circle */}
    <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.2" className="crest-pulse-slow"/>
    {/* Waves */}
    <path d="M 20 40 Q 35 25 50 40 T 80 40" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" className="crest-wave" />
    <path d="M 20 60 Q 35 45 50 60 T 80 60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" className="crest-wave" style={{animationDelay: '200ms'}} />
    <path d="M 30 80 Q 45 65 60 80 T 70 80" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.4" className="crest-wave" style={{animationDelay: '400ms'}} />
    {/* Droplets */}
    <circle cx="50" cy="20" r="4" fill="currentColor" className="crest-float" />
    <circle cx="35" cy="15" r="3" fill="currentColor" opacity="0.6" className="crest-float" style={{animationDelay: '150ms'}} />
    <circle cx="65" cy="15" r="3" fill="currentColor" opacity="0.6" className="crest-float" style={{animationDelay: '300ms'}} />
  </svg>
);

// IX: The Guiding
const CrestLantern = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg crest-sway-slow">
    {/* Hanger */}
    <path d="M 50 5 L 50 20" stroke="currentColor" strokeWidth="4" />
    <path d="M 40 20 L 60 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    {/* Lantern Body */}
    <path d="M 35 20 L 65 20 L 70 80 L 30 80 Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    {/* Frame Lines */}
    <path d="M 50 20 L 50 80" stroke="currentColor" strokeWidth="2" />
    <path d="M 32 50 L 68 50" stroke="currentColor" strokeWidth="2" />
    {/* Core light */}
    <circle cx="50" cy="50" r="12" fill="currentColor" className="crest-flicker" />
    <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.8" />
    {/* Top Cap */}
    <path d="M 45 15 L 55 15 L 50 5 Z" fill="currentColor" />
    {/* Bottom Base */}
    <path d="M 28 80 L 72 80 M 35 85 L 65 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// X: The Everlight
const CrestSun = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
    {/* Expanding Rings */}
    <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" opacity="0.5" className="crest-expand-ring" />
    <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" opacity="0.2" className="crest-expand-ring" style={{animationDelay: '1s'}} />
    
    {/* Core Diamond/Sun */}
    <path d="M 50 30 L 65 50 L 50 70 L 35 50 Z" fill="currentColor" className="crest-pulse" />
    <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.9" />

    {/* Spinning Rays */}
    <g className="crest-spin-slow" style={{transformOrigin: '50px 50px'}}>
      <line x1="50" y1="10" x2="50" y2="25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="75" x2="50" y2="90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="10" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="22" y1="22" x2="32" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="78" y1="78" x2="68" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="22" y1="78" x2="32" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="78" y1="22" x2="68" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
    </g>
  </svg>
);


// Global Exporter Component
export default function TierCrest({ tierName, className, glowColor }) {
  let content = null;
  switch (tierName) {
    case 'The Beginning': content = <CrestSeedling />; break;
    case 'The Seeker':    content = <CrestCompass />; break;
    case 'The Grower':    content = <CrestLeaf />; break;
    case 'The Aware':     content = <CrestEye />; break;
    case 'The Steady':    content = <CrestMountain />; break;
    case 'The Wise':      content = <CrestFlame />; break;
    case 'The Chosen':    content = <CrestStar />; break;
    case 'The Devoted':   content = <CrestWater />; break;
    case 'The Guiding':   content = <CrestLantern />; break;
    case 'The Everlight': content = <CrestSun />; break;
    default:              content = <CrestSeedling />; break; // fallback
  }

  return (
    <CrestWrapper className={className} glowColor={glowColor}>
      {content}
    </CrestWrapper>
  );
}
