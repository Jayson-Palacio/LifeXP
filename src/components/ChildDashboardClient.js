"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { getLevelForXP, getXPProgress, getXPDisplay } from '../lib/levels';
import { showToast, showConfetti, showFloat } from '../lib/ui';

export default function ChildDashboardClient({ initialChild, missions, initialCompletions }) {
  const router = useRouter();
  
  const [child, setChild] = useState(initialChild);
  const [completions, setCompletions] = useState(initialCompletions);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  
  // Set body class for theme
  useEffect(() => {
    document.body.className = `theme-${child.theme || 'indigo'}`;
    return () => { document.body.className = ''; };
  }, [child.theme]);

  const levelInfo = getLevelForXP(child.xp);
  const xpProgress = getXPProgress(child.xp);

  // Derive mission states
  const missionStates = missions.map(m => {
    const thisMissionCompletions = completions.filter(c => c.mission_id === m.id);
    const validCompletions = thisMissionCompletions.filter(c => c.status !== 'rejected');
    const rejectedCompletions = thisMissionCompletions.filter(c => c.status === 'rejected');
    
    const totalDone = validCompletions.length;
    const max = m.max_completions || 1;
    
    if (totalDone >= max) {
      return { ...m, totalDone, max, status: validCompletions.some(c => c.status === 'pending') ? 'pending' : 'approved' };
    }
    
    const isRetry = rejectedCompletions.length > 0 && totalDone === 0;
    return { ...m, totalDone, max, status: isRetry ? 'rejected' : 'available' };
  });

  const handleSubmitMission = async (missionId, e) => {
    e.target.disabled = true;
    e.target.textContent = '...';
    
    const newCompletion = {
      mission_id: missionId,
      child_id: child.id,
      status: 'pending'
    };
    
    const { data } = await supabase.from('completions').insert([newCompletion]).select().single();
    if (data) {
      setCompletions(prev => [...prev, data]);
      showToast('Mission submitted! ⏳ Waiting for approval');
    }
  };

  const handleChangeTheme = async (t) => {
    await supabase.from('children').update({ theme: t }).eq('id', child.id);
    setChild({ ...child, theme: t });
  };

  return (
    <div className="page page-enter">
      <div className="page-header">
        <button className="back-btn" onClick={() => router.push('/')}>←</button>
        <h1 className="page-title">{child.name}'s Quest</h1>
      </div>

      <div className="hero-card" style={{ boxShadow: '0 10px 30px var(--glow-primary)', borderColor: 'var(--primary-dim)' }}>
        <div className="hero-avatar">{child.avatar}</div>
        <h2 className="hero-name">{child.name}</h2>
        <div className="hero-level" style={{ color: 'var(--primary)' }}>Level {levelInfo.level} — {levelInfo.title} {levelInfo.emoji}</div>

        <div className="xp-bar-container">
          <div className="xp-bar-label">
            <span>{levelInfo.title}</span>
            <span>{getXPDisplay(child.xp)}</span>
          </div>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${Math.round(xpProgress * 100)}%`, background: 'linear-gradient(90deg, var(--gold), var(--primary))', transition: 'width 0.5s ease-out' }}></div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-icon">🪙</span>
            <span className="stat-value-amber">{child.coins}</span>
          </div>
          {child.streak > 0 && (
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <span className="stat-value-cyan">{child.streak} day{child.streak > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Today's Missions</h3>
        </div>

        {missions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🎯</div>
            <p className="empty-state-text">No missions yet! Ask your parent.</p>
          </div>
        ) : missionStates.map(m => (
          <div key={m.id} className={`mission-card ${m.status === 'pending' ? 'pending' : ''}`} style={m.status === 'available' ? { borderLeftColor: 'var(--primary)' } : {}}>
            <span className="mission-icon">{m.icon}</span>
            <div className="mission-info">
              <div className="mission-name">{m.name}</div>
              <div className="mission-rewards">
                <span className="badge badge-gold">⭐ {m.xp_reward} XP</span>
                <span className="badge badge-amber">🪙 {m.coin_reward}</span>
              </div>
            </div>
            <div className="mission-actions">
              {(m.status === 'available' || m.status === 'rejected') ? (
                <button className="btn btn-primary btn-sm" onClick={(e) => handleSubmitMission(m.id, e)}>
                  {m.status === 'rejected' ? 'Retry ↻' : 'Done! ✓'} {m.max > 1 ? `(${m.totalDone}/${m.max})` : ''}
                </button>
              ) : m.status === 'pending' ? (
                <span className="badge badge-gold">⏳ Pending {m.max > 1 ? `(${m.totalDone}/${m.max})` : ''}</span>
              ) : (
                <span className="badge badge-green">✅ Done {m.max > 1 ? `(${m.max}/${m.max})` : ''}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', paddingBottom: 40 }}>
        <button className="btn btn-gold btn-lg" style={{ flex: 2 }} onClick={() => router.push(`/kid/${child.id}/shop`)}>🛒 Reward Shop</button>
        <button className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => setThemeModalOpen(true)}>🎨 Color</button>
      </div>

      {themeModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setThemeModalOpen(false); }}>
          <div className="modal-content" style={{ borderTop: '4px solid var(--primary)' }}>
            <h3 className="modal-title" style={{ textAlign: 'center' }}>Choose Your Color 🎨</h3>
            <div className="avatar-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {['indigo', 'gold', 'green', 'purple', 'cyan', 'red', 'amber'].map(t => (
                <button key={t} className={`avatar-option theme-option ${child.theme === t ? 'selected' : ''}`} onClick={() => handleChangeTheme(t)}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `var(--${t})`, boxShadow: `var(--glow-${t})` }}></div>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-block" onClick={() => setThemeModalOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
