"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { getLevelForXP, getXPProgress, getXPDisplay, getUnlockedColors } from '../lib/levels';
import { showToast, showFloat } from '../lib/ui';
import AppShell from './AppShell';
import TierCrest from './TierCrest';
import AvatarDisplay from './AvatarDisplay';

export default function ChildDashboardClient({ initialChild, missions, initialCompletions, rewards }) {
  const router = useRouter();
  
  const [child, setChild] = useState(initialChild);
  const [completions, setCompletions] = useState(initialCompletions);
  const [activeTab, setActiveTab] = useState('hall');

  const { level, tierName, tierSymbol, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
  const xpProgress = getXPProgress(child.total_xp_earned || child.xp || 0);
  const xpDisplay = getXPDisplay(child.total_xp_earned || child.xp || 0);
  
  const activeTheme = child.theme ? child.theme : tierColor;

  // Set body class for theme
  useEffect(() => {
    document.body.className = `theme-${activeTheme}`;
    return () => { document.body.className = ''; };
  }, [activeTheme]);

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
      // Note: Full celebration system (sounds + modal) will be implemented in ui.js later.
      showToast('Mission done! ⏳ Waiting for parent checking');
    }
  };

  const handleRedeem = async (r, e) => {
    e.target.disabled = true;
    e.target.textContent = '...';

    if (child.coins < r.cost) {
      e.target.disabled = false;
      e.target.textContent = 'Need more 🪙';
      return showToast('Not enough coins!', 'error');
    }

    try {
      const newCoins = child.coins - r.cost;
      
      const redemption = {
        reward_id: r.id,
        child_id: child.id
      };
      
      await supabase.from('redemptions').insert([redemption]);
      await supabase.from('children').update({ coins: newCoins }).eq('id', child.id);

      setChild({ ...child, coins: newCoins });
      
      const rect = e.target.getBoundingClientRect();
      showFloat(`-${r.cost} 🪙`, '#f59e0b', rect.left + rect.width / 2, rect.top);
      showToast(`🎉 Redeemed: ${r.name}!`);

    } catch (err) {
      console.error(err);
      showToast('Error redeeming reward', 'error');
    }
  };

  const handleChangeTheme = async (t) => {
    await supabase.from('children').update({ theme: t.id }).eq('id', child.id);
    setChild({ ...child, theme: t.id });
    showToast(`🎨 Theme changed to ${t.name}!`);
  };

  const unlockedColors = getUnlockedColors(level);

  const renderHall = () => (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-2xl)' }}>
      <button className="back-btn" onClick={() => router.push('/')} style={{ position: 'absolute', top: 'var(--space-lg)', right: 'var(--space-lg)', zIndex: 10 }}>🏠</button>
      
      <div className="hero-card" style={{ boxShadow: 'var(--glow-primary)', borderColor: 'var(--primary-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
          <div style={{ width: 100, height: 100 }}>
            <TierCrest tierName={tierName} glowColor="var(--primary)" />
          </div>
        </div>
        
        <div className="hero-avatar"><AvatarDisplay avatarString={child.avatar} /></div>
        <h2 className="hero-name">{child.name}</h2>
        
        <div className="hero-level" style={{ color: 'var(--primary)', marginTop: 8, fontSize: '1.1rem' }}>
          {tierName} · Level {level}
        </div>

        <div className="xp-bar-container" style={{ marginTop: 'var(--space-xl)' }}>
          <div className="xp-bar-label">
            <span>Next: Level {level + 1}</span>
            <span>{xpDisplay}</span>
          </div>
          <div className="xp-bar-track" style={{ height: 16 }}>
            <div className="xp-bar-fill" style={{ width: `${Math.round(xpProgress * 100)}%`, background: 'var(--primary)', transition: 'width 0.8s ease-out' }}></div>
          </div>
        </div>

        <div className="hero-stats" style={{ marginTop: 'var(--space-xl)' }}>
          <div className="stat-item" style={{ fontSize: '1.2rem' }}>
            <span className="stat-icon">🪙</span>
            <span className="stat-value-amber">{child.coins} coins</span>
          </div>
          {child.streak > 0 && (
            <div className="stat-item" style={{ fontSize: '1.2rem' }}>
              <span className="stat-icon">🔥</span>
              <span className="stat-value-cyan">{child.streak}-day streak</span>
            </div>
          )}
        </div>
      </div>

      <div className="section" style={{ marginTop: 'var(--space-2xl)' }}>
        <h3 className="section-title" style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>✨ Themes Unlocked</h3>
        <div className="avatar-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-sm)' }}>
          {unlockedColors.map(c => (
            <button key={c.id} className={`avatar-option ${activeTheme === c.id ? 'selected' : ''}`} onClick={() => handleChangeTheme(c)}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.hex === 'animated' ? 'linear-gradient(135deg, #facc15, #a855f7, #06b6d4)' : c.hex, boxShadow: `0 0 10px ${c.hex === 'animated' ? '#a855f7' : c.hex}` }}></div>
            </button>
          ))}
          {/* Mock locked colors to show there's more to earn */}
          {[1,2,3,4].map(idx => (
           <div key={`locked-${idx}`} className="avatar-option" style={{ opacity: 0.3, cursor: 'not-allowed', background: 'var(--bg-surface-alt)' }}>
              🔒
           </div> 
          )).slice(0, 8 - unlockedColors.length)}
        </div>
      </div>
    </div>
  );

  const renderMissions = () => (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-2xl)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-xl)', textAlign: 'center' }}>Today's Missions</h2>
      
      {missions.length === 0 ? (
        <div className="empty-state">
           <TierCrest tierName={tierName} />
           <h3 style={{ marginTop: 24 }}>All caught up!</h3>
           <p className="empty-state-text">You're amazing today. 🎉</p>
        </div>
      ) : missionStates.map(m => (
        <div key={m.id} className={`mission-card ${m.status === 'pending' ? 'pending' : ''}`} style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <span className="mission-icon" style={{ fontSize: '2.5rem' }}>{m.icon}</span>
          <div className="mission-info" style={{ marginLeft: 8 }}>
            <div className="mission-name" style={{ fontSize: '1.2rem', marginBottom: 8 }}>{m.name}</div>
            <div className="mission-rewards">
              <span className="badge badge-gold" style={{ fontSize: '0.9rem' }}>⭐ {m.xp_reward} XP</span>
              <span className="badge badge-amber" style={{ fontSize: '0.9rem' }}>🪙 {m.coin_reward}</span>
            </div>
          </div>
          <div className="mission-actions" style={{ marginLeft: 'auto' }}>
            {(m.status === 'available' || m.status === 'rejected') ? (
              <button 
                className="btn btn-primary" 
                style={{ padding: '16px 24px', fontSize: '1.2rem', minWidth: 120 }}
                onClick={(e) => handleSubmitMission(m.id, e)}
              >
                {m.status === 'rejected' ? 'Retry ↻' : 'Done! ✓'}
              </button>
            ) : m.status === 'pending' ? (
              <div style={{ textAlign: 'center', opacity: 0.8 }}>
                <span style={{ fontSize: '2rem' }}>⏳</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Waiting</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', animation: 'scaleIn 0.5s ease-out' }}>
                <span style={{ fontSize: '2rem' }}>✅</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--green)' }}>Done!</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderShop = () => (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-2xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 'var(--space-xl)', position: 'relative' }}>
         <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center' }}>Reward Shop</h2>
         <div className="stat-item" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-surface)', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--amber-dim)' }}>
           <span className="stat-icon">🪙</span>
           <span className="stat-value-amber">{child.coins}</span>
         </div>
      </div>

      {rewards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">🛒</div>
          <p className="empty-state-text">No rewards right now.</p>
        </div>
      ) : (
        <div className="reward-grid">
          {rewards.map(r => {
            const canAfford = child.coins >= r.cost;
            return (
              <div key={r.id} className="reward-card" style={{ padding: 'var(--space-xl)', border: `2px solid ${canAfford ? 'var(--primary)' : 'var(--bg-glass-border)'}`, opacity: canAfford ? 1 : 0.6 }}>
                <div className="reward-icon" style={{ fontSize: '3rem' }}>{r.icon}</div>
                <div className="reward-name" style={{ fontSize: '1.2rem', marginTop: 12 }}>{r.name}</div>
                <div className="reward-cost" style={{ fontSize: '1.1rem', margin: '12px 0' }}>🪙 {r.cost}</div>
                <button 
                  className={`btn ${canAfford ? 'btn-primary' : 'btn-ghost'} btn-block`}
                  style={{ padding: '12px' }}
                  disabled={!canAfford}
                  onClick={(e) => handleRedeem(r, e)}
                >
                  {canAfford ? 'Redeem!' : 'Need coins'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <AppShell role="kid" activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'hall' && renderHall()}
      {activeTab === 'missions' && renderMissions()}
      {activeTab === 'shop' && renderShop()}
    </AppShell>
  );
}
