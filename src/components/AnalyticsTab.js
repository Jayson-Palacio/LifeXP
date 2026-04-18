"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getLevelForXP } from '../lib/levels';
import AvatarDisplay from './AvatarDisplay';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function StatCard({ icon, label, value, sub, color = 'var(--primary)' }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--bg-glass-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ fontSize: '1.4rem' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, color = 'var(--primary)' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ flex: 1, height: 8, background: 'var(--bg-deep)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: color,
        borderRadius: 'var(--radius-full)',
        transition: 'width 0.6s ease-out',
        boxShadow: `0 0 6px ${color}88`,
      }} />
    </div>
  );
}

function generateInsight(stats, childName) {
  const insights = [];

  if (stats.totalApproved === 0) {
    return `${childName} hasn't completed any missions yet. Try assigning a simple daily task to get them started! 🚀`;
  }

  // Best day
  const bestDayIdx = stats.dayActivity.indexOf(Math.max(...stats.dayActivity));
  const bestDay = DAY_NAMES[bestDayIdx];
  if (Math.max(...stats.dayActivity) > 0) {
    insights.push(`most active on ${bestDay}s`);
  }

  // Approval rate
  const rate = stats.totalApproved / (stats.totalApproved + stats.totalRejected + stats.totalPending + 0.001);
  if (rate > 0.9) insights.push('has an excellent approval rate — very reliable!');
  else if (rate < 0.5) insights.push('has had some rejections recently — may need clearer instructions');

  // Streak
  if (stats.currentStreak >= 3) insights.push(`is on a ${stats.currentStreak}-day streak — keep them motivated!`);

  // Spender vs saver
  const netCoins = stats.coinsEarned - stats.coinsSpent;
  if (stats.coinsSpent > stats.coinsEarned * 0.8) insights.push('tends to spend coins quickly — consider adding savings goals');
  else if (netCoins > 100) insights.push(`is saving up — has ${netCoins} unspent coins`);

  if (insights.length === 0) return `${childName} is progressing steadily. Keep assigning varied missions to discover their strengths!`;

  return `${childName} is ${insights.join(', and ')}.`;
}

export default function AnalyticsTab({ children, singleChildId = null }) {
  const [selectedId, setSelectedId] = useState(singleChildId || children?.[0]?.id || null);
  const [data, setData] = useState({}); // keyed by child id
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (singleChildId) setSelectedId(singleChildId);
  }, [singleChildId]);

  useEffect(() => {
    if (!selectedId || data[selectedId]) return;
    loadData(selectedId);
  }, [selectedId, data]);

  const loadData = async (childId) => {
    setLoading(true);
    try {
      const [
        { data: comps },
        { data: reds },
        { data: childRow },
      ] = await Promise.all([
        supabase.from('completions').select('*, missions(name, icon, coin_reward, xp_reward)').eq('child_id', childId).order('submitted_at', { ascending: false }),
        supabase.from('redemptions').select('*, rewards(name, icon, cost)').eq('child_id', childId).order('redeemed_at', { ascending: false }),
        supabase.from('children').select('streak, coins, total_xp_earned, xp').eq('id', childId).single(),
      ]);

      const approved = (comps || []).filter(c => c.status === 'approved');
      const rejected = (comps || []).filter(c => c.status === 'rejected');
      const pending  = (comps || []).filter(c => c.status === 'pending');

      // Day of week activity (approved only)
      const dayActivity = Array(7).fill(0);
      approved.forEach(c => {
        const d = new Date(c.submitted_at || c.created_at);
        dayActivity[d.getDay()]++;
      });

      // Mission frequency map
      const missionMap = {};
      approved.forEach(c => {
        const key = c.missions?.name || 'Unknown';
        const icon = c.missions?.icon || '🎯';
        if (!missionMap[key]) missionMap[key] = { name: key, icon, count: 0 };
        missionMap[key].count++;
      });
      const topMissions = Object.values(missionMap).sort((a, b) => b.count - a.count).slice(0, 5);

      // Reward frequency map
      const rewardMap = {};
      (reds || []).filter(r => r.status !== 'refunded').forEach(r => {
        const key = r.rewards?.name || 'Unknown';
        const icon = r.rewards?.icon || '🎁';
        const cost = r.rewards?.cost || 0;
        if (!rewardMap[key]) rewardMap[key] = { name: key, icon, count: 0, spent: 0 };
        rewardMap[key].count++;
        rewardMap[key].spent += cost;
      });
      const topRewards = Object.values(rewardMap).sort((a, b) => b.count - a.count).slice(0, 5);

      // Coins earned vs spent
      const coinsEarned = approved.reduce((sum, c) => sum + (c.missions?.coin_reward || 0), 0);
      const coinsSpent  = (reds || []).filter(r => r.status !== 'refunded').reduce((sum, r) => sum + (r.rewards?.cost || 0), 0);

      // Last 7 days trend
      const last7 = Array(7).fill(0);
      const today = new Date(); today.setHours(0,0,0,0);
      approved.forEach(c => {
        const d = new Date(c.submitted_at || c.created_at);
        const diffDays = Math.floor((today - d) / 86400000);
        if (diffDays >= 0 && diffDays < 7) last7[6 - diffDays]++;
      });

      const stats = {
        totalApproved: approved.length,
        totalRejected: rejected.length,
        totalPending: pending.length,
        dayActivity,
        topMissions,
        topRewards,
        coinsEarned,
        coinsSpent,
        currentStreak: childRow?.streak || 0,
        currentCoins: childRow?.coins || 0,
        totalXp: childRow?.total_xp_earned || childRow?.xp || 0,
        last7,
      };

      setData(prev => ({ ...prev, [childId]: stats }));
    } finally {
      setLoading(false);
    }
  };

  const child = children?.find(c => c.id === selectedId);
  const stats = data[selectedId];
  const { level } = child ? getLevelForXP(child.total_xp_earned || child.xp || 0) : { level: 1 };

  const approvalRate = stats
    ? Math.round((stats.totalApproved / Math.max(stats.totalApproved + stats.totalRejected + stats.totalPending, 1)) * 100)
    : 0;

  const maxDay = stats ? Math.max(...stats.dayActivity, 1) : 1;
  const maxLast7 = stats ? Math.max(...stats.last7, 1) : 1;

  return (
    <div style={{ padding: '0', paddingBottom: singleChildId ? 'var(--space-xl)' : 100 }}>
      {!singleChildId && (
        <>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 4 }}>📊 Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>
            Behavioural insights for each child
          </p>
        </>
      )}

      {/* Child Selector */}
      {!singleChildId && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--space-xl)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {(children || []).map(c => {
            const { tierColor } = getLevelForXP(c.total_xp_earned || c.xp || 0);
            const active = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: active ? '2px solid var(--primary)' : '2px solid var(--bg-glass-border)',
                  background: active ? 'var(--primary-dim, rgba(168,85,247,0.15))' : 'var(--bg-surface)',
                  color: 'var(--text-bright)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: active ? '0 0 14px var(--primary)44' : 'none',
                }}
              >
                <AvatarDisplay avatarString={c.avatar} style={{ fontSize: '1.6rem' }} />
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
          <div style={{ marginTop: 8 }}>Crunching the numbers…</div>
        </div>
      )}

      {!loading && !stats && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          No data yet. Missions need to be completed first.
        </div>
      )}

      {!loading && stats && (
        <>
          {/* AI-style insight */}
          {child && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: '16px 20px',
              marginBottom: 'var(--space-xl)',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Insight</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-bright)', lineHeight: 1.5 }}>
                  {generateInsight(stats, child.name)}
                </div>
              </div>
            </div>
          )}

          {/* Key Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 'var(--space-xl)' }}>
            <StatCard icon="✅" label="Missions Done" value={stats.totalApproved} sub={`${stats.totalPending} pending · ${stats.totalRejected} rejected`} color="var(--green)" />
            <StatCard icon="🎯" label="Approval Rate" value={`${approvalRate}%`} sub="of all submissions" color={approvalRate > 80 ? 'var(--green)' : approvalRate > 50 ? 'var(--amber)' : 'var(--red)'} />
            <StatCard icon="🪙" label="Coins Earned" value={stats.coinsEarned} sub={`${stats.coinsSpent} spent · ${stats.currentCoins} held`} color="var(--amber)" />
            <StatCard icon="🔥" label="Day Streak" value={stats.currentStreak} sub={`Lv ${level} · ${stats.totalXp} XP total`} color="var(--cyan)" />
          </div>

          {/* Last 7 Days Trend */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>📈 Last 7 Days</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
              {stats.last7.map((count, i) => {
                const dayLabel = DAY_NAMES[new Date(Date.now() - (6 - i) * 86400000).getDay()];
                const pct = maxLast7 > 0 ? (count / maxLast7) * 100 : 0;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: '100%',
                      height: `${Math.max(pct * 0.48, count > 0 ? 6 : 2)}px`,
                      background: count > 0 ? 'var(--primary)' : 'var(--bg-deep)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.5s ease',
                      boxShadow: count > 0 ? '0 0 8px var(--primary)66' : 'none',
                      alignSelf: 'flex-end',
                    }} />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>{dayLabel}</div>
                  </div>
                );
              })}
            </div>
            {stats.last7.every(v => v === 0) && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>No completions in the last 7 days</div>
            )}
          </div>

          {/* Day of Week Heatmap */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>📅 Best Days of the Week</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>Based on all-time approved completions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DAY_NAMES.map((day, i) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>{day}</div>
                  <MiniBar value={stats.dayActivity[i]} max={maxDay} color={stats.dayActivity[i] === Math.max(...stats.dayActivity) ? 'var(--amber)' : 'var(--primary)'} />
                  <div style={{ width: 24, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-bright)', flexShrink: 0, textAlign: 'right' }}>{stats.dayActivity[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Missions */}
          {stats.topMissions.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', marginBottom: 'var(--space-xl)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>🏆 Most Completed Missions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.topMissions.map((m, i) => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 24, fontSize: '0.85rem', fontWeight: 900, color: i === 0 ? 'var(--amber)' : 'var(--text-muted)', flexShrink: 0 }}>#{i + 1}</div>
                    <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{m.icon}</div>
                    <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 700 }}>{m.name}</div>
                    <MiniBar value={m.count} max={stats.topMissions[0].count} color="var(--green)" />
                    <div style={{ width: 28, fontSize: '0.85rem', fontWeight: 800, color: 'var(--green)', flexShrink: 0, textAlign: 'right' }}>{m.count}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Rewards */}
          {stats.topRewards.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', marginBottom: 'var(--space-xl)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>🛍️ Favourite Rewards</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.topRewards.map((r, i) => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 24, fontSize: '0.85rem', fontWeight: 900, color: i === 0 ? 'var(--amber)' : 'var(--text-muted)', flexShrink: 0 }}>#{i + 1}</div>
                    <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{r.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>🪙 {r.spent} total spent</div>
                    </div>
                    <MiniBar value={r.count} max={stats.topRewards[0].count} color="var(--amber)" />
                    <div style={{ width: 28, fontSize: '0.85rem', fontWeight: 800, color: 'var(--amber)', flexShrink: 0, textAlign: 'right' }}>{r.count}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
