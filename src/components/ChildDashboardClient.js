"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { getLevelForXP, getXPProgress, getXPDisplay, getUnlockedColors } from '../lib/levels';
import { getStartOfDay, getStartOfWeek, getStartOfMonth, getStoredTzOffset } from '../lib/time';
import { showToast, showFloat } from '../lib/ui';
import { playRandomSuccessSound } from '../lib/sounds';
import { parseCharacter, checkCharacterUnlocks } from '../lib/character';
import TierCrest from './TierCrest';
import AvatarDisplay from './AvatarDisplay';
import CharacterDisplay from './CharacterDisplay';
import CharacterEditor from './CharacterEditor';

export default function ChildDashboardClient({ initialChild, missions, initialCompletions, rewards, initialRedemptions, requireApproval = true }) {
  const router = useRouter();
  const [child, setChild] = useState(initialChild);
  const [completions, setCompletions] = useState(initialCompletions);
  const [allRedemptions, setAllRedemptions] = useState(initialRedemptions || []);
  const pendingRedemptions = allRedemptions.filter(r => r.status === 'pending');

  // Sync state with props when data is refreshed (e.g. on window focus)
  useEffect(() => { setChild(initialChild); }, [initialChild]);
  useEffect(() => { setCompletions(initialCompletions); }, [initialCompletions]);
  useEffect(() => { setAllRedemptions(initialRedemptions || []); }, [initialRedemptions]);
  
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showCharacterEditor, setShowCharacterEditor] = useState(false);
  const [characterData, setCharacterData] = useState(() => parseCharacter(initialChild?.character));
  const [loadingMissions, setLoadingMissions] = useState({});
  const themePickerRef = useRef(null);

  const { level, tierName, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
  const xpProgress = getXPProgress(child.total_xp_earned || child.xp || 0);
  const xpDisplay = getXPDisplay(child.total_xp_earned || child.xp || 0);
  const activeTheme = child.theme || tierColor;
  const unlockedColors = getUnlockedColors(level);

  // Apply body theme class
  useEffect(() => {
    document.body.className = `theme-${activeTheme}`;
    return () => { document.body.className = ''; };
  }, [activeTheme]);

  // Close theme picker when clicking outside
  useEffect(() => {
    if (!showThemePicker) return;
    const handler = (e) => {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [showThemePicker]);

  // Listen for reward fulfillments/refunds
  useEffect(() => {
    const channel = supabase
      .channel('redemptions-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'redemptions', filter: `child_id=eq.${child.id}` }, (payload) => {
        setAllRedemptions(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
        
        if (payload.new.status !== 'pending') {
          if (payload.new.status === 'refunded') {
            const reward = rewards.find(r => r.id === payload.new.reward_id);
            if (reward) {
              showToast(`Refunded: +${reward.cost} coins!`);
              setChild(prev => ({ ...prev, coins: prev.coins + reward.cost }));
            }
          } else if (payload.new.status === 'fulfilled') {
            showToast('🎁 Your reward was delivered!');
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [child.id, rewards]);

  // ─── Mission state calculation ─────────────────────────────────
  const getMissionState = (m) => {
    const all = completions.filter(c => c.mission_id === m.id);
    const valid = all.filter(c => c.status !== 'rejected');
    const hasPending = valid.some(c => c.status === 'pending');
    const approved = valid.filter(c => c.status === 'approved').length;

    // How many they can do per period
    const maxPerPeriod = m.max_completions_per_period || 1;

    // Count completions within the current period
    const now = new Date();
    const tz = getStoredTzOffset();
    const periodStart = (() => {
      if (m.frequency === 'weekly') {
        return getStartOfWeek(tz);
      }
      if (m.frequency === 'monthly') {
        return getStartOfMonth(tz);
      }
      // daily or date_range: just today
      return getStartOfDay(tz);
    })();

    const periodDone = valid.filter(c => new Date(c.submitted_at) >= periodStart).length;
    const periodRemaining = maxPerPeriod - periodDone;

    // Not active for date_range missions outside their dates
    if (m.frequency === 'date_range' && m.start_date && m.end_date) {
      const today = now.toISOString().split('T')[0];
      if (today < m.start_date || today > m.end_date) return null;
    }

    if (m.frequency === 'weekly' && m.specific_days && m.specific_days.length > 0) {
      if (!m.specific_days.includes(now.getDay())) return null;
    }

    if (periodRemaining <= 0) {
      if (hasPending) return { ...m, status: 'pending', periodDone, maxPerPeriod, periodRemaining };
      return { ...m, status: 'done', periodDone, maxPerPeriod, periodRemaining };
    }
    const isRetry = all.some(c => c.status === 'rejected') && periodDone === 0;
    return { ...m, status: isRetry ? 'retry' : 'available', periodDone, maxPerPeriod, periodRemaining };
  };

  const missionStates = missions.filter(m => m.is_active !== false).map(getMissionState).filter(Boolean);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleSubmitMission = async (mission, e) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    setLoadingMissions(prev => ({ ...prev, [mission.id]: true }));

    if (!requireApproval) {
      // Auto-approve: credit XP and coins immediately
      const currentXp = child.total_xp_earned || child.xp || 0;
      const newXp = currentXp + mission.xp_reward;
      const newCoins = child.coins + mission.coin_reward;

      // Streak logic
      let newStreak = child.streak || 0;
      const now = new Date();
      const today = now.toDateString();
      const lastCompDate = child.last_completion_date ? new Date(child.last_completion_date) : null;
      
      if (!lastCompDate || lastCompDate.toDateString() !== today) {
         if (lastCompDate && now.getTime() - lastCompDate.getTime() > 86400000 * 2) {
             newStreak = 1;
         } else {
             newStreak += 1;
         }
      }

      const { data } = await supabase.from('completions').insert([{
        mission_id: mission.id,
        child_id: child.id,
        status: 'approved',
      }]).select().single();

      if (data) {
        await supabase.from('children').update({ xp: newXp, total_xp_earned: newXp, coins: newCoins, streak: newStreak, last_completion_date: now.toISOString() }).eq('id', child.id);
        setChild(prev => ({ ...prev, xp: newXp, total_xp_earned: newXp, coins: newCoins, streak: newStreak, last_completion_date: now.toISOString() }));
        setCompletions(prev => [...prev, data]);

        const { getLevelForXP: getLvl } = await import('../lib/levels');
        const oldLevel = getLvl(currentXp);
        const newLevel = getLvl(newXp);
        
        // Play success chime
        playRandomSuccessSound && playRandomSuccessSound();

        // Stagger animations horizontally and vertically so they don't overlap
        showFloat(`+${mission.xp_reward} XP`, 'var(--primary)', clientX - 45, clientY - 10);
        setTimeout(() => {
          showFloat(`+${mission.coin_reward} 🪙`, 'var(--amber)', clientX + 15, clientY - 10);
        }, 150);

        if (newLevel.level > oldLevel.level) {
          const { showLevelUp, showTierUp } = await import('../lib/ui');
          const { checkColorUnlocks } = await import('../lib/levels');
          if (newLevel.tierName !== oldLevel.tierName) {
            showTierUp(newLevel.level, newLevel.tierName);
          } else {
            const unlocks = checkColorUnlocks(oldLevel.level, newLevel.level);
            showLevelUp(newLevel.level, newLevel.tierName, unlocks.length > 0 ? unlocks[0] : null);
          }
        }
        showToast('Mission complete! ⭐ Rewards added!');
      }
    } else {
      // Require approval path: just insert as pending
      const { data } = await supabase.from('completions').insert([{
        mission_id: mission.id,
        child_id: child.id,
        status: 'pending',
      }]).select().single();
      
      if (data) {
        setCompletions(prev => [...prev, data]);
        showToast('Done! ⏳ Waiting for parent approval');
      }
    }
    
    setLoadingMissions(prev => ({ ...prev, [mission.id]: false }));
  };

  const handleRedeem = async (r, e) => {
    e.target.disabled = true;
    e.target.textContent = '...';

    if (child.coins < r.cost) {
      e.target.disabled = false;
      e.target.textContent = 'Need coins';
      return showToast('Not enough coins!', 'error');
    }

    try {
      const { data: rawExisting } = await supabase.from('redemptions').select('redeemed_at, status').eq('reward_id', r.id).eq('child_id', child.id);
      const existing = (rawExisting || []).filter(x => x.status !== 'refunded');
      
      const now = new Date();
      const tz = getStoredTzOffset();
      const startOfDay   = getStartOfDay(tz);
      const startOfWeek  = getStartOfWeek(tz);
      const startOfMonth = getStartOfMonth(tz);
      const countSince = (since) => existing.filter(x => new Date(x.redeemed_at) >= since).length;

      if (r.max_total_redemptions && existing.length >= r.max_total_redemptions) {
        e.target.disabled = false; e.target.textContent = 'Limit';
        return showToast(`🔒 Total limit reached for "${r.name}"`, 'error');
      }
      if (r.max_daily_redemptions && countSince(startOfDay) >= r.max_daily_redemptions) {
        e.target.disabled = false; e.target.textContent = 'Daily limit';
        return showToast(`⏰ Daily limit for "${r.name}"`, 'error');
      }
      if (r.max_weekly_redemptions && countSince(startOfWeek) >= r.max_weekly_redemptions) {
        e.target.disabled = false; e.target.textContent = 'Weekly limit';
        return showToast(`📆 Weekly limit for "${r.name}"`, 'error');
      }
      if (r.max_monthly_redemptions && countSince(startOfMonth) >= r.max_monthly_redemptions) {
        e.target.disabled = false; e.target.textContent = 'Monthly limit';
        return showToast(`🗓️ Monthly limit for "${r.name}"`, 'error');
      }

      const newCoins = child.coins - r.cost;
      const { data: inserted } = await supabase.from('redemptions').insert([{ reward_id: r.id, child_id: child.id, status: 'pending' }]).select().single();
      if (inserted) {
        setAllRedemptions(prev => [inserted, ...prev]);
      }
      await supabase.from('children').update({ coins: newCoins }).eq('id', child.id);
      setChild({ ...child, coins: newCoins });
      const rect = e.target.getBoundingClientRect();
      showFloat(`-${r.cost} 🪙`, '#f59e0b', rect.left + rect.width / 2, rect.top);
      showToast(`🎉 Redeemed: ${r.name}!`);
    } catch (err) {
      showToast('Error redeeming', 'error');
    } finally {
      e.target.disabled = false;
      e.target.textContent = 'Redeem!';
    }
  };

  const handleChangeTheme = async (t) => {
    await supabase.from('children').update({ theme: t.id }).eq('id', child.id);
    setChild({ ...child, theme: t.id });
    setShowThemePicker(false);
    showToast(`🎨 ${t.name}`);
  };

  const handleSaveCharacter = async (newCharData) => {
    const json = JSON.stringify(newCharData);
    await supabase.from('children').update({ character: json }).eq('id', child.id);
    setCharacterData(newCharData);
    setChild(prev => ({ ...prev, character: json }));
    if (!characterData) showToast('🎮 Hero created! Welcome to the adventure!');
    else showToast('✅ Hero updated!');
  };

  const activeColor = unlockedColors.find(c => c.id === activeTheme);

  const getThemeBackground = (hex) => {
    if (!hex) return 'var(--primary)';
    if (hex === 'animated') return 'linear-gradient(135deg, #facc15, #a855f7, #06b6d4)';
    if (hex === 'gradient-sunset') return 'linear-gradient(135deg, #f97316 50%, #db2777 50%)';
    if (hex === 'gradient-midnight') return 'linear-gradient(135deg, #1e1b4b 50%, #4338ca 50%)';
    if (hex === 'gradient-galactic') return 'linear-gradient(135deg, #312e81, #9d174d)';
    if (hex === 'gradient-magma') return 'linear-gradient(135deg, #b91c1c, #ea580c, #facc15)';
    if (hex === 'gradient-rainbow') return 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
    return hex;
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className={`theme-${activeTheme}`} style={{ minHeight: '100dvh', overflowY: 'auto', paddingBottom: 40, position: 'relative' }}>
      <div className="kaeluma-bg" style={{ opacity: 0.12, position: 'fixed', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── TOP NAV ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(var(--bg-deep-rgb, 10,8,20),0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--bg-glass-border)',
      }}>
        {/* Left Side: Theme Circle Button */}
        <div ref={themePickerRef} style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => setShowThemePicker(v => !v)}
            title="Change Theme"
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--primary)',
              background: getThemeBackground(activeColor?.hex),
              boxShadow: 'var(--glow-primary)',
              cursor: 'pointer', flexShrink: 0,
            }}
          />

          {/* Theme Picker Dropdown */}
          {showThemePicker && (
            <div style={{
              position: 'absolute', top: 44, left: 0,
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              zIndex: 200,
              minWidth: 180,
              animation: 'slideUp 0.15s ease-out',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Your Themes
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {unlockedColors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleChangeTheme(c)}
                    title={c.name}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', border: activeTheme === c.id ? '3px solid #fff' : '2px solid transparent',
                      background: getThemeBackground(c.hex),
                      boxShadow: activeTheme === c.id ? `0 0 8px ${c.hex.startsWith('gradient-') || c.hex === 'animated' ? '#fff' : c.hex}` : 'none',
                      cursor: 'pointer', transition: 'transform 0.12s',
                    }}
                  />
                ))}
              </div>
              {unlockedColors.length < 8 && (
                <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  🔒 Level up to unlock more
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Title (Removed as requested to reduce clutter since it's under the profile picture) */}
        <div style={{ flex: '0 1 auto' }}></div>

        {/* Right Side: Home Button */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="cool-home-btn"
            onClick={() => router.push('/')}
          >
            🏠 <span>Home</span>
          </button>
        </div>
      </div>

      {/* ── UNIFIED HERO PANEL ── */}
      <div className="hero-banner" style={{ paddingBottom: 0 }}>
        {/* Ambient glow handled by ::before in CSS */}

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          padding: '0 4px',
        }}>

          {/* LEFT: Avatar + name + tier */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', minWidth: 80 }}>
            {/* Avatar ring */}
            <div className="hero-avatar-ring" style={{ width: 80, height: 80, marginBottom: 8 }}>
              <div className="hero-avatar-img">
                <AvatarDisplay avatarString={child.avatar} size="100%" />
              </div>
              <div className="hero-tier-badge" style={{ fontSize: '0.6rem', padding: '2px 8px', bottom: -8 }}>
                <div className="hero-tier-badge-icon"><TierCrest tierName={tierName} glowColor="var(--primary)" /></div>
                <span>{tierName}</span>
              </div>
            </div>
            <h2 className="hero-name" style={{ fontSize: '1.2rem', marginTop: 14, marginBottom: 2 }}>{child.name}</h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, opacity: 0.85 }}>Level {level}</div>
          </div>

          {/* CENTER: RPG stat pills */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 4 }}>
            {/* Coins */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 'var(--radius-full)', padding: '6px 14px',
            }}>
              <span style={{ fontSize: '1rem' }}>🪙</span>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>{child.coins}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1, marginTop: 2 }}>Coins</div>
              </div>
            </div>
            {/* Streak */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)',
              border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: 'var(--radius-full)', padding: '6px 14px',
            }}>
              <span style={{ fontSize: '1rem' }}>🔥</span>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fb923c', lineHeight: 1 }}>{child.streak || 0}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1, marginTop: 2 }}>Day Streak</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Pixel character */}
          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 4 }}>
            {characterData ? (
              <div
                onClick={() => setShowCharacterEditor(true)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Edit hero"
              >
                <CharacterDisplay characterData={characterData} size={90} animated />
                <div style={{
                  position: 'absolute', bottom: -4, right: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--primary)', border: '2px solid var(--bg-deep)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem',
                }}>✏️</div>
              </div>
            ) : (
              <button
                onClick={() => setShowCharacterEditor(true)}
                style={{
                  width: 80, height: 100,
                  border: '2px dashed rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700,
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>🎮</span>
                Build Hero
              </button>
            )}
          </div>
        </div>

        {/* XP bar — full width below the split panel */}
        <div style={{ padding: '20px 4px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span style={{ fontWeight: 700 }}>Next: Lv {level + 1}</span>
            <span>{xpDisplay}</span>
          </div>
          <div style={{ width: '100%', height: 8, background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}>
            <div style={{
              height: '100%',
              width: `${Math.round(xpProgress * 100)}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--primary-light, var(--primary)))',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.8s ease-out',
              boxShadow: '0 0 8px var(--primary)',
            }} />
          </div>
        </div>
      </div>

      {/* ── MISSIONS ── */}
      <div style={{ padding: '0 16px', marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 14, letterSpacing: '-0.01em' }}>
          🎯 Today's Missions
        </h3>

        {missionStates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🌟</div>
            <p className="empty-state-text">All done — you're amazing!</p>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {missionStates.map(m => {
              const hasProgress = m.maxPerPeriod > 1;
              return (
                  <div key={m.id} className={`mission-card ${m.status === 'pending' ? 'pending' : ''}`} style={{ padding: '14px 16px', marginBottom: 10 }}>
                    {/* Mission icon: photo or emoji */}
                    <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '2rem' }}>
                      {m.image
                        ? <img src={m.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : m.icon
                      }
                    </div>

                    <div className="mission-info" style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
                      <div className="mission-name" style={{ fontSize: '1.05rem', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                      <div className="mission-rewards">
                        <span className="badge badge-gold" style={{ fontSize: '0.82rem' }}>⭐ {m.xp_reward} XP</span>
                        <span className="badge badge-amber" style={{ fontSize: '0.82rem' }}>🪙 {m.coin_reward}</span>
                      </div>
                    </div>

                    <div className="mission-actions" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      {(m.status === 'available' || m.status === 'retry') ? (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '12px 18px', fontSize: '1.05rem', minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}
                          onClick={(e) => handleSubmitMission(m, e)}
                          disabled={loadingMissions[m.id]}
                        >
                          {loadingMissions[m.id] ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                          ) : (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>{m.status === 'retry' ? 'Retry ↻' : 'Done! ✓'}</span>
                              </div>
                              {hasProgress && <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600 }}>{m.periodDone}/{m.maxPerPeriod}×</span>}
                            </>
                          )}
                        </button>
                      ) : m.status === 'pending' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)', border: '1px solid var(--amber-dim)', color: 'var(--amber)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.95rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>Waiting</span>
                          </div>
                          {hasProgress && <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600 }}>{m.periodDone}/{m.maxPerPeriod}×</span>}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', color: 'var(--green)', animation: 'scaleIn 0.3s ease-out', boxShadow: '0 0 12px rgba(34, 197, 94, 0.1)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.95rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span>Done</span>
                          </div>
                          {hasProgress && <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600 }}>{m.periodDone}/{m.maxPerPeriod}×</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {/* ── PENDING DELIVERIES ── */}
      {pendingRedemptions.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.01em', color: 'var(--amber)' }}>
            🚚 Pending Deliveries
          </h3>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {pendingRedemptions.map(red => {
               const reward = rewards.find(r => r.id === red.reward_id);
               if (!reward) return null;
               return (
                 <div key={red.id} style={{ flexShrink: 0, width: 140, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--amber-dim)', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                   <div style={{ width: 48, height: 48, margin: '0 auto 8px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '2rem' }}>
                     {reward.image
                       ? <img src={reward.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       : (reward.icon || '🎁')
                     }
                   </div>
                   <div style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reward.name}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Waiting for parent</div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {/* ── REWARD SHOP ── */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.01em' }}>🛒 Reward Shop</h3>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--amber)' }}>
            🪙 {child.coins}
          </div>
        </div>

        {(() => {
          const childRewards = rewards.filter(r => r.is_active !== false && (!r.assigned_to || r.assigned_to.length === 0 || r.assigned_to.includes(child.id)));
          
          if (childRewards.length === 0) {
            return (
              <div className="empty-state">
                <div className="empty-state-emoji">🛒</div>
                <p className="empty-state-text">No rewards set up yet.</p>
              </div>
            );
          }

          return (
            <div className="reward-grid">
              {childRewards.map(r => {
                const now = new Date();
                const tz = getStoredTzOffset();
                const startOfDay   = getStartOfDay(tz);
                const startOfWeek  = getStartOfWeek(tz);
                const startOfMonth = getStartOfMonth(tz);

                const validRedemptions = allRedemptions.filter(x => x.reward_id === r.id && x.status !== 'refunded');
                const countSince = (since) => validRedemptions.filter(x => new Date(x.redeemed_at) >= since).length;
                const totalCount = validRedemptions.length;
                
                const dailyCount = countSince(startOfDay);
                const weeklyCount = countSince(startOfWeek);
                const monthlyCount = countSince(startOfMonth);

                let limitHit = false;
                let limitText = null;

                if (r.max_daily_redemptions) { limitText = `Daily: ${dailyCount}/${r.max_daily_redemptions}`; if (dailyCount >= r.max_daily_redemptions) limitHit = true; }
                else if (r.max_weekly_redemptions) { limitText = `Weekly: ${weeklyCount}/${r.max_weekly_redemptions}`; if (weeklyCount >= r.max_weekly_redemptions) limitHit = true; }
                else if (r.max_monthly_redemptions) { limitText = `Monthly: ${monthlyCount}/${r.max_monthly_redemptions}`; if (monthlyCount >= r.max_monthly_redemptions) limitHit = true; }
                else if (r.max_total_redemptions) { limitText = `Total: ${totalCount}/${r.max_total_redemptions}`; if (totalCount >= r.max_total_redemptions) limitHit = true; }

                const canAfford = child.coins >= r.cost;
                const canProceed = canAfford && !limitHit;

                return (
                  <div key={r.id} className="reward-card" style={{ padding: 'var(--space-lg)', border: `2px solid ${canProceed ? 'var(--primary)' : 'var(--bg-glass-border)'}`, opacity: canProceed ? 1 : 0.6 }}>
                    <div className="reward-icon" style={{ width: 64, height: 64, margin: '0 auto 12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '2.8rem' }}>
                      {r.image
                        ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (r.icon || '🎁')
                      }
                    </div>
                    
                    {limitText && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: limitHit ? 'var(--red)' : 'var(--text-muted)', marginBottom: 4 }}>
                        {limitHit && '🚫 '} {limitText}
                      </div>
                    )}

                    <div className="reward-name" style={{ fontSize: '1rem', marginTop: 4 }}>{r.name}</div>
                    <div className="reward-cost" style={{ fontSize: '1rem', margin: '8px 0' }}>🪙 {r.cost}</div>
                    <button
                      className={`btn ${canProceed ? 'btn-primary' : 'btn-ghost'} btn-block`}
                      style={{ padding: '10px' }}
                      disabled={!canProceed}
                      onClick={(e) => handleRedeem(r, e)}
                    >
                      {limitHit ? 'Limit Reached' : canAfford ? 'Redeem!' : 'Need coins'}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
      </div>

      {/* Character Editor Modal */}
      {showCharacterEditor && (
        <CharacterEditor
          characterData={characterData}
          onSave={handleSaveCharacter}
          onClose={() => setShowCharacterEditor(false)}
          level={level}
        />
      )}
    </div>
  );
}
