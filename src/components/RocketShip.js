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

      // Randomize speed (between 5 and 10 seconds to feel floaty in space)
      const duration = 5000 + Math.random() * 5000; 

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
        fontSize: '2rem',
        pointerEvents: 'none',
        zIndex: 50,
        opacity: 0.6,
        filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))'
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
            fontSize: '2rem',
            pointerEvents: 'none',
            zIndex: 50,
            opacity: 0.6,
            filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))'
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

  return <div style={style}>🚀</div>;
}
