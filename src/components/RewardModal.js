"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { REWARD_EMOJI_GROUPS, REWARD_EMOJIS } from '../lib/ui';
import GroupedEmojiPicker from './GroupedEmojiPicker';
import InlineCrop from './CropOverlay';

export default function RewardModal({ modal, childrenList = [], closeModal, onSuccess }) {
  const isEdit = !!modal.data;
  const [showLimits, setShowLimits] = useState(false);
  
  const [rewardCropSrc, setRewardCropSrc] = useState(null);
  const [rewardImage, setRewardImage] = useState(isEdit ? modal.data?.image || null : null);
  
  // Assignment tracking
  const defaultAssigned = modal.data?.assigned_to || [];
  const [assignAll, setAssignAll] = useState(defaultAssigned.length === 0);
  const [assignedTo, setAssignedTo] = useState(defaultAssigned);

  const toggleAssign = (childId) => {
    setAssignedTo(prev => prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]);
  };

  return (
    <>
      <div style={{ display: rewardCropSrc ? 'block' : 'none' }}>
        <p style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Crop the reward photo</p>
        {rewardCropSrc && (
          <InlineCrop
            imageSrc={rewardCropSrc}
            onConfirm={(dataUrl) => { setRewardImage(dataUrl); setRewardCropSrc(null); }}
            onCancel={() => setRewardCropSrc(null)}
          />
        )}
      </div>

      <form style={{ display: rewardCropSrc ? 'none' : 'block' }} onSubmit={async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const toIntOrNull = (key) => { const v = parseInt(fd.get(key)); return isNaN(v) || v <= 0 ? null : v; };
      
      const newObj = {
        name: fd.get('name'),
        cost: parseInt(fd.get('cost')) || 10,
        icon: fd.get('icon') || '🎁',
        image: rewardImage,
        max_daily_redemptions: toIntOrNull('max_daily'),
        max_weekly_redemptions: toIntOrNull('max_weekly'),
        max_monthly_redemptions: toIntOrNull('max_monthly'),
        max_total_redemptions: toIntOrNull('max_total'),
        assigned_to: assignAll || assignedTo.length === 0 ? null : assignedTo
      };

      if (isEdit) {
        await supabase.from('rewards').update(newObj).eq('id', modal.data.id);
        onSuccess({ ...modal.data, ...newObj }, true);
      } else {
        const { data } = await supabase.from('rewards').insert([newObj]).select().single();
        if (data) onSuccess(data, false);
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

      {/* ASSIGNMENT */}
      {childrenList.length > 0 && (
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Assign To</label>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={assignAll} 
                onChange={(e) => {
                  setAssignAll(e.target.checked);
                  if (e.target.checked) setAssignedTo([]);
                }}
                style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
              />
              <span style={{ fontWeight: assignAll ? 'bold' : 'normal' }}>All Kids</span>
            </label>
            
            {!assignAll && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginLeft: 24, marginTop: 4 }}>
                {childrenList.map(child => (
                  <label key={child.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'var(--bg-glass)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: assignedTo.includes(child.id) ? '2px solid var(--primary)' : '2px solid transparent' }}>
                    <input 
                      type="checkbox" 
                      checked={assignedTo.includes(child.id)}
                      onChange={() => toggleAssign(child.id)}
                      style={{ display: 'none' }}
                    />
                    {child.avatar?.startsWith('data:image') ? (
                       <img src={child.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                       <span style={{ fontSize: '1.2rem' }}>{child.avatar || '👦'}</span>
                    )}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{child.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REDEMPTION LIMITS TOGGLE */}
      <div style={{ marginBottom: 16 }}>
        <button 
          type="button" 
          onClick={() => setShowLimits(!showLimits)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}
        >
          {showLimits ? '▼ Hide Advanced Limits' : '▶ Advanced Limits'}
        </button>
        
        {showLimits && (
          <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: '12px', marginTop: 10 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Limit Usage <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(blank = unlimited)</span></div>
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
                    defaultValue={modal.data?.[`${key}_redemptions`] || ''}
                    style={{ fontSize: '0.9rem', padding: '8px 10px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* REWARD PHOTO */}
      <div className="input-group" style={{ marginBottom: 16 }}>
        <label>Reward Photo</label>
        <label style={{ cursor: 'pointer', display: 'block', marginBottom: 8 }}>
          <input
            type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => setRewardCropSrc(ev.target.result);
              reader.readAsDataURL(file);
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 14px', borderRadius: 'var(--radius-md)',
            border: rewardImage ? '2px solid var(--primary)' : '2px dashed var(--bg-glass-border)',
            background: rewardImage ? 'var(--primary-dim)' : 'var(--bg-glass)',
            cursor: 'pointer',
          }}>
            {rewardImage ? (
              <>
                <img
                  src={rewardImage}
                  alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                />
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>📷 Photo set — tap to change</span>
                <button type="button" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setRewardImage(null); }}>✕</button>
              </>
            ) : (
              <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>📷 Upload reward photo</span>
            )}
          </div>
        </label>
      </div>

      {/* ICON EMOJI */}
      {!rewardImage && (
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Emoji Icon</label>
          <GroupedEmojiPicker
            groups={REWARD_EMOJI_GROUPS}
            name="icon"
            defaultValue={modal.data?.icon || REWARD_EMOJIS[0]}
          />
        </div>
      )}
      
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Reward'}</button>
      </div>
    </form>
    </>
  );
}
