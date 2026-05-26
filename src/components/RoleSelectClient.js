"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLevelForXP, getXPProgress } from '../lib/levels';
import { getStartOfDay, getStartOfWeek, getStartOfMonth, getStoredTzOffset } from '../lib/time';
import AvatarDisplay from './AvatarDisplay';
import RocketShip from './RocketShip';
import GoldCoin from './GoldCoin';
import { playClick, playPop } from '../lib/sounds';
import { verifyParentPin, verifyAccountPassword, resetParentPinWithPassword } from '../app/actions/auth';

export default function RoleSelectClient({ childrenData, missions, completions }) {
  const router = useRouter();
  const [view, setView] = useState('select'); // 'select' | 'pin'
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  // Pre-warm all kid pages and parent page so navigation feels instant
  useEffect(() => {
    if (childrenData) {
      childrenData.forEach(child => router.prefetch(`/kid/${child.id}`));
    }
    router.prefetch('/parent');
  }, [childrenData, router]);

  const getDailyMissionStats = (childId) => {
     if (!missions || !completions) return null;
     
     const now = new Date();
     const tz = getStoredTzOffset();
     const today = getStartOfDay(tz);
     
     const childMissions = missions.filter(m => !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(childId));
     
     let total = 0;
     let done = 0;
     
     for (const m of childMissions) {
        if (m.frequency === 'weekly' && m.specific_days && m.specific_days.length > 0) {
           if (!m.specific_days.includes(now.getDay())) continue;
        }
        if (m.frequency === 'date_range' && m.start_date && m.end_date) {
           const todayStr = now.toISOString().split('T')[0];
           if (todayStr < m.start_date || todayStr > m.end_date) continue;
        }
        
        const childComps = completions.filter(c => c.child_id === childId && c.mission_id === m.id && c.status !== 'rejected');
        const maxPerPeriod = m.max_completions_per_period || 1;
        
        let periodStart = today;
        if (m.frequency === 'weekly') {
           periodStart = getStartOfWeek(tz);
        } else if (m.frequency === 'monthly') {
           periodStart = getStartOfMonth(tz);
        }
        
        const periodDoneCount = childComps.filter(c => new Date(c.submitted_at || c.created_at) >= periodStart).length;
        
        total += maxPerPeriod;
        done += Math.min(periodDoneCount, maxPerPeriod);
     }
     
     return { done, total };
  };

  const handleParentClick = () => {
    if (playClick) playClick();
    // Re-trigger prefetch the moment they show intent — guarantees the
    // route is warm for the entire ~2s they spend typing the PIN.
    router.prefetch('/parent');
    setView('pin');
    setPin('');
    setError('');
  };

  const handleKeyClick = async (val) => {
    if (isVerifying) return;
    if (playClick) playClick();
    if (val === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      
      if (newPin.length === 4) {
        setIsVerifying(true);
        if (view === 'pin') {
          // Standard PIN verification
          const isCorrect = await verifyParentPin(newPin);
          setIsVerifying(false);
          if (isCorrect) {
            setIsExiting(true);
            setTimeout(() => router.push('/parent'), 250);
          } else {
            setIsShaking(true);
            setError('Wrong PIN. Try again.');
            setTimeout(() => {
              setPin('');
              setIsShaking(false);
            }, 600);
          }
        } else if (view === 'forgot-pin-new') {
          // Setting new PIN after password verification
          const res = await resetParentPinWithPassword(accountPassword, newPin);
          setIsVerifying(false);
          if (res.success) {
            setIsExiting(true);
            setTimeout(() => router.push('/parent'), 250);
          } else {
            setIsShaking(true);
            setError(res.error || 'Failed to reset PIN.');
            setTimeout(() => {
              setPin('');
              setIsShaking(false);
            }, 600);
          }
        }
      }
    }
  };

  if (view === 'forgot-pin-password') {
    return (
      <div className={`pin-page ${isExiting ? 'page-exit' : 'page-enter'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 'var(--space-md)' }}>
        <button className="back-btn" onClick={() => { if (playClick) playClick(); setView('pin'); setError(''); }} style={{ position: 'absolute', top: 'var(--space-lg)', left: 'var(--space-lg)' }}>←</button>
        
        <div style={{ background: 'rgba(10, 8, 20, 0.7)', backdropFilter: 'blur(16px)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 'var(--space-sm)', background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Reset PIN
          </h2>
          
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Enter your Kaeluma account password to verify your identity:
          </p>

          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsVerifying(true);
            setError('');
            const form = e.currentTarget;
            const pwd = form.elements.password.value;
            
            const res = await verifyAccountPassword(pwd);
            setIsVerifying(false);
            if (res.success) {
              setAccountPassword(pwd);
              setView('forgot-pin-new');
              setPin('');
              setError('');
            } else {
              setError(res.error || 'Incorrect password.');
            }
          }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <label htmlFor="password">Account Password</label>
              <input className="input" id="password" name="password" type="password" required disabled={isVerifying} style={{ background: 'var(--bg-deep)' }} />
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isVerifying} style={{ height: '50px' }}>
              {isVerifying ? 'Verifying...' : 'Verify Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'pin' || view === 'forgot-pin-new') {
    const isReset = view === 'forgot-pin-new';
    return (
      <div className={`pin-page ${isExiting ? 'page-exit' : 'page-enter'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button className="back-btn" onClick={() => { if (playClick) playClick(); setView(isReset ? 'forgot-pin-password' : 'select'); setError(''); setPin(''); }} style={{ position: 'absolute', top: 'var(--space-lg)', left: 'var(--space-lg)' }}>←</button>
        <h2 className="pin-title" style={{ marginBottom: 'var(--space-lg)' }}>{isReset ? '🔒 Set New PIN' : '🔒 Parent Mode'}</h2>
        <div className={`pin-display ${isShaking ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}></div>
          ))}
        </div>
        <div className="pin-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} className="pin-key" onClick={() => handleKeyClick(n.toString())} disabled={isVerifying}>{n}</button>
          ))}
          <button className="pin-key pin-key-empty" disabled={isVerifying}></button>
          <button className="pin-key" onClick={() => handleKeyClick('0')} disabled={isVerifying}>0</button>
          <button className="pin-key pin-key-delete" onClick={() => handleKeyClick('del')} disabled={isVerifying}>←</button>
        </div>
        <div className="pin-error">{isVerifying ? 'Checking…' : error}</div>

        {!isReset && (
          <button 
            onClick={() => {
              if (playClick) playClick();
              setView('forgot-pin-password');
              setError('');
              setPin('');
            }} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              cursor: 'pointer', 
              fontSize: '0.9rem', 
              marginTop: 'var(--space-md)', 
              textDecoration: 'underline',
              fontFamily: 'var(--font-outfit)'
            }}
          >
            Forgot PIN?
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`role-select-page ${isExiting ? 'page-exit' : 'page-enter'}`}>
      
      {/* Ambient energetic cosmic background for Kaeluma */}
      <div className="kaeluma-bg" />
      <RocketShip />

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 1000, margin: '0 auto', zIndex: 1 }}>
        <div className="kaeluma-logo-spin">☀</div>
        <h1 className="kaeluma-title">Kaeluma</h1>
        <p className="role-select-subtitle">Who's checking in?</p>

        {childrenData && childrenData.length > 0 ? (() => {
          const n = childrenData.length;
          // Ideal column count: 1→1, 2→2, 3→3, 4→2 (2×2), 5→3, 6+→3
          const cols = n === 1 ? 1 : n === 4 ? 2 : n <= 3 ? n : 3;

          return (
          <div className="kaeluma-grid" style={{ '--grid-cols': cols }}>
            {childrenData.map((child, index) => {
              const { level, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
              const progressFraction = getXPProgress(child.total_xp_earned || child.xp || 0);
              const activeTheme = child.theme ? child.theme : tierColor;

              const stats = getDailyMissionStats(child.id);
              const isAllDone = stats && stats.done >= stats.total && stats.total > 0;

              return (
                <button 
                  key={child.id} 
                  className={`theme-${activeTheme} kaeluma-card`}
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    flexDirection: 'column',
                    width: '100%',
                    position: 'relative',
                    border: isAllDone ? '1px solid var(--primary)' : undefined,
                  }}
                  onClick={() => {
                    if (playPop) playPop();
                    // Persist theme so the loading skeleton matches this kid's color
                    try { localStorage.setItem('kaeluma_kid_theme', child.theme || 'seedling'); } catch {}
                    setIsExiting(true);
                    setTimeout(() => router.push(`/kid/${child.id}`), 250);
                  }}
                >
                  <div className="kaeluma-card-avatar" style={{ border: 'none', background: 'transparent', boxShadow: 'none', overflow: 'visible' }}>
                    <div className={`hero-avatar-ring ring-${child.ring_style || 'solid'}`} style={{ width: '100%', height: '100%', margin: 0 }}>
                      <div className="hero-avatar-img">
                        <AvatarDisplay avatarString={child.avatar} size="100%" style={{ width: '100%', height: '100%', display: 'block' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minWidth: 0, zIndex: 1 }}>
                    <div className="kaeluma-card-name">{child.name}</div>
                    <div className="kaeluma-card-level">Lv {level}</div>
                    <div className="kaeluma-card-stats">
                      <span style={{ color: 'var(--amber)' }}><GoldCoin /> {child.coins}</span>
                      {stats && (
                        <span style={{ color: stats.done >= stats.total && stats.total > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                          🎯 {stats.done}/{stats.total}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Glowing Progress Bar at the bottom edge */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(0,0,0,0.3)', zIndex: 1, borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressFraction * 100}%`, background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                  </div>
                </button>
              );
            })}
          </div>
          );
        })() : (
          <p style={{ color: 'var(--text-muted)' }}>No players found. Please add a player in Parent Mode.</p>
        )}
      </div>

      {/* Sleek Parent Lock centered at the bottom */}
      <button 
        className="sleek-parent-btn"
        onClick={handleParentClick}
        title="Parent Mode"
      >
        🔒 <span className="sleek-parent-btn-text">Parent Mode</span>
      </button>

    </div>
  );
}
