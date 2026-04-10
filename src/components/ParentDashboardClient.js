"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { showToast, showFloat } from '../lib/ui';
import { AVATAR_EMOJIS, MISSION_EMOJIS, REWARD_EMOJIS } from '../lib/ui';
import { getLevelForXP, getXPProgress, getXPDisplay } from '../lib/levels';
import AppShell from './AppShell';

export default function ParentDashboardClient({ initialChildren, initialMissions, initialRewards, initialPending }) {
  const router = useRouter();
  
  // AppShell state
  const [activeTab, setActiveTab] = useState('family');
  
  // Data State
  const [children, setChildren] = useState(initialChildren || []);
  const [missions, setMissions] = useState(initialMissions || []);
  const [rewards, setRewards] = useState(initialRewards || []);
  const [pending, setPending] = useState(initialPending || []);
  
  // Modals specific
  const [modal, setModal] = useState(null); // { type: 'mission'|'reward'|'child', data: null }
  const [inspectChildId, setInspectChildId] = useState(null); // the id of the child currently viewed in the drawer

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

  const closeModal = () => setModal(null);

  // M I S S I O N   M O D A L
  const renderMissionModal = () => {
    const isEdit = !!modal.data;
    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newObj = {
          name: fd.get('name'),
          xp_reward: parseInt(fd.get('xp_reward')) || 10,
          coin_reward: parseInt(fd.get('coin_reward')) || 5,
          icon: fd.get('icon'),
          max_completions: parseInt(fd.get('max_completions')) || 1
        };
        if (isEdit) {
          await supabase.from('missions').update(newObj).eq('id', modal.data.id);
          setMissions(prev => prev.map(m => m.id === modal.data.id ? { ...m, ...newObj } : m));
          showToast('Mission updated!');
        } else {
          const { data } = await supabase.from('missions').insert([newObj]).select().single();
          setMissions(prev => [...prev, data]);
          showToast('Mission created! 🎯');
        }
        closeModal();
      }}>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Mission Name</label>
          <input name="name" className="input" defaultValue={modal.data?.name || ''} required placeholder="e.g. Make your bed" />
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>XP</label>
            <input type="number" name="xp_reward" className="input" defaultValue={modal.data?.xp_reward || 10} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Coins</label>
            <input type="number" name="coin_reward" className="input" defaultValue={modal.data?.coin_reward || 5} />
          </div>
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Icon</label>
          <div className="emoji-picker" style={{ gap: 8, marginTop: 8 }}>
            {MISSION_EMOJIS.map(e => (
              <label key={e} style={{ cursor: 'pointer' }}>
                <input type="radio" name="icon" value={e} defaultChecked={(modal.data?.icon || MISSION_EMOJIS[0]) === e} style={{ display: 'none' }} />
                <div style={{ padding: 12, border: '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }} className="emoji-picker-item">
                  {e}
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Mission'}</button>
        </div>
      </form>
    );
  };

  // R E W A R D   M O D A L
  const renderRewardModal = () => {
    const isEdit = !!modal.data;
    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newObj = {
          name: fd.get('name'),
          cost: parseInt(fd.get('cost')) || 10,
          icon: fd.get('icon'),
        };
        if (isEdit) {
          await supabase.from('rewards').update(newObj).eq('id', modal.data.id);
          setRewards(prev => prev.map(r => r.id === modal.data.id ? { ...r, ...newObj } : r));
          showToast('Reward updated!');
        } else {
          const { data } = await supabase.from('rewards').insert([newObj]).select().single();
          setRewards(prev => [...prev, data]);
          showToast('Reward created! 🎁');
        }
        closeModal();
      }}>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Reward Name</label>
          <input name="name" className="input" defaultValue={modal.data?.name || ''} required placeholder="Extra Screen Time" />
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Coin Cost</label>
          <input type="number" name="cost" className="input" defaultValue={modal.data?.cost || 10} />
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Icon</label>
          <div className="emoji-picker" style={{ gap: 8, marginTop: 8 }}>
            {REWARD_EMOJIS.map(e => (
              <label key={e} style={{ cursor: 'pointer' }}>
                <input type="radio" name="icon" value={e} defaultChecked={(modal.data?.icon || REWARD_EMOJIS[0]) === e} style={{ display: 'none' }} />
                <div style={{ padding: 12, border: '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }} className="emoji-picker-item">
                  {e}
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Reward'}</button>
        </div>
      </form>
    );
  };

  // C H I L D   M O D A L
  const renderChildModal = () => {
    const isEdit = !!modal.data;
    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newObj = {
          name: fd.get('name'),
          avatar: fd.get('avatar'),
        };
        if (isEdit) {
          await supabase.from('children').update(newObj).eq('id', modal.data.id);
          setChildren(prev => prev.map(c => c.id === modal.data.id ? { ...c, ...newObj } : c));
          showToast('Kid profile updated!');
        } else {
          const { data } = await supabase.from('children').insert([{ ...newObj, total_xp_earned: 0, coins: 0, theme: 'seedling' }]).select().single();
          setChildren(prev => [...prev, data]);
          showToast(`Welcome ${newObj.name}! 🎉`);
        }
        closeModal();
      }}>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Name</label>
          <input name="name" className="input" defaultValue={modal.data?.name || ''} required placeholder="Kid's First Name" />
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Avatar</label>
          <div className="avatar-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginTop: 8 }}>
            {AVATAR_EMOJIS.map(e => (
              <label key={e} style={{ cursor: 'pointer' }}>
                <input type="radio" name="avatar" value={e} defaultChecked={(modal.data?.avatar || AVATAR_EMOJIS[0]) === e} style={{ display: 'none' }} />
                <div style={{ display: 'flex', aspectRatio: '1', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                  {e}
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Add Kid'}</button>
        </div>
      </form>
    );
  };

  const renderFamily = () => (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <button className="back-btn" onClick={() => router.push('/')} style={{ position: 'absolute', top: 'var(--space-lg)', right: 'var(--space-lg)' }}>Exit</button>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-xl)' }}>Your Family</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
        {children.map(child => {
          const { level, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
          const progressFraction = getXPProgress(child.total_xp_earned || child.xp || 0);
          const activeTheme = child.theme ? child.theme : tierColor;

          return (
            <div 
              key={child.id} 
              className={`theme-${activeTheme}`}
              style={{ padding: 'var(--space-lg)', background: 'var(--bg-surface)', border: '1px solid var(--primary-dim)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--glow-primary)', cursor: 'pointer' }}
              onClick={() => setInspectChildId(child.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '2.5rem' }}>{child.avatar}</span>
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
            </div>
          );
        })}
        
        {/* ADD KID BUTTON */}
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

  const renderApprovals = () => (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-xl)' }}>Approvals Waiting</h2>
      
      {pending.length === 0 ? (
        <div className="empty-state">
           <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
           <h3 style={{ fontSize: '1.2rem' }}>All caught up!</h3>
           <p className="empty-state-text">No pending approvals right now.</p>
        </div>
      ) : pending.map(comp => {
         const child = children.find(c => c.id === comp.child_id) || {};
         const mission = missions.find(m => m.id === comp.mission_id) || {};
         return (
          <div key={comp.id} style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-lg)', background: 'var(--bg-surface)', border: '1px solid var(--text-dim)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
               <div style={{ fontSize: '3rem' }}>{child.avatar}</div>
               <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{child.name} submitted:</div>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{mission.icon} {mission.name}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <span className="badge badge-gold" style={{ fontSize: '1rem', padding: '6px 12px' }}>⭐ {mission.xp_reward} XP</span>
                    <span className="badge badge-amber" style={{ fontSize: '1rem', padding: '6px 12px' }}>🪙 {mission.coin_reward}</span>
                  </div>
               </div>
            </div>
            {/* The One-Tap Power Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
               <button className="btn btn-ghost" style={{ flex: 1, padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: 'none' }} onClick={(e) => handleReject(comp, e)}>✗ Reject</button>
               <button className="btn btn-success" style={{ flex: 2, padding: '16px', fontSize: '1.2rem' }} onClick={(e) => handleApprove(comp, e)}>✓ Approve!</button>
            </div>
          </div>
         );
      })}
    </div>
  );

  const renderMissions = () => (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-xl)' }}>Manage Missions</h2>
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
  );

  const renderRewards = () => (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-xl)' }}>Manage Rewards</h2>
      <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-2xl)' }} onClick={() => setModal({ type: 'reward', data: null })}>+ Add Reward</button>
      
      <div className="reward-grid">
        {rewards.map(r => (
          <div key={r.id} className="reward-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="reward-icon" style={{ fontSize: '3rem' }}>{r.icon}</div>
            <div className="reward-name" style={{ fontSize: '1.1rem', marginTop: 12 }}>{r.name}</div>
            <div className="reward-cost" style={{ fontSize: '1rem', marginTop: 8, marginBottom: 16 }}>🪙 {r.cost}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal({ type: 'reward', data: r })}>Edit</button>
              <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={() => handleDeleteReward(r.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
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
                     <div style={{ background: 'var(--primary-dim)', borderRadius: '50%', padding: '16px', border: '2px solid var(--primary)' }}>
                        {child.avatar}
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
        {activeTab === 'family' && renderFamily()}
        {activeTab === 'approvals' && renderApprovals()}
        {activeTab === 'missions' && renderMissions()}
        {activeTab === 'rewards' && renderRewards()}
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
            {/* Some CSS tweaks to old modal form inputs to fit new theme are already applied in components.css */}
            {modal.type === 'mission' && renderMissionModal()}
            {modal.type === 'reward' && renderRewardModal()}
            {modal.type === 'child' && renderChildModal()}
          </div>
        </div>
      )}
      
      <style jsx global>{`
         /* Force hide standard generic radio dots within the emoji picker components */
         .emoji-picker label input[type="radio"]:checked + .emoji-picker-item {
             border-color: var(--primary);
             background: var(--primary-dim);
             box-shadow: var(--glow-primary);
         }
      `}</style>
    </>
  );
}
