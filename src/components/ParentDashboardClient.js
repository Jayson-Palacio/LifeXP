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
import AnalyticsTab from './AnalyticsTab';
import MissionModal from './MissionModal';
import RewardModal from './RewardModal';
import ChildModal from './ChildModal';
import { playClick, playPop, playRandomSuccessSound } from '../lib/sounds';

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

  // Sync state with props when data is refreshed (e.g. on window focus)
  useEffect(() => { setChildren(initialChildren || []); }, [initialChildren]);
  useEffect(() => { setMissions(initialMissions || []); }, [initialMissions]);
  useEffect(() => { setRewards(initialRewards || []); }, [initialRewards]);
  useEffect(() => { setPending(initialPending || []); }, [initialPending]);
  useEffect(() => { setPendingRedemptions(initialPendingRedemptions || []); }, [initialPendingRedemptions]);
  useEffect(() => { setSettings(initialSettings || { require_approval: true, family_name: 'Our Family', theme_mode: 'dark' }); }, [initialSettings]);
  
  // Modals specific
  const [modal, setModal] = useState(null);
  const [inspectChildId, setInspectChildId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null); // null = not loaded yet
  const [historyLoading, setHistoryLoading] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lifexp_collapsed_categories');
      if (stored) return JSON.parse(stored);
    }
    return {};
  });

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => {
      const next = { ...prev, [cat]: !prev[cat] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('lifexp_collapsed_categories', JSON.stringify(next));
      }
      return next;
    });
  };

  // Reset history state when opening drawer for a new kid
  useEffect(() => {
    setHistoryOpen(false);
    setHistoryData(null);
  }, [inspectChildId]);

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
    // Streak logic
    let newStreak = child.streak || 0;
    const now = new Date();
    const today = now.toDateString();
    const lastCompDate = child.last_completion_date ? new Date(child.last_completion_date) : null;
    
    if (!lastCompDate || lastCompDate.toDateString() !== today) {
       // if more than 48 hours passed since last completion, reset
       if (lastCompDate && now.getTime() - lastCompDate.getTime() > 86400000 * 2) {
           newStreak = 1;
       } else {
           newStreak += 1;
       }
    }
    
    // Update DB
    await supabase.from('completions').update({ status: 'approved', reviewed_at: now.toISOString() }).eq('id', comp.id);
    await supabase.from('children').update({ xp: newXp, total_xp_earned: newXp, coins: newCoins, streak: newStreak, last_completion_date: now.toISOString() }).eq('id', child.id);

    // Update local state
    setPending(prev => prev.filter(p => p.id !== comp.id));
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, xp: newXp, total_xp_earned: newXp, coins: newCoins, streak: newStreak, last_completion_date: now.toISOString() } : c));

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
    if (playPop) playPop();
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
    if (playClick) playClick();
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

  const handleToggleActiveMission = async (m) => {
    const newStatus = m.is_active === false ? true : false;
    await supabase.from('missions').update({ is_active: newStatus }).eq('id', m.id);
    setMissions(prev => prev.map(mission => mission.id === m.id ? { ...mission, is_active: newStatus } : mission));
    showToast(newStatus ? 'Mission activated!' : 'Mission saved for later.');
  };

  const handleDeleteReward = async (id) => {
    if (!confirm('Delete this reward?')) return;
    await supabase.from('rewards').delete().eq('id', id);
    setRewards(prev => prev.filter(r => r.id !== id));
    showToast('Reward deleted.');
  };

  const handleToggleActiveReward = async (r) => {
    const newStatus = r.is_active === false ? true : false;
    await supabase.from('rewards').update({ is_active: newStatus }).eq('id', r.id);
    setRewards(prev => prev.map(reward => reward.id === r.id ? { ...reward, is_active: newStatus } : reward));
    showToast(newStatus ? 'Reward activated!' : 'Reward saved for later.');
  };

  const handleDeleteChild = async (id) => {
    if (!confirm('Delete this kid and all progress? This cannot be undone.')) return;
    await supabase.from('children').delete().eq('id', id);
    setChildren(prev => prev.filter(c => c.id !== id));
    if (inspectChildId === id) setInspectChildId(null);
    showToast('Kid removed from app.');
  };

  const handleAdjustCoins = async (childId, amount, e) => {
    if (e) e.stopPropagation();
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    // Prevent negative balances if we deduct more than they have
    const newCoins = Math.max(0, child.coins + amount); 
    if (playClick) playClick();
    await supabase.from('children').update({ coins: newCoins }).eq('id', childId);
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, coins: newCoins } : c));
    
    if (amount > 0) {
      showToast(`Granted ${amount} 🪙`);
    } else {
      showToast(`Deducted ${Math.abs(amount)} 🪙`);
    }
  };

  const loadHistory = async (childId) => {
    setHistoryLoading(true);
    try {
      const [{ data: comps }, { data: reds }] = await Promise.all([
        supabase.from('completions').select('*, missions(name, icon)').eq('child_id', childId).order('submitted_at', { ascending: false }).limit(30),
        supabase.from('redemptions').select('*, rewards(name, icon)').eq('child_id', childId).order('redeemed_at', { ascending: false }).limit(30),
      ]);

      const events = [
        ...(comps || []).map(c => ({
          id: `c-${c.id}`,
          type: 'mission',
          label: c.missions?.name || 'Unknown Mission',
          icon: c.missions?.icon || '🎯',
          status: c.status,
          date: new Date(c.submitted_at || c.created_at),
        })),
        ...(reds || []).map(r => ({
          id: `r-${r.id}`,
          type: 'reward',
          label: r.rewards?.name || 'Unknown Reward',
          icon: r.rewards?.icon || '🎁',
          status: r.status,
          date: new Date(r.redeemed_at || r.created_at),
        })),
      ].sort((a, b) => b.date - a.date);

      setHistoryData(events);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleHistory = (childId) => {
    const willOpen = !historyOpen;
    setHistoryOpen(willOpen);
    if (willOpen && historyData === null) {
      loadHistory(childId);
    }
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
        <button className="cool-home-btn" onClick={() => router.push('/')}>
          🏠 <span>Home</span>
        </button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Activities</h2>
        <button className="cool-home-btn" onClick={() => router.push('/')}>
          🏠 <span>Home</span>
        </button>
      </div>
      
      <div className="segment-control">
        <div className={`segment-control-indicator ${manageTab === 'missions' ? 'pos-0' : 'pos-1'}`} />
        <button className={`segment-control-btn ${manageTab === 'missions' ? 'active' : ''}`} onClick={() => setManageTab('missions')}>🎯 Missions</button>
        <button className={`segment-control-btn ${manageTab === 'rewards' ? 'active' : ''}`} onClick={() => setManageTab('rewards')}>🎁 Rewards</button>
      </div>

      {manageTab === 'missions' ? (
        <div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-2xl)' }} onClick={() => setModal({ type: 'mission', data: null })}>+ Add Mission</button>
          
          {(() => {
            if (missions.length === 0) return <div className="empty-state"><p className="empty-state-text">No missions added yet.</p></div>;
            const activeMissions = missions.filter(m => m.is_active !== false);
            const inactiveMissions = missions.filter(m => m.is_active === false);
            
            // Group active missions by category
            const groupedActive = activeMissions.reduce((acc, m) => {
              const cat = m.category || 'General';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(m);
              return acc;
            }, {});
            const sortedCategories = Object.keys(groupedActive).sort();
            
            const renderMission = (m, isInactive) => (
              <div key={m.id} className="mission-card" style={{ padding: '16px', opacity: isInactive ? 0.6 : 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="mission-icon" style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '2rem' }}>
                  {m.image
                    ? <img src={m.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : m.icon
                  }
                </div>
                <div className="mission-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="mission-name" style={{ fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div className="mission-rewards" style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>⭐ {m.xp_reward}</span>
                    <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>🪙 {m.coin_reward}</span>
                  </div>
                </div>
                <div className="mission-actions" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-icon" title={isInactive ? 'Unarchive' : 'Archive'} onClick={() => handleToggleActiveMission(m)} style={{ background: 'var(--bg-glass)' }}>
                    {isInactive 
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>}
                  </button>
                  <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'mission', data: m })} style={{ background: 'var(--bg-glass)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)', background: 'var(--bg-glass)' }} onClick={() => handleDeleteMission(m.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            );

            return (
              <>
                {sortedCategories.map(cat => {
                  const CATEGORY_ICONS = {
                    'General': '🏷️',
                    'Chores': '🧹',
                    'Morning Routine': '🌅',
                    'Evening Routine': '🌙',
                    'Homework': '📚',
                    'Health & Hygiene': '🦷',
                    'Behavior': '🤝',
                    'Activities': '🎨',
                    'Reading': '📖',
                    'School & Learning': '🎓',
                    'Pets': '🐶',
                    'Exercise': '🏃',
                  };
                  const icon = CATEGORY_ICONS[cat] || '📁';
                  
                  return (
                    <div key={cat} style={{ marginBottom: 24 }}>
                      <div 
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                          cursor: 'pointer', 
                          marginBottom: collapsedCategories[cat] ? 0 : 16,
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '14px 18px',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => toggleCategory(cat)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
                            {cat}
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, background: 'rgba(0, 0, 0, 0.3)', padding: '2px 8px', borderRadius: '12px' }}>
                              {groupedActive[cat].length}
                            </span>
                          </h3>
                        </div>
                        <div style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          width: 32, height: 32, borderRadius: '50%', 
                          background: 'rgba(255, 255, 255, 0.08)',
                          transform: collapsedCategories[cat] ? 'rotate(-90deg)' : 'none', 
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-bright)' }}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Expanded Missions Container */}
                      <div style={{
                        display: 'grid', gridTemplateRows: collapsedCategories[cat] ? '0fr' : '1fr',
                        transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ paddingTop: collapsedCategories[cat] ? 0 : 4 }}>
                            {groupedActive[cat].map(m => renderMission(m, false))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {inactiveMissions.length > 0 && (
                  <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-lg)',
                      background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                    }}>
                      <span style={{ fontSize: '1.4rem' }}>🗄️</span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0 }}>Archived Missions</h3>
                    </div>
                    {inactiveMissions.map(m => renderMission(m, true))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-2xl)' }} onClick={() => setModal({ type: 'reward', data: null })}>+ Add Reward</button>
          
          <div>
            {(() => {
              if (rewards.length === 0) return <div className="empty-state"><p className="empty-state-text">No rewards added yet.</p></div>;
              
              const activeRewards = rewards.filter(r => r.is_active !== false);
              const inactiveRewards = rewards.filter(r => r.is_active === false);
              
              const renderReward = (r, isInactive) => (
                <div key={r.id} className="mission-card" style={{ padding: '16px', opacity: isInactive ? 0.6 : 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="mission-icon" style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '2rem' }}>
                    {r.image
                      ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : r.icon
                    }
                  </div>
                  <div className="mission-info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="mission-name" style={{ fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                    <div className="mission-rewards" style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                      <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>🪙 {r.cost}</span>
                    </div>
                  </div>
                  <div className="mission-actions" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-icon" title={isInactive ? 'Activate' : 'Pause'} onClick={() => handleToggleActiveReward(r)} style={{ background: 'var(--bg-glass)' }}>
                      {isInactive 
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>}
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'reward', data: r })} style={{ background: 'var(--bg-glass)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)', background: 'var(--bg-glass)' }} onClick={() => handleDeleteReward(r.id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              );

              return (
                <>
                  {activeRewards.map(r => renderReward(r, false))}
                  
                  {inactiveRewards.length > 0 && (
                    <div style={{ marginTop: 'var(--space-2xl)' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>Saved for Later</h3>
                      {inactiveRewards.map(r => renderReward(r, true))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );

  // Render Kid Slide-up Drawer
  const renderKidDrawer = () => {
     // Reset history when drawer opens for a new kid
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

                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
                        <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'var(--bg-deep)', border: '1px solid rgba(245, 158, 11, 0.3)' }} onClick={(e) => handleAdjustCoins(child.id, -1, e)}>-1</button>
                        <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'var(--bg-deep)', border: '1px solid rgba(245, 158, 11, 0.3)' }} onClick={(e) => handleAdjustCoins(child.id, 1, e)}>+1</button>
                      </div>
                   </div>
                   <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <span className="stat-icon" style={{ fontSize: '2rem' }}>🔥</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 8 }}>{child.streak} Day Streak</div>
                   </div>
               </div>
               
               <div style={{ marginBottom: 'var(--space-2xl)' }}>
                 <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>🎯 Active Missions</h4>
                 {(() => {
                    const childMissions = missions.filter(m => m.is_active !== false && (!m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(child.id)));
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

               {/* Analytics */}
               <div style={{ marginBottom: 'var(--space-2xl)' }}>
                 <AnalyticsTab children={children} singleChildId={inspectChildId} />
               </div>

               {/* History Accordion */}
               <div style={{ marginBottom: 'var(--space-2xl)' }}>
                 <button
                   onClick={() => handleToggleHistory(child.id)}
                   style={{
                     width: '100%',
                     background: 'var(--bg-surface)',
                     border: '1px solid var(--bg-glass-border)',
                     borderRadius: historyOpen ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
                     padding: '14px 18px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     cursor: 'pointer',
                     color: 'var(--text-bright)',
                     fontWeight: 800,
                     fontSize: '1rem',
                     transition: 'border-radius 0.2s',
                   }}
                 >
                   <span>📜 Activity History</span>
                   <svg
                     width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                     style={{ transform: historyOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
                   >
                     <polyline points="6 9 12 15 18 9" />
                   </svg>
                 </button>

                 <div style={{
                   overflow: 'hidden',
                   maxHeight: historyOpen ? '600px' : '0px',
                   transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                   background: 'var(--bg-surface)',
                   border: historyOpen ? '1px solid var(--bg-glass-border)' : 'none',
                   borderTop: 'none',
                   borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                 }}>
                   <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                     {historyLoading && (
                       <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '0.9rem' }}>Loading history…</div>
                     )}
                     {!historyLoading && historyData && historyData.length === 0 && (
                       <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '0.9rem' }}>No activity yet.</div>
                     )}
                     {!historyLoading && historyData && historyData.map(evt => {
                       const statusColor = {
                         approved: 'var(--green)',
                         pending: 'var(--amber)',
                         rejected: 'var(--red)',
                         fulfilled: 'var(--green)',
                         refunded: 'var(--cyan)',
                       }[evt.status] || 'var(--text-muted)';

                       const statusLabel = {
                         approved: 'Approved',
                         pending: 'Pending',
                         rejected: 'Rejected',
                         fulfilled: 'Delivered',
                         refunded: 'Refunded',
                       }[evt.status] || evt.status;

                       const typePrefix = evt.type === 'mission' ? '✅' : '🛍️';

                       return (
                         <div key={evt.id} style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: 12,
                           padding: '10px 0',
                           borderBottom: '1px solid var(--bg-glass-border)',
                         }}>
                           <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{evt.icon}</div>
                           <div style={{ flex: 1, minWidth: 0 }}>
                             <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                               {typePrefix} {evt.label}
                             </div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                               {evt.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </div>
                           </div>
                           <div style={{ fontSize: '0.75rem', fontWeight: 800, color: statusColor, flexShrink: 0, background: `${statusColor}18`, padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                             {statusLabel}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
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
        {activeTab === 'overview'   && renderOverview()}
        {activeTab === 'manage'     && renderManage()}
        {activeTab === 'settings'   && <SettingsTab initialSettings={settings} />}
      </AppShell>

      {/* Slide-Up Drawer for Kid Inspect Mode */}
      {renderKidDrawer()}

      {/* Global Modals for Editing */}
      {modal && (
        <div className="modal-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
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
