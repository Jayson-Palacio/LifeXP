"use client";

import AvatarDisplay from './AvatarDisplay';
import { getLevelForXP, getXPProgress } from '../lib/levels';
import { getStreakIcon, getStreakStyles } from '../lib/streaks';
import { playPop } from '../lib/sounds';

export default function OverviewTab({
  children, missions, rewards, pending, pendingRedemptions,
  settings, isExiting, setIsExiting, router,
  setInspectChildId, setModal,
  handleApprove, handleReject, handleFulfillReward, handleRefundReward,
}) {
  const hasApprovals = pending.length > 0;
  const hasRedemptions = pendingRedemptions.length > 0;

  return (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      {(hasApprovals || hasRedemptions) && (
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>Action Required</h2>
          
          {pending.map((comp, index) => {
             const child = children.find(c => c.id === comp.child_id) || {};
             const mission = missions.find(m => m.id === comp.mission_id) || {};
             return (
              <div key={comp.id} style={{ 
                display: 'flex', flexDirection: 'column', padding: 'var(--space-lg)', 
                background: 'linear-gradient(145deg, var(--bg-surface) 0%, rgba(255,255,255,0.03) 100%)', 
                border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)', 
                marginBottom: 'var(--space-md)', 
                boxShadow: '0 0 20px rgba(var(--primary-rgb, 168,85,247), 0.15)',
                animation: 'slideUp 0.4s ease-out backwards',
                animationDelay: `${index * 0.1}s`
              }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                   <AvatarDisplay avatarString={child.avatar} style={{ fontSize: '3rem' }} />
                   <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{child.name} submitted:</div>
                      <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{mission.icon} {mission.name}</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.9rem', padding: '4px 8px' }}>⭐ {mission.xp_reward} XP</span>
                        <span className="badge badge-amber" style={{ fontSize: '0.9rem', padding: '4px 8px' }}>🪙 {mission.coin_reward}</span>
                       </div>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                   <button className="btn btn-ghost" style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: 'none' }} onClick={(e) => handleReject(comp, e)}>✗ Reject</button>
                   <button className="btn btn-success" style={{ flex: 2, padding: '12px', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }} onClick={(e) => handleApprove(comp, e)}>✓ Approve!</button>
                </div>
              </div>
             );
          })}

          {pendingRedemptions.map((red, index) => {
             const child = children.find(c => c.id === red.child_id) || {};
             const reward = rewards.find(r => r.id === red.reward_id) || {};
             return (
                <div key={red.id} style={{ 
                  display: 'flex', flexDirection: 'column', padding: 'var(--space-lg)', 
                  background: 'linear-gradient(145deg, var(--bg-surface) 0%, rgba(255,255,255,0.03) 100%)', 
                  border: '1px solid var(--secondary-dim, rgba(168,85,247,0.5))', 
                  borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)', 
                  boxShadow: '0 0 20px rgba(168,85,247, 0.15)',
                  animation: 'slideUp 0.4s ease-out backwards',
                  animationDelay: `${(pending.length + index) * 0.1}s`
                }}>
                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                     <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '2rem' }}>
                       {reward.image
                         ? <img src={reward.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         : (reward.icon || '🎁')
                       }
                     </div>
                     <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{child.name} redeemed:</div>
                        <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{reward.name}</div>
                        <div style={{ marginTop: 4 }}>
                          <span className="badge badge-amber" style={{ fontSize: '0.9rem', padding: '4px 8px' }}>🪙 {reward.cost} coins spent</span>
                        </div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                     <button className="btn btn-ghost" style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: 'none' }} onClick={(e) => handleRefundReward(red, e)}>↻ Refund</button>
                     <button className="btn btn-success" style={{ flex: 2, padding: '12px', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }} onClick={(e) => handleFulfillReward(red, e)}>✓ Mark Given!</button>
                  </div>
                </div>
             );
          })}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Family Dashboard</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{settings.family_name || 'Your Family'}</h2>
        </div>
        <button className="cool-home-btn" onClick={() => {
            if (isExiting) return;
            if (playPop) playPop();
            setIsExiting(true);
            setTimeout(() => router.push('/'), 250);
        }}>
          {isExiting ? '🚀' : '🏠'} <span>{isExiting ? 'Warping...' : 'Home'}</span>
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
        {children.map((child, index) => {
          const { level, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
          const progressFraction = getXPProgress(child.total_xp_earned || child.xp || 0);
          const activeTheme = child.theme ? child.theme : tierColor;
          
          const childMissions = missions.filter(m => !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(child.id));

          return (
            <div 
              key={child.id} 
              className={`theme-${activeTheme}`}
              style={{ 
                padding: 'var(--space-lg)', 
                background: 'linear-gradient(145deg, var(--bg-surface) 0%, rgba(255,255,255,0.02) 100%)', 
                border: '1px solid var(--primary-dim)', 
                borderRadius: 'var(--radius-lg)', 
                boxShadow: 'var(--glow-primary)', 
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                animation: 'slideUp 0.5s ease-out backwards',
                animationDelay: `${index * 0.1}s`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onClick={() => setInspectChildId(child.id)}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <AvatarDisplay avatarString={child.avatar} style={{ fontSize: '2.5rem' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-bright)' }}>{child.name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>Lv {level}</div>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-deep)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressFraction * 100}%`, background: 'var(--primary)', borderRadius: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--amber)', fontWeight: 'bold' }}>🪙 {child.coins}</span>
                {child.streak > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--radius-full)', ...getStreakStyles(child.streak) }}>
                    <span style={{ fontSize: '0.8rem' }}>{getStreakIcon(child.streak)}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{child.streak} days</span>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <div style={{ background: 'var(--bg-deep)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  🎯 {childMissions.length} Active Missions
                </div>
              </div>
            </div>
          );
        })}
        
        <div 
          style={{ padding: 'var(--space-lg)', background: 'var(--bg-glass)', border: '1px dashed var(--text-dim)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 140 }}
          onClick={() => setModal({ type: 'child', data: null })}
        >
          <span style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>+</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: 8 }}>Add Kid</span>
        </div>
      </div>
    </div>
  );
}
