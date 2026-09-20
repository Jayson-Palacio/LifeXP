"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GoldCoin from './GoldCoin';
import { showToast } from '../lib/ui';
import { updateAppSettings } from '../app/actions/auth';

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
          background: open ? 'var(--bg-surface-alt)' : hovered ? 'rgba(28, 28, 30, 0.04)' : 'var(--bg-surface-alt)', 
          border: '1px solid var(--bg-glass-border)',
          borderColor: open ? 'rgba(168,85,247,0.3)' : hovered ? 'rgba(28, 28, 30, 0.12)' : 'var(--bg-glass-border)',
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

// â”€â”€â”€ ABOUT SECTION (GAME GUIDE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AboutSection() {
  const tierData = [
    { range: '1â€“10',   name: 'The Beginning', symbol: 'ðŸŒ±' },
    { range: '11â€“20',  name: 'The Seeker',    symbol: 'ðŸ§­' },
    { range: '21â€“30',  name: 'The Grower',    symbol: 'ðŸŒ¿' },
    { range: '31â€“40',  name: 'The Aware',     symbol: 'ðŸ‘' },
    { range: '41â€“50',  name: 'The Steady',    symbol: 'â›°' },
    { range: '51â€“60',  name: 'The Wise',      symbol: 'ðŸ•¯' },
    { range: '61â€“70',  name: 'The Chosen',    symbol: 'âœ¦' },
    { range: '71â€“80',  name: 'The Devoted',   symbol: 'ðŸŒŠ' },
    { range: '81â€“90',  name: 'The Guiding',   symbol: 'ðŸ®' },
    { range: '91â€“100', name: 'The Everlight', symbol: 'â˜€' },
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
    { name: 'âœ¦ Legendary',  level: 100, desc: 'Full rainbow prismatic spin' },
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
        <span style={{ fontSize: '2rem' }}>ðŸ“–</span>
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
            ðŸŽ® How Quests works
          </div>
          <AccordionItem icon="ðŸŒŸ" title="What is Kaeluma?" defaultOpen={true}>
            <p style={{ margin: '0 0 12px' }}>
              <strong style={{ color: 'var(--text-bright)' }}>Kaeluma</strong> turns family routines into a game kids actually want to play. 
              Parents create <strong style={{ color: 'var(--text-bright)' }}>missions</strong> (chores, routines, learning goals) 
              and set up <strong style={{ color: 'var(--text-bright)' }}>rewards</strong> as incentives. 
              Players earn <strong style={{ color: 'var(--gold)' }}>XP</strong> and <strong style={{ color: 'var(--amber)' }}>Coins</strong> for 
              completing missions, level up to unlock customization options, and spend coins to redeem real-world rewards.
            </p>
            <p style={{ margin: 0 }}>
              The goal is to build healthy habits through positive reinforcement â€” no punishments, only progress. 
              Every completed mission brings players closer to their next level, tier, and reward. ðŸš€
            </p>
          </AccordionItem>
          
          <AccordionItem icon="ðŸŽ¯" title="Missions & XP">
            <p style={{ margin: '0 0 12px' }}>
              Missions are tasks you create for your family. Each mission awards 
              <strong style={{ color: 'var(--gold)' }}> XP (Experience Points)</strong> and 
              <strong style={{ color: 'var(--amber)' }}> Coins</strong> when completed.
            </p>
            <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>ðŸ“… <strong style={{ color: 'var(--text-bright)' }}>Frequency:</strong> Daily, Weekly, Monthly, or Custom Date Range</div>
                <div>ðŸ” <strong style={{ color: 'var(--text-bright)' }}>Repeats:</strong> Set how many times per period (e.g. 3x daily)</div>
                <div>ðŸ‘¥ <strong style={{ color: 'var(--text-bright)' }}>Assignment:</strong> Assign to specific players or leave open for all</div>
                <div>ðŸ“† <strong style={{ color: 'var(--text-bright)' }}>Weekly Days:</strong> Choose specific days for weekly missions</div>
              </div>
            </div>
            <p style={{ margin: '0 0 8px' }}>
              When <strong style={{ color: 'var(--text-bright)' }}>Require Approvals</strong> is enabled (default), 
              missions show as "pending" until a parent approves them. Turn it off for auto-approve mode.
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
              ðŸ’¡ Tip: Use the Mission Inspiration Library in the Activities tab for 75+ ready-made mission ideas!
            </p>
          </AccordionItem>
          
          <AccordionItem icon={<GoldCoin />} title="Coins & Rewards">
            <p style={{ margin: '0 0 12px' }}>
              <strong style={{ color: 'var(--amber)' }}>Coins</strong> are the in-app currency players earn from completing missions. 
              They can spend coins to redeem <strong style={{ color: 'var(--text-bright)' }}>Rewards</strong> â€” real-world treats 
              that you define (screen time, ice cream, a trip to the park, etc).
            </p>
            <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reward Controls</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>ðŸ’° <strong style={{ color: 'var(--text-bright)' }}>Cost:</strong> Set how many coins each reward costs</div>
                <div>ðŸ”’ <strong style={{ color: 'var(--text-bright)' }}>Limits:</strong> Cap redemptions per day, week, month, or total</div>
                <div>ðŸ‘¥ <strong style={{ color: 'var(--text-bright)' }}>Assignment:</strong> Make rewards available to specific players</div>
                <div>âœ… <strong style={{ color: 'var(--text-bright)' }}>Fulfillment:</strong> Mark rewards as "Given" or refund coins</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
              ðŸ’¡ Tip: Parents can manually add or deduct coins from a player's profile by tapping their card on the overview.
            </p>
          </AccordionItem>
        </div>

        {/* Progression Group */}
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, paddingLeft: 4 }}>
            ðŸ“ˆ Leveling & Customization
          </div>
          <AccordionItem icon="ðŸ“ˆ" title="Leveling System (1â€“100)">
            <p style={{ margin: '0 0 12px' }}>
              Players start at <strong style={{ color: 'var(--text-bright)' }}>Level 1</strong> and can reach 
              <strong style={{ color: 'var(--text-bright)' }}> Level 100</strong>. XP requirements grow exponentially â€” 
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
              Level-ups trigger a full-screen celebration with confetti and sound effects! ðŸŽ‰
            </p>
          </AccordionItem>
          
          <AccordionItem icon="ðŸ…" title="Tiers (10 Ranks)">
            <p style={{ margin: '0 0 12px' }}>
              Every 10 levels, players enter a new <strong style={{ color: 'var(--text-bright)' }}>Tier</strong> â€” a named 
              rank that represents their journey. Reaching a new tier triggers a special ceremony!
            </p>
            <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tierData.map(t => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(28, 28, 30, 0.06)' }}>
                    <span style={{ fontSize: '1.3rem', width: 28, textAlign: 'center' }}>{t.symbol}</span>
                    <span style={{ flex: 1, fontWeight: 700, color: 'var(--text-bright)' }}>{t.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, background: 'rgba(28, 28, 30, 0.06)', padding: '2px 8px', borderRadius: '10px' }}>Lv {t.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </AccordionItem>
          
          <AccordionItem icon="ðŸŽ¨" title="Theme Colors (23 Unlockables)">
            <p style={{ margin: '0 0 12px' }}>
              Players can customize their dashboard color theme as they level up. Start with 3 basic colors and unlock 
              <strong style={{ color: 'var(--text-bright)' }}> 23 total</strong>, including neons, gradients, and 
              the animated <strong style={{ color: 'var(--gold)' }}>Everlight</strong> at Level 100.
            </p>
            <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14, maxHeight: 280, overflowY: 'auto' }}>
              {colorMilestones.map(c => (
                <div key={c.level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(28, 28, 30, 0.06)' }}>
                  <span style={{ color: 'var(--text-bright)', fontSize: '0.85rem' }}>{c.colors}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, background: 'rgba(28, 28, 30, 0.06)', padding: '2px 8px', borderRadius: '10px', flexShrink: 0, marginLeft: 8 }}>Lv {c.level}</span>
                </div>
              ))}
            </div>
          </AccordionItem>
          
          <AccordionItem icon="ðŸ’«" title="Ring Styles (10 Effects)">
            <p style={{ margin: '0 0 12px' }}>
              The avatar ring is the glowing border around your child's profile picture. 
              As they level up, more elaborate animated ring effects unlock.
            </p>
            <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              {ringData.map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(28, 28, 30, 0.06)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '0.9rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{r.desc}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, background: 'rgba(28, 28, 30, 0.06)', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>Lv {r.level}</span>
                </div>
              ))}
            </div>
          </AccordionItem>
        </div>

        {/* Streaks & Secrets Group */}
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, paddingLeft: 4 }}>
            ðŸ”¥ Streaks & Secrets
          </div>
          <AccordionItem icon="ðŸ”¥" title="Streaks">
            <p style={{ margin: '0 0 12px' }}>
              Completing at least one mission per day builds a <strong style={{ color: 'var(--text-bright)' }}>streak</strong>. 
              Streaks evolve visually as they grow, encouraging consistency:
            </p>
            <div style={{ background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: 'ðŸ”¥', range: '1â€“6 days', label: 'Flame', color: '#fb923c' },
                  { icon: 'âš¡', range: '7â€“29 days', label: 'Lightning', color: '#3b82f6' },
                  { icon: 'ðŸ’Ž', range: '30â€“99 days', label: 'Diamond', color: '#06b6d4' },
                  { icon: 'ðŸŒŒ', range: '100+ days', label: 'Cosmic', color: '#d946ef' },
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
              âš ï¸ Missing 2 consecutive days resets the streak back to 0. Keep it going!
            </p>
          </AccordionItem>
          
          <AccordionItem icon="ðŸ¥š" title="Easter Eggs">
            <p style={{ margin: 0 }}>
              Players can discover hidden surprises by tapping their avatar on the dashboard 5 times quickly. 
              Each tap triggers a random animation effect â€” glow, spin, color shift, wobble, flip, or shake. 
              There's also a special <strong style={{ color: 'var(--gold)' }}>All-Clear Celebration</strong> that 
              plays when every daily mission has been completed! ðŸŽŠ
            </p>
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}

export default function SettingsTab({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || { require_approval: true, family_name: 'Our Family' });
  const [subTab, setSubTab] = useState('preferences'); // 'preferences' | 'guide'
  const [tzSaving, setTzSaving] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [tzOffset, setTzOffset] = useState('');

  // Load timezone client-side
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const v = localStorage.getItem('kaeluma_tz_offset');
      setTzOffset(v !== null ? v : '');
    }
  }, []);

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
      showToast('Reset timezone auto-saved! â°');
      setTimeout(() => setTzSaving('idle'), 2000);
    } catch (err) {
      setTzSaving('idle');
      showToast('Failed to save timezone', 'error');
    }
  };

  return (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <p className="quests-kicker">Quests</p>
        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', fontWeight: 600, letterSpacing: '-0.035em', margin: 0 }}>Settings.</h2>
      </div>

      <div className="segment-control" style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '0 auto var(--space-xl)' }}>
        <button
          className={`segment-control-btn ${subTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setSubTab('preferences')}
        >
          Preferences
        </button>
        <button
          className={`segment-control-btn ${subTab === 'guide' ? 'active' : ''}`}
          onClick={() => setSubTab('guide')}
        >
          Game Guide
        </button>
        <div className={`segment-control-indicator ${subTab === 'preferences' ? 'pos-0' : 'pos-1'}`} />
      </div>

      {subTab === 'preferences' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Link
            href="/apps?tab=account"
            className="btn btn-ghost"
            style={{
              display: 'block',
              textAlign: 'left',
              padding: '16px 18px',
              textDecoration: 'none',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-bright)' }}>Household &amp; apps</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Family name, parent PIN, support, and which apps show after sign-in live in Apps â†’ Account.
            </div>
          </Link>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
          }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-bright)', marginBottom: 16 }}>
              Quests
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-bright)' }}>Require Approvals</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Missions must be approved before rewards unlock.
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const newVal = !settings.require_approval;
                  await updateAppSettings({ require_approval: newVal });
                  setSettings((s) => ({ ...s, require_approval: newVal }));
                  showToast(newVal ? 'Approvals required' : 'Auto-approve on');
                }}
                style={{
                  width: 50, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: settings.require_approval ? 'var(--green)' : 'var(--bg-surface-alt)',
                  position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: settings.require_approval ? 27 : 3,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label>Daily reset timezone</label>
                {tzSaving === 'saving' && <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Saving...</span>}
                {tzSaving === 'saved' && <span style={{ fontSize: '0.78rem', color: 'var(--green)' }}>Saved</span>}
              </div>
              <select
                className="input"
                value={tzOffset}
                onChange={(e) => handleSaveTz(e.target.value)}
              >
                <option value="">Use device timezone</option>
                <option value="-12">UTC-12 â€” Baker Island</option>
                <option value="-11">UTC-11 â€” American Samoa</option>
                <option value="-10">UTC-10 â€” Hawaii</option>
                <option value="-9">UTC-9 â€” Alaska</option>
                <option value="-8">UTC-8 â€” Pacific Time (US &amp; Canada)</option>
                <option value="-7">UTC-7 â€” Mountain Time (US &amp; Canada)</option>
                <option value="-6">UTC-6 â€” Central Time (US &amp; Canada)</option>
                <option value="-5">UTC-5 â€” Eastern Time (US &amp; Canada)</option>
                <option value="-4">UTC-4 â€” Atlantic Time / Venezuela</option>
                <option value="-3">UTC-3 â€” Brazil / Argentina</option>
                <option value="-2">UTC-2 â€” South Georgia</option>
                <option value="-1">UTC-1 â€” Azores</option>
                <option value="0">UTC+0 â€” London / Dublin / Lisbon</option>
                <option value="1">UTC+1 â€” Paris / Berlin / Rome / Madrid</option>
                <option value="2">UTC+2 â€” Athens / Cairo / Johannesburg</option>
                <option value="3">UTC+3 â€” Moscow / Nairobi / Riyadh</option>
                <option value="4">UTC+4 â€” Dubai / Baku</option>
                <option value="4.5">UTC+4:30 â€” Kabul</option>
                <option value="5">UTC+5 â€” Pakistan</option>
                <option value="5.5">UTC+5:30 â€” India (IST)</option>
                <option value="6">UTC+6 â€” Bangladesh / Almaty</option>
                <option value="7">UTC+7 â€” Bangkok / Jakarta</option>
                <option value="8">UTC+8 â€” Singapore / Hong Kong / Perth</option>
                <option value="9">UTC+9 â€” Tokyo / Seoul</option>
                <option value="9.5">UTC+9:30 â€” Adelaide</option>
                <option value="10">UTC+10 â€” Sydney / Melbourne</option>
                <option value="11">UTC+11 â€” Solomon Islands</option>
                <option value="12">UTC+12 â€” Auckland / Fiji</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <AboutSection />
      )}
    </div>
  );
}
