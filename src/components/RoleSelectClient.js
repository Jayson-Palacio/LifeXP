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
    <div className="role-select-page page-enter">
      
      {/* Ambient energetic cosmic background for Kaeluma */}
      <div className="kaeluma-bg" />

      {/* Sleek Parent Lock inside the page but at absolute corner */}
      <button 
        className="sleek-parent-btn"
        onClick={handleParentClick}
        title="Parent Mode"
      >
        🔒
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: 800, margin: '0 auto', zIndex: 1 }}>
        <div className="kaeluma-logo-spin">☀</div>
        <h1 className="kaeluma-title">Kaeluma</h1>
        <p className="role-select-subtitle">Who's checking in?</p>

        {childrenData && childrenData.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)', justifyContent: 'center', marginTop: 'var(--space-2xl)' }}>
            {childrenData.map((child, index) => {
              const { level, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
              const progressFraction = getXPProgress(child.total_xp_earned || child.xp || 0);
              const activeTheme = child.theme ? child.theme : tierColor;

              return (
                <button 
                  key={child.id} 
                  className={`theme-${activeTheme} kaeluma-card`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push(`/kid/${child.id}`)}
                >
                  <AvatarDisplay avatarString={child.avatar} style={{ fontSize: '3.5rem' }} />
                  <div style={{ textAlign: 'center', width: '100%', zIndex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-bright)', letterSpacing: '-0.02em', marginBottom: '2px' }}>{child.name}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lv {level}</div>
                  </div>
                  
                  {/* Glowing Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden', zIndex: 1 }}>
                    <div style={{ height: '100%', width: `${progressFraction * 100}%`, background: 'var(--primary)', borderRadius: '3px', boxShadow: '0 0 10px var(--primary)' }} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No players found. Please add a kid in Parent Mode.</p>
        )}
      </div>

    </div>
  );
}
