"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyParentPin } from '../app/actions/auth';
import { getLevelForXP, getXPProgress } from '../lib/levels';
import AvatarDisplay from './AvatarDisplay';

export default function RoleSelectClient({ childrenData }) {
  const router = useRouter();
  const [view, setView] = useState('select'); // 'select' | 'pin'
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleParentClick = () => {
    setView('pin');
    setPin('');
    setError('');
  };

  const handleKeyClick = async (val) => {
    if (val === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      
      if (newPin.length === 4) {
        const isValid = await verifyParentPin(newPin);
        if (isValid) {
          router.push('/parent');
        } else {
          setIsShaking(true);
          setError('Wrong PIN. Try again.');
          setTimeout(() => {
            setPin('');
            setIsShaking(false);
          }, 600);
        }
      }
    }
  };

  if (view === 'pin') {
    return (
      <div className="pin-page page-enter">
        <button className="back-btn" onClick={() => setView('select')} style={{ position: 'absolute', top: 'var(--space-lg)', left: 'var(--space-lg)' }}>←</button>
        <h2 className="pin-title">🔒 Parent Mode</h2>
        <div className={`pin-display ${isShaking ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}></div>
          ))}
        </div>
        <div className="pin-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} className="pin-key" onClick={() => handleKeyClick(n.toString())}>{n}</button>
          ))}
          <button className="pin-key pin-key-empty"></button>
          <button className="pin-key" onClick={() => handleKeyClick('0')}>0</button>
          <button className="pin-key pin-key-delete" onClick={() => handleKeyClick('del')}>←</button>
        </div>
        <div className="pin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="role-select-page page-enter" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Ambient background styling specifically for kiosk mode view */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(129, 140, 248, 0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: 800, margin: '0 auto', zIndex: 1 }}>
        <div className="role-select-logo">☀</div>
        <h1 className="role-select-title">LifeXP</h1>
        <p className="role-select-subtitle">Who's checking in?</p>

        {childrenData && childrenData.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
            {childrenData.map(child => {
              const { level, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0); // fallback to `.xp` to not break during migration
              const progressFraction = getXPProgress(child.total_xp_earned || child.xp || 0);
              
              // Map child.theme or tierColor to a valid theme CSS class name.
              const activeTheme = child.theme ? child.theme : tierColor;

              return (
                <button 
                  key={child.id} 
                  className={`theme-${activeTheme}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--primary-dim)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)',
                    minWidth: '160px',
                    gap: '12px',
                    boxShadow: 'var(--glow-primary)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s var(--ease-bounce)',
                  }}
                  onClick={() => router.push(`/kid/${child.id}`)}
                >
                  <AvatarDisplay avatarString={child.avatar} style={{ fontSize: '3rem' }} />
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-bright)' }}>{child.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>Lv {level}</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-deep)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressFraction * 100}%`, background: 'var(--primary)', borderRadius: '3px' }} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No players found. Please add a kid in Parent Mode.</p>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2xl)', zIndex: 1 }}>
        <button 
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '12px 24px', opacity: 0.6 }}
          onClick={handleParentClick}
        >
          🔒 Parent Mode
        </button>
      </div>

    </div>
  );
}
