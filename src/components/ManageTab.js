"use client";

import { useState } from 'react';
import { MISSION_LIBRARY } from '../lib/missionLibrary';
import { playPop } from '../lib/sounds';

export default function ManageTab({
  missions, rewards, children,
  isExiting, setIsExiting, router,
  setModal,
  handleDeleteMission, handleToggleActiveMission,
  handleDeleteReward, handleToggleActiveReward,
}) {
  const [manageTab, setManageTab] = useState('missions');

  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kaeluma_collapsed_categories');
      if (stored) return JSON.parse(stored);
    }
    return {};
  });

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => {
      const next = { ...prev, [cat]: !prev[cat] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kaeluma_collapsed_categories', JSON.stringify(next));
      }
      return next;
    });
  };

  const [collapsedLibrary, setCollapsedLibrary] = useState({
    '🌅 Morning Routine': true,
    '🧹 Chores & Household': true,
    '📚 Learning & Growth': true,
    '🧼 Health & Wellness': true,
    '🤝 Character & Behavior': true,
  });

  const toggleLibraryCategory = (cat) => {
    setCollapsedLibrary(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const renderMission = (m, isInactive, index = 0) => (
    <div key={m.id} className="mission-card" style={{ 
      padding: '16px', 
      opacity: isInactive ? 0.6 : 1, 
      marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12,
      background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      animation: 'slideUp 0.3s ease-out backwards',
      animationDelay: `${index * 0.05}s`
    }}>
      <div className="mission-icon" style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '2rem' }}>
        {m.image
          ? <img src={m.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : m.icon
        }
      </div>
      <div className="mission-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="mission-name" style={{ fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
        <div className="mission-rewards" style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>⭐ {m.xp_reward}</span>
          <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>🪙 {m.coin_reward}</span>
        </div>
      </div>
      <div className="mission-actions" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-icon" title={isInactive ? 'Unarchive' : 'Archive'} onClick={() => handleToggleActiveMission(m)} style={{ background: 'var(--bg-glass)' }}>
          {isInactive 
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>}
        </button>
        <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'mission', data: m })} style={{ background: 'var(--bg-glass)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)', background: 'var(--bg-glass)' }} onClick={() => handleDeleteMission(m.id)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );

  const renderReward = (r, isInactive, index = 0) => (
    <div key={r.id} className="mission-card" style={{ 
      padding: '16px', opacity: isInactive ? 0.6 : 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12,
      background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      animation: 'slideUp 0.3s ease-out backwards',
      animationDelay: `${index * 0.05}s`
    }}>
      <div className="mission-icon" style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '2rem' }}>
        {r.image
          ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : r.icon
        }
      </div>
      <div className="mission-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="mission-name" style={{ fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
        <div className="mission-rewards" style={{ marginTop: 6, display: 'flex', gap: 6 }}>
          <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>🪙 {r.cost}</span>
        </div>
      </div>
      <div className="mission-actions" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-icon" title={isInactive ? 'Activate' : 'Pause'} onClick={() => handleToggleActiveReward(r)} style={{ background: 'var(--bg-glass)' }}>
          {isInactive 
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>}
        </button>
        <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'reward', data: r })} style={{ background: 'var(--bg-glass)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)', background: 'var(--bg-glass)' }} onClick={() => handleDeleteReward(r.id)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );

  const CATEGORY_ICONS = {
    'General': '🏷️', 'Chores': '🧹', 'Morning Routine': '🌅', 'Evening Routine': '🌙',
    'Homework': '📚', 'Health & Hygiene': '🦷', 'Behavior': '🤝', 'Activities': '🎨',
    'Reading': '📖', 'School & Learning': '🎓', 'Pets': '🐶', 'Exercise': '🏃',
  };

  return (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Activities</h2>
        <button className="cool-home-btn" onClick={() => {
            if (isExiting) return;
            if (playPop) playPop();
            setIsExiting(true);
            setTimeout(() => router.push('/'), 250);
        }}>
          {isExiting ? '🚀' : '🏠'} <span>{isExiting ? 'Warping...' : 'Home'}</span>
        </button>
      </div>
      
      <div className="segment-control">
        <div className={`segment-control-indicator ${manageTab === 'missions' ? 'pos-0' : 'pos-1'}`} />
        <button className={`segment-control-btn ${manageTab === 'missions' ? 'active' : ''}`} onClick={() => setManageTab('missions')}>🎯 Missions</button>
        <button className={`segment-control-btn ${manageTab === 'rewards' ? 'active' : ''}`} onClick={() => setManageTab('rewards')}>🎁 Rewards</button>
      </div>

      {manageTab === 'missions' ? (
        <div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-2xl)' }} onClick={() => setModal({ type: 'mission', data: null })}>+ Add Mission</button>
          
          {(() => {
            if (missions.length === 0) return <div className="empty-state"><p className="empty-state-text">No missions added yet.</p></div>;
            const activeMissions = missions.filter(m => m.is_active !== false);
            const inactiveMissions = missions.filter(m => m.is_active === false);
            
            const groupedActive = activeMissions.reduce((acc, m) => {
              const cat = m.category || 'General';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(m);
              return acc;
            }, {});
            const sortedCategories = Object.keys(groupedActive).sort();

            return (
              <>
                {sortedCategories.map(cat => {
                  const icon = CATEGORY_ICONS[cat] || '📁';
                  
                  return (
                    <div key={cat} style={{ marginBottom: 24 }}>
                      <div 
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                          cursor: 'pointer', 
                          marginBottom: collapsedCategories[cat] ? 0 : 16,
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '14px 18px',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => toggleCategory(cat)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
                            {cat}
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, background: 'rgba(0, 0, 0, 0.3)', padding: '2px 8px', borderRadius: '12px' }}>
                              {groupedActive[cat].length}
                            </span>
                          </h3>
                        </div>
                        <div style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          width: 32, height: 32, borderRadius: '50%', 
                          background: 'rgba(255, 255, 255, 0.08)',
                          transform: collapsedCategories[cat] ? 'rotate(-90deg)' : 'none', 
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-bright)' }}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'grid', gridTemplateRows: collapsedCategories[cat] ? '0fr' : '1fr',
                        transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ paddingTop: collapsedCategories[cat] ? 0 : 4 }}>
                            {groupedActive[cat].map((m, idx) => renderMission(m, false, idx))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {inactiveMissions.length > 0 && (
                  <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-lg)',
                      background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                    }}>
                      <span style={{ fontSize: '1.4rem' }}>🗄️</span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0 }}>Archived Missions</h3>
                    </div>
                    {inactiveMissions.map(m => renderMission(m, true))}
                  </div>
                )}
                
                {/* Mission Inspiration Box */}
                <div style={{ marginTop: 'var(--space-2xl)', marginBottom: 'var(--space-xl)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: '1.5rem' }}>💡</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>Mission Inspiration Library</h3>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 24 }}>Swipe and tap any card below to instantly add it as a mission:</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {MISSION_LIBRARY.map(lib => (
                      <div key={lib.category}>
                        <div 
                          onClick={() => toggleLibraryCategory(lib.category)}
                          style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                            fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', 
                            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12,
                            cursor: 'pointer'
                          }}
                        >
                          <div>{lib.category}</div>
                          <div style={{ 
                            transform: collapsedLibrary[lib.category] ? 'rotate(-90deg)' : 'none', 
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: 0.5
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'grid', gridTemplateRows: collapsedLibrary[lib.category] ? '0fr' : '1fr',
                          transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ 
                              display: 'flex', 
                              gap: 12, 
                              overflowX: 'auto', 
                              paddingBottom: 12,
                              paddingTop: 4,
                              scrollSnapType: 'x mandatory',
                              WebkitOverflowScrolling: 'touch',
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none'
                            }}>
                          {lib.ideas.map(idea => (
                            <div 
                              key={idea.name}
                              onClick={() => setModal({ type: 'mission', data: { name: idea.name, icon: idea.icon, category: idea.category, coin_reward: idea.coins, frequency: 'daily' } })}
                              style={{
                                minWidth: 130,
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '16px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, background 0.2s',
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'; }}
                            >
                              <div style={{ fontSize: '2.2rem', marginBottom: 8, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>{idea.icon}</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-bright)', lineHeight: 1.2, marginBottom: 8 }}>{idea.name}</div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>🪙 {idea.coins}</div>
                            </div>
                          ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </>
            );
          })()}
        </div>
      ) : (
        <div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-2xl)' }} onClick={() => setModal({ type: 'reward', data: null })}>+ Add Reward</button>
          
          <div>
            {(() => {
              if (rewards.length === 0) return <div className="empty-state"><p className="empty-state-text">No rewards added yet.</p></div>;
              
              const activeRewards = rewards.filter(r => r.is_active !== false);
              const inactiveRewards = rewards.filter(r => r.is_active === false);

              return (
                <>
                  {activeRewards.map((r, idx) => renderReward(r, false, idx))}
                  
                  {inactiveRewards.length > 0 && (
                    <div style={{ marginTop: 'var(--space-2xl)' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>Saved for Later</h3>
                      {inactiveRewards.map((r, idx) => renderReward(r, true, idx))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
