"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { showToast, showFloat } from '../lib/ui';
import { getLevelForXP } from '../lib/levels';
import AppShell from './AppShell';
import SettingsTab from './SettingsTab';
import OverviewTab from './OverviewTab';
import ManageTab from './ManageTab';
import KidDrawer from './KidDrawer';
import MissionModal from './MissionModal';
import RewardModal from './RewardModal';
import ChildModal from './ChildModal';
import ContactForm from './ContactForm';
import { playClick, playPop } from '../lib/sounds';

export default function ParentDashboardClient({ initialChildren, initialMissions, initialRewards, initialPending, initialPendingRedemptions, initialSettings, parentEmail = '' }) {
  const router = useRouter();
  
  // AppShell state
  const [activeTab, setActiveTab] = useState('overview');
  const [isExiting, setIsExiting] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
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
  useEffect(() => { setSettings(initialSettings || { require_approval: true, family_name: 'Our Family' }); }, [initialSettings]);
  
  // Modals
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
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'completions' }, (payload) => {
        setPending(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);


  // ─── ACTION HANDLERS ────────────────────────────────────────────────────────

  const handleApprove = async (comp, e) => {
    e.stopPropagation();
    const mission = missions.find(m => m.id === comp.mission_id);
    const child = children.find(c => c.id === comp.child_id);
    if (!mission || !child) return;

    const currentXp = child.total_xp_earned || child.xp || 0;
    const oldLevelInfo = getLevelForXP(currentXp);

    const newXp = currentXp + mission.xp_reward;
    const newCoins = child.coins + mission.coin_reward;
    const newLevelInfo = getLevelForXP(newXp);

    let newStreak = child.streak || 0;
    const now = new Date();
    const today = now.toDateString();
    const lastCompDate = child.last_completion_date ? new Date(child.last_completion_date) : null;
    
    if (!lastCompDate || lastCompDate.toDateString() !== today) {
       if (lastCompDate && now.getTime() - lastCompDate.getTime() > 86400000 * 2) {
           newStreak = 1;
       } else {
           newStreak += 1;
       }
    }
    
    const { error: compError } = await supabase.from('completions').update({ status: 'approved', reviewed_at: now.toISOString() }).eq('id', comp.id);
    if (compError) {
      showToast('Error approving mission: ' + compError.message, 'error');
      return;
    }
    const { error: childError } = await supabase.from('children').update({ xp: newXp, total_xp_earned: newXp, coins: newCoins, streak: newStreak, last_completion_date: now.toISOString() }).eq('id', child.id);
    if (childError) {
      showToast('Error updating child rewards: ' + childError.message, 'error');
      // Rollback completion status
      await supabase.from('completions').update({ status: 'pending', reviewed_at: null }).eq('id', comp.id);
      return;
    }

    setPending(prev => prev.filter(p => p.id !== comp.id));
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, xp: newXp, total_xp_earned: newXp, coins: newCoins, streak: newStreak, last_completion_date: now.toISOString() } : c));

    setTimeout(async () => {
        const rTop = e.clientY - 20;
        const rLeft = e.clientX + 20;
        showFloat(`+${mission.xp_reward} XP`, 'var(--primary)', rLeft, rTop);
        showFloat(`+${mission.coin_reward} 🪙`, 'var(--amber)', rLeft, rTop + 30);

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
    const { error } = await supabase.from('completions').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', comp.id);
    if (error) {
      showToast('Error rejecting: ' + error.message, 'error');
      return;
    }
    setPending(prev => prev.filter(p => p.id !== comp.id));
  };

  const handleFulfillReward = async (red, e) => {
    e.stopPropagation();
    if (playPop) playPop();
    const { error } = await supabase.from('redemptions').update({ status: 'fulfilled' }).eq('id', red.id);
    if (error) {
      showToast('Error fulfilling: ' + error.message, 'error');
      return;
    }
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
    const { error: redError } = await supabase.from('redemptions').update({ status: 'refunded' }).eq('id', red.id);
    if (redError) {
      showToast('Error refunding: ' + redError.message, 'error');
      return;
    }
    const { error: childError } = await supabase.from('children').update({ coins: newCoins }).eq('id', child.id);
    if (childError) {
      showToast('Error refunding coins: ' + childError.message, 'error');
      // Rollback redemption
      await supabase.from('redemptions').update({ status: 'pending' }).eq('id', red.id);
      return;
    }
    
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, coins: newCoins } : c));
    setPendingRedemptions(prev => prev.filter(r => r.id !== red.id));
    showToast(`Refunded ${reward.cost} coins!`);
  };

  const handleDeleteMission = async (id) => {
    if (!confirm('Delete this mission?')) return;
    const { error } = await supabase.from('missions').delete().eq('id', id);
    if (error) {
      showToast('Error deleting mission: ' + error.message, 'error');
      return;
    }
    setMissions(prev => prev.filter(m => m.id !== id));
    showToast('Mission deleted.');
  };

  const handleToggleActiveMission = async (m) => {
    const newStatus = m.is_active === false ? true : false;
    const { error } = await supabase.from('missions').update({ is_active: newStatus }).eq('id', m.id);
    if (error) {
      showToast('Error toggling mission: ' + error.message, 'error');
      return;
    }
    setMissions(prev => prev.map(mission => mission.id === m.id ? { ...mission, is_active: newStatus } : mission));
    showToast(newStatus ? 'Mission activated!' : 'Mission saved for later.');
  };

  const handleDeleteReward = async (id) => {
    if (!confirm('Delete this reward?')) return;
    const { error } = await supabase.from('rewards').delete().eq('id', id);
    if (error) {
      showToast('Error deleting reward: ' + error.message, 'error');
      return;
    }
    setRewards(prev => prev.filter(r => r.id !== id));
    showToast('Reward deleted.');
  };

  const handleToggleActiveReward = async (r) => {
    const newStatus = r.is_active === false ? true : false;
    const { error } = await supabase.from('rewards').update({ is_active: newStatus }).eq('id', r.id);
    if (error) {
      showToast('Error toggling reward: ' + error.message, 'error');
      return;
    }
    setRewards(prev => prev.map(reward => reward.id === r.id ? { ...reward, is_active: newStatus } : reward));
    showToast(newStatus ? 'Reward activated!' : 'Reward saved for later.');
  };

  const handleDeleteChild = async (id) => {
    if (!confirm('Delete this player and all progress? This cannot be undone.')) return;
    const { error } = await supabase.from('children').delete().eq('id', id);
    if (error) {
      showToast('Error deleting player: ' + error.message, 'error');
      return;
    }
    setChildren(prev => prev.filter(c => c.id !== id));
    if (inspectChildId === id) setInspectChildId(null);
    showToast('Player removed from app.');
  };

  const handleAdjustCoins = async (childId, amount, e) => {
    if (e) e.stopPropagation();
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    const newCoins = Math.max(0, child.coins + amount); 
    if (playClick) playClick();
    const { error } = await supabase.from('children').update({ coins: newCoins }).eq('id', childId);
    if (error) {
      showToast('Error adjusting coins: ' + error.message, 'error');
      return;
    }
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, coins: newCoins } : c));
    
    if (amount > 0) {
      showToast(`Granted ${amount} 🪙`);
    } else {
      showToast(`Deducted ${Math.abs(amount)} 🪙`);
    }
  };

  const closeModal = () => { setModal(null); };


  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <>
      <AppShell role="parent" activeTab={activeTab} onTabChange={setActiveTab} notifications={{ approvals: pending.length }}>
        {activeTab === 'overview' && (
          <OverviewTab
            children={children}
            missions={missions}
            rewards={rewards}
            pending={pending}
            pendingRedemptions={pendingRedemptions}
            settings={settings}
            isExiting={isExiting}
            setIsExiting={setIsExiting}
            router={router}
            setInspectChildId={setInspectChildId}
            setModal={setModal}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleFulfillReward={handleFulfillReward}
            handleRefundReward={handleRefundReward}
            onOpenSupport={() => setShowSupportModal(true)}
          />
        )}
        {activeTab === 'manage' && (
          <ManageTab
            missions={missions}
            rewards={rewards}
            children={children}
            isExiting={isExiting}
            setIsExiting={setIsExiting}
            router={router}
            setModal={setModal}
            handleDeleteMission={handleDeleteMission}
            handleToggleActiveMission={handleToggleActiveMission}
            handleDeleteReward={handleDeleteReward}
            handleToggleActiveReward={handleToggleActiveReward}
            onOpenSupport={() => setShowSupportModal(true)}
          />
        )}
        {activeTab === 'settings' && <SettingsTab initialSettings={settings} onOpenSupport={() => setShowSupportModal(true)} />}
      </AppShell>

      {/* Slide-Up Drawer for Kid Inspect Mode */}
      <KidDrawer
        inspectChildId={inspectChildId}
        setInspectChildId={setInspectChildId}
        children={children}
        missions={missions}
        setModal={setModal}
        handleAdjustCoins={handleAdjustCoins}
        handleDeleteChild={handleDeleteChild}
      />

      {/* Global Modals for Editing */}
      {modal && (
        <div className="modal-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-content">
            <h3 className="modal-title" style={{ textAlign: 'center', fontSize: '1.5rem' }}>
              {modal.type === 'mission' ? (modal.data ? 'Edit Mission' : 'New Mission') :
               modal.type === 'reward' ? (modal.data ? 'Edit Reward' : 'New Reward') :
               (modal.data ? 'Edit Player Profile' : 'Add Player to Family')}
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
                  showToast(isEdit ? 'Player profile updated!' : `Welcome ${data.name}! 🎉`);
                }}
              />
            }
          </div>
        </div>
      )}

      {/* Support Modal Overlay */}
      {showSupportModal && (
        <div 
          className="modal-overlay" 
          onPointerDown={(e) => { if (e.target === e.currentTarget) setShowSupportModal(false); }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 13, 22, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: 500, 
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              position: 'relative',
              animation: 'scaleIn 0.3s var(--ease-bounce)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowSupportModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'color 0.2s',
                zIndex: 10
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-bright)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ✕
            </button>

            <ContactForm 
              isModal={true} 
              initialEmail={parentEmail}
              onSuccess={() => setTimeout(() => setShowSupportModal(false), 2000)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
