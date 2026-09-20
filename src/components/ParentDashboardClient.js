"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { showToast, showFloat, showLevelUp, showTierUp } from '../lib/ui';
import { getLevelForXP, checkColorUnlocks } from '../lib/levels';
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
import { adjustChildCoins, deleteParentResource, reviewCompletion, reviewRedemption, setParentResourceActive } from '../app/actions/parent';
import { readQuestsLocal, saveQuestsLocal } from '../lib/questsLocal';

export default function ParentDashboardClient({ initialChildren, initialMissions, initialRewards, initialPending, initialPendingRedemptions, initialSettings, parentEmail = '' }) {
  const boot = readQuestsLocal('parent');
  
  // AppShell state
  const [activeTab, setActiveTab] = useState('overview');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const inFlight = useRef(new Set());
  
  // Data State
  const [children, setChildren] = useState(boot?.children ?? initialChildren ?? []);
  const [missions, setMissions] = useState(initialMissions || []);
  const [rewards, setRewards] = useState(initialRewards || []);
  const [pending, setPending] = useState(boot?.pending ?? initialPending ?? []);
  const [pendingRedemptions, setPendingRedemptions] = useState(boot?.pendingRedemptions ?? initialPendingRedemptions ?? []);
  const [settings, setSettings] = useState(initialSettings || { require_approval: true, family_name: 'Our Family' });

  const lastMutatedAt = useRef(boot?.at || 0);
  const skipStaleRefresh = () => Date.now() - lastMutatedAt.current < 2500;
  const persistParent = (nextChildren, nextPending, nextReds) => {
    lastMutatedAt.current = Date.now();
    saveQuestsLocal('parent', {
      children: nextChildren,
      pending: nextPending,
      pendingRedemptions: nextReds,
    });
  };

  // Sync from the server, but don't clobber a tap that just landed.
  useEffect(() => { if (!skipStaleRefresh()) setChildren(initialChildren || []); }, [initialChildren]);
  useEffect(() => { setMissions(initialMissions || []); }, [initialMissions]);
  useEffect(() => { setRewards(initialRewards || []); }, [initialRewards]);
  useEffect(() => { if (!skipStaleRefresh()) setPending(initialPending || []); }, [initialPending]);
  useEffect(() => { if (!skipStaleRefresh()) setPendingRedemptions(initialPendingRedemptions || []); }, [initialPendingRedemptions]);
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
          setPending(prev => prev.some(p => p.id === payload.new.id) ? prev : [payload.new, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemptions' }, (payload) => {
        if (payload.new.status === 'pending') {
          setPendingRedemptions(prev => prev.some(p => p.id === payload.new.id) ? prev : [payload.new, ...prev]);
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
    if (inFlight.current.has(comp.id)) return;
    const mission = missions.find(m => m.id === comp.mission_id);
    const child = children.find(c => c.id === comp.child_id);
    if (!mission || !child) return;
    inFlight.current.add(comp.id);

    const currentXp = child.total_xp_earned || child.xp || 0;
    const oldLevelInfo = getLevelForXP(currentXp);
    const nextPending = pending.filter(p => p.id !== comp.id);
    const nextChildren = children.map(c => c.id === child.id ? {
      ...c,
      coins: (c.coins || 0) + (mission.coin_reward || 0),
      xp: (c.xp || 0) + (mission.xp_reward || 0),
      total_xp_earned: currentXp + (mission.xp_reward || 0),
    } : c);
    persistParent(nextChildren, nextPending, pendingRedemptions);
    setPending(nextPending);
    setChildren(nextChildren);

    if (playPop) playPop();
    showFloat(`+${mission.xp_reward} XP`, 'var(--primary)', e.clientX + 12, e.clientY - 16);
    showFloat(`+${mission.coin_reward} 🪙`, 'var(--amber)', e.clientX + 12, e.clientY + 14);

    const result = await reviewCompletion(comp.id, true);
    if (!result.success) {
      persistParent(children, pending, pendingRedemptions);
      setPending(pending);
      setChildren(children);
      showToast('Error approving mission: ' + result.error, 'error');
      inFlight.current.delete(comp.id);
      return;
    }

    const updatedChild = result.data?.child;
    if (updatedChild) {
      const synced = nextChildren.map(c => c.id === child.id ? updatedChild : c);
      persistParent(synced, nextPending, pendingRedemptions);
      setChildren(synced);
    }

    const newXp = updatedChild?.total_xp_earned || updatedChild?.xp || currentXp + (mission.xp_reward || 0);
    const newLevelInfo = getLevelForXP(newXp);
    if (newLevelInfo.level > oldLevelInfo.level) {
      if (newLevelInfo.tierName !== oldLevelInfo.tierName) showTierUp(newLevelInfo.level, newLevelInfo.tierName);
      else showLevelUp(newLevelInfo.level, newLevelInfo.tierName, checkColorUnlocks(oldLevelInfo.level, newLevelInfo.level)[0] || null);
    }
    inFlight.current.delete(comp.id);
  };

  const handleReject = async (comp, e) => {
    e.stopPropagation();
    if (inFlight.current.has(comp.id)) return;
    inFlight.current.add(comp.id);
    const nextPending = pending.filter(p => p.id !== comp.id);
    persistParent(children, nextPending, pendingRedemptions);
    setPending(nextPending);
    const result = await reviewCompletion(comp.id, false);
    if (!result.success) {
      persistParent(children, pending, pendingRedemptions);
      setPending(pending);
      showToast('Error rejecting: ' + result.error, 'error');
    }
    inFlight.current.delete(comp.id);
  };

  const handleFulfillReward = async (red, e) => {
    e.stopPropagation();
    if (inFlight.current.has(red.id)) return;
    inFlight.current.add(red.id);
    if (playPop) playPop();
    const nextReds = pendingRedemptions.filter(r => r.id !== red.id);
    persistParent(children, pending, nextReds);
    setPendingRedemptions(nextReds);
    const result = await reviewRedemption(red.id, true);
    if (!result.success) {
      persistParent(children, pending, pendingRedemptions);
      setPendingRedemptions(pendingRedemptions);
      showToast('Error fulfilling: ' + result.error, 'error');
      inFlight.current.delete(red.id);
      return;
    }
    showToast('Reward marked as given!');
    inFlight.current.delete(red.id);
  };

  const handleRefundReward = async (red, e) => {
    e.stopPropagation();
    const reward = rewards.find(r => r.id === red.reward_id);
    const child = children.find(c => c.id === red.child_id);
    if (!reward || !child) return;
    if (inFlight.current.has(red.id)) return;
    inFlight.current.add(red.id);

    if (playClick) playClick();
    const nextReds = pendingRedemptions.filter(r => r.id !== red.id);
    const nextChildren = children.map(c => c.id === child.id ? { ...c, coins: (c.coins || 0) + (reward.cost || 0) } : c);
    persistParent(nextChildren, pending, nextReds);
    setPendingRedemptions(nextReds);
    setChildren(nextChildren);

    const result = await reviewRedemption(red.id, false);
    if (!result.success) {
      persistParent(children, pending, pendingRedemptions);
      setPendingRedemptions(pendingRedemptions);
      setChildren(children);
      showToast('Error refunding: ' + result.error, 'error');
      inFlight.current.delete(red.id);
      return;
    }

    const synced = nextChildren.map(c => c.id === child.id ? (result.data?.child || c) : c);
    persistParent(synced, pending, nextReds);
    setChildren(synced);
    showToast(`Refunded ${reward.cost} coins!`);
    inFlight.current.delete(red.id);
  };

  const handleDeleteMission = async (id) => {
    if (!confirm('Delete this mission?')) return;
    const result = await deleteParentResource('missions', id);
    if (!result.success) {
      showToast('Error deleting mission: ' + result.error, 'error');
      return;
    }
    setMissions(prev => prev.filter(m => m.id !== id));
    showToast('Mission deleted.');
  };

  const handleToggleActiveMission = async (m) => {
    const newStatus = m.is_active === false ? true : false;
    const result = await setParentResourceActive('missions', m.id, newStatus);
    if (!result.success) {
      showToast('Error toggling mission: ' + result.error, 'error');
      return;
    }
    setMissions(prev => prev.map(mission => mission.id === m.id ? { ...mission, is_active: newStatus } : mission));
    showToast(newStatus ? 'Mission activated!' : 'Mission saved for later.');
  };

  const handleDeleteReward = async (id) => {
    if (!confirm('Delete this reward?')) return;
    const result = await deleteParentResource('rewards', id);
    if (!result.success) {
      showToast('Error deleting reward: ' + result.error, 'error');
      return;
    }
    setRewards(prev => prev.filter(r => r.id !== id));
    showToast('Reward deleted.');
  };

  const handleToggleActiveReward = async (r) => {
    const newStatus = r.is_active === false ? true : false;
    const result = await setParentResourceActive('rewards', r.id, newStatus);
    if (!result.success) {
      showToast('Error toggling reward: ' + result.error, 'error');
      return;
    }
    setRewards(prev => prev.map(reward => reward.id === r.id ? { ...reward, is_active: newStatus } : reward));
    showToast(newStatus ? 'Reward activated!' : 'Reward saved for later.');
  };

  const handleDeleteChild = async (id) => {
    if (!confirm('Delete this player and all progress? This cannot be undone.')) return;
    const result = await deleteParentResource('children', id);
    if (!result.success) {
      showToast('Error deleting player: ' + result.error, 'error');
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
    
    if (playClick) playClick();
    const result = await adjustChildCoins(childId, amount);
    if (!result.success) {
      showToast('Error adjusting coins: ' + result.error, 'error');
      return;
    }
    setChildren(prev => prev.map(c => c.id === childId ? (result.data || c) : c));
    
    if (amount > 0) {
      showToast(`Granted ${amount} 🪙`);
    } else {
      showToast(`Deducted ${Math.abs(amount)} 🪙`);
    }
  };

  const closeModal = () => { setModal(null); };


  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="quests-app">
      <AppShell role="parent" activeTab={activeTab} onTabChange={setActiveTab} notifications={{ approvals: pending.length + pendingRedemptions.length }} onSupport={() => setShowSupportModal(true)}>
        {activeTab === 'overview' && (
          <OverviewTab
            children={children}
            missions={missions}
            rewards={rewards}
            pending={pending}
            pendingRedemptions={pendingRedemptions}
            settings={settings}
            setInspectChildId={setInspectChildId}
            setModal={setModal}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleFulfillReward={handleFulfillReward}
            handleRefundReward={handleRefundReward}
          />
        )}
        {activeTab === 'manage' && (
          <ManageTab
            missions={missions}
            rewards={rewards}
            children={children}
            setModal={setModal}
            handleDeleteMission={handleDeleteMission}
            handleToggleActiveMission={handleToggleActiveMission}
            handleDeleteReward={handleDeleteReward}
            handleToggleActiveReward={handleToggleActiveReward}
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
        >
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: 500, 
              width: '100%',
              position: 'relative',
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
    </div>
  );
}
