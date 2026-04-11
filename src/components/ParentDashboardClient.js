"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { showToast, showFloat } from '../lib/ui';
import { AVATAR_EMOJI_GROUPS, MISSION_EMOJI_GROUPS, REWARD_EMOJI_GROUPS, AVATAR_EMOJIS, MISSION_EMOJIS, REWARD_EMOJIS } from '../lib/ui';
import { getLevelForXP, getXPProgress, getXPDisplay } from '../lib/levels';
import AppShell from './AppShell';
import AvatarDisplay from './AvatarDisplay';
import InlineCrop from './CropOverlay';
import GroupedEmojiPicker from './GroupedEmojiPicker';
import SettingsTab from './SettingsTab';

export default function ParentDashboardClient({ initialChildren, initialMissions, initialRewards, initialPending, initialSettings }) {
  const router = useRouter();
  
  // AppShell state
  const [activeTab, setActiveTab] = useState('family');
  
  // Data State
  const [children, setChildren] = useState(initialChildren || []);
  const [missions, setMissions] = useState(initialMissions || []);
  const [rewards, setRewards] = useState(initialRewards || []);
  const [pending, setPending] = useState(initialPending || []);
  const [settings, setSettings] = useState(initialSettings || { require_approval: true, family_name: 'Our Family' });
  
  // Modals specific
  const [modal, setModal] = useState(null);
  const [inspectChildId, setInspectChildId] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [pendingBase64, setPendingBase64] = useState(null);
  const [missionFrequency, setMissionFrequency] = useState(null);
  const [missionCropSrc, setMissionCropSrc] = useState(null);
  const [pendingMissionImage, setPendingMissionImage] = useState(null);

  // Real-time subscription for new pending completions
  useEffect(() => {
    const channel = supabase
      .channel('completions-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'completions' }, (payload) => {
        if (payload.new.status === 'pending') {
          setPending(prev => [payload.new, ...prev]);
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

  const closeModal = () => { setModal(null); setPendingBase64(null); setPendingMissionImage(null); setMissionCropSrc(null); setMissionFrequency(null); };

  // M I S S I O N   M O D A L
  const renderMissionModal = () => {
    const isEdit = !!modal.data;
    const defaultFrequency = modal.data?.frequency || 'daily';
    const freq = missionFrequency === null ? defaultFrequency : missionFrequency;

    // If we're in crop mode for mission image, show crop UI
    if (missionCropSrc) {
      return (
        <div>
          <p style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Crop the mission photo</p>
          <InlineCrop
            imageSrc={missionCropSrc}
            onConfirm={(dataUrl) => { setPendingMissionImage(dataUrl); setMissionCropSrc(null); }}
            onCancel={() => setMissionCropSrc(null)}
          />
        </div>
      );
    }

    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newObj = {
          name: fd.get('name'),
          xp_reward: parseInt(fd.get('xp_reward')) || 10,
          coin_reward: parseInt(fd.get('coin_reward')) || 5,
          icon: fd.get('icon') || '⭐',
          image: pendingMissionImage || (isEdit ? modal.data?.image || null : null),
          max_completions: parseInt(fd.get('max_completions')) || 1,
          max_completions_per_period: parseInt(fd.get('max_completions_per_period')) || 1,
          frequency: freq,
          start_date: freq === 'date_range' ? fd.get('start_date') || null : null,
          end_date: freq === 'date_range' ? fd.get('end_date') || null : null,
        };
        if (isEdit) {
          await supabase.from('missions').update(newObj).eq('id', modal.data.id);
          setMissions(prev => prev.map(m => m.id === modal.data.id ? { ...m, ...newObj } : m));
          showToast('Mission updated!');
        } else {
          const { data } = await supabase.from('missions').insert([newObj]).select().single();
          if (data) setMissions(prev => [...prev, data]);
          showToast('Mission created! 🎯');
        }
        setMissionFrequency(null);
        setPendingMissionImage(null);
        closeModal();
      }}>
        <div className="input-group" style={{ marginBottom: 14 }}>
          <label>Mission Name</label>
          <input name="name" className="input" defaultValue={modal.data?.name || ''} required placeholder="e.g. Make your bed" />
        </div>

        {/* XP + Coins */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>XP <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(1–500)</span></label>
            <input type="number" name="xp_reward" className="input" min={1} max={500} defaultValue={Math.min(modal.data?.xp_reward || 10, 500)} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Coins</label>
            <input type="number" name="coin_reward" className="input" min={0} max={200} defaultValue={modal.data?.coin_reward || 5} />
          </div>
        </div>

        {/* FREQUENCY */}
        <div className="input-group" style={{ marginBottom: 14 }}>
          <label>Repeats</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {[['daily', '📅 Daily'], ['weekly', '📆 Weekly'], ['monthly', '🗓️ Monthly'], ['date_range', '📌 Date Range']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setMissionFrequency(val)}
                style={{
                  padding: '7px 13px', borderRadius: 'var(--radius-full)',
                  border: `2px solid ${freq === val ? 'var(--primary)' : 'var(--bg-glass-border)'}`,
                  background: freq === val ? 'var(--primary-dim)' : 'var(--bg-glass)',
                  color: freq === val ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* PER-PERIOD COMPLETION COUNT */}
        <div className="input-group" style={{ marginBottom: 14 }}>
          <label>Times per {freq === 'weekly' ? 'week' : freq === 'monthly' ? 'month' : freq === 'date_range' ? 'day' : 'day'}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>(e.g. brush teeth = 2)</span>
          </label>
          <input
            type="number" name="max_completions_per_period" className="input"
            min={1} max={20}
            defaultValue={modal.data?.max_completions_per_period || 1}
            style={{ maxWidth: 100 }}
          />
        </div>

        {/* DATE RANGE — compact for iPad */}
        {freq === 'date_range' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <div className="input-group">
              <label>Start</label>
              <input type="date" name="start_date" className="input input-sm" defaultValue={modal.data?.start_date || ''} required />
            </div>
            <div className="input-group">
              <label>End</label>
              <input type="date" name="end_date" className="input input-sm" defaultValue={modal.data?.end_date || ''} required />
            </div>
          </div>
        )}

        {/* MISSION PHOTO */}
        <div className="input-group" style={{ marginBottom: 14 }}>
          <label>Mission Photo <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(optional — helps kids who can't read)</span></label>
          <label style={{ cursor: 'pointer', display: 'block', marginBottom: 8 }}>
            <input
              type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setMissionCropSrc(ev.target.result);
                reader.readAsDataURL(file);
              }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 14px', borderRadius: 'var(--radius-md)',
              border: pendingMissionImage || modal.data?.image ? '2px solid var(--primary)' : '2px dashed var(--bg-glass-border)',
              background: pendingMissionImage || modal.data?.image ? 'var(--primary-dim)' : 'var(--bg-glass)',
              cursor: 'pointer',
            }}>
              {(pendingMissionImage || modal.data?.image) ? (
                <>
                  <img
                    src={pendingMissionImage || modal.data?.image}
                    alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                  />
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>📷 Photo set — tap to change</span>
                  {(pendingMissionImage || modal.data?.image) && <button type="button" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setPendingMissionImage(null); }}>✕</button>}
                </>
              ) : (
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>📷 Upload mission photo</span>
              )}
            </div>
          </label>
        </div>

        {/* ICON EMOJI */}
        <div className="input-group" style={{ marginBottom: 14 }}>
          <label>Emoji Icon <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(used alongside photo)</span></label>
          <GroupedEmojiPicker
            groups={MISSION_EMOJI_GROUPS}
            name="icon"
            defaultValue={modal.data?.icon || MISSION_EMOJIS[0]}
          />
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
        const toIntOrNull = (key) => { const v = parseInt(fd.get(key)); return isNaN(v) || v <= 0 ? null : v; };
        const newObj = {
          name: fd.get('name'),
          cost: parseInt(fd.get('cost')) || 10,
          icon: fd.get('icon'),
          max_daily_redemptions: toIntOrNull('max_daily'),
          max_weekly_redemptions: toIntOrNull('max_weekly'),
          max_monthly_redemptions: toIntOrNull('max_monthly'),
          max_total_redemptions: toIntOrNull('max_total'),
        };
        if (isEdit) {
          await supabase.from('rewards').update(newObj).eq('id', modal.data.id);
          setRewards(prev => prev.map(r => r.id === modal.data.id ? { ...r, ...newObj } : r));
          showToast('Reward updated!');
        } else {
          const { data } = await supabase.from('rewards').insert([newObj]).select().single();
          if (data) setRewards(prev => [...prev, data]);
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
          <input type="number" name="cost" className="input" min={1} defaultValue={modal.data?.cost || 10} />
        </div>

        {/* REDEMPTION LIMITS */}
        <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Redemption Limits <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank = unlimited)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['max_daily',   '📅 Per Day'],
              ['max_weekly',  '📆 Per Week'],
              ['max_monthly', '🗓️ Per Month'],
              ['max_total',   '🔒 Total Ever']
            ].map(([key, label]) => (
              <div key={key}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                <input
                  type="number"
                  name={key}
                  className="input"
                  min={1}
                  placeholder="∞"
                  defaultValue={modal.data?.[`${key.replace('max_', 'max_').replace('max_daily','max_daily_redemptions').replace('max_weekly','max_weekly_redemptions').replace('max_monthly','max_monthly_redemptions').replace('max_total','max_total_redemptions')}`] || ''}
                  style={{ fontSize: '0.9rem', padding: '8px 10px' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Icon</label>
          <GroupedEmojiPicker
            groups={REWARD_EMOJI_GROUPS}
            name="icon"
            defaultValue={modal.data?.icon || REWARD_EMOJIS[0]}
          />
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

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => setCropSrc(ev.target.result);
      reader.readAsDataURL(file);
    };

    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        let finalAvatar = pendingBase64 || fd.get('base64_avatar');
        if (!finalAvatar) finalAvatar = fd.get('avatar');
        const newObj = { name: fd.get('name'), avatar: finalAvatar };
        if (isEdit) {
          await supabase.from('children').update(newObj).eq('id', modal.data.id);
          setChildren(prev => prev.map(c => c.id === modal.data.id ? { ...c, ...newObj } : c));
          showToast('Kid profile updated!');
        } else {
          const { data, error } = await supabase.from('children').insert([{
            ...newObj, xp: 0, total_xp_earned: 0, coins: 0, theme: 'seedling'
          }]).select().single();
          if (error) { showToast('Error adding kid: ' + error.message, 'error'); return; }
          if (data) setChildren(prev => [...prev, data]);
          showToast(`Welcome ${newObj.name}! 🎉`);
        }
        closeModal();
      }}>
        <input type="text" name="base64_avatar" value={pendingBase64 || ''} readOnly style={{ display: 'none' }} />

        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Name</label>
          <input name="name" className="input" defaultValue={modal.data?.name || ''} required placeholder="Kid's First Name" />
        </div>

        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Photo or Emoji</label>

          {/* If we have cropSrc, show InlineCrop; otherwise show the picker */}
          {cropSrc ? (
            <InlineCrop
              imageSrc={cropSrc}
              onConfirm={(dataUrl) => { setPendingBase64(dataUrl); setCropSrc(null); }}
              onCancel={() => setCropSrc(null)}
            />
          ) : (
            <>
              {/* Upload button or confirmed photo preview */}
              <label style={{ cursor: 'pointer', display: 'block', marginBottom: 8 }}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: pendingBase64 ? '2px solid var(--primary)' : '2px dashed var(--bg-glass-border)',
                  background: pendingBase64 ? 'var(--primary-dim)' : 'var(--bg-glass)',
                  cursor: 'pointer',
                }}>
                  {pendingBase64 ? (
                    <>
                      <img src={pendingBase64} alt="Avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>📷 Photo selected — tap to change</span>
                    </>
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.9rem' }}>📷 Upload a photo</span>
                  )}
                </div>
              </label>

              {/* Grouped emoji grid */}
              {!pendingBase64 && (
                <GroupedEmojiPicker
                  groups={AVATAR_EMOJI_GROUPS}
                  name="avatar"
                  defaultValue={modal.data?.avatar || AVATAR_EMOJIS[0]}
                  onChange={() => setPendingBase64(null)}
                />
              )}
            </>
          )}
        </div>

        {/* Only show save button when not in crop mode */}
        {!cropSrc && (
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Add Kid'}</button>
          </div>
        )}
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
               <AvatarDisplay avatarString={child.avatar} style={{ fontSize: '3rem' }} />
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
            {modal.type === 'mission' && renderMissionModal()}
            {modal.type === 'reward' && renderRewardModal()}
            {modal.type === 'child' && renderChildModal()}
          </div>
        </div>
      )}
    </>
  );
}
