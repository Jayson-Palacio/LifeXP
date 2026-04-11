"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AVATAR_EMOJI_GROUPS, AVATAR_EMOJIS } from '../lib/ui';
import GroupedEmojiPicker from './GroupedEmojiPicker';
import InlineCrop from './CropOverlay';

export default function ChildModal({ modal, closeModal, onSuccess }) {
  const isEdit = !!modal.data;
  const [cropSrc, setCropSrc] = useState(null);
  const existingIsPhoto = modal.data?.avatar?.startsWith('data:image');
  const [pendingBase64, setPendingBase64] = useState(existingIsPhoto ? modal.data.avatar : null);

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
        onSuccess({ ...modal.data, ...newObj }, true);
      } else {
        const { data, error } = await supabase.from('children').insert([{
          ...newObj, xp: 0, total_xp_earned: 0, coins: 0, theme: 'seedling'
        }]).select().single();
        if (!error && data) {
          onSuccess(data, false);
        }
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
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>📷 Photo set — tap to change</span>
                    <button type="button" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setPendingBase64(null); }}>✕</button>
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
                defaultValue={(!existingIsPhoto && modal.data?.avatar) ? modal.data.avatar : AVATAR_EMOJIS[0]}
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
}
