"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLevelForXP, getXPProgress } from '../lib/levels';
import { getStartOfDay, getStartOfWeek, getStartOfMonth, getStoredTzOffset } from '../lib/time';
import AvatarDisplay from './AvatarDisplay';

export default function RoleSelectClient({ childrenData, missions, completions, parentPin }) {
  const router = useRouter();
  const [view, setView] = useState('select'); // 'select' | 'pin'
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

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
    setView('pin');
    setPin('');
    setError('');
  };

  const handleKeyClick = (val) => {
    if (val === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      
      if (newPin.length === 4) {
        // Compare locally — no server round trip needed
        if (newPin === parentPin) {
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: 800, margin: '0 auto', zIndex: 1 }}>
        <div className="kaeluma-logo-spin">☀</div>
        <h1 className="kaeluma-title">Kaeluma</h1>
        <p className="role-select-subtitle">Who's checking in?</p>

        {childrenData && childrenData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center', marginTop: 'var(--space-xl)', paddingBottom: '80px', width: '100%' }}>
            {childrenData.map((child, index) => {
              const { level, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
              const progressFraction = getXPProgress(child.total_xp_earned || child.xp || 0);
              const activeTheme = child.theme ? child.theme : tierColor;

              const stats = getDailyMissionStats(child.id);

              return (
                <button 
                  key={child.id} 
                  className={`theme-${activeTheme} kaeluma-card`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    flexDirection: 'row',
                    width: '100%',
                    maxWidth: 360,
                    padding: '16px 24px',
                    position: 'relative'
                  }}
                  onClick={() => router.push(`/kid/${child.id}`)}
                >
                  <AvatarDisplay avatarString={child.avatar} style={{ fontSize: '3.2rem', flexShrink: 0 }} />
                  <div style={{ flex: 1, textAlign: 'left', marginLeft: 16, zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>{child.name}</div>
                      <div style={{ fontSize: '1.05rem', color: 'var(--amber)', fontWeight: 800 }}>🪙 {child.coins}</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
                      <div style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lv {level}</div>
                      {stats && (
                        <div style={{ fontSize: '0.85rem', color: stats.done >= stats.total && stats.total > 0 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 700 }}>
                          🎯 {stats.done}/{stats.total}
                        </div>
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
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No players found. Please add a kid in Parent Mode.</p>
        )}
      </div>

      {/* Sleek Parent Lock pushed to the bottom */}
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
