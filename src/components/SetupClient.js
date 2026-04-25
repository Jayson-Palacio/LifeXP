"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AVATAR_EMOJI_GROUPS, MISSION_EMOJI_GROUPS } from '../lib/ui';
import { submitSetupData } from '../app/actions/setup';
import GroupedEmojiPicker from './GroupedEmojiPicker';
import InlineCrop from './CropOverlay';
import { showConfetti } from '../lib/ui';

const TOTAL_STEPS = 6; // 0=Welcome, 1=FamilyName, 2=PIN, 3=Kid, 4=Mission, 5=Done

const STEP_LABELS = ['Welcome', 'Family', 'PIN', 'Kid', 'Mission', 'Done!'];

const MISSION_TEMPLATES = [
  { icon: '🛏️', name: 'Make Your Bed' },
  { icon: '🦷', name: 'Brush Teeth' },
  { icon: '📚', name: 'Read for 15 Minutes' },
  { icon: '🧹', name: 'Clean Your Room' },
  { icon: '📝', name: 'Do Homework' },
  { icon: '🐕', name: 'Feed the Pet' },
];

export default function SetupClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState('');
  const [pin, setPin] = useState('');
  const [childName, setChildName] = useState('');
  const [childAvatar, setChildAvatar] = useState(AVATAR_EMOJI_GROUPS[0].emojis[0]);
  const [pendingBase64, setPendingBase64] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [missionName, setMissionName] = useState('');
  const [missionIcon, setMissionIcon] = useState(MISSION_EMOJI_GROUPS[0].emojis[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const familyNameRef = useRef(null);
  const nameInputRef = useRef(null);
  const missionInputRef = useRef(null);

  useEffect(() => {
    if (step === 1 && familyNameRef.current) familyNameRef.current.focus();
    if (step === 3 && nameInputRef.current) nameInputRef.current.focus();
    if (step === 4 && missionInputRef.current) missionInputRef.current.focus();
  }, [step]);

  const handlePinKey = (val) => {
    if (val === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin.length === 4) setTimeout(() => setStep(3), 400);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    if (!missionName.trim()) return;
    setIsSubmitting(true);
    const finalAvatar = pendingBase64 || childAvatar;
    const result = await submitSetupData(
      pin, childName.trim(), finalAvatar,
      missionName.trim(), missionIcon, familyName.trim() || 'Our Family'
    );
    if (result.success) {
      setStep(5);
      setTimeout(() => showConfetti(80), 200);
    } else {
      setIsSubmitting(false);
      alert('Error setting up: ' + result.error);
    }
  };

  const avatarDisplay = pendingBase64
    ? <img src={pendingBase64} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: 'var(--glow-primary)' }} />
    : <div style={{ fontSize: '5rem', lineHeight: 1 }}>{childAvatar}</div>;

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', background: 'var(--bg-deep)',
    }}>

      {/* Progress Bar — hidden on Welcome (0) and Done (5) */}
      {step > 0 && step < 5 && (
        <div style={{ width: '100%', maxWidth: 440, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {STEP_LABELS.slice(1, 5).map((label, i) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step > i + 1 ? 'var(--primary)' : step === i + 1 ? 'var(--primary)' : 'var(--bg-surface)',
                  border: step >= i + 1 ? '2px solid var(--primary)' : '2px solid var(--bg-glass-border)',
                  fontSize: '0.75rem', fontWeight: 900,
                  color: step >= i + 1 ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.3s ease',
                  boxShadow: step === i + 1 ? 'var(--glow-primary)' : 'none',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: step >= i + 1 ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div style={{ height: 4, background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(90deg, var(--primary), var(--primary-light, var(--primary)))',
              width: `${((step - 1) / 4) * 100}%`,
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--glow-primary)',
            }} />
          </div>
        </div>
      )}

      {/* Card */}
      <div className="page-enter" key={step} style={{
        width: '100%', maxWidth: 440,
        background: 'linear-gradient(145deg, var(--bg-surface) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-3xl)',
        padding: '36px 28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
      }}>

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: 16, filter: 'drop-shadow(0 0 24px rgba(168,85,247,0.6))', animation: 'pulse 3s ease-in-out infinite' }}>🌟</div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0 0 8px', background: 'linear-gradient(135deg, #fff 0%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LifeXP
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Turn everyday moments into<br /><strong style={{ color: 'var(--text-bright)' }}>epic adventures.</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 36 }}>
              Let's get your family set up in under 2 minutes!
            </p>
            <button className="btn btn-primary btn-block btn-lg" onClick={() => setStep(1)}>
              Let's Build Your Family →
            </button>
          </div>
        )}

        {/* ── STEP 1: Family Name ── */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏠</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px' }}>What's your family called?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                This personalizes your dashboard for everyone.
              </p>
            </div>
            <div className="input-group" style={{ marginBottom: 28 }}>
              <input
                ref={familyNameRef}
                type="text"
                className="input"
                placeholder="e.g. The Johnson Family"
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                maxLength={40}
                autoComplete="off"
                style={{ fontSize: '1.1rem', textAlign: 'center' }}
                onKeyDown={e => e.key === 'Enter' && familyName.trim() && setStep(2)}
              />
            </div>
            <button
              className="btn btn-primary btn-block btn-lg"
              disabled={!familyName.trim()}
              onClick={() => setStep(2)}
            >
              Next →
            </button>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 8, opacity: 0.6 }} onClick={() => { setFamilyName('Our Family'); setStep(2); }}>
              Skip for now
            </button>
          </div>
        )}

        {/* ── STEP 2: PIN ── */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px' }}>Set a Parent PIN</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Keeps your dashboard safe from little fingers.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: i < pin.length ? 'var(--primary)' : 'var(--bg-deep)',
                  border: i < pin.length ? '2px solid var(--primary)' : '2px solid var(--bg-glass-border)',
                  boxShadow: i < pin.length ? 'var(--glow-primary)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
                }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 280, margin: '0 auto' }}>
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} className="pin-key" onClick={() => handlePinKey(n.toString())} style={{ fontSize: '1.4rem', fontWeight: 700, padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'transform 0.1s, background 0.1s', color: 'var(--text-bright)' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >{n}</button>
              ))}
              <div />
              <button className="pin-key" onClick={() => handlePinKey('0')} style={{ fontSize: '1.4rem', fontWeight: 700, padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', color: 'var(--text-bright)' }}>0</button>
              <button onClick={() => handlePinKey('del')} style={{ fontSize: '1.2rem', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', color: 'var(--text-muted)' }}>←</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Add First Kid ── */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>👦</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 6px' }}>Add Your First Kid</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Pick a fun avatar or use their real photo!</p>
            </div>

            {/* Big avatar preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-deep)',
                  border: '3px solid var(--primary)',
                  boxShadow: 'var(--glow-primary)',
                }}>
                  {avatarDisplay}
                </div>
                {/* Camera upload button */}
                <label style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--primary)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)', border: '2px solid var(--bg-deep)',
                }}>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  📷
                </label>
              </div>
            </div>

            {cropSrc ? (
              <InlineCrop
                imageSrc={cropSrc}
                onConfirm={(dataUrl) => { setPendingBase64(dataUrl); setCropSrc(null); }}
                onCancel={() => setCropSrc(null)}
              />
            ) : (
              <>
                <div className="input-group" style={{ marginBottom: 16 }}>
                  <input
                    ref={nameInputRef}
                    type="text"
                    className="input"
                    placeholder="Kid's first name"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    maxLength={20}
                    autoComplete="off"
                    style={{ textAlign: 'center', fontSize: '1.1rem' }}
                  />
                </div>

                {!pendingBase64 && (
                  <div className="input-group" style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: 6 }}>Choose Emoji Avatar</label>
                    <GroupedEmojiPicker
                      groups={AVATAR_EMOJI_GROUPS}
                      name="avatar"
                      defaultValue={childAvatar}
                      onChange={v => { setPendingBase64(null); setChildAvatar(v); }}
                    />
                  </div>
                )}
                {pendingBase64 && (
                  <button type="button" className="btn btn-ghost btn-block" style={{ marginBottom: 16 }} onClick={() => setPendingBase64(null)}>
                    ← Use Emoji Instead
                  </button>
                )}

                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={!childName.trim()}
                  onClick={() => setStep(4)}
                >
                  Next →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 4: First Mission ── */}
        {step === 4 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎯</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 6px' }}>First Mission</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                What's the first task for {childName}?
              </p>
            </div>

            {/* Quick-start templates */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick Start</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {MISSION_TEMPLATES.map(t => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => { setMissionName(t.name); setMissionIcon(t.icon); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-lg)',
                      background: missionName === t.name ? 'rgba(var(--primary-rgb,168,85,247),0.15)' : 'var(--bg-deep)',
                      border: missionName === t.name ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-bright)' }}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>OR CUSTOM</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div className="input-group" style={{ marginBottom: 12 }}>
              <input
                ref={missionInputRef}
                type="text"
                className="input"
                placeholder="Type your own mission..."
                value={missionName}
                onChange={e => setMissionName(e.target.value)}
                maxLength={40}
                autoComplete="off"
              />
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 20, textAlign: 'center' }}>
              Reward: ⭐ 10 XP &nbsp; 🪙 5 Coins — customize anytime
            </p>

            <button
              className="btn btn-gold btn-block btn-lg"
              disabled={!missionName.trim() || isSubmitting}
              onClick={handleFinish}
            >
              {isSubmitting ? 'Setting up...' : "🚀 Let's Go!"}
            </button>
          </div>
        )}

        {/* ── STEP 5: Celebration ── */}
        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12, animation: 'bounce 0.6s ease infinite alternate' }}>🎉</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 6px', background: 'linear-gradient(135deg, #fbbf24, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              You're all set!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.95rem' }}>
              Welcome to LifeXP, {familyName || 'your family'}!
            </p>

            {/* Summary card */}
            <div style={{
              background: 'var(--bg-deep)', borderRadius: 'var(--radius-xl)',
              padding: '20px', marginBottom: 28, border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🏠</span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Family</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{familyName || 'Our Family'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                  {pendingBase64
                    ? <img src={pendingBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : childAvatar}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>First Kid</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{childName}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>{missionIcon}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>First Mission</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{missionName}</div>
                </div>
              </div>
            </div>

            <button className="btn btn-gold btn-block btn-lg" onClick={() => router.push('/')}>
              Open My Dashboard 🚀
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
