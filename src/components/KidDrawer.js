"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getLevelForXP, getXPProgress, getXPDisplay } from '../lib/levels';
import { getStreakIcon } from '../lib/streaks';
import AvatarDisplay from './AvatarDisplay';
import AnalyticsTab from './AnalyticsTab';
import GoldCoin from './GoldCoin';

export default function KidDrawer({
  inspectChildId, setInspectChildId,
  children, missions,
  setModal,
  handleAdjustCoins, handleDeleteChild,
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Reset history state when drawer opens for a different kid
  useEffect(() => {
    setHistoryOpen(false);
    setHistoryData(null);
  }, [inspectChildId]);

  const loadHistory = async (childId) => {
    setHistoryLoading(true);
    try {
      const [{ data: comps }, { data: reds }] = await Promise.all([
        supabase.from('completions').select('*, missions(name, icon)').eq('child_id', childId).order('submitted_at', { ascending: false }).limit(30),
        supabase.from('redemptions').select('*, rewards(name, icon)').eq('child_id', childId).order('redeemed_at', { ascending: false }).limit(30),
      ]);

      const events = [
        ...(comps || []).map(c => ({
          id: `c-${c.id}`,
          type: 'mission',
          label: c.missions?.name || 'Unknown Mission',
          icon: c.missions?.icon || '🎯',
          status: c.status,
          date: new Date(c.submitted_at || c.created_at),
        })),
        ...(reds || []).map(r => ({
          id: `r-${r.id}`,
          type: 'reward',
          label: r.rewards?.name || 'Unknown Reward',
          icon: r.rewards?.icon || '🎁',
          status: r.status,
          date: new Date(r.redeemed_at || r.created_at),
        })),
      ].sort((a, b) => b.date - a.date);

      setHistoryData(events);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleHistory = (childId) => {
    const willOpen = !historyOpen;
    setHistoryOpen(willOpen);
    if (willOpen && historyData === null) {
      loadHistory(childId);
    }
  };

  if (!inspectChildId) return null;
  const child = children.find(c => c.id === inspectChildId);
  if (!child) return null;

  const { level, tierName, tierColor } = getLevelForXP(child.total_xp_earned || child.xp || 0);
  const xpDisplay = getXPDisplay(child.total_xp_earned || child.xp || 0);
  const xpProgress = getXPProgress(child.total_xp_earned || child.xp || 0);
  const activeTheme = child.theme ? child.theme : tierColor;

  return (
    <div className={`theme-${activeTheme}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease-out' }}>
       <div style={{ width: '100%', height: 'calc(100% - 100px)', background: 'var(--bg-deep)', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', overflowY: 'auto', borderTop: '4px solid var(--primary)', animation: 'slideUp 0.3s ease-out', position: 'relative' }}>
           <button className="btn btn-ghost" style={{ position: 'absolute', top: 'var(--space-lg)', right: 'var(--space-lg)', zIndex: 10 }} onClick={() => setInspectChildId(null)}>Close</button>
           
           <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
              <div style={{ fontSize: '4rem', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                 <div style={{ background: 'var(--primary-dim)', borderRadius: '50%', padding: '16px', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AvatarDisplay avatarString={child.avatar} />
                 </div>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: 16 }}>{child.name}&apos;s Profile</h2>
              <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem', marginTop: 4 }}>Lv {level} · {tierName}</div>
              <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.9rem', marginTop: 14, border: '1px solid var(--primary-dim)', borderRadius: 'var(--radius-full)' }} onClick={() => { setModal({ type: 'child', data: child }); setInspectChildId(null); }}>
                ✎ Edit Profile
              </button>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
               <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span className="stat-icon" style={{ fontSize: '2rem' }}><GoldCoin size="2rem" /></span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 8 }}>{child.coins} Coins</div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'var(--bg-deep)', border: '1px solid rgba(245, 158, 11, 0.3)' }} onClick={(e) => handleAdjustCoins(child.id, -1, e)}>-1</button>
                    <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'var(--bg-deep)', border: '1px solid rgba(245, 158, 11, 0.3)' }} onClick={(e) => handleAdjustCoins(child.id, 1, e)}>+1</button>
                  </div>
               </div>
               <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span className="stat-icon" style={{ fontSize: '2rem' }}>{getStreakIcon(child.streak)}</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 8 }}>{child.streak} Day Streak</div>
               </div>
           </div>
           
           <div style={{ marginBottom: 'var(--space-2xl)' }}>
             <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>🎯 Active Missions</h4>
             {(() => {
                const childMissions = missions.filter(m => m.is_active !== false && (!m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(child.id)));
                if (childMissions.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active missions.</div>;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {childMissions.map(m => (
                       <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: '1.8rem' }}>{m.icon}</span>
                          <div style={{ flex: 1}}>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{m.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.max_completions_per_period}x {m.frequency}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>⭐ {m.xp_reward}</span>
                            <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '2px 6px' }}><GoldCoin /> {m.coin_reward}</span>
                          </div>
                       </div>
                    ))}
                  </div>
                );
             })()}
           </div>

           <div style={{ marginBottom: 'var(--space-2xl)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontWeight: 'bold' }}>
                <span>Experience to Next Level</span>
                <span>{xpDisplay}</span>
             </div>
             <div style={{ width: '100%', height: '16px', background: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${xpProgress * 100}%`, background: 'var(--primary)', borderRadius: '8px' }} />
             </div>
             <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'right' }}>Total XP: {child.total_xp_earned || child.xp || 0}</div>
           </div>

           {/* Analytics */}
           <div style={{ marginBottom: 'var(--space-2xl)' }}>
             <AnalyticsTab children={children} singleChildId={inspectChildId} />
           </div>

           {/* History Accordion */}
           <div style={{ marginBottom: 'var(--space-2xl)' }}>
             <button
               onClick={() => handleToggleHistory(child.id)}
               style={{
                 width: '100%',
                 background: 'var(--bg-surface)',
                 border: '1px solid var(--bg-glass-border)',
                 borderRadius: historyOpen ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
                 padding: '14px 18px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 cursor: 'pointer',
                 color: 'var(--text-bright)',
                 fontWeight: 800,
                 fontSize: '1rem',
                 transition: 'border-radius 0.2s',
               }}
             >
               <span>📜 Activity History</span>
               <svg
                 width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                 style={{ transform: historyOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
               >
                 <polyline points="6 9 12 15 18 9" />
               </svg>
             </button>

             <div style={{
               overflow: 'hidden',
               maxHeight: historyOpen ? '600px' : '0px',
               transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
               background: 'var(--bg-surface)',
               border: historyOpen ? '1px solid var(--bg-glass-border)' : 'none',
               borderTop: 'none',
               borderRadius: '0 0 var(--radius-md) var(--radius-md)',
             }}>
               <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                 {historyLoading && (
                   <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '0.9rem' }}>Loading history…</div>
                 )}
                 {!historyLoading && historyData && historyData.length === 0 && (
                   <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '0.9rem' }}>No activity yet.</div>
                 )}
                 {!historyLoading && historyData && historyData.map(evt => {
                   const statusColor = {
                     approved: 'var(--green)',
                     pending: 'var(--amber)',
                     rejected: 'var(--red)',
                     fulfilled: 'var(--green)',
                     refunded: 'var(--cyan)',
                   }[evt.status] || 'var(--text-muted)';

                   const statusLabel = {
                     approved: 'Approved',
                     pending: 'Pending',
                     rejected: 'Rejected',
                     fulfilled: 'Delivered',
                     refunded: 'Refunded',
                   }[evt.status] || evt.status;

                   const typePrefix = evt.type === 'mission' ? '✅' : '🛍️';

                   return (
                     <div key={evt.id} style={{
                       display: 'flex',
                       alignItems: 'center',
                       gap: 12,
                       padding: '10px 0',
                       borderBottom: '1px solid var(--bg-glass-border)',
                     }}>
                       <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{evt.icon}</div>
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {typePrefix} {evt.label}
                         </div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                           {evt.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                         </div>
                       </div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 800, color: statusColor, flexShrink: 0, background: `${statusColor}18`, padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                         {statusLabel}
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           </div>

            <div style={{ borderTop: '1px solid var(--bg-glass-border)', paddingTop: 'var(--space-xl)', display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-ghost" style={{ padding: '8px 24px', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => handleDeleteChild(child.id)}>🗑 Remove Player</button>
            </div>
       </div>
    </div>
  );
}
