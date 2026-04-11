"use client";

import { useState } from 'react';
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
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-xl)' }}>⚙️ Settings</h2>

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
    </div>
  );
}
