"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/ui';
import { changeParentPin, updateAppSettings } from '../app/actions/auth';

export default function SettingsTab({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || { require_approval: true, family_name: 'Our Family' });
  const [pinStep, setPinStep] = useState('idle'); // 'idle' | 'entering'
  const [pinPhase, setPinPhase] = useState('current'); // 'current' | 'new' | 'confirm'
  const [inputPin, setInputPin] = useState('');
  const [storedCurrentPin, setStoredCurrentPin] = useState('');
  const [storedNewPin, setStoredNewPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);

  // Load pending invites on mount
  useEffect(() => {
    fetch('/api/invites').then(r => r.json()).then(data => {
      setPendingInvites(data.invites || []);
    }).catch(() => {});
  }, []);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Invite sent to ${data.email}!`);
        setPendingInvites(prev => [{ invited_email: data.email, id: Date.now() }, ...prev]);
        setInviteEmail('');
      } else {
        showToast(data.error || 'Failed to invite');
      }
    } catch (e) {
      showToast('Error sending invite');
    }
    setIsInviting(false);
  };

  const removeInvite = async (id) => {
    await fetch('/api/invites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPendingInvites(prev => prev.filter(i => i.id !== id));
    showToast('Invite removed');
  };

  // Read and write tz from localStorage (client only)
  const [tzOffset, setTzOffset] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const v = localStorage.getItem('kaeluma_tz_offset');
      return v !== null ? v : '';
    }
    return '';
  });

  const handleSaveTz = () => {
    if (tzOffset === '' || tzOffset === null) {
      localStorage.removeItem('kaeluma_tz_offset');
    } else {
      localStorage.setItem('kaeluma_tz_offset', tzOffset);
    }
    showToast('⏰ Timezone saved!');
  };

  const handlePinKey = async (val) => {
    if (val === 'del') { setInputPin(p => p.slice(0, -1)); return; }
    if (inputPin.length >= 4) return;
    const next = inputPin + val;
    setInputPin(next);
    if (next.length < 4) return;

    // Give UI a tick to update dots before action
    setTimeout(async () => {
      if (pinPhase === 'current') {
        setStoredCurrentPin(next);
        setPinPhase('new');
        setInputPin('');
      } else if (pinPhase === 'new') {
        setStoredNewPin(next);
        setPinPhase('confirm');
        setInputPin('');
      } else {
        // confirm phase
        if (next !== storedNewPin) {
          setPinError('PINs do not match. Try again.');
          setPinPhase('new');
          setInputPin('');
          setStoredNewPin('');
        } else {
          const res = await changeParentPin(storedCurrentPin, next);
          if (res.success) {
            showToast('PIN changed! 🔒');
            setPinStep('idle');
            setPinPhase('current');
            setInputPin('');
            setStoredCurrentPin('');
            setStoredNewPin('');
            setPinError('');
          } else {
            setPinError(res.error);
            setPinPhase('current');
            setInputPin('');
            setStoredCurrentPin('');
          }
        }
      }
    }, 80);
  };

  const phaseLabels = {
    current: '🔑 Enter Current PIN',
    new: '✨ Enter New PIN',
    confirm: '✅ Confirm New PIN'
  };

  return (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>⚙️ Settings</h2>
        <button className="cool-home-btn" onClick={() => window.location.href='/'}>
          🏠 <span>Home</span>
        </button>
      </div>

      {/* APPROVAL TOGGLE */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Require Approvals</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              When off, missions are auto-approved instantly
            </div>
          </div>
          <button
            onClick={async () => {
              const newVal = !settings.require_approval;
              await updateAppSettings({ require_approval: newVal });
              setSettings(s => ({ ...s, require_approval: newVal }));
              showToast(newVal ? '✅ Approvals required' : '⚡ Auto-approve on');
            }}
            style={{
              width: 56, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer',
              background: settings.require_approval ? 'var(--green)' : 'var(--bg-surface-alt)',
              position: 'relative', transition: 'background 0.25s', flexShrink: 0,
              boxShadow: settings.require_approval ? 'var(--glow-green)' : 'none',
            }}
          >
            <div style={{
              position: 'absolute', top: 3,
              left: settings.require_approval ? 29 : 3,
              width: 24, height: 24, borderRadius: '50%', background: '#fff',
              transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
            }} />
          </button>
        </div>
      </div>

      {/* FAMILY NAME */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const name = new FormData(e.target).get('family_name');
          await updateAppSettings({ family_name: name });
          setSettings(s => ({ ...s, family_name: name }));
          showToast('Family name updated!');
        }}>
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label>Family Name</label>
            <input
              key={settings.family_name}
              name="family_name"
              className="input"
              defaultValue={settings.family_name || 'Our Family'}
              placeholder="e.g. The Johnson Family"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Name</button>
        </form>
      </div>


      {/* FAMILY SHARING */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>👨‍👩‍👧‍👦 Family Sharing</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Invite a co-parent or grandparent by email. When they sign up with that email, they'll automatically join your family.
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            type="email"
            placeholder="grandma@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={sendInvite}
            disabled={isInviting || !inviteEmail.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            {isInviting ? '...' : 'Invite'}
          </button>
        </div>

        {pendingInvites.length > 0 && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Pending Invites</div>
            {pendingInvites.map(inv => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', marginBottom: 6 }}>
                <span style={{ fontSize: '0.9rem' }}>✉️ {inv.invited_email}</span>
                <button
                  onClick={() => removeInvite(inv.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 8px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TIMEZONE */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>🕐 Daily Reset Timezone</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Missions reset at midnight in this timezone. Leave blank to use your device's timezone.
        </div>
        <select
          className="input"
          value={tzOffset}
          onChange={e => setTzOffset(e.target.value)}
          style={{ marginBottom: 12 }}
        >
          <option value="">📱 Use device timezone (default)</option>
          <option value="-12">UTC-12 — Baker Island</option>
          <option value="-11">UTC-11 — American Samoa</option>
          <option value="-10">UTC-10 — Hawaii</option>
          <option value="-9">UTC-9 — Alaska</option>
          <option value="-8">UTC-8 — Pacific Time (US &amp; Canada)</option>
          <option value="-7">UTC-7 — Mountain Time (US &amp; Canada)</option>
          <option value="-6">UTC-6 — Central Time (US &amp; Canada)</option>
          <option value="-5">UTC-5 — Eastern Time (US &amp; Canada)</option>
          <option value="-4">UTC-4 — Atlantic Time / Venezuela</option>
          <option value="-3">UTC-3 — Brazil / Argentina</option>
          <option value="-2">UTC-2 — South Georgia</option>
          <option value="-1">UTC-1 — Azores</option>
          <option value="0">UTC+0 — London / Dublin / Lisbon</option>
          <option value="1">UTC+1 — Paris / Berlin / Rome / Madrid</option>
          <option value="2">UTC+2 — Athens / Cairo / Johannesburg</option>
          <option value="3">UTC+3 — Moscow / Nairobi / Riyadh</option>
          <option value="4">UTC+4 — Dubai / Baku</option>
          <option value="4.5">UTC+4:30 — Kabul</option>
          <option value="5">UTC+5 — Pakistan</option>
          <option value="5.5">UTC+5:30 — India (IST)</option>
          <option value="6">UTC+6 — Bangladesh / Almaty</option>
          <option value="7">UTC+7 — Bangkok / Jakarta</option>
          <option value="8">UTC+8 — Singapore / Hong Kong / Perth</option>
          <option value="9">UTC+9 — Tokyo / Seoul</option>
          <option value="9.5">UTC+9:30 — Adelaide</option>
          <option value="10">UTC+10 — Sydney / Melbourne</option>
          <option value="11">UTC+11 — Solomon Islands</option>
          <option value="12">UTC+12 — Auckland / Fiji</option>
        </select>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveTz}>Save Timezone</button>
      </div>

      {/* PIN CHANGE */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>🔒 Change Parent PIN</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Enter your current PIN, then choose a new one
        </div>

        {pinStep === 'idle' ? (
          <button
            className="btn btn-ghost btn-block"
            onClick={() => { setPinStep('entering'); setPinPhase('current'); setInputPin(''); setPinError(''); }}
          >
            Change PIN
          </button>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>
              {phaseLabels[pinPhase]}
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`pin-dot ${i < inputPin.length ? 'filled' : ''}`} />
              ))}
            </div>
            <div className="pin-pad" style={{ maxWidth: 280, margin: '0 auto 16px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button key={n} className="pin-key" type="button" onClick={() => handlePinKey(n.toString())}>{n}</button>
              ))}
              <button className="pin-key pin-key-empty" type="button" />
              <button className="pin-key" type="button" onClick={() => handlePinKey('0')}>0</button>
              <button className="pin-key pin-key-delete" type="button" onClick={() => handlePinKey('del')}>←</button>
            </div>
            {pinError && <div className="pin-error" style={{ marginBottom: 12 }}>{pinError}</div>}
            <button
              className="btn btn-ghost"
              onClick={() => { setPinStep('idle'); setInputPin(''); setPinError(''); setPinPhase('current'); }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ACCOUNT SETTINGS */}
      <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
        <button 
          onClick={async () => {
            const { logout } = await import('../app/login/actions');
            await logout();
          }}
          className="btn btn-ghost" 
          style={{ color: 'var(--red)' }}
        >
          Sign Out of Kaeluma
        </button>
      </div>
    </div>
  );
}
