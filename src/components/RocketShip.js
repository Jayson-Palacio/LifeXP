'use client';
import { useEffect, useState } from 'react';

export default function RocketShip() {
  const [style, setStyle] = useState({ display: 'none' });

  useEffect(() => {
    let timeoutId;
    
    const animate = () => {
      // Randomize whether it starts on the left or right
      const startLeft = Math.random() > 0.5;
      
      // Randomize vertical positions
      const startY = Math.random() * window.innerHeight;
      const endY = Math.random() * window.innerHeight;
      
      const startX = startLeft ? -100 : window.innerWidth + 100;
      const endX = startLeft ? window.innerWidth + 100 : -100;

      // Randomize speed (between 10 and 20 seconds to feel twice as slow)
      const duration = 10000 + Math.random() * 10000; 

      // Calculate the angle it should face
      const dx = endX - startX;
      const dy = endY - startY;
      // 🚀 emoji naturally points up and slightly right (approx 45 degrees)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 45;

      // 1. Instantly snap to the starting position with no transition
      setStyle({
        position: 'fixed',
        top: 0,
        left: 0,
        transform: `translate(${startX}px, ${startY}px) rotate(${angle}deg)`,
        transition: 'none',
        fontSize: '2.5rem',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.4,
      });

      // 2. Wait a couple of frames to ensure the browser registers the start position,
      // then apply the transition to the end position.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStyle({
            position: 'fixed',
            top: 0,
            left: 0,
            transform: `translate(${endX}px, ${endY}px) rotate(${angle}deg)`,
            transition: `transform ${duration}ms linear`,
            fontSize: '2.5rem',
            pointerEvents: 'none',
            zIndex: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.4,
          });
        });
      });

      // Schedule the next appearance randomly between 4 and 12 seconds after this one finishes
      const nextDelay = duration + 4000 + Math.random() * 8000;
      timeoutId = setTimeout(animate, nextDelay);
    };

    // Initial delay before first launch
    timeoutId = setTimeout(animate, 2000 + Math.random() * 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div style={style}>
      {/* Intense glow layer that works on all platforms */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60px',
        height: '60px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.9) 0%, rgba(168,85,247,0.5) 40%, transparent 70%)',
        filter: 'blur(6px)',
        zIndex: -1
      }} />
      <span style={{ 
        position: 'relative', 
        zIndex: 1,
        filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.8))'
      }}>
        <svg 
          width="44" height="44" viewBox="0 0 24 24" 
          fill="none" strokeWidth="1.5" 
          strokeLinecap="round" strokeLinejoin="round" 
        >
          {/* Flame */}
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#facc15" stroke="#f97316"/>
          {/* Main Body */}
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#f8fafc" stroke="#ffffff"/>
          {/* Left Fin */}
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" fill="#a855f7" stroke="#d8b4fe"/>
          {/* Right Fin */}
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" fill="#a855f7" stroke="#d8b4fe"/>
        </svg>
      </span>
    </div>
  );
}
