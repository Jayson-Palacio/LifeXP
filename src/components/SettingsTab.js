"use client";

import { useState, useEffect } from 'react';
import GoldCoin from './GoldCoin';
import { showToast } from '../lib/ui';
import { changeParentPin, updateAppSettings } from '../app/actions/auth';

// Support & Donation Configuration
const STRIPE_DONATION_URL = 'https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00';

// ─── ABOUT ACCORDION ITEM ─────────────────────────────────────────────────────
function AccordionItem({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ marginBottom: 8, transition: 'all 0.2s' }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', 
          background: open ? 'var(--bg-surface-alt)' : hovered ? 'rgba(255,255,255,0.06)' : 'var(--bg-surface-alt)', 
          border: '1px solid var(--bg-glass-border)',
          borderColor: open ? 'rgba(168,85,247,0.3)' : hovered ? 'rgba(255,255,255,0.15)' : 'var(--bg-glass-border)',
          borderRadius: open ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
          cursor: 'pointer', color: 'var(--text-bright)', fontWeight: 700, fontSize: '0.95rem',
          transition: 'all 0.2s var(--ease-out)',
          boxShadow: open ? '0 4px 15px rgba(168, 85, 247, 0.05)' : 'none',
          outline: 'none',
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
        overflow: 'hidden', 
        maxHeight: open ? '1500px' : '0px',
        transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'var(--bg-surface)', 
        border: open ? '1px solid var(--bg-glass-border)' : 'none',
        borderTop: 'none', 
        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      }}>
        <div style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT SECTION (GAME GUIDE) ───────────────────────────────────────────────
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
    <div style={{ marginTop: 0 }}>
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
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-bright)' }}>Kaeluma Academy</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Master Kaeluma's leveling, tiers, streaks, and reward systems
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Core Rules Group */}
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, paddingLeft: 4 }}>
            🎮 Core Game Loops
          </div>
          <AccordionItem icon="🌟" title="What is Kaeluma?" defaultOpen={true}>
            <p style={{ margin: '0 0 12px' }}>
              <strong style={{ color: 'var(--text-bright)' }}>Kaeluma</strong> turns family daily tasks into an epic adventure. 
              Parents create <strong style={{ color: 'var(--text-bright)' }}>missions</strong> (chores, routines, learning goals) 
              and set up <strong style={{ color: 'var(--text-bright)' }}>rewards</strong> as incentives. 
              Players earn <strong style={{ color: 'var(--gold)' }}>XP</strong> and <strong style={{ color: 'var(--amber)' }}>Coins</strong> for 
              completing missions, level up to unlock customization options, and spend coins to redeem real-world rewards.
            </p>
            <p style={{ margin: 0 }}>
              The goal is to build healthy habits through positive reinforcement — no punishments, only progress. 
              Every completed mission brings players closer to their next level, tier, and reward. 🚀
            </p>
          </AccordionItem>
          
          <AccordionItem icon="🎯" title="Missions & XP">
            <p style={{ margin: '0 0 12px' }}>
              Missions are tasks you create for your family. Each mission awards 
              <strong style={{ color: 'var(--gold)' }}> XP (Experience Points)</strong> and 
              <strong style={{ color: 'var(--amber)' }}> Coins</strong> when completed.
            </p>
            <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>📅 <strong style={{ color: 'var(--text-bright)' }}>Frequency:</strong> Daily, Weekly, Monthly, or Custom Date Range</div>
                <div>🔁 <strong style={{ color: 'var(--text-bright)' }}>Repeats:</strong> Set how many times per period (e.g. 3x daily)</div>
                <div>👥 <strong style={{ color: 'var(--text-bright)' }}>Assignment:</strong> Assign to specific players or leave open for all</div>
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
          
          <AccordionItem icon={<GoldCoin />} title="Coins & Rewards">
            <p style={{ margin: '0 0 12px' }}>
              <strong style={{ color: 'var(--amber)' }}>Coins</strong> are the in-app currency players earn from completing missions. 
              They can spend coins to redeem <strong style={{ color: 'var(--text-bright)' }}>Rewards</strong> — real-world treats 
              that you define (screen time, ice cream, a trip to the park, etc).
            </p>
            <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reward Controls</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>💰 <strong style={{ color: 'var(--text-bright)' }}>Cost:</strong> Set how many coins each reward costs</div>
                <div>🔒 <strong style={{ color: 'var(--text-bright)' }}>Limits:</strong> Cap redemptions per day, week, month, or total</div>
                <div>👥 <strong style={{ color: 'var(--text-bright)' }}>Assignment:</strong> Make rewards available to specific players</div>
                <div>✅ <strong style={{ color: 'var(--text-bright)' }}>Fulfillment:</strong> Mark rewards as "Given" or refund coins</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
              💡 Tip: Parents can manually add or deduct coins from a player's profile by tapping their card on the overview.
            </p>
          </AccordionItem>
        </div>

        {/* Progression Group */}
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, paddingLeft: 4 }}>
            📈 Leveling & Customization
          </div>
          <AccordionItem icon="📈" title="Leveling System (1–100)">
            <p style={{ margin: '0 0 12px' }}>
              Players start at <strong style={{ color: 'var(--text-bright)' }}>Level 1</strong> and can reach 
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
          
          <AccordionItem icon="🏅" title="Tiers (10 Ranks)">
            <p style={{ margin: '0 0 12px' }}>
              Every 10 levels, players enter a new <strong style={{ color: 'var(--text-bright)' }}>Tier</strong> — a named 
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
          
          <AccordionItem icon="🎨" title="Theme Colors (23 Unlockables)">
            <p style={{ margin: '0 0 12px' }}>
              Players can customize their dashboard color theme as they level up. Start with 3 basic colors and unlock 
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
        </div>

        {/* Streaks & Secrets Group */}
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, paddingLeft: 4 }}>
            🔥 Streaks & Secrets
          </div>
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
          
          <AccordionItem icon="🥚" title="Easter Eggs">
            <p style={{ margin: 0 }}>
              Players can discover hidden surprises by tapping their avatar on the dashboard 5 times quickly. 
              Each tap triggers a random animation effect — glow, spin, color shift, wobble, flip, or shake. 
              There's also a special <strong style={{ color: 'var(--gold)' }}>All-Clear Celebration</strong> that 
              plays when every daily mission has been completed! 🎊
            </p>
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}

export default function SettingsTab({ initialSettings, onOpenSupport }) {
  const [settings, setSettings] = useState(initialSettings || { require_approval: true, family_name: 'Our Family' });
  const [subTab, setSubTab] = useState('preferences'); // 'preferences' | 'guide'
  
  // PIN states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinPhase, setPinPhase] = useState('current'); // 'current' | 'new' | 'confirm'
  const [inputPin, setInputPin] = useState('');
  const [storedCurrentPin, setStoredCurrentPin] = useState('');
  const [storedNewPin, setStoredNewPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Auto-save feedback indicators
  const [familyNameInput, setFamilyNameInput] = useState(settings.family_name || 'Our Family');
  const [nameSaving, setNameSaving] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [tzSaving, setTzSaving] = useState('idle'); // 'idle' | 'saving' | 'saved'

  const [ticketType, setTicketType] = useState('bug');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);


  // Read and write tz from localStorage (client only)
  const [tzOffset, setTzOffset] = useState('');

  // Sync state with settings updates
  useEffect(() => {
    if (settings.family_name) {
      setFamilyNameInput(settings.family_name);
    }
  }, [settings.family_name]);

  // Load timezone client-side
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const v = localStorage.getItem('kaeluma_tz_offset');
      setTzOffset(v !== null ? v : '');
    }
  }, []);

  const handleSaveName = async () => {
    const trimmed = familyNameInput.trim();
    if (trimmed === '') return;
    if (trimmed === settings.family_name) return;
    
    setNameSaving('saving');
    try {
      await updateAppSettings({ family_name: trimmed });
      setSettings(s => ({ ...s, family_name: trimmed }));
      setNameSaving('saved');
      showToast('Family name saved! 🏡');
      setTimeout(() => setNameSaving('idle'), 2000);
    } catch (err) {
      setNameSaving('idle');
      showToast('Failed to save name: ' + err.message, 'error');
    }
  };

  const handleSaveTz = (newTz) => {
    setTzOffset(newTz);
    setTzSaving('saving');
    try {
      if (newTz === '' || newTz === null) {
        localStorage.removeItem('kaeluma_tz_offset');
      } else {
        localStorage.setItem('kaeluma_tz_offset', newTz);
      }
      setTzSaving('saved');
      showToast('Reset timezone auto-saved! ⏰');
      setTimeout(() => setTzSaving('idle'), 2000);
    } catch (err) {
      setTzSaving('idle');
      showToast('Failed to save timezone', 'error');
    }
  };

  const startPinChange = () => {
    setShowPinModal(true);
    setPinPhase('current');
    setInputPin('');
    setPinError('');
    setStoredCurrentPin('');
    setStoredNewPin('');
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
            showToast('PIN changed successfully! 🔒');
            setShowPinModal(false);
            setPinPhase('current');
            setInputPin('');
            setStoredCurrentPin('');
            setStoredNewPin('');
            setPinError('');
          } else {
            setPinError(res.error || 'Incorrect current PIN.');
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>⚙️ Settings</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onOpenSupport && (
            <button 
              className="cool-home-btn" 
              style={{ 
                background: 'rgba(99, 102, 241, 0.08)', 
                borderColor: 'rgba(99, 102, 241, 0.25)',
                color: 'var(--text-bright)'
              }}
              onClick={onOpenSupport}
            >
              <span>💬</span> <span>Support</span>
            </button>
          )}
          <button className="cool-home-btn" onClick={() => window.location.href='/'}>
            🏠 <span>Home</span>
          </button>
        </div>
      </div>

      {/* Segmented Sub-tab Navigation */}
      <div className="segment-control" style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '0 auto var(--space-xl)' }}>
        <button 
          className={`segment-control-btn ${subTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setSubTab('preferences')}
        >
          🔧 Preferences
        </button>
        <button 
          className={`segment-control-btn ${subTab === 'guide' ? 'active' : ''}`}
          onClick={() => setSubTab('guide')}
        >
          📖 Game Guide
        </button>
        <div className={`segment-control-indicator ${subTab === 'preferences' ? 'pos-0' : 'pos-1'}`} />
      </div>

      {subTab === 'preferences' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          {/* COMPACT SUPPORT BANNER */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.04) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.22)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 300px' }}>
              <span style={{ fontSize: '1.6rem', animation: 'pulse 2s infinite' }}>💖</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-bright)' }}>Support Kaeluma</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 1 }}>
                  Send a voluntary one-time tip to support development and cover hosting costs.
                </div>
              </div>
            </div>
            <a
              href={STRIPE_DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(90deg, #635BFF 0%, #7B73FF 100%)',
                color: '#fff',
                fontWeight: 800,
                padding: '10px 18px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Support on Stripe
            </a>
          </div>

          {/* FAMILY PROFILE */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--bg-glass-border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: 'var(--space-lg)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.3rem' }}>🏡</span>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-bright)' }}>Family Profile</div>
            </div>
            
            <div className="input-group" style={{ marginBottom: 16, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label>Family Name</label>
                {nameSaving === 'saving' && <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Saving...</span>}
                {nameSaving === 'saved' && <span style={{ fontSize: '0.78rem', color: 'var(--green)' }}>✓ Auto-saved</span>}
              </div>
              <input
                className="input"
                value={familyNameInput}
                onChange={e => setFamilyNameInput(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                placeholder="e.g. The Johnson Family"
                style={{ borderColor: nameSaving === 'saved' ? 'var(--green)' : '' }}
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label>Daily Reset Timezone</label>
                {tzSaving === 'saving' && <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Saving...</span>}
                {tzSaving === 'saved' && <span style={{ fontSize: '0.78rem', color: 'var(--green)' }}>✓ Auto-saved</span>}
              </div>
              <select
                className="input"
                value={tzOffset}
                onChange={e => handleSaveTz(e.target.value)}
                style={{ borderColor: tzSaving === 'saved' ? 'var(--green)' : '' }}
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
            </div>
          </div>

          {/* SECURITY & SYSTEM */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--bg-glass-border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: 'var(--space-lg)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.3rem' }}>🛡️</span>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-bright)' }}>Security &amp; System</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-bright)' }}>Require Approvals</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Missions must be approved by parents before rewards unlock.
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
                  width: 50, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: settings.require_approval ? 'var(--green)' : 'var(--bg-surface-alt)',
                  position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                  boxShadow: settings.require_approval ? 'var(--glow-green)' : 'none',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: settings.require_approval ? 27 : 3,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                }} />
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--bg-glass-border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-bright)' }}>Parent Dashboard PIN</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Secures parent settings and approvals from children.
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={startPinChange} style={{ flexShrink: 0 }}>
                  Change PIN
                </button>
              </div>
            </div>
          </div>

          {/* SUPPORT & FEEDBACK */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--bg-glass-border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: 'var(--space-lg)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.3rem' }}>💬</span>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-bright)' }}>Support &amp; Feedback</div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Report a bug or suggest a feature to make Kaeluma better.
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
              placeholder="Tell us what's on your mind..."
              style={{ marginBottom: 16, minHeight: '100px', resize: 'vertical' }}
              disabled={isSubmittingTicket}
            />

            <button 
              className="btn btn-primary btn-block" 
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
        </div>
      ) : (
        <AboutSection />
      )}

      {/* ACCOUNT SETTINGS (SIGN OUT) */}
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
        <div style={{ marginTop: 'var(--space-lg)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Kaeluma v1.0 · Made with ❤️ for families
        </div>
      </div>

      {/* MODAL PIN PAD OVERLAY */}
      {showPinModal && (
        <div className="modal-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setShowPinModal(false); }}>
          <div className="modal-content" style={{ maxWidth: 340, textAlign: 'center', animation: 'scaleIn 0.3s var(--ease-bounce)' }}>
            <h3 className="modal-title" style={{ fontSize: '1.25rem', marginBottom: 12 }}>Change Parent PIN</h3>
            
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>
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
            
            {pinError && <div className="pin-error" style={{ marginBottom: 16 }}>{pinError}</div>}
            
            <button
              className="btn btn-ghost btn-block"
              onClick={() => { setShowPinModal(false); setInputPin(''); setPinError(''); setPinPhase('current'); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
