"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/ui';
import { MISSION_EMOJI_GROUPS, MISSION_EMOJIS } from '../lib/ui';
import GroupedEmojiPicker from './GroupedEmojiPicker';
import InlineCrop from './CropOverlay';

export default function MissionModal({ modal, closeModal, onSuccess }) {
  const isEdit = !!modal.data;
  const defaultFrequency = modal.data?.frequency || 'daily';
  const [missionFrequency, setMissionFrequency] = useState(defaultFrequency);
  const [missionCropSrc, setMissionCropSrc] = useState(null);
  const [pendingMissionImage, setPendingMissionImage] = useState(null);

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
      const coin_val = fd.get('coin_reward');
      const coin_reward = coin_val !== null && coin_val !== '' ? parseInt(coin_val) : 5;
      const xp_reward = Math.min((coin_reward * 10) + 10, 500);

      const newObj = {
        name: fd.get('name'),
        xp_reward,
        coin_reward,
        icon: fd.get('icon') || '⭐',
        image: pendingMissionImage || (isEdit ? modal.data?.image || null : null),
        max_completions: parseInt(fd.get('max_completions')) || 1,
        max_completions_per_period: parseInt(fd.get('max_completions_per_period')) || 1,
        frequency: missionFrequency,
        start_date: missionFrequency === 'date_range' ? fd.get('start_date') || null : null,
        end_date: missionFrequency === 'date_range' ? fd.get('end_date') || null : null,
      };
      
      if (isEdit) {
        await supabase.from('missions').update(newObj).eq('id', modal.data.id);
        onSuccess({ ...modal.data, ...newObj }, true);
      } else {
        const { data } = await supabase.from('missions').insert([newObj]).select().single();
        if (data) onSuccess(data, false);
      }
      closeModal();
    }}>
      <div className="input-group" style={{ marginBottom: 14 }}>
        <label>Mission Name</label>
        <input name="name" className="input" defaultValue={modal.data?.name || ''} required placeholder="e.g. Make your bed" />
      </div>

      {/* Coins */}
      <div className="input-group" style={{ marginBottom: 14 }}>
        <label>Coins <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(XP is automatically calculated!)</span></label>
        <input type="number" name="coin_reward" className="input" min={0} max={200} defaultValue={modal.data?.coin_reward ?? 5} />
      </div>

      {/* FREQUENCY */}
      <div className="input-group" style={{ marginBottom: 14 }}>
        <label>Repeats</label>
        <select 
          className="input" 
          value={missionFrequency} 
          onChange={(e) => setMissionFrequency(e.target.value)}
          style={{ marginTop: 8 }}
        >
          <option value="daily">📅 Daily</option>
          <option value="weekly">📆 Weekly</option>
          <option value="monthly">🗓️ Monthly</option>
          <option value="date_range">📌 Date Range</option>
        </select>
      </div>

      {/* PER-PERIOD COMPLETION COUNT */}
      <div className="input-group" style={{ marginBottom: 14 }}>
        <label>Times per {missionFrequency === 'weekly' ? 'week' : missionFrequency === 'monthly' ? 'month' : missionFrequency === 'date_range' ? 'day' : 'day'}
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
      {missionFrequency === 'date_range' && (
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
        <label>Mission Photo</label>
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
      {!(pendingMissionImage || modal.data?.image) && (
        <div className="input-group" style={{ marginBottom: 14 }}>
          <label>Emoji Icon</label>
          <GroupedEmojiPicker
            groups={MISSION_EMOJI_GROUPS}
            name="icon"
            defaultValue={modal.data?.icon || MISSION_EMOJIS[0]}
          />
        </div>
      )}

      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Mission'}</button>
      </div>
    </form>
  );
}
