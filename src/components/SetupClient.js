"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AVATAR_EMOJIS, MISSION_EMOJIS } from '../lib/constants';
import { submitSetupData } from '../app/actions/setup';

export default function SetupClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [childName, setChildName] = useState('');
  const [childAvatar, setChildAvatar] = useState(AVATAR_EMOJIS[0]);
  const [missionName, setMissionName] = useState('');
  const [missionIcon, setMissionIcon] = useState(MISSION_EMOJIS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const nameInputRef = useRef(null);
  const missionInputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && nameInputRef.current) {
      nameInputRef.current.focus();
    } else if (step === 3 && missionInputRef.current) {
      missionInputRef.current.focus();
    }
  }, [step]);

  const handlePinKey = (val) => {
    if (val === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => setStep(2), 300);
      }
    }
  };

  const handleFinish = async () => {
    if (!missionName.trim()) return;
    setIsSubmitting(true);
    const result = await submitSetupData(pin, childName.trim(), childAvatar, missionName.trim(), missionIcon);
    if (result.success) {
      router.push('/');
    } else {
      setIsSubmitting(false);
      alert("Error setting up: " + result.error);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-step">
        <div className="setup-step-indicator">
          <div className={`setup-dot ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}></div>
          <div className={`setup-dot ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}></div>
          <div className={`setup-dot ${step === 3 ? 'active' : ''}`}></div>
        </div>

        {step === 1 && (
          <div className="page-enter">
            <h2 className="setup-step-title">🔒 Set Parent PIN</h2>
            <p className="setup-step-desc">This protects the parent dashboard. Pick 4 digits you'll remember.</p>
            <div className="pin-display">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}></div>
              ))}
            </div>
            <div className="pin-pad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button key={n} className="pin-key" onClick={() => handlePinKey(n.toString())}>{n}</button>
              ))}
              <button className="pin-key pin-key-empty"></button>
              <button className="pin-key" onClick={() => handlePinKey('0')}>0</button>
              <button className="pin-key pin-key-delete" onClick={() => handlePinKey('del')}>←</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="page-enter">
            <h2 className="setup-step-title">👶 Add Your First Kid</h2>
            <p className="setup-step-desc">What's their name? Pick a fun avatar!</p>
            <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label htmlFor="child-name">Name</label>
              <input 
                ref={nameInputRef}
                type="text" 
                className="input" 
                id="child-name" 
                placeholder="e.g. Luna" 
                value={childName} 
                onChange={e => setChildName(e.target.value)}
                maxLength="20" 
                autoComplete="off" 
              />
            </div>
            <div className="input-group">
              <label>Avatar</label>
              <div className="avatar-grid">
                {AVATAR_EMOJIS.map(e => (
                  <button 
                    key={e} 
                    className={`avatar-option ${e === childAvatar ? 'selected' : ''}`} 
                    onClick={() => setChildAvatar(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button 
              className="btn btn-primary btn-block btn-lg" 
              style={{ marginTop: 'var(--space-xl)' }}
              disabled={!childName.trim()}
              onClick={() => setStep(3)}
            >
              Next →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="page-enter">
            <h2 className="setup-step-title">🎯 First Mission</h2>
            <p className="setup-step-desc">Create a task your kid can complete today!</p>
            <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label htmlFor="mission-name">Mission Name</label>
              <input 
                ref={missionInputRef}
                type="text" 
                className="input" 
                id="mission-name" 
                placeholder="e.g. Make Your Bed" 
                value={missionName}
                onChange={e => setMissionName(e.target.value)}
                maxLength="40" 
                autoComplete="off" 
              />
            </div>
            <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label>Icon</label>
              <div className="emoji-picker">
                {MISSION_EMOJIS.map(e => (
                  <button 
                    key={e} 
                    className={`emoji-option ${e === missionIcon ? 'selected' : ''}`} 
                    onClick={() => setMissionIcon(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-lg)' }}>
              Reward: ⭐ 10 XP &nbsp; 🪙 5 Coins (you can customize later)
            </p>
            <button 
              className="btn btn-gold btn-block btn-lg" 
              disabled={!missionName.trim() || isSubmitting}
              onClick={handleFinish}
            >
              {isSubmitting ? 'Saving...' : "🚀 Let's Go!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
