"use client";

import AvatarDisplay from './AvatarDisplay';
import GuildGuideCard from './GuildGuideCard';
import { getLevelForXP, getXPProgress } from '../lib/levels';
import { guildGuideNote } from '../lib/guildGuide';
import { getStreakIcon, getStreakStyles } from '../lib/streaks';
import GoldCoin from './GoldCoin';

export default function OverviewTab({
  children, missions, rewards, pending, pendingRedemptions,
  settings,
  setInspectChildId, setModal,
  handleApprove, handleReject, handleFulfillReward, handleRefundReward,
}) {
  const hasApprovals = pending.length > 0;
  const hasRedemptions = pendingRedemptions.length > 0;
  const queueCount = pending.length + pendingRedemptions.length;
  const guide = guildGuideNote({
    children,
    missions,
    rewards,
    pending,
    pendingRedemptions,
    familyName: settings?.family_name,
  });

  const onGuideAction = (action) => {
    if (!action) return;
    if (action.type === 'add_child') setModal({ type: 'child', data: null });
    if (action.type === 'add_mission') {
      setModal({
        type: 'mission',
        data: action.prefill
          ? {
              name: action.prefill.name,
              icon: action.prefill.icon,
              category: action.prefill.category,
              coin_reward: action.prefill.coin_reward,
            }
          : null,
      });
    }
    if (action.type === 'add_reward') setModal({ type: 'reward', data: null });
  };

  return (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <GuildGuideCard note={guide} onAction={onGuideAction} />
      {(hasApprovals || hasRedemptions) && (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <p className="quests-kicker">Needs you</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.3rem)', fontWeight: 600, letterSpacing: '-0.035em', margin: '0 0 18px' }}>
            {queueCount} to review.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
            {pending.map((comp) => {
               const child = children.find(c => c.id === comp.child_id) || {};
               const mission = missions.find(m => m.id === comp.mission_id);
               const canApprove = Boolean(mission?.id);
               return (
                <div key={comp.id} className="quests-family-card" style={{ 
                  display: 'flex', flexDirection: 'column', padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                     <AvatarDisplay avatarString={child.avatar} style={{ fontSize: '2.2rem', flexShrink: 0 }} />
                     <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{child.name || 'Player'}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mission?.icon || '🎯'} {mission?.name || 'Deleted mission'}</div>
                        {mission && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>⭐ {mission.xp_reward} XP</span>
                          <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '2px 6px' }}><GoldCoin /> {mission.coin_reward}</span>
                         </div>
                        )}
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                     <button className="btn btn-ghost" style={{ flex: 1, minHeight: 44, padding: '10px', fontSize: '0.95rem' }} onClick={(e) => handleReject(comp, e)}>Redo</button>
                     <button className="btn btn-success" disabled={!canApprove} style={{ flex: 2, minHeight: 44, padding: '10px', fontSize: '0.95rem' }} onClick={(e) => handleApprove(comp, e)}>Approve</button>
                  </div>
                </div>
               );
            })}

            {pendingRedemptions.map((red) => {
               const child = children.find(c => c.id === red.child_id) || {};
               const reward = rewards.find(r => r.id === red.reward_id) || {};
               return (
                  <div key={red.id} className="quests-family-card" style={{ 
                    display: 'flex', flexDirection: 'column', padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-alt)', fontSize: '1.5rem' }}>
                         {reward.image
                           ? <img src={reward.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           : (reward.icon || '🎁')
                         }
                       </div>
                       <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{child.name} redeemed</div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reward.name}</div>
                          <div style={{ marginTop: 4 }}>
                            <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '2px 6px' }}><GoldCoin /> {reward.cost} coins</span>
                          </div>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                       <button className="btn btn-ghost" style={{ flex: 1, minHeight: 44, padding: '10px', fontSize: '0.95rem' }} onClick={(e) => handleRefundReward(red, e)}>Refund</button>
                       <button className="btn btn-success" style={{ flex: 2, minHeight: 44, padding: '10px', fontSize: '0.95rem' }} onClick={(e) => handleFulfillReward(red, e)}>Mark given</button>
                    </div>
                  </div>
               );
            })}
          </div>
        </div>
      )}
      <p className="quests-kicker">{settings.family_name || 'Your family'}</p>
      <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.3rem)', fontWeight: 600, letterSpacing: '-0.035em', margin: '0 0 22px' }}>Who's playing.</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
        {children.map((child, index) => {
          const { level, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
          const progressFraction = getXPProgress(child.total_xp_earned || child.xp || 0);
          const activeTheme = child.theme ? child.theme : tierColor;
          
          const childMissions = missions.filter(m => m.is_active !== false && (!m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(child.id)));

          return (
            <button
              type="button"
              key={child.id} 
              className={`theme-${activeTheme} quests-family-card`}
              style={{ 
                padding: 'var(--space-lg)', 
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                animation: 'slideUp 0.35s ease-out backwards',
                animationDelay: `${index * 0.04}s`,
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
                width: '100%',
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
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressFraction * 100}%`, background: 'var(--primary)', borderRadius: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--amber)', fontWeight: 'bold' }}><GoldCoin /> {child.coins}</span>
                {child.streak > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--radius-full)', ...getStreakStyles(child.streak) }}>
                    <span style={{ fontSize: '0.8rem' }}>{getStreakIcon(child.streak)}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{child.streak} day{child.streak === 1 ? '' : 's'}</span>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <div style={{ background: 'var(--bg-surface-alt)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  🎯 {childMissions.length} active mission{childMissions.length === 1 ? '' : 's'}
                </div>
              </div>
            </button>
          );
        })}
        
        <button
          type="button"
          style={{ padding: 'var(--space-lg)', background: 'var(--bg-glass)', border: '1px dashed var(--text-dim)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 140, font: 'inherit', color: 'inherit' }}
          onClick={() => setModal({ type: 'child', data: null })}
        >
          <span style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>+</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: 8 }}>Add Player</span>
        </button>
      </div>

      {/* SUPPORT & TIP JAR BANNER */}
      <div style={{
        marginTop: 'var(--space-2xl)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.03) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.18)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.03)',
        animation: 'slideUp 0.6s ease-out backwards',
        animationDelay: '0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: '280px', flex: '1 1 400px' }}>
          <span style={{ fontSize: '2.2rem' }}>💖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-bright)' }}>Loving Kaeluma?</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 2 }}>
              If Kaeluma makes your morning routines easier, consider supporting us with a one-time tip. Every contribution helps keep the servers running!
            </div>
          </div>
        </div>
        <a
          href="https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'linear-gradient(90deg, #635BFF 0%, #7B73FF 100%)',
            color: '#fff',
            fontWeight: 800,
            padding: '12px 24px',
            fontSize: '0.9rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          Support Kaeluma
        </a>
      </div>
    </div>
  );
}
