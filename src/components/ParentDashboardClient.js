"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { showToast, showFloat } from '../lib/ui';
import { AVATAR_EMOJIS, MISSION_EMOJIS, REWARD_EMOJIS } from '../lib/ui';

function getLevelForXP(xp) {
  const level = Math.floor(xp / 100) + 1;
  const levelEmoji = ['🐣', '🐥', '🐛', '🦋', '🐢', '🦊', '🐯', '🦁', '🐉', '👑'][Math.min(level - 1, 9)];
  return { level, emoji: levelEmoji };
}

export default function ParentDashboardClient({ initialChildren, initialMissions, initialRewards, initialPending }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('approvals');
  
  const [children, setChildren] = useState(initialChildren || []);
  const [missions, setMissions] = useState(initialMissions || []);
  const [rewards, setRewards] = useState(initialRewards || []);
  const [pending, setPending] = useState(initialPending || []);

  const [modal, setModal] = useState(null); // { type: 'mission'|'reward'|'child', data: null }

  const handleApprove = async (comp, e) => {
    e.stopPropagation();
    const mission = missions.find(m => m.id === comp.mission_id);
    const child = children.find(c => c.id === comp.child_id);
    if (!mission || !child) return;

    // Award XP
    const newXp = child.xp + mission.xp_reward;
    const newCoins = child.coins + mission.coin_reward;
    
    // Update DB
    await supabase.from('completions').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', comp.id);
    await supabase.from('children').update({ xp: newXp, coins: newCoins }).eq('id', child.id);

    // Update local state
    setPending(prev => prev.filter(p => p.id !== comp.id));
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, xp: newXp, coins: newCoins } : c));

    showFloat(`+${mission.xp_reward} ⭐`, '#facc15', e.clientX, e.clientY);
    showToast(`✅ Approved! ${child.name} earned ${mission.xp_reward} XP`);
  };

  const handleReject = async (comp, e) => {
    e.stopPropagation();
    await supabase.from('completions').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', comp.id);
    setPending(prev => prev.filter(p => p.id !== comp.id));
    showToast('❌ Mission rejected', 'error');
  };

  const handleDeleteMission = async (id) => {
    if (!confirm('Delete this mission?')) return;
    await supabase.from('missions').delete().eq('id', id);
    setMissions(prev => prev.filter(m => m.id !== id));
    showToast('Mission deleted');
  };

  const handleDeleteReward = async (id) => {
    if (!confirm('Delete this reward?')) return;
    await supabase.from('rewards').delete().eq('id', id);
    setRewards(prev => prev.filter(r => r.id !== id));
    showToast('Reward deleted');
  };

  const handleDeleteChild = async (id) => {
    if (!confirm('Delete this kid and all progress?')) return;
    await supabase.from('children').delete().eq('id', id);
    setChildren(prev => prev.filter(c => c.id !== id));
    showToast('Kid removed');
  };

  // Generic modal close
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
          <input name="name" className="input" defaultValue={modal.data?.name || ''} required />
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
          <select name="icon" className="input" defaultValue={modal.data?.icon || MISSION_EMOJIS[0]}>
            {MISSION_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Save' : 'Create'}</button>
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
          <input name="name" className="input" defaultValue={modal.data?.name || ''} required />
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Cost</label>
          <input type="number" name="cost" className="input" defaultValue={modal.data?.cost || 10} />
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Icon</label>
          <select name="icon" className="input" defaultValue={modal.data?.icon || REWARD_EMOJIS[0]}>
            {REWARD_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Save' : 'Create'}</button>
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
          showToast('Kid updated!');
        } else {
          const { data } = await supabase.from('children').insert([newObj]).select().single();
          setChildren(prev => [...prev, data]);
          showToast('Kid added! 🎉');
        }
        closeModal();
      }}>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Name</label>
          <input name="name" className="input" defaultValue={modal.data?.name || ''} required />
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Avatar</label>
          <select name="avatar" className="input" defaultValue={modal.data?.avatar || AVATAR_EMOJIS[0]}>
            {AVATAR_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Save' : 'Add'}</button>
        </div>
      </form>
    );
  };

  return (
    <div className="page page-enter">
      <div className="page-header">
        <button className="back-btn" onClick={() => router.push('/')}>←</button>
        <h1 className="page-title">Parent Dashboard</h1>
      </div>

      <div className="parent-tabs">
        <button className={`parent-tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
          Approvals {pending.length > 0 && <span className="notification-dot"></span>}
        </button>
        <button className={`parent-tab ${activeTab === 'missions' ? 'active' : ''}`} onClick={() => setActiveTab('missions')}>Missions</button>
        <button className={`parent-tab ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>Rewards</button>
        <button className={`parent-tab ${activeTab === 'kids' ? 'active' : ''}`} onClick={() => setActiveTab('kids')}>Kids</button>
      </div>

      <div id="tab-content" style={{ paddingBottom: 40 }}>
        {activeTab === 'approvals' && (
          pending.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-emoji">✅</div>
              <p className="empty-state-text">All caught up!<br/>No pending approvals.</p>
            </div>
          ) : pending.map(comp => {
            const child = children.find(c => c.id === comp.child_id) || {};
            const mission = missions.find(m => m.id === comp.mission_id) || {};
            return (
              <div key={comp.id} className="approval-card">
                <span className="mission-icon">{mission.icon}</span>
                <div className="approval-info">
                  <div className="approval-child">{child.avatar} {child.name}</div>
                  <div className="approval-mission">{mission.name}</div>
                  <div className="mission-rewards" style={{ marginTop: 4 }}>
                    <span className="badge badge-gold">⭐ {mission.xp_reward} XP</span>
                    <span className="badge badge-amber">🪙 {mission.coin_reward}</span>
                  </div>
                </div>
                <div className="approval-actions">
                  <button className="btn btn-success btn-icon approve-btn" onClick={(e) => handleApprove(comp, e)}>✓</button>
                  <button className="btn btn-danger btn-icon reject-btn" onClick={(e) => handleReject(comp, e)}>✗</button>
                </div>
              </div>
            );
          })
        )}

        {activeTab === 'missions' && (
          <>
            <button className="btn btn-primary btn-block" style={{ marginBottom: 'var(--space-lg)' }} onClick={() => setModal({ type: 'mission', data: null })}>+ Add Mission</button>
            {missions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-emoji">🎯</div>
                <p className="empty-state-text">No missions yet.</p>
              </div>
            ) : missions.map(m => (
              <div key={m.id} className="mission-card">
                <span className="mission-icon">{m.icon}</span>
                <div className="mission-info">
                  <div className="mission-name">{m.name}</div>
                  <div className="mission-rewards">
                    <span className="badge badge-gold">⭐ {m.xp_reward}</span>
                    <span className="badge badge-amber">🪙 {m.coin_reward}</span>
                  </div>
                </div>
                <div className="mission-actions">
                  <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'mission', data: m })}>✎</button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteMission(m.id)}>🗑</button>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'rewards' && (
          <>
            <button className="btn btn-primary btn-block" style={{ marginBottom: 'var(--space-lg)' }} onClick={() => setModal({ type: 'reward', data: null })}>+ Add Reward</button>
            <div className="reward-grid">
              {rewards.map(r => (
                <div key={r.id} className="reward-card">
                  <div className="reward-icon">{r.icon}</div>
                  <div className="reward-name">{r.name}</div>
                  <div className="reward-cost">🪙 {r.cost}</div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'reward', data: r })}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteReward(r.id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'kids' && (
          <>
            <button className="btn btn-primary btn-block" style={{ marginBottom: 'var(--space-lg)' }} onClick={() => setModal({ type: 'child', data: null })}>+ Add Kid</button>
            {children.map(c => {
              const lvl = getLevelForXP(c.xp);
              return (
                <div key={c.id} className="child-card">
                  <span className="child-card-avatar">{c.avatar}</span>
                  <div className="child-card-info">
                    <div className="child-card-name">{c.name}</div>
                    <div className="child-card-stats">
                      <span>Lv {lvl.level} {lvl.emoji}</span>
                      <span>⭐ {c.xp} XP</span>
                      <span>🪙 {c.coins}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'child', data: c })}>✎</button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteChild(c.id)}>🗑</button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeModal(); }}>
          <div className="modal-content">
            <h3 className="modal-title">
              {modal.type === 'mission' ? (modal.data ? 'Edit Mission' : 'New Mission') :
               modal.type === 'reward' ? (modal.data ? 'Edit Reward' : 'New Reward') :
               (modal.data ? 'Edit Kid' : 'Add Kid')}
            </h3>
            <div id="modal-body">
              {modal.type === 'mission' && renderMissionModal()}
              {modal.type === 'reward' && renderRewardModal()}
              {modal.type === 'child' && renderChildModal()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
