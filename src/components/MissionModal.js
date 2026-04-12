"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/ui';
import { MISSION_EMOJI_GROUPS, MISSION_EMOJIS } from '../lib/ui';
import GroupedEmojiPicker from './GroupedEmojiPicker';
import InlineCrop from './CropOverlay';

export default function MissionModal({ modal, childrenList = [], closeModal, onSuccess }) {
  const isEdit = !!modal.data;
  const defaultFrequency = modal.data?.frequency || 'daily';
  
  const [missionFrequency, setMissionFrequency] = useState(defaultFrequency);
  const [missionCropSrc, setMissionCropSrc] = useState(null);
  const [missionImage, setMissionImage] = useState(isEdit ? modal.data?.image || null : null);
  const [specificDays, setSpecificDays] = useState(isEdit ? modal.data?.specific_days || [] : []);
  
  // Track coins for dynamic XP calculation
  const [coinAmount, setCoinAmount] = useState(modal.data?.coin_reward?.toString() ?? '5');
  const parsedCoins = parseInt(coinAmount) || 0;
  const calculatedXP = Math.min(Math.max((parsedCoins * 10), 10), 500);

  // Assignment tracking
  const defaultAssigned = modal.data?.assigned_to || [];
  const [assignAll, setAssignAll] = useState(defaultAssigned.length === 0);
  const [assignedTo, setAssignedTo] = useState(defaultAssigned);

  const toggleAssign = (childId) => {
    setAssignedTo(prev => prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]);
  };

  return (
    <>
      <div style={{ display: missionCropSrc ? 'block' : 'none' }}>
        <p style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Crop the mission photo</p>
        {missionCropSrc && (
          <InlineCrop
            imageSrc={missionCropSrc}
            onConfirm={(dataUrl) => { setMissionImage(dataUrl); setMissionCropSrc(null); }}
            onCancel={() => setMissionCropSrc(null)}
          />
        )}
      </div>

      <form style={{ display: missionCropSrc ? 'none' : 'block' }} onSubmit={async (e) => {
        e.preventDefault();
      const fd = new FormData(e.target);
      
      const newObj = {
        name: fd.get('name'),
        xp_reward: calculatedXP,
        coin_reward: parsedCoins,
        icon: fd.get('icon') || '⭐',
        image: missionImage,
        max_completions: parseInt(fd.get('max_completions')) || 1,
        max_completions_per_period: parseInt(fd.get('max_completions_per_period')) || 1,
        frequency: missionFrequency,
        specific_days: missionFrequency === 'weekly' ? specificDays : null,
        start_date: missionFrequency === 'date_range' ? fd.get('start_date') || null : null,
        end_date: missionFrequency === 'date_range' ? fd.get('end_date') || null : null,
        assigned_to: assignAll || assignedTo.length === 0 ? null : assignedTo
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

      {/* Coins & Dynamic XP */}
      <div className="input-group" style={{ marginBottom: 14 }}>
        <label style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          Coins 
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            (+{calculatedXP} XP)
          </span>
        </label>
        <input 
          type="number" 
          name="coin_reward" 
          className="input" 
          min={0} max={200} 
          value={coinAmount}
          onChange={(e) => setCoinAmount(e.target.value)}
        />
      </div>

      {/* ASSIGNMENT */}
      {childrenList.length > 0 && (
        <div className="input-group" style={{ marginBottom: 14 }}>
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

      {missionFrequency === 'weekly' && (
        <div className="input-group" style={{ marginBottom: 14 }}>
          <label>Specific Days</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 8 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <label key={idx} style={{ 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', 
                 width: 32, height: 32, 
                 borderRadius: '50%', 
                 background: specificDays.includes(idx) ? 'var(--primary)' : 'var(--bg-glass)',
                 color: specificDays.includes(idx) ? '#fff' : 'inherit',
                 cursor: 'pointer', fontWeight: 'bold',
                 border: '1px solid var(--primary-dim)'
              }}>
                <input 
                  type="checkbox" 
                  checked={specificDays.includes(idx)} 
                  onChange={(e) => {
                     if (e.target.checked) setSpecificDays([...specificDays, idx]);
                     else setSpecificDays(specificDays.filter(d => d !== idx));
                  }} 
                  style={{ display: 'none' }}
                />
                {day}
              </label>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Leave empty to allow any day.</p>
        </div>
      )}

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
            border: missionImage ? '2px solid var(--primary)' : '2px dashed var(--bg-glass-border)',
            background: missionImage ? 'var(--primary-dim)' : 'var(--bg-glass)',
            cursor: 'pointer',
          }}>
            {missionImage ? (
              <>
                <img
                  src={missionImage}
                  alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                />
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>📷 Photo set — tap to change</span>
                <button type="button" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setMissionImage(null); }}>✕</button>
              </>
            ) : (
              <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>📷 Upload mission photo</span>
            )}
          </div>
        </label>
      </div>

      {/* ICON EMOJI */}
      {!missionImage && (
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
    </>
  );
}
