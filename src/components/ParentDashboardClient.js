"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { showToast, showFloat } from '../lib/ui';
import { AVATAR_EMOJI_GROUPS, MISSION_EMOJI_GROUPS, REWARD_EMOJI_GROUPS, AVATAR_EMOJIS, MISSION_EMOJIS, REWARD_EMOJIS } from '../lib/ui';
import { getLevelForXP, getXPProgress, getXPDisplay } from '../lib/levels';
import AppShell from './AppShell';
import AvatarDisplay from './AvatarDisplay';
import SettingsTab from './SettingsTab';
import MissionModal from './MissionModal';
import RewardModal from './RewardModal';
import ChildModal from './ChildModal';

export default function ParentDashboardClient({ initialChildren, initialMissions, initialRewards, initialPending, initialPendingRedemptions, initialSettings }) {
  const router = useRouter();
  
  // AppShell state
  const [activeTab, setActiveTab] = useState('overview');
  const [manageTab, setManageTab] = useState('missions');
  
  // Data State
  const [children, setChildren] = useState(initialChildren || []);
  const [missions, setMissions] = useState(initialMissions || []);
  const [rewards, setRewards] = useState(initialRewards || []);
  const [pending, setPending] = useState(initialPending || []);
  const [pendingRedemptions, setPendingRedemptions] = useState(initialPendingRedemptions || []);
  const [settings, setSettings] = useState(initialSettings || { require_approval: true, family_name: 'Our Family' });
  
  // Modals specific
  const [modal, setModal] = useState(null);
  const [inspectChildId, setInspectChildId] = useState(null);

  // Real-time subscription for new pending completions and redemptions
  useEffect(() => {
    const channel = supabase
      .channel('completions-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'completions' }, (payload) => {
        if (payload.new.status === 'pending') {
          setPending(prev => [payload.new, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemptions' }, (payload) => {
        if (payload.new.status === 'pending') {
          setPendingRedemptions(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);


  const handleApprove = async (comp, e) => {
    e.stopPropagation();
    const mission = missions.find(m => m.id === comp.mission_id);
    const child = children.find(c => c.id === comp.child_id);
    if (!mission || !child) return;

    const currentXp = child.total_xp_earned || child.xp || 0;
    const oldLevelInfo = getLevelForXP(currentXp);

    // Award XP
    const newXp = currentXp + mission.xp_reward;
    const newCoins = child.coins + mission.coin_reward;
    const newLevelInfo = getLevelForXP(newXp);
    
    // Update DB
    await supabase.from('completions').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', comp.id);
    await supabase.from('children').update({ xp: newXp, total_xp_earned: newXp, coins: newCoins }).eq('id', child.id);

    // Update local state
    setPending(prev => prev.filter(p => p.id !== comp.id));
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, xp: newXp, total_xp_earned: newXp, coins: newCoins } : c));

    // Wait 200 ms to do UI actions
    setTimeout(async () => {
        const rTop = e.clientY - 20;
        const rLeft = e.clientX + 20;
        showFloat(`+${mission.xp_reward} XP`, 'var(--primary)', rLeft, rTop);
        showFloat(`+${mission.coin_reward} 🪙`, 'var(--amber)', rLeft, rTop + 30);

        // Check for Level/Tier up
        if (newLevelInfo.level > oldLevelInfo.level) {
            const { showLevelUp, showTierUp } = await import('../lib/ui');
            const { checkColorUnlocks } = await import('../lib/levels');
            
            if (newLevelInfo.tierName !== oldLevelInfo.tierName) {
                showTierUp(newLevelInfo.level, newLevelInfo.tierName);
            } else {
                const unlocks = checkColorUnlocks(oldLevelInfo.level, newLevelInfo.level);
                showLevelUp(newLevelInfo.level, newLevelInfo.tierName, unlocks.length > 0 ? unlocks[0] : null);
            }
        }
    }, 50);
  };

  const handleReject = async (comp, e) => {
    e.stopPropagation();
    await supabase.from('completions').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', comp.id);
    setPending(prev => prev.filter(p => p.id !== comp.id));
  };

  const handleFulfillReward = async (red, e) => {
    e.stopPropagation();
    await supabase.from('redemptions').update({ status: 'fulfilled' }).eq('id', red.id);
    setPendingRedemptions(prev => prev.filter(r => r.id !== red.id));
    showToast('Reward marked as given!');
  };

  const handleRefundReward = async (red, e) => {
    e.stopPropagation();
    const reward = rewards.find(r => r.id === red.reward_id);
    const child = children.find(c => c.id === red.child_id);
    if (!reward || !child) return;

    const newCoins = child.coins + reward.cost;
    await supabase.from('redemptions').update({ status: 'refunded' }).eq('id', red.id);
    await supabase.from('children').update({ coins: newCoins }).eq('id', child.id);
    
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, coins: newCoins } : c));
    setPendingRedemptions(prev => prev.filter(r => r.id !== red.id));
    showToast(`Refunded ${reward.cost} coins!`);
  };

  const handleDeleteMission = async (id) => {
    if (!confirm('Delete this mission?')) return;
    await supabase.from('missions').delete().eq('id', id);
    setMissions(prev => prev.filter(m => m.id !== id));
    showToast('Mission deleted.');
  };

  const handleDeleteReward = async (id) => {
    if (!confirm('Delete this reward?')) return;
    await supabase.from('rewards').delete().eq('id', id);
    setRewards(prev => prev.filter(r => r.id !== id));
    showToast('Reward deleted.');
  };

  const handleDeleteChild = async (id) => {
    if (!confirm('Delete this kid and all progress? This cannot be undone.')) return;
    await supabase.from('children').delete().eq('id', id);
    setChildren(prev => prev.filter(c => c.id !== id));
    if (inspectChildId === id) setInspectChildId(null);
    showToast('Kid removed from app.');
  };

  const closeModal = () => { setModal(null); };

  const renderOverview = () => {
    const hasApprovals = pending.length > 0;
    const hasRedemptions = pendingRedemptions.length > 0;

    return (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      {(hasApprovals || hasRedemptions) && (
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>Action Required</h2>
          
          {pending.map(comp => {
             const child = children.find(c => c.id === comp.child_id) || {};
             const mission = missions.find(m => m.id === comp.mission_id) || {};
             return (
              <div key={comp.id} style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-lg)', background: 'var(--bg-surface)', border: '1px solid var(--primary-dim)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)', boxShadow: 'var(--glow-primary)' }}>
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
                   <button className="btn btn-success" style={{ flex: 2, padding: '12px', fontSize: '1.1rem' }} onClick={(e) => handleApprove(comp, e)}>✓ Approve!</button>
                </div>
              </div>
             );
          })}

          {pendingRedemptions.map(red => {
             const child = children.find(c => c.id === red.child_id) || {};
             const reward = rewards.find(r => r.id === red.reward_id) || {};
             return (
                <div key={red.id} style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-lg)', background: 'var(--bg-surface)', border: '1px solid var(--secondary-dim, rgba(168,85,247,0.3))', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)', boxShadow: 'var(--glow-primary)' }}>
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
                     <button className="btn btn-success" style={{ flex: 2, padding: '12px', fontSize: '1.1rem' }} onClick={(e) => handleFulfillReward(red, e)}>✓ Mark Given!</button>
                  </div>
                </div>
             );
          })}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Family</h2>
        <button className="btn btn-ghost" onClick={() => router.push('/')} style={{ fontSize: '0.9rem' }}>Exit Mode</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
        {children.map(child => {
          const { level, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
          const progressFraction = getXPProgress(child.total_xp_earned || child.xp || 0);
          const activeTheme = child.theme ? child.theme : tierColor;
          
          const childMissions = missions.filter(m => !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(child.id));

          return (
            <div 
              key={child.id} 
              className={`theme-${activeTheme}`}
              style={{ padding: 'var(--space-lg)', background: 'var(--bg-surface)', border: '1px solid var(--primary-dim)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--glow-primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onClick={() => setInspectChildId(child.id)}
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
                {child.streak > 0 && <span style={{ color: 'var(--cyan)', fontWeight: 'bold' }}>🔥 {child.streak} days</span>}
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
  };

  const renderManage = () => (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>Library</h2>
      
      <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-full)', padding: 4, marginBottom: 'var(--space-xl)', border: '1px solid var(--bg-glass-border)' }}>
        <button className={`btn ${manageTab === 'missions' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, borderRadius: 'var(--radius-full)' }} onClick={() => setManageTab('missions')}>🎯 Missions</button>
        <button className={`btn ${manageTab === 'rewards' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, borderRadius: 'var(--radius-full)' }} onClick={() => setManageTab('rewards')}>🎁 Rewards</button>
      </div>

      {manageTab === 'missions' ? (
        <div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-2xl)' }} onClick={() => setModal({ type: 'mission', data: null })}>+ Add Mission</button>
          
          {missions.length === 0 ? (
            <div className="empty-state">
               <p className="empty-state-text">No missions added yet.</p>
            </div>
          ) : missions.map(m => (
            <div key={m.id} className="mission-card" style={{ padding: 'var(--space-lg)' }}>
              <span className="mission-icon" style={{ fontSize: '2.5rem' }}>{m.icon}</span>
              <div className="mission-info" style={{ marginLeft: 8 }}>
                <div className="mission-name" style={{ fontSize: '1.2rem' }}>{m.name}</div>
                <div className="mission-rewards" style={{ marginTop: 8 }}>
                  <span className="badge badge-gold">⭐ {m.xp_reward}</span>
                  <span className="badge badge-amber">🪙 {m.coin_reward}</span>
                </div>
              </div>
              <div className="mission-actions" style={{ marginLeft: 'auto' }}>
                <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'mission', data: m })}>✎</button>
                <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)' }} onClick={() => handleDeleteMission(m.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-2xl)' }} onClick={() => setModal({ type: 'reward', data: null })}>+ Add Reward</button>
          
          <div>
            {rewards.length === 0 ? (
              <div className="empty-state">
                 <p className="empty-state-text">No rewards added yet.</p>
              </div>
            ) : rewards.map(r => (
              <div key={r.id} className="mission-card" style={{ padding: 'var(--space-lg)' }}>
                <div className="mission-icon" style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '1.8rem' }}>
                  {r.image
                    ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : r.icon
                  }
                </div>
                <div className="mission-info" style={{ marginLeft: 8 }}>
                  <div className="mission-name" style={{ fontSize: '1.2rem' }}>{r.name}</div>
                  <div className="mission-rewards" style={{ marginTop: 8 }}>
                    <span className="badge badge-amber">🪙 {r.cost}</span>
                  </div>
                </div>
                <div className="mission-actions" style={{ marginLeft: 'auto' }}>
                  <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'reward', data: r })}>✎</button>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)' }} onClick={() => handleDeleteReward(r.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Kid Slide-up Drawer
  const renderKidDrawer = () => {
     if (!inspectChildId) return null;
     const child = children.find(c => c.id === inspectChildId);
     if (!child) return null;
     
     const { level, tierName, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
     const xpDisplay = getXPDisplay(child.total_xp_earned || child.xp || 0);
     const xpProgress = getXPProgress(child.total_xp_earned || child.xp || 0);
     const activeTheme = child.theme ? child.theme : tierColor;

     return (
        <div className={`theme-${activeTheme}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease-out' }}>
           <div style={{ width: '100%', height: 'calc(100% - 100px)', background: 'var(--bg-deep)', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', overflowY: 'auto', borderTop: '4px solid var(--primary)', animation: 'slideUp 0.3s ease-out', position: 'relative' }}>
               <button className="btn btn-ghost" style={{ position: 'absolute', top: 'var(--space-lg)', right: 'var(--space-lg)', zIndex: 10 }} onClick={() => setInspectChildId(null)}>Close</button>
               
               <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                  <div style={{ fontSize: '4rem', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                     <div style={{ background: 'var(--primary-dim)', borderRadius: '50%', padding: '16px', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AvatarDisplay avatarString={child.avatar} />
                     </div>
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: 16 }}>{child.name}'s Profile</h2>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem', marginTop: 4 }}>Lv {level} · {tierName}</div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
                   <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <span className="stat-icon" style={{ fontSize: '2rem' }}>🪙</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 8 }}>{child.coins} Coins</div>
                   </div>
                   <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <span className="stat-icon" style={{ fontSize: '2rem' }}>🔥</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 8 }}>{child.streak} Day Streak</div>
                   </div>
               </div>
               
               <div style={{ marginBottom: 'var(--space-2xl)' }}>
                 <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>🎯 Active Missions</h4>
                 {(() => {
                    const childMissions = missions.filter(m => !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(child.id));
                    if (childMissions.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active missions.</div>;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {childMissions.map(m => (
                           <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                              <span style={{ fontSize: '1.8rem' }}>{m.icon}</span>
                              <div style={{ flex: 1}}>
                                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{m.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.max_completions_per_period}x {m.frequency}</div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>⭐ {m.xp_reward}</span>
                                <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>🪙 {m.coin_reward}</span>
                              </div>
                           </div>
                        ))}
                      </div>
                    );
                 })()}
               </div>

               <div style={{ marginBottom: 'var(--space-2xl)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontWeight: 'bold' }}>
                    <span>Experience to Next Level</span>
                    <span>{xpDisplay}</span>
                 </div>
                 <div style={{ width: '100%', height: '16px', background: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${xpProgress * 100}%`, background: 'var(--primary)', borderRadius: '8px' }} />
                 </div>
                 <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'right' }}>Total XP: {child.total_xp_earned || child.xp || 0}</div>
               </div>

               <div style={{ borderTop: '1px solid var(--bg-glass-border)', paddingTop: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)' }}>
                   <button className="btn btn-ghost btn-block" onClick={() => { setModal({ type: 'child', data: child }); setInspectChildId(null); }}>✎ Edit Profile</button>
                   <button className="btn btn-ghost" style={{ padding: '0 24px', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => handleDeleteChild(child.id)}>🗑 Remove</button>
               </div>
           </div>
        </div>
     );
  };


  return (
    <>
      <AppShell role="parent" activeTab={activeTab} onTabChange={setActiveTab} notifications={{ approvals: pending.length }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'manage' && renderManage()}
        {activeTab === 'settings' && <SettingsTab initialSettings={settings} />}
      </AppShell>

      {/* Slide-Up Drawer for Kid Inspect Mode */}
      {renderKidDrawer()}

      {/* Global Modals for Editing */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeModal(); }}>
          <div className="modal-content">
            <h3 className="modal-title" style={{ textAlign: 'center', fontSize: '1.5rem' }}>
              {modal.type === 'mission' ? (modal.data ? 'Edit Mission' : 'New Mission') :
               modal.type === 'reward' ? (modal.data ? 'Edit Reward' : 'New Reward') :
               (modal.data ? 'Edit Kid Profile' : 'Add Kid to Family')}
            </h3>
            {modal.type === 'mission' && 
              <MissionModal 
                modal={modal} 
                childrenList={children}
                closeModal={closeModal} 
                onSuccess={(data, isEdit) => {
                  if (isEdit) setMissions(prev => prev.map(m => m.id === data.id ? data : m));
                  else setMissions(prev => [...prev, data]);
                  showToast(isEdit ? 'Mission updated!' : 'Mission created! 🎯');
                }} 
              />
            }
            {modal.type === 'reward' && 
              <RewardModal 
                modal={modal} 
                childrenList={children}
                closeModal={closeModal} 
                onSuccess={(data, isEdit) => {
                  if (isEdit) setRewards(prev => prev.map(r => r.id === data.id ? data : r));
                  else setRewards(prev => [...prev, data]);
                  showToast(isEdit ? 'Reward updated!' : 'Reward created! 🎁');
                }}
              />
            }
            {modal.type === 'child' && 
              <ChildModal 
                modal={modal} 
                closeModal={closeModal} 
                onSuccess={(data, isEdit) => {
                  if (isEdit) setChildren(prev => prev.map(c => c.id === data.id ? data : c));
                  else setChildren(prev => [...prev, data]);
                  showToast(isEdit ? 'Kid profile updated!' : `Welcome ${data.name}! 🎉`);
                }}
              />
            }
          </div>
        </div>
      )}
    </>
  );
}
