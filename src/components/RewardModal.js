"use client";

import { supabase } from '../lib/supabase';
import { REWARD_EMOJI_GROUPS, REWARD_EMOJIS } from '../lib/ui';
import GroupedEmojiPicker from './GroupedEmojiPicker';

export default function RewardModal({ modal, closeModal, onSuccess }) {
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
}
