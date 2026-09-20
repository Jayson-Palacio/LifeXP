"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QuestsTopBar from './QuestsTopBar';
import { supabase } from '../lib/supabase';
import { getLevelForXP, getXPProgress, getXPDisplay, getUnlockedColors, checkColorUnlocks } from '../lib/levels';
import { getStartOfDay, getStartOfWeek, getStartOfMonth, getStoredTzOffset, localYmd } from '../lib/time';
import { showToast, showFloat, showLevelUp, showTierUp } from '../lib/ui';
import { playRandomSuccessSound, playKaChing, playPop, playClick } from '../lib/sounds';
import AvatarDisplay from './AvatarDisplay';
import GoldCoin from './GoldCoin';
import QuestsTodayRing from './QuestsTodayRing';
import { getStreakIcon, getStreakStyles } from '../lib/streaks';
import { redeemReward, submitMission, undoMission, updateAppearance } from '../app/actions/game';
import { readQuestsLocal, saveQuestsLocal } from '../lib/questsLocal';

export default function ChildDashboardClient({ initialChild, missions, initialCompletions, rewards, initialRedemptions, requireApproval = true, familyName }) {
  const router = useRouter();
  const boot = readQuestsLocal(`kid:${initialChild.id}`);
  const [child, setChild] = useState(boot?.child ?? initialChild);
  const [completions, setCompletions] = useState(boot?.completions ?? initialCompletions);
  const [allRedemptions, setAllRedemptions] = useState(boot?.redemptions ?? (initialRedemptions || []));
  const pendingRedemptions = allRedemptions.filter(r => r.status === 'pending');
  const lastMutatedAt = useRef(boot?.at || 0);
  const skipStaleRefresh = () => Date.now() - lastMutatedAt.current < 2500;

  const persistKid = (nextChild, nextCompletions, nextRedemptions) => {
    lastMutatedAt.current = Date.now();
    saveQuestsLocal(`kid:${initialChild.id}`, {
      child: nextChild,
      completions: nextCompletions,
      redemptions: nextRedemptions,
    });
  };

  // Sync from the server, but don't clobber a tap that just landed.
  useEffect(() => { if (!skipStaleRefresh()) setChild(initialChild); }, [initialChild]);
  useEffect(() => { if (!skipStaleRefresh()) setCompletions(initialCompletions); }, [initialCompletions]);
  useEffect(() => { if (!skipStaleRefresh()) setAllRedemptions(initialRedemptions || []); }, [initialRedemptions]);
 
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePickerRef = useRef(null);

  // Gamification & Polish States
  const [avatarTaps, setAvatarTaps] = useState(0);
  const [easterEggAnim, setEasterEggAnim] = useState('');
  const [isShakingCoins, setIsShakingCoins] = useState(false);
  const [showAllClearCelebration, setShowAllClearCelebration] = useState(false);
  const prevAllClearedRef = useRef(null);
  const justLeveledUpRef = useRef(false);
  const inFlightMissions = useRef(new Set());
  const inFlightRedeem = useRef(new Set());

  // Reset avatar taps if idle
  useEffect(() => {
    if (avatarTaps > 0 && avatarTaps < 5) {
      const timer = setTimeout(() => setAvatarTaps(0), 1000);
      return () => clearTimeout(timer);
    }
  }, [avatarTaps]);

  // Streak helpers imported from lib/streaks

  const handleAvatarTap = () => {
    if (playPop) playPop();
    setAvatarTaps(prev => {
      const next = prev + 1;
      if (next === 5) {
        const anims = ['egg-glow', 'egg-spin', 'egg-hue', 'egg-wobble', 'egg-flip', 'egg-shake'];
        const randomAnim = anims[Math.floor(Math.random() * anims.length)];
        setEasterEggAnim(randomAnim);
        setTimeout(() => setEasterEggAnim(''), 2000);
        return 0;
      }
      return next;
    });
  };

  const handleCoinTap = () => {
    if (playPop) playPop();
    setIsShakingCoins(true);
    setTimeout(() => setIsShakingCoins(false), 500);
  };

  const { level, tierName, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
  const xpProgress = getXPProgress(child.total_xp_earned || child.xp || 0);
  const xpDisplay = getXPDisplay(child.total_xp_earned || child.xp || 0);
  const activeTheme    = child.theme || tierColor;
  const unlockedColors = getUnlockedColors(level);

  const [tzOffset, setTzOffset] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setTzOffset(getStoredTzOffset());
    setHydrated(true);
  }, []);

  // Apply active theme class without wiping other body classes
  useEffect(() => {
    const cls = `theme-${activeTheme}`;
    document.body.classList.add(cls);
    return () => { document.body.classList.remove(cls); };
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
    const maxPerPeriod = m.max_completions_per_period || 1;
    // Server is UTC; the browser is local. Date windows must wait until mount
    // or today's list/ring hydrate as the wrong calendar day.
    if (!hydrated) {
      return { ...m, status: 'available', periodDone: 0, maxPerPeriod, periodRemaining: maxPerPeriod };
    }

    const all = completions.filter(c => c.mission_id === m.id);
    const valid = all.filter(c => c.status !== 'rejected');
    const hasPending = valid.some(c => c.status === 'pending');

    // Count completions within the current period
    const now = new Date();
    const tz = tzOffset;
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
      const today = localYmd(now);
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

  const missionStates = missions
    .filter(m => m.is_active !== false)
    .map(getMissionState)
    .filter(Boolean)
    .sort((a, b) => {
      const order = { available: 0, retry: 1, pending: 2, done: 3 };
      return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    });

  const todaySlot = (m) => (!m.frequency || m.frequency === 'daily' || m.frequency === 'date_range') ? (m.maxPerPeriod || 1) : 1;
  const todayTotal = hydrated ? missionStates.reduce((n, m) => n + todaySlot(m), 0) : 0;
  const todayDone = missionStates.reduce((n, m) => {
    const cap = todaySlot(m);
    const done = cap === (m.maxPerPeriod || 1)
      ? Math.min(m.periodDone || 0, cap)
      : (m.status === 'done' || m.status === 'pending' ? 1 : 0);
    return n + done;
  }, 0);
  const todayLeft = Math.max(0, todayTotal - todayDone);
  const assignedMissions = missions.filter(m => m.is_active !== false);

  const allCleared = missionStates.length > 0 && missionStates.every(m => m.status === 'done' || m.status === 'pending');

  useEffect(() => {
    if (!hydrated) return;
    // initialize on first run without triggering celebration
    if (prevAllClearedRef.current === null) {
      prevAllClearedRef.current = allCleared;
      return;
    }
    
    if (allCleared && !prevAllClearedRef.current) {
      if (!justLeveledUpRef.current) {
        setShowAllClearCelebration(true);
        if (playRandomSuccessSound) playRandomSuccessSound();
        setTimeout(() => setShowAllClearCelebration(false), 1600);
      }
    }
    prevAllClearedRef.current = allCleared;
    
    // Reset the level-up flag after a cycle
    if (justLeveledUpRef.current) {
      setTimeout(() => { justLeveledUpRef.current = false; }, 100);
    }
  }, [allCleared, hydrated]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleSubmitMission = async (mission, e) => {
    if (inFlightMissions.current.has(mission.id)) return;
    inFlightMissions.current.add(mission.id);

    const clientX = e.clientX;
    const clientY = e.clientY;
    const tempId = `opt-${mission.id}-${Date.now()}`;
    const nextStatus = requireApproval ? 'pending' : 'approved';
    const prevChild = child;
    const prevCompletions = completions;
    const tempRow = {
      id: tempId,
      mission_id: mission.id,
      child_id: child.id,
      status: nextStatus,
      submitted_at: new Date().toISOString(),
    };
    const nextCompletions = [...completions, tempRow];
    const nextChild = nextStatus === 'approved' ? {
      ...child,
      coins: (child.coins || 0) + (mission.coin_reward || 0),
      xp: (child.xp || 0) + (mission.xp_reward || 0),
      total_xp_earned: (child.total_xp_earned || child.xp || 0) + (mission.xp_reward || 0),
    } : child;

    setCompletions(nextCompletions);
    if (nextStatus === 'approved') setChild(nextChild);
    persistKid(nextChild, nextCompletions, allRedemptions);

    if (nextStatus === 'approved') {
      showFloat(`+${mission.xp_reward} XP`, 'var(--primary)', clientX - 45, clientY - 10);
      setTimeout(() => showFloat(`+${mission.coin_reward} 🪙`, 'var(--amber)', clientX + 15, clientY - 10), 120);
    } else {
      showFloat('Sent!', 'var(--primary)', clientX - 20, clientY - 12);
    }

    if (playRandomSuccessSound) playRandomSuccessSound();

    try {
      const result = await submitMission(child.id, mission.id);
      if (!result.success) {
        setCompletions(prevCompletions);
        setChild(prevChild);
        persistKid(prevChild, prevCompletions, allRedemptions);
        showToast(result.error || 'Could not save that mission.', 'error');
        return;
      }

      const payload = result.data?.completion ? result.data : (result.data?.data || result.data || {});
      const completion = payload.completion;
      const updatedChild = payload.child;
      const finalCompletions = completion
        ? [...nextCompletions.filter(c => c.id !== tempId), completion]
        : nextCompletions;
      const finalChild = updatedChild || nextChild;
      setCompletions(finalCompletions);
      if (updatedChild) setChild(updatedChild);
      persistKid(finalChild, finalCompletions, allRedemptions);

      if (completion?.status === 'approved') {
        const currentXp = prevChild.total_xp_earned || prevChild.xp || 0;
        const newXp = updatedChild?.total_xp_earned || updatedChild?.xp || currentXp;
        const oldLevel = getLevelForXP(currentXp);
        const newLevel = getLevelForXP(newXp);
        if (newLevel.level > oldLevel.level) {
          justLeveledUpRef.current = true;
          if (newLevel.tierName !== oldLevel.tierName) showTierUp(newLevel.level, newLevel.tierName);
          else showLevelUp(newLevel.level, newLevel.tierName, checkColorUnlocks(oldLevel.level, newLevel.level)[0] || null);
        }
      }
    } finally {
      inFlightMissions.current.delete(mission.id);
    }
  };

  const handleUndoMission = async (mission, e) => {
    if (e) e.stopPropagation();
    const pendingComp = completions.find(c => c.mission_id === mission.id && c.status === 'pending');
    if (!pendingComp || String(pendingComp.id).startsWith('opt-')) return;

    const prevCompletions = completions;
    const nextCompletions = completions.filter(c => c.id !== pendingComp.id);
    persistKid(child, nextCompletions, allRedemptions);
    setCompletions(nextCompletions);
    try {
      const result = await undoMission(pendingComp.id);
      if (!result.success) {
        setCompletions(prevCompletions);
        persistKid(child, prevCompletions, allRedemptions);
        showToast('Error undoing mission: ' + result.error, 'error');
      }
    } catch {
      setCompletions(prevCompletions);
      persistKid(child, prevCompletions, allRedemptions);
    }
  };

  const handleRedeem = async (r, e) => {
    if (inFlightRedeem.current.has(r.id)) return;
    inFlightRedeem.current.add(r.id);
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const prevChild = child;
    const prevReds = allRedemptions;
    const tempId = `opt-r-${r.id}-${Date.now()}`;
    const nextReds = [{
      id: tempId,
      reward_id: r.id,
      child_id: child.id,
      status: 'pending',
      redeemed_at: new Date().toISOString(),
    }, ...allRedemptions];
    const nextChild = { ...child, coins: Math.max(0, (child.coins || 0) - (r.cost || 0)) };
    persistKid(nextChild, completions, nextReds);
    setAllRedemptions(nextReds);
    setChild(nextChild);
    if (playKaChing) playKaChing();
    showFloat(`-${r.cost} 🪙`, '#f59e0b', rect.left + rect.width / 2, rect.top);

    try {
      const result = await redeemReward(child.id, r.id);
      if (!result.success) {
        setAllRedemptions(prevReds);
        setChild(prevChild);
        persistKid(prevChild, completions, prevReds);
        showToast(result.error || 'Unable to redeem this reward.', 'error');
        return;
      }
      const payload = result.data?.redemption ? result.data : (result.data?.data || result.data || {});
      const redemption = payload.redemption;
      const finalReds = redemption
        ? [redemption, ...nextReds.filter(x => x.id !== tempId)]
        : nextReds;
      const finalChild = payload.child || nextChild;
      setAllRedemptions(finalReds);
      if (payload.child) setChild(payload.child);
      persistKid(finalChild, completions, finalReds);
    } finally {
      inFlightRedeem.current.delete(r.id);
    }
  };

  const handleChangeTheme = async (t) => {
    const result = await updateAppearance(child.id, 'theme', t.id);
    if (!result.success) return showToast('Error changing theme: ' + result.error, 'error');
    try { localStorage.setItem('kaeluma_kid_theme', t.id); } catch {}
    setChild(prev => ({ ...prev, theme: t.id }));
    setShowThemePicker(false);
    showToast(`🎨 ${t.name}`);
  };

  const activeColor = unlockedColors.find(c => c.id === activeTheme);

  const getThemeBackground = (hex) => {
    if (!hex) return 'var(--primary)';
    if (hex === 'animated') return 'linear-gradient(135deg, #facc15, #a855f7, #06b6d4)';
    if (hex === 'gradient-sunset') return 'linear-gradient(135deg, #f97316 50%, #db2777 50%)';
    if (hex === 'gradient-midnight') return 'linear-gradient(135deg, #1e1b4b 50%, #4338ca 50%)';
    if (hex === 'gradient-galactic') return 'linear-gradient(135deg, #312e81, #9d174d)';
    if (hex === 'gradient-magma') return 'linear-gradient(135deg, #b91c1c, #ea580c, #facc15)';
    if (hex === 'gradient-rainbow') return 'linear-gradient(135deg, #FF6B6B, #F6E58D, #B8E994, #82CCDD, #D980FA)';
    return hex;
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className={`quests-app theme-${activeTheme}`} style={{ minHeight: '100dvh', overflowY: 'auto', paddingBottom: 40, position: 'relative' }}>
      <div className="kaeluma-bg" style={{ position: 'fixed', zIndex: 0 }} />
      <QuestsTopBar
        right={(
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div ref={themePickerRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    if (playClick) playClick();
                    setShowThemePicker(v => !v);
                  }}
                  title="Change Theme"
                  style={{
                    width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--primary)',
                    background: getThemeBackground(activeColor?.hex),
                    boxShadow: 'none',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                />
                {showThemePicker && (
                  <div style={{
                    position: 'absolute', top: 44, right: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--bg-glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 12,
                    boxShadow: '0 12px 40px rgba(28, 28, 30, 0.12)',
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
                          onClick={() => {
                            if (playPop) playPop();
                            handleChangeTheme(c);
                          }}
                          title={c.name}
                          style={{
                            width: 32, height: 32, borderRadius: '50%', border: activeTheme === c.id ? '3px solid #1c1c1e' : '2px solid transparent',
                            background: getThemeBackground(c.hex),
                            boxShadow: activeTheme === c.id ? `0 0 8px ${c.hex}` : 'none',
                            cursor: 'pointer', transition: 'transform 0.12s',
                          }}
                        />
                      ))}
                    </div>
                    {unlockedColors.length < 12 && (
                      <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        🔒 Level up to unlock more
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                className="cool-home-btn"
                title={`Return to ${familyName || 'Family'} Dashboard`}
                onClick={() => {
                  router.push('/dashboard');
                  if (playPop) playPop();
                }}
              >
                🏠 <span style={{ maxWidth: 90, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{familyName || 'Home'}</span>
              </button>
            </div>
          </>
        )}
      />

      <div className="page-enter" style={{ position: 'relative', zIndex: 1, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>

      {/* ── UNIFIED HERO PANEL ── */}
      <div className="hero-banner" style={{ paddingBottom: 0, marginTop: -10 }}>
        <div
          className="quests-hero-panel"
          data-cleared={allCleared ? 'true' : undefined}
          style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 20px 0',
        }}>

          {/* Avatar — centered */}
          <div className={`hero-avatar-ring ${easterEggAnim}`} style={{ width: 96, height: 96, margin: '0 0 14px', cursor: 'pointer', transition: 'all 1s ease-in-out' }} onClick={handleAvatarTap}>
            <div className="hero-avatar-img">
              <AvatarDisplay avatarString={child.avatar} size="100%" />
            </div>
          </div>

          {/* Name + Level + Tier */}
          <h2 style={{ fontSize: '1.55rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-bright)', lineHeight: 1, textAlign: 'center' }}>{child.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.03em' }}>Lv {level}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{tierName}</span>
          </div>

          {/* Stat pills — centered row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div className={isShakingCoins ? 'shake-coin' : ''} onClick={handleCoinTap} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(251,191,36,0.12)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(251,191,36,0.25)', transition: 'transform 0.1s' }}>
              <GoldCoin size="0.95rem" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--gold)' }}>{child.coins}</span>
            </div>
            
            {/* Evolving Streak */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 'var(--radius-full)', ...getStreakStyles(child.streak || 0) }}>
              <span style={{ fontSize: '0.9rem' }}>{getStreakIcon(child.streak || 0)}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>{child.streak || 0}</span>
            </div>
          </div>

          {todayTotal > 0 && (
            <div className="quests-today-row">
              <QuestsTodayRing done={todayDone} total={todayTotal} size={76} />
              <div className="quests-today-copy">
                <strong>{allCleared ? 'All clear' : 'Today'}</strong>
                <span>
                  {allCleared
                    ? "You're amazing!"
                    : todayLeft === 1
                      ? 'One more!'
                      : `${todayLeft} left`}
                </span>
              </div>
            </div>
          )}

          {/* XP bar — full width, below stats */}
          <div style={{ width: '100%', padding: '18px 0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>{level < 100 ? `Next: Lv ${level + 1}` : '✨ MAX LEVEL'}</span>
              <span>{level < 100 ? xpDisplay : ''}</span>
            </div>
            <div style={{ width: '100%', height: 8, background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.round(xpProgress * 100)}%`,
                background: 'var(--primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.8s ease-out',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MISSIONS ── */}
      <div style={{ padding: '0 16px', marginTop: 24, marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.01em' }}>
          🎯 Today's Missions
          {todayTotal > 0 && (
            <span style={{ marginLeft: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {todayDone}/{todayTotal}
            </span>
          )}
        </h3>

        {assignedMissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🎯</div>
            <p className="empty-state-text">No missions yet. A parent can add some.</p>
          </div>
        ) : !hydrated ? (
          <div style={{ marginBottom: 24 }}>
            {assignedMissions.map((m) => (
              <div key={m.id} className="mission-card" style={{ padding: '14px 16px', marginBottom: 10, minHeight: 80 }} />
            ))}
          </div>
        ) : missionStates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🌙</div>
            <p className="empty-state-text">Nothing due today. Enjoy the break!</p>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {missionStates.map(m => {
              const hasProgress = m.maxPerPeriod > 1;
              return (
                  <div key={m.id} className={`mission-card ${m.status === 'pending' ? 'pending' : ''}`} style={{ padding: '14px 16px', marginBottom: 10, position: 'relative' }}>
                    
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
                        <span className="badge badge-amber" style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}><GoldCoin size="0.82rem" /> {m.coin_reward}</span>
                      </div>
                    </div>

                    <div className="mission-actions" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      {(m.status === 'available' || m.status === 'retry') ? (
                        <button
                          className="btn btn-primary quests-done-btn"
                          style={{ padding: '12px 18px', fontSize: '1.05rem', minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}
                          onClick={(e) => handleSubmitMission(m, e)}
                        >
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>{m.status === 'retry' ? 'Retry ↻' : 'Done! ✓'}</span>
                            </div>
                            {hasProgress && <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600 }}>{m.periodDone}/{m.maxPerPeriod}×</span>}
                          </>
                        </button>
                      ) : m.status === 'pending' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)', border: '1px solid var(--amber-dim)', color: 'var(--amber)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.95rem' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              <span>Waiting</span>
                            </div>
                            {hasProgress && <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600 }}>{m.periodDone}/{m.maxPerPeriod}×</span>}
                          </div>
                          <button 
                            onClick={(e) => handleUndoMission(m, e)} 
                            disabled={String(completions.find(c => c.mission_id === m.id && c.status === 'pending')?.id || '').startsWith('opt-')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: '10px 8px', minHeight: 44, opacity: String(completions.find(c => c.mission_id === m.id && c.status === 'pending')?.id || '').startsWith('opt-') ? 0.4 : 1 }}
                          >
                            Undo
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.22)', color: 'var(--green)', animation: 'scaleIn 0.22s ease-out' }}>
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
                 <div key={red.id} style={{ flexShrink: 0, width: 140, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--amber-dim)', textAlign: 'center', boxShadow: '0 4px 16px rgba(28,28,30,0.06)' }}>
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
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <GoldCoin size="0.9rem" /> {child.coins}
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
                const tz = tzOffset;
                const startOfDay   = getStartOfDay(tz);
                const startOfWeek  = getStartOfWeek(tz);
                const startOfMonth = getStartOfMonth(tz);

                const validRedemptions = allRedemptions.filter(x => x.reward_id === r.id && x.status !== 'refunded');
                const countSince = (since) => validRedemptions.filter(x => new Date(x.redeemed_at) >= since).length;
                const totalCount = validRedemptions.length;
                
                const dailyCount = hydrated ? countSince(startOfDay) : 0;
                const weeklyCount = hydrated ? countSince(startOfWeek) : 0;
                const monthlyCount = hydrated ? countSince(startOfMonth) : 0;

                let limitHit = false;
                let limitText = null;

                if (hydrated && r.max_daily_redemptions) { limitText = `Daily: ${dailyCount}/${r.max_daily_redemptions}`; if (dailyCount >= r.max_daily_redemptions) limitHit = true; }
                else if (hydrated && r.max_weekly_redemptions) { limitText = `Weekly: ${weeklyCount}/${r.max_weekly_redemptions}`; if (weeklyCount >= r.max_weekly_redemptions) limitHit = true; }
                else if (hydrated && r.max_monthly_redemptions) { limitText = `Monthly: ${monthlyCount}/${r.max_monthly_redemptions}`; if (monthlyCount >= r.max_monthly_redemptions) limitHit = true; }
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
                    <div className="reward-cost" style={{ fontSize: '1rem', margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><GoldCoin size="1rem" /> {r.cost}</div>
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


      {/* ── GRAND FINALE OVERLAY ── */}
      {showAllClearCelebration && (
        <div className="grand-finale-overlay">
          <div className="grand-finale-text">All clear</div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="confetti-piece"
              style={{
                left: `${18 + ((i * 17) % 64)}vw`,
                top: `-12px`,
                background: ['#c8920a', '#f5c518', '#f3e5ab', '#1c1c1e'][i % 4],
                width: 6,
                height: 6,
                animationDelay: `${(i % 5) * 0.03}s`,
                animationDuration: `${0.75 + (i % 3) * 0.12}s`
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}
