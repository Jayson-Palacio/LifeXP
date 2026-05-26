"use client";

import { useState, useEffect, useRef } from 'react';
import GoldCoin from './GoldCoin';
import { playRandomSuccessSound, playTierUpSwell, playPop, playClick, playKaChing } from '../lib/sounds';
import { getXPProgress, getXPDisplay, getXPForLevel, getLevelForXP } from '../lib/levels';

export default function InteractiveHeroMockup() {
  const [xp, setXp] = useState(2295); // Starts near Lv 11 threshold (2311 XP)
  const [coins, setCoins] = useState(150);
  const [level, setLevel] = useState(10);
  const [tierName, setTierName] = useState('The Beginning');
  const [tierSymbol, setTierSymbol] = useState('🌱');
  const [theme, setTheme] = useState('seedling');
  const [missionState, setMissionState] = useState('available'); // 'available' | 'loading' | 'done'
  
  // Animation states
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [avatarAnimation, setAvatarAnimation] = useState('');
  const [coinShake, setCoinShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const prevLevelRef = useRef(10);

  const initialXp = 2295;
  const initialCoins = 150;

  // Calculate XP values
  const xpProgress = getXPProgress(xp);
  const xpDisplay = getXPDisplay(xp);

  const handleAvatarTap = () => {
    try {
      if (playPop) playPop();
    } catch (e) {
      console.warn("playPop failed:", e);
    }
    const anims = ['egg-glow', 'egg-spin', 'egg-wobble', 'egg-flip', 'egg-shake'];
    const randomAnim = anims[Math.floor(Math.random() * anims.length)];
    setAvatarAnimation(randomAnim);
    setTimeout(() => setAvatarAnimation(''), 1500);
  };

  const handleCoinTap = () => {
    try {
      if (playPop) playPop();
    } catch (e) {
      console.warn("playPop failed:", e);
    }
    setCoinShake(true);
    setTimeout(() => setCoinShake(false), 500);
  };

  const handleMissionComplete = (e) => {
    if (missionState !== 'available') return;
    try {
      if (playClick) playClick();
    } catch (err) {
      console.warn("playClick failed:", err);
    }
    
    setMissionState('loading');

    // Get click/button coordinates synchronously before entering async timeout
    let left = typeof window !== 'undefined' ? window.innerWidth / 2 : 250;
    let top = typeof window !== 'undefined' ? window.innerHeight / 2 : 250;
    if (e && e.currentTarget) {
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        left = rect.left + rect.width / 2;
        top = rect.top;
      } catch (err) {
        console.warn("Failed to get bounding rect:", err);
      }
    }
    
    // Simulate slight server latency
    setTimeout(() => {
      // Audio cue
      try {
        if (playRandomSuccessSound) playRandomSuccessSound();
      } catch (err) {
        console.warn("playRandomSuccessSound failed:", err);
      }
      
      const newXp = xp + 25;
      const newCoins = coins + 15;
      
      setXp(newXp);
      setCoins(newCoins);
      setMissionState('done');
      
      const textId1 = Date.now() + '-xp';
      const textId2 = Date.now() + '-coins';
      
      setFloatingTexts(prev => [
        ...prev,
        { id: textId1, text: '+25 XP', color: 'var(--primary)', left: left - 40, top: top - 20 },
        { id: textId2, text: '+15 🪙', color: 'var(--amber)', left: left + 20, top: top - 10 }
      ]);

      // Remove floating markers after animation finishes
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== textId1 && t.id !== textId2));
      }, 1500);

      // Check for Level Up dynamically using levels logic
      const oldLevelInfo = getLevelForXP(xp);
      const newLevelInfo = getLevelForXP(newXp);
      
      if (newLevelInfo.level > oldLevelInfo.level) {
        setTimeout(() => {
          setIsLevelingUp(true);
          setShowConfetti(true);
          try {
            if (playTierUpSwell) playTierUpSwell();
          } catch (e) {
            console.warn("playTierUpSwell failed:", e);
          }
          
          setLevel(newLevelInfo.level);
          setTierName(newLevelInfo.tierName);
          setTierSymbol(newLevelInfo.tierSymbol);
          setTheme(newLevelInfo.tierColor);

          setTimeout(() => {
            setIsLevelingUp(false);
            setShowConfetti(false);
          }, 4500);
        }, 600);
      }
    }, 600);
  };

  const handleReset = () => {
    try {
      if (playClick) playClick();
    } catch (e) {
      console.warn("playClick failed:", e);
    }
    setXp(initialXp);
    setCoins(initialCoins);
    setLevel(10);
    setTierName('The Beginning');
    setTierSymbol('🌱');
    setTheme('seedling');
    setMissionState('available');
    setFloatingTexts([]);
    setIsLevelingUp(false);
    setShowConfetti(false);
  };

  return (
    <div className={`theme-${theme}`} style={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto 10vh' }}>
      
      {/* Confetti Canvas */}
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999 }}>
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}vw`,
                top: `-20px`,
                background: ['#facc15', '#a855f7', '#06b6d4', '#f97316', '#db2777', '#34d399'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Gain Text Effects */}
      {floatingTexts.map(f => (
        <div
          key={f.id}
          style={{
            position: 'fixed',
            left: f.left,
            top: f.top,
            zIndex: 999,
            pointerEvents: 'none',
            color: f.color,
            fontWeight: 900,
            fontSize: '1.25rem',
            animation: 'floatUp 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
        >
          {f.text}
        </div>
      ))}

      {/* Mockup Card */}
      <div 
        style={{ 
          background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)', 
          border: '1px solid var(--primary-dim)', 
          borderRadius: '24px', 
          padding: '24px', 
          boxShadow: isLevelingUp 
            ? '0 30px 60px rgba(0,0,0,0.4), 0 0 60px var(--primary)' 
            : '0 30px 60px rgba(0,0,0,0.4), 0 0 40px rgba(168, 85, 247, 0.15)',
          transform: isLevelingUp ? 'perspective(1000px) rotateX(2deg) scale(1.03)' : 'perspective(1000px) rotateX(2deg)',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
        }}
      >
        {/* Interactive Reset Trigger */}
        {(missionState === 'done' || level === 11) && (
          <button 
            onClick={handleReset}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              color: 'var(--text-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'background 0.2s',
              zIndex: 10
            }}
            title="Reset Simulator"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            ↻
          </button>
        )}

        {/* Mockup Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div 
              onClick={handleAvatarTap}
              className={avatarAnimation}
              style={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.8rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🦁
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                Leo
                {isLevelingUp && <span style={{ fontSize: '0.9rem', animation: 'pulse 0.5s infinite' }}>⚡</span>}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, transition: 'color 0.5s' }}>
                Lv {level} · {tierName} {tierSymbol}
              </div>
            </div>
          </div>
          <div 
            onClick={handleCoinTap}
            className={coinShake ? 'shake-coin' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              background: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '6px 12px', 
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'transform 0.1s'
            }}
          >
            <GoldCoin size="1.1rem" />
            <span style={{ fontWeight: 800, color: '#fcd34d' }}>{coins}</span>
          </div>
        </div>

        {/* Mockup XP Bar */}
        <div style={{ background: 'rgba(0,0,0,0.35)', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 28, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)' }}>
          <div 
            style={{ 
              width: `${Math.round(xpProgress * 100)}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--primary), var(--primary-light, var(--primary)))', 
              borderRadius: 5,
              transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1), background 0.5s',
              boxShadow: '0 0 8px var(--primary)'
            }}
          />
        </div>

        {/* Mockup Missions */}
        <div style={{ textAlign: 'left', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: 12 }}>
          Today's Missions
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Mission 1 (Completed) */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🛏️</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.98rem' }}>Make Bed</div>
                <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>+15 XP · +10 🪙</div>
              </div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '6px 14px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem' }}>
              Done ✓
            </div>
          </div>

          {/* Mission 2 (Interactive) */}
          <div style={{ 
            background: missionState === 'done' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)', 
            border: missionState === 'done' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.1)', 
            borderRadius: 16, 
            padding: 14, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            transition: 'all 0.3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>📖</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.98rem' }}>Read 20 Mins</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, transition: 'color 0.5s' }}>+25 XP · +15 🪙</div>
              </div>
            </div>
            
            {missionState === 'available' ? (
              <button 
                onClick={handleMissionComplete}
                className="btn btn-primary"
                style={{ 
                  padding: '8px 18px', 
                  borderRadius: 12, 
                  fontWeight: 800, 
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  minWidth: 70,
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)'
                }}
              >
                Go!
              </button>
            ) : missionState === 'loading' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '6px 14px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                Done ✓
              </div>
            )}
          </div>
        </div>

        {/* Level Up Banner Overlay */}
        {isLevelingUp && (
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(0,0,0,0.8)', 
              borderRadius: '24px', 
              zIndex: 20, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            <div style={{ fontSize: '3rem', animation: 'crestFloat 1.2s ease-in-out infinite' }}>🧭</div>
            <div 
              style={{ 
                fontSize: '2.2rem', 
                fontWeight: 900, 
                color: '#fff', 
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                lineHeight: 1.1,
                marginTop: 8,
                animation: 'levelUpPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
              }}
            >
              LEVEL UP!
            </div>
            <div 
              style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontWeight: 800, 
                fontSize: '1.05rem', 
                marginTop: 10,
                textAlign: 'center',
                animation: 'fadeIn 0.4s ease-out 0.3s backwards'
              }}
            >
              Lv 11 · The Seeker
            </div>
            <div 
              style={{ 
                color: 'var(--text-dim)', 
                fontSize: '0.8rem', 
                marginTop: 4, 
                textAlign: 'center',
                animation: 'fadeIn 0.4s ease-out 0.5s backwards'
              }}
            >
              🎨 Morning Sky theme unlocked!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
