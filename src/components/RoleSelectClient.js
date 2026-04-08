"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyParentPin } from '../app/actions/auth';

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
        <h2 className="pin-title">🔒 Enter Parent PIN</h2>
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
      <div className="role-select-logo">⚡</div>
      <h1 className="role-select-title">LifeXP</h1>
      <p className="role-select-subtitle">Turn real life into a game</p>

      <div className="role-select-buttons">
        <button className="role-btn role-btn-parent" onClick={handleParentClick}>
          <span className="role-btn-emoji">🔒</span>
          <span className="role-btn-text">
            <span className="role-btn-name">Parent Mode</span>
            <span className="role-btn-desc">Manage missions & rewards</span>
          </span>
        </button>

        {childrenData && childrenData.length > 0 && (
          <>
            <div className="role-divider">Players</div>
            {childrenData.map(child => (
              <button 
                key={child.id} 
                className="role-btn role-btn-child" 
                onClick={() => router.push(`/kid/${child.id}`)}
              >
                <span className="role-btn-emoji">{child.avatar}</span>
                <span className="role-btn-text">
                  <span className="role-btn-name">{child.name}</span>
                  <span className="role-btn-desc">Level {child.level} • {child.xp} XP • {child.coins} 🪙</span>
                </span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
