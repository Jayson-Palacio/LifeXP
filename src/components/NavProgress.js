"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavProgress() {
  const pathname = usePathname();
  const barRef = useRef(null);
  const timerRef = useRef(null);

  // When pathname changes, the navigation is complete — hide the bar
  useEffect(() => {
    if (!barRef.current) return;
    // Snap to 100% then fade out
    barRef.current.style.opacity = '1';
    barRef.current.style.width = '100%';
    timerRef.current = setTimeout(() => {
      if (barRef.current) barRef.current.style.opacity = '0';
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [pathname]);

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: '0%',
        background: 'linear-gradient(90deg, var(--primary), var(--primary-light, #a855f7))',
        boxShadow: '0 0 8px var(--primary)',
        zIndex: 99999,
        transition: 'width 0.3s ease, opacity 0.4s ease',
        opacity: 0,
        borderRadius: '0 2px 2px 0',
      }}
    />
  );
}
