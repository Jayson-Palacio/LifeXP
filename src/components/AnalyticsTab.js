"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getLevelForXP } from '../lib/levels';
import AvatarDisplay from './AvatarDisplay';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getStreakIcon = (streak) => {
  if (streak >= 100) return '🌌';
  if (streak >= 30) return '💎';
  if (streak >= 7) return '⚡';
  return '🔥';
};

const getStreakColor = (streak) => {
  if (streak >= 100) return '#d946ef';
  if (streak >= 30) return '#06b6d4';
  if (streak >= 7) return '#3b82f6';
  return '#fb923c';
};

function StatCard({ icon, label, value, sub, color = 'var(--primary)' }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, var(--bg-surface) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 'var(--radius-xl)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '5rem', opacity: 0.05, filter: 'grayscale(1)', pointerEvents: 'none' }}>{icon}</div>
      <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 900, color, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
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
  if (stats.totalApproved === 0) {
    return `${childName} hasn't completed any missions yet. Try assigning a simple daily task to get them started! 🚀`;
  }
  
  const insights = [];
  
  // Power user check
  if (stats.totalApproved > 50) {
    insights.push(`is a total powerhouse with over ${stats.totalApproved} completed missions`);
  }

  // Best day & Weekend Warrior check
  const bestDayIdx = stats.dayActivity.indexOf(Math.max(...stats.dayActivity));
  const bestDay = DAY_NAMES[bestDayIdx];
  const totalInBestDay = stats.dayActivity[bestDayIdx];
  const bestDayPercentage = stats.totalApproved > 0 ? (totalInBestDay / stats.totalApproved) : 0;
  
  if (bestDayPercentage > 0.35 && stats.totalApproved > 5) {
     if (bestDay === 'Sat' || bestDay === 'Sun') {
         insights.push(`is a 'Weekend Warrior', completing most of their missions on ${bestDay}s`);
     } else {
         insights.push(`tends to be most productive on ${bestDay}s`);
     }
  }

  // Approval rate
  const rate = stats.totalApproved / (stats.totalApproved + stats.totalRejected + stats.totalPending + 0.001);
  if (rate > 0.95 && stats.totalApproved > 10) {
      insights.push('maintains an incredibly high approval rate (very reliable!)');
  } else if (rate < 0.6 && stats.totalRejected > 3) {
      insights.push('has had a few rejections recently, so they might need clearer instructions');
  }

  // Streak
  if (stats.currentStreak >= 10) {
      insights.push(`is on an impressive ${stats.currentStreak}-day streak`);
  } else if (stats.currentStreak >= 3) {
      insights.push(`is building a solid ${stats.currentStreak}-day streak`);
  }

  // Favorite Mission
  if (stats.topMissions && stats.topMissions.length > 0) {
      const topM = stats.topMissions[0];
      if (topM.count >= 5) {
          insights.push(`absolutely crushes the '${topM.name}' mission (${topM.count} completions)`);
      }
  }

  // Spender vs saver
  const netCoins = stats.coinsEarned - stats.coinsSpent;
  if (stats.coinsSpent > stats.coinsEarned * 0.8 && stats.coinsEarned > 50) {
      insights.push('loves to spend their coins as soon as they get them');
  } else if (netCoins > 150) {
      insights.push(`is a master saver, currently hoarding ${netCoins} unspent coins`);
  }

  if (insights.length === 0) {
      const generic = [
         `${childName} is progressing steadily. Keep assigning varied missions to discover their strengths!`,
         `${childName} is doing great. Consistency is key, so keep those daily missions coming!`,
         `Things are looking good for ${childName}. Try adding a new type of reward to keep excitement high.`
      ];
      return generic[Math.floor(Math.random() * generic.length)];
  }

  // Shuffle insights to keep it fresh
  const shuffled = insights.sort(() => 0.5 - Math.random());
  
  // Pick 1 to 2 insights to avoid massive run-on sentences
  const selected = shuffled.slice(0, 2);

  if (selected.length === 1) {
      const intros = [
          `Interestingly, ${childName} `,
          `It looks like ${childName} `,
          `Based on the data, ${childName} `,
          `Here's a fun fact: ${childName} `
      ];
      return intros[Math.floor(Math.random() * intros.length)] + selected[0] + '.';
  } else {
      const intros = [
          `Based on recent activity, ${childName} `,
          `Looking at the trends, ${childName} `,
          `${childName} is doing well! They `,
      ];
      const connectors = [' and also ', ', plus they ', ', and '];
      const intro = intros[Math.floor(Math.random() * intros.length)];
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      
      return intro + selected[0] + connector + selected[1] + '.';
  }
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

      // Activity Heatmap (last 60 days)
      const heatmapDays = 60;
      const heatmapData = Array(heatmapDays).fill(0);
      const today = new Date(); today.setHours(0,0,0,0);
      approved.forEach(c => {
        const d = new Date(c.submitted_at || c.created_at);
        d.setHours(0,0,0,0);
        const diffDays = Math.floor((today - d) / 86400000);
        if (diffDays >= 0 && diffDays < heatmapDays) {
          heatmapData[heatmapDays - 1 - diffDays]++;
        }
      });
      const maxHeatmap = Math.max(...heatmapData, 1);

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
        heatmapData,
        maxHeatmap,
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
              background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.1))',
              border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              marginBottom: 'var(--space-xl)',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(168,85,247,0.1)',
            }}>
              <div style={{ fontSize: '2rem', flexShrink: 0, filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.5))' }}>✨</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>AI Insight</div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-bright)', lineHeight: 1.5, fontWeight: 500 }}>
                  {generateInsight(stats, child.name)}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 'var(--space-xl)' }}>
            <StatCard icon="✅" label="Missions Done" value={stats.totalApproved} sub={`${stats.totalPending} pending · ${stats.totalRejected} rejected`} color="var(--green)" />
            <StatCard icon="🎯" label="Approval Rate" value={`${approvalRate}%`} sub="of all submissions" color={approvalRate > 80 ? 'var(--green)' : approvalRate > 50 ? 'var(--amber)' : 'var(--red)'} />
            <StatCard icon="🪙" label="Coins Earned" value={stats.coinsEarned} sub={`${stats.coinsSpent} spent · ${stats.currentCoins} held`} color="var(--amber)" />
            <StatCard icon={getStreakIcon(stats.currentStreak)} label="Day Streak" value={stats.currentStreak} sub={`Lv ${level} · ${stats.totalXp} XP total`} color={getStreakColor(stats.currentStreak)} />
          </div>

          {/* 60-Day Activity Heatmap */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: 'var(--space-xl)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>🔥 60-Day Activity</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consistency is key!</div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {stats.heatmapData.map((count, i) => {
                const daysAgo = 59 - i;
                const d = new Date(Date.now() - daysAgo * 86400000);
                const tooltip = `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${count} missions`;
                
                let bg = 'var(--bg-deep)';
                let opacity = 1;
                if (count > 0) {
                  bg = 'var(--primary)';
                  const intensity = count / stats.maxHeatmap;
                  if (intensity >= 0.75) opacity = 1;
                  else if (intensity >= 0.4) opacity = 0.65;
                  else opacity = 0.35;
                }

                return (
                  <div 
                    key={i} 
                    title={tooltip}
                    style={{ 
                      flex: '1 0 calc(10% - 6px)',
                      minWidth: 14, 
                      maxWidth: 24,
                      aspectRatio: '1/1', 
                      background: bg,
                      opacity: opacity,
                      borderRadius: 4,
                      boxShadow: count > 0 ? '0 2px 4px rgba(0,0,0,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'transform 0.2s',
                      cursor: 'help'
                    }} 
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
               <span>Less</span>
               <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bg-deep)' }} />
               <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary)', opacity: 0.35 }} />
               <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary)', opacity: 0.65 }} />
               <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary)', opacity: 1 }} />
               <span>More</span>
            </div>
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
