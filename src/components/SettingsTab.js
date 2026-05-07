"use client";

import { useState } from 'react';
import { showToast } from '../lib/ui';
import { changeParentPin, updateAppSettings } from '../app/actions/auth';

// ─── ABOUT ACCORDION ITEM ─────────────────────────────────────────────────────
function AccordionItem({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: 'var(--bg-surface-alt)', border: '1px solid var(--bg-glass-border)',
          borderRadius: open ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
          cursor: 'pointer', color: 'var(--text-bright)', fontWeight: 700, fontSize: '0.95rem',
          transition: 'border-radius 0.2s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>{icon}</span> {title}
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', opacity: 0.5 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div style={{
        overflow: 'hidden', maxHeight: open ? '2000px' : '0px',
        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'var(--bg-surface)', border: open ? '1px solid var(--bg-glass-border)' : 'none',
        borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      }}>
        <div style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────────
function AboutSection() {
  const tierData = [
    { range: '1–10',   name: 'The Beginning', symbol: '🌱' },
    { range: '11–20',  name: 'The Seeker',    symbol: '🧭' },
    { range: '21–30',  name: 'The Grower',    symbol: '🌿' },
    { range: '31–40',  name: 'The Aware',     symbol: '👁' },
    { range: '41–50',  name: 'The Steady',    symbol: '⛰' },
    { range: '51–60',  name: 'The Wise',      symbol: '🕯' },
    { range: '61–70',  name: 'The Chosen',    symbol: '✦' },
    { range: '71–80',  name: 'The Devoted',   symbol: '🌊' },
    { range: '81–90',  name: 'The Guiding',   symbol: '🏮' },
    { range: '91–100', name: 'The Everlight', symbol: '☀' },
  ];

  const ringData = [
    { name: 'Solid',        level: 1,   desc: 'Clean solid line' },
    { name: 'Pulse',        level: 5,   desc: 'Soft breathing glow' },
    { name: 'Double Ring',  level: 10,  desc: 'Two stacked rings' },
    { name: 'Neon',         level: 20,  desc: 'Hard neon glow' },
    { name: 'Spin',         level: 30,  desc: 'Rotating conic gradient' },
    { name: 'Shimmer',      level: 40,  desc: 'Sweeping light sheen' },
    { name: 'Plasma',       level: 55,  desc: 'Multi-color animated plasma' },
    { name: 'Fire',         level: 70,  desc: 'Flickering fire aura' },
    { name: 'Galaxy',       level: 85,  desc: 'Deep space starfield spin' },
    { name: '✦ Legendary',  level: 100, desc: 'Full rainbow prismatic spin' },
  ];

  const colorMilestones = [
    { level: 1,  colors: 'Seedling Green, Bubblegum Pink, Ocean Blue' },
    { level: 3,  colors: 'Morning Sky' },
    { level: 5,  colors: 'Lavender Mist' },
    { level: 7,  colors: 'Golden Hour' },
    { level: 12, colors: 'Coral Reef' },
    { level: 18, colors: 'Forest Deep' },
    { level: 25, colors: 'Deep Violet' },
    { level: 30, colors: 'Crimson Red' },
    { level: 40, colors: 'Stone Gray' },
    { level: 45, colors: 'Candle Flame' },
    { level: 50, colors: 'Deep Indigo' },
    { level: 60, colors: 'Emerald Gem' },
    { level: 65, colors: 'Sapphire Gem' },
    { level: 75, colors: 'Neon Pink' },
    { level: 80, colors: 'Neon Cyan' },
    { level: 90, colors: 'Plasma Green' },
    { level: 92, colors: 'Sunset Split (gradient)' },
    { level: 94, colors: 'Midnight Split (gradient)' },
    { level: 96, colors: 'Galactic Void (gradient)' },
    { level: 98, colors: 'Molten Magma (gradient)' },
    { level: 99, colors: 'Rainbow Dash (gradient)' },
    { level: 100, colors: 'Everlight (animated)' },
  ];

  return (
    <div style={{ marginTop: 'var(--space-xl)' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-lg)',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(59,130,246,0.08) 100%)',
        border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <span style={{ fontSize: '2rem' }}>📖</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-bright)' }}>About Kaeluma</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Everything you need to know about how the app works
          </div>
        </div>
      </div>

      {/* Overview */}
      <AccordionItem icon="🌟" title="What is Kaeluma?" defaultOpen={true}>
        <p style={{ margin: '0 0 12px' }}>
          <strong style={{ color: 'var(--text-bright)' }}>Kaeluma</strong> turns your child's everyday tasks into an epic adventure. 
          Parents create <strong style={{ color: 'var(--text-bright)' }}>missions</strong> (chores, routines, learning goals) 
          and set up <strong style={{ color: 'var(--text-bright)' }}>rewards</strong> as incentives. 
          Kids earn <strong style={{ color: 'var(--gold)' }}>XP</strong> and <strong style={{ color: 'var(--amber)' }}>Coins</strong> for 
          completing missions, level up to unlock customization options, and spend coins to redeem real-world rewards.
        </p>
        <p style={{ margin: 0 }}>
          The goal is to build healthy habits through positive reinforcement — no punishments, only progress. 
          Every completed mission brings your child closer to their next level, tier, and reward. 🚀
        </p>
      </AccordionItem>

      {/* Missions & XP */}
      <AccordionItem icon="🎯" title="Missions & XP">
        <p style={{ margin: '0 0 12px' }}>
          Missions are tasks you create for your child. Each mission awards 
          <strong style={{ color: 'var(--gold)' }}> XP (Experience Points)</strong> and 
          <strong style={{ color: 'var(--amber)' }}> Coins</strong> when completed.
        </p>
        <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission Settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>📅 <strong style={{ color: 'var(--text-bright)' }}>Frequency:</strong> Daily, Weekly, Monthly, or Custom Date Range</div>
            <div>🔁 <strong style={{ color: 'var(--text-bright)' }}>Repeats:</strong> Set how many times per period (e.g. 3x daily)</div>
            <div>👶 <strong style={{ color: 'var(--text-bright)' }}>Assignment:</strong> Assign to specific kids or leave open for all</div>
            <div>📆 <strong style={{ color: 'var(--text-bright)' }}>Weekly Days:</strong> Choose specific days for weekly missions</div>
          </div>
        </div>
        <p style={{ margin: '0 0 8px' }}>
          When <strong style={{ color: 'var(--text-bright)' }}>Require Approvals</strong> is enabled (default), 
          missions show as "pending" until a parent approves them. Turn it off for auto-approve mode.
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
          💡 Tip: Use the Mission Inspiration Library in the Activities tab for 75+ ready-made mission ideas!
        </p>
      </AccordionItem>

      {/* Coins & Rewards */}
      <AccordionItem icon="🪙" title="Coins & Rewards">
        <p style={{ margin: '0 0 12px' }}>
          <strong style={{ color: 'var(--amber)' }}>Coins</strong> are the in-app currency kids earn from completing missions. 
          They can spend coins to redeem <strong style={{ color: 'var(--text-bright)' }}>Rewards</strong> — real-world treats 
          that you define (screen time, ice cream, a trip to the park, etc).
        </p>
        <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reward Controls</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>💰 <strong style={{ color: 'var(--text-bright)' }}>Cost:</strong> Set how many coins each reward costs</div>
            <div>🔒 <strong style={{ color: 'var(--text-bright)' }}>Limits:</strong> Cap redemptions per day, week, month, or total</div>
            <div>👶 <strong style={{ color: 'var(--text-bright)' }}>Assignment:</strong> Make rewards available to specific kids</div>
            <div>✅ <strong style={{ color: 'var(--text-bright)' }}>Fulfillment:</strong> Mark rewards as "Given" or refund coins</div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
          💡 Tip: Parents can manually add or deduct coins from a child's profile by tapping their card on the overview.
        </p>
      </AccordionItem>

      {/* Leveling System */}
      <AccordionItem icon="📈" title="Leveling System (1–100)">
        <p style={{ margin: '0 0 12px' }}>
          Kids start at <strong style={{ color: 'var(--text-bright)' }}>Level 1</strong> and can reach 
          <strong style={{ color: 'var(--text-bright)' }}> Level 100</strong>. XP requirements grow exponentially — 
          early levels are quick to motivate beginners, while later levels require more dedication.
        </p>
        <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP Milestones</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
            {[
              ['Level 5', '~560 XP'], ['Level 10', '~2,000 XP'],
              ['Level 25', '~9,000 XP'], ['Level 50', '~27,000 XP'],
              ['Level 75', '~52,000 XP'], ['Level 100', '~79,000 XP'],
            ].map(([lv, xp]) => (
              <div key={lv} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{lv}</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{xp}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
          Level-ups trigger a full-screen celebration with confetti and sound effects! 🎉
        </p>
      </AccordionItem>

      {/* Tiers */}
      <AccordionItem icon="🏅" title="Tiers (10 Ranks)">
        <p style={{ margin: '0 0 12px' }}>
          Every 10 levels, your child enters a new <strong style={{ color: 'var(--text-bright)' }}>Tier</strong> — a named 
          rank that represents their journey. Reaching a new tier triggers a special ceremony!
        </p>
        <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tierData.map(t => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '1.3rem', width: 28, textAlign: 'center' }}>{t.symbol}</span>
                <span style={{ flex: 1, fontWeight: 700, color: 'var(--text-bright)' }}>{t.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>Lv {t.range}</span>
              </div>
            ))}
          </div>
        </div>
      </AccordionItem>

      {/* Theme Colors */}
      <AccordionItem icon="🎨" title="Theme Colors (23 Unlockables)">
        <p style={{ margin: '0 0 12px' }}>
          Kids can customize their dashboard color theme as they level up. Start with 3 basic colors and unlock 
          <strong style={{ color: 'var(--text-bright)' }}> 23 total</strong>, including neons, gradients, and 
          the animated <strong style={{ color: 'var(--gold)' }}>Everlight</strong> at Level 100.
        </p>
        <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, maxHeight: 280, overflowY: 'auto' }}>
          {colorMilestones.map(c => (
            <div key={c.level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'var(--text-bright)', fontSize: '0.85rem' }}>{c.colors}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', flexShrink: 0, marginLeft: 8 }}>Lv {c.level}</span>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* Ring Styles */}
      <AccordionItem icon="💫" title="Ring Styles (10 Effects)">
        <p style={{ margin: '0 0 12px' }}>
          The avatar ring is the glowing border around your child's profile picture. 
          As they level up, more elaborate animated ring effects unlock.
        </p>
        <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          {ringData.map(r => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '0.9rem' }}>{r.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{r.desc}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>Lv {r.level}</span>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* Streaks */}
      <AccordionItem icon="🔥" title="Streaks">
        <p style={{ margin: '0 0 12px' }}>
          Completing at least one mission per day builds a <strong style={{ color: 'var(--text-bright)' }}>streak</strong>. 
          Streaks evolve visually as they grow, encouraging consistency:
        </p>
        <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🔥', range: '1–6 days', label: 'Flame', color: '#fb923c' },
              { icon: '⚡', range: '7–29 days', label: 'Lightning', color: '#3b82f6' },
              { icon: '💎', range: '30–99 days', label: 'Diamond', color: '#06b6d4' },
              { icon: '🌌', range: '100+ days', label: 'Cosmic', color: '#d946ef' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: s.color }}>{s.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{s.range}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
          ⚠️ Missing 2 consecutive days resets the streak back to 0. Keep it going!
        </p>
      </AccordionItem>

      {/* Easter Eggs */}
      <AccordionItem icon="🥚" title="Easter Eggs">
        <p style={{ margin: 0 }}>
          Kids can discover hidden surprises by tapping their avatar on the dashboard 5 times quickly. 
          Each tap triggers a random animation effect — glow, spin, color shift, wobble, flip, or shake. 
          There's also a special <strong style={{ color: 'var(--gold)' }}>All-Clear Celebration</strong> that 
          plays when every daily mission has been completed! 🎊
        </p>
      </AccordionItem>
    </div>
  );
}

export default function SettingsTab({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || { require_approval: true, family_name: 'Our Family' });
  const [pinStep, setPinStep] = useState('idle'); // 'idle' | 'entering'
  const [pinPhase, setPinPhase] = useState('current'); // 'current' | 'new' | 'confirm'
  const [inputPin, setInputPin] = useState('');
  const [storedCurrentPin, setStoredCurrentPin] = useState('');
  const [storedNewPin, setStoredNewPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [ticketType, setTicketType] = useState('bug');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

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

      {/* SUPPORT & FEEDBACK */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>💬 Support & Feedback</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Found a bug or have an idea to make Kaeluma better? Let me know directly!
        </div>

        <select
          className="input"
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          style={{ marginBottom: 12 }}
          disabled={isSubmittingTicket}
        >
          <option value="bug">🐛 Report a Bug</option>
          <option value="feature">💡 Request a Feature</option>
        </select>

        <textarea
          className="input"
          value={ticketMessage}
          onChange={(e) => setTicketMessage(e.target.value)}
          placeholder="What's on your mind?"
          style={{ marginBottom: 16, minHeight: '100px', resize: 'vertical' }}
          disabled={isSubmittingTicket}
        />

        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }} 
          disabled={isSubmittingTicket || !ticketMessage.trim()}
          onClick={async () => {
            setIsSubmittingTicket(true);
            const { submitTicket } = await import('../app/actions/support');
            const res = await submitTicket(ticketType, ticketMessage);
            setIsSubmittingTicket(false);
            if (res.success) {
              showToast(ticketType === 'bug' ? '🐛 Bug reported! Thank you.' : '💡 Idea submitted! Thank you.');
              setTicketMessage('');
              setTicketType('bug');
            } else {
              showToast(res.error || 'Failed to submit ticket');
            }
          }}
        >
          {isSubmittingTicket ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      {/* ─── ABOUT KAELUMA ─────────────────────────────────────────────── */}
      <AboutSection />

      {/* ACCOUNT SETTINGS */}
      <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
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
        <div style={{ marginTop: 'var(--space-lg)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Kaeluma v1.0 · Made with ❤️ for families
        </div>
      </div>
    </div>
  );
}
