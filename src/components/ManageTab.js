"use client";

import { useState, useEffect } from 'react';
import { MISSION_LIBRARY, REWARD_LIBRARY } from '../lib/missionLibrary';
import { playPop } from '../lib/sounds';
import GoldCoin from './GoldCoin';

export default function ManageTab({
  missions, rewards, children,
  setModal,
  handleDeleteMission, handleToggleActiveMission,
  handleDeleteReward, handleToggleActiveReward,
}) {
  const [manageTab, setManageTab] = useState('missions');
  const [selectedChildId, setSelectedChildId] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kaeluma_collapsed_categories');
      if (stored) setCollapsedCategories(JSON.parse(stored));
    } catch {}
  }, []);

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
    '📺 Screen Time & Tech': true,
    '🍦 Sweet Treats & Food': true,
    '👑 Privileges & Fun': true,
    '🧸 Toys & Outings': true,
  });

  const toggleLibraryCategory = (cat) => {
    setCollapsedLibrary(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const renderMission = (m, isInactive, index = 0) => (
    <div key={m.id} className="mission-card" style={{ 
      padding: '12px 14px', 
      opacity: isInactive ? 0.6 : 1, 
      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
      background: '#fff',
      border: '1px solid rgba(28, 28, 30, 0.08)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 4px 14px rgba(28, 28, 30, 0.04)',
      animation: 'slideUp 0.3s ease-out backwards',
      animationDelay: `${index * 0.05}s`
    }}>
      <div className="mission-icon" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '1.6rem' }}>
        {m.image
          ? <img src={m.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : m.icon
        }
      </div>
      <div className="mission-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="mission-name" style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
        <div className="mission-rewards" style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>⭐ {m.xp_reward}</span>
          <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '2px 6px' }}><GoldCoin /> {m.coin_reward}</span>
        </div>
      </div>
      <div className="mission-actions" style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        {/* Toggle Switch */}
        <div 
          title={isInactive ? 'Activate' : 'Archive'}
          onClick={() => handleToggleActiveMission(m)}
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            background: isInactive ? 'rgba(28, 28, 30, 0.12)' : 'var(--primary)',
            border: '1px solid rgba(28, 28, 30, 0.1)',
            padding: 2,
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isInactive ? 'flex-start' : 'flex-end',
          }}
        >
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: isInactive ? 'var(--text-muted)' : '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }} />
        </div>

        <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'mission', data: m })} style={{ width: 32, height: 32, background: 'var(--bg-glass)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button className="btn btn-ghost btn-icon" style={{ width: 32, height: 32, color: 'var(--red)', background: 'var(--bg-glass)' }} onClick={() => handleDeleteMission(m.id)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );

  const renderReward = (r, isInactive, index = 0) => (
    <div key={r.id} className="mission-card" style={{ 
      padding: '12px 14px', opacity: isInactive ? 0.6 : 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
      background: '#fff',
      border: '1px solid rgba(28, 28, 30, 0.08)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 4px 14px rgba(28, 28, 30, 0.04)',
      animation: 'slideUp 0.3s ease-out backwards',
      animationDelay: `${index * 0.05}s`
    }}>
      <div className="mission-icon" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', fontSize: '1.6rem' }}>
        {r.image
          ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : r.icon
        }
      </div>
      <div className="mission-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="mission-name" style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
        <div className="mission-rewards" style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '2px 6px' }}><GoldCoin /> {r.cost}</span>
        </div>
      </div>
      <div className="mission-actions" style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        {/* Toggle Switch */}
        <div 
          title={isInactive ? 'Activate' : 'Save for Later'}
          onClick={() => handleToggleActiveReward(r)}
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            background: isInactive ? 'rgba(28, 28, 30, 0.12)' : 'var(--primary)',
            border: '1px solid rgba(28, 28, 30, 0.1)',
            padding: 2,
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isInactive ? 'flex-start' : 'flex-end',
          }}
        >
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: isInactive ? 'var(--text-muted)' : '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }} />
        </div>

        <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'reward', data: r })} style={{ width: 32, height: 32, background: 'var(--bg-glass)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button className="btn btn-ghost btn-icon" style={{ width: 32, height: 32, color: 'var(--red)', background: 'var(--bg-glass)' }} onClick={() => handleDeleteReward(r.id)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );

  const CATEGORY_ICONS = {
    'General': '🏷️', 'Chores': '🧹', 'Morning Routine': '🌅', 'Evening Routine': '🌙',
    'Homework': '📚', 'Health & Hygiene': '🦷', 'Behavior': '🤝', 'Activities': '🎨',
    'Reading': '📖', 'School & Learning': '🎓', 'Pets': '🐶', 'Exercise': '🏃',
  };

  const filteredMissions = missions.filter(m => {
    if (selectedChildId === 'all') return true;
    return !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(selectedChildId);
  });

  const filteredRewards = rewards.filter(r => {
    if (selectedChildId === 'all') return true;
    return !r.assigned_to || r.assigned_to.length === 0 || r.assigned_to.includes(selectedChildId);
  });

  return (
    <div className="page page-enter" style={{ paddingTop: 'var(--space-lg)' }}>
      <div style={{ textAlign: 'left', marginBottom: 'var(--space-md)' }}>
        <p className="quests-kicker">Quests</p>
        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', fontWeight: 600, letterSpacing: '-0.035em', margin: 0, lineHeight: 1.15 }}>Missions & rewards.</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>Create, organize, and assign what the kids chase.</p>
      </div>

      {/* Kid Filter Bar */}
      {children && children.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: 6, 
          overflowX: 'auto', 
          paddingBottom: 8, 
          marginTop: 8,
          marginBottom: 12,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <button
            onClick={() => { if (playPop) playPop(); setSelectedChildId('all'); }}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: '1px solid rgba(28, 28, 30, 0.08)',
              background: selectedChildId === 'all' ? '#1c1c1e' : '#fff',
              color: selectedChildId === 'all' ? '#fff' : '#1c1c1e',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            👥 All Players
          </button>
          {children.map(child => (
            <button
              key={child.id}
              title={child.name}
              onClick={() => { if (playPop) playPop(); setSelectedChildId(child.id); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 42,
                padding: 0,
                borderRadius: '50%',
                cursor: 'pointer',
                border: selectedChildId === child.id ? '2.5px solid var(--primary)' : '2px solid rgba(28, 28, 30, 0.08)',
                background: selectedChildId === child.id ? 'var(--primary-dim)' : '#fff',
                transition: 'all 0.2s',
                flexShrink: 0,
                overflow: 'hidden',
                boxShadow: 'none',
              }}
            >
              {child.avatar?.startsWith('data:image') ? (
                <img src={child.avatar} alt={child.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{child.avatar || '👦'}</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      <div className="segment-control">
        <div className={`segment-control-indicator ${manageTab === 'missions' ? 'pos-0' : 'pos-1'}`} />
        <button className={`segment-control-btn ${manageTab === 'missions' ? 'active' : ''}`} onClick={() => setManageTab('missions')}>🎯 Missions</button>
        <button className={`segment-control-btn ${manageTab === 'rewards' ? 'active' : ''}`} onClick={() => setManageTab('rewards')}>🎁 Rewards</button>
      </div>

      {manageTab === 'missions' ? (
        <div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-lg)' }} onClick={() => setModal({ type: 'mission', data: null })}>+ Add Mission</button>
          
          {(() => {
            if (filteredMissions.length === 0) return <div className="empty-state"><p className="empty-state-text">No missions found for this selection.</p></div>;
            const activeMissions = filteredMissions.filter(m => m.is_active !== false);
            const inactiveMissions = filteredMissions.filter(m => m.is_active === false);
            
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
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <div 
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                          cursor: 'pointer', 
                          marginBottom: collapsedCategories[cat] ? 0 : 8,
                          background: '#fff',
                          border: '1px solid rgba(28, 28, 30, 0.08)',
                          boxShadow: '0 2px 10px rgba(28, 28, 30, 0.04)',
                          backdropFilter: 'none',
                          WebkitBackdropFilter: 'none',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 14px',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => toggleCategory(cat)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{icon}</span>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, background: 'var(--bg-surface-alt)', padding: '1px 7px', borderRadius: '10px', flexShrink: 0 }}>
                              {groupedActive[cat].length}
                            </span>
                          </h3>
                        </div>
                        <div style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--bg-surface-alt)',
                          transform: collapsedCategories[cat] ? 'rotate(-90deg)' : 'none', 
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-bright)' }}>
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
                      background: 'var(--bg-surface-alt)', padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                      border: '1px dashed var(--bg-glass-border)',
                    }}>
                      <span style={{ fontSize: '1.4rem' }}>🗄️</span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0 }}>Archived Missions</h3>
                    </div>
                    {inactiveMissions.map(m => renderMission(m, true))}
                  </div>
                )}
                
                {/* Mission Inspiration Box */}
                <div style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>Mission Inspiration Library</h3>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>Swipe and tap any card below to instantly add it as a mission:</div>
                  
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
                                minWidth: 110,
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                background: '#fff',
                                border: '1px solid rgba(28, 28, 30, 0.08)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px 10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, background 0.2s',
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'var(--bg-surface-alt)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#fff'; }}
                            >
                              <div style={{ fontSize: '1.8rem', marginBottom: 6, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{idea.icon}</div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-bright)', lineHeight: 1.2, marginBottom: 6 }}>{idea.name}</div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '10px' }}><GoldCoin /> {idea.coins}</div>
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
          <button className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 'var(--space-lg)' }} onClick={() => setModal({ type: 'reward', data: null })}>+ Add Reward</button>
          
          <div>
            {(() => {
              if (filteredRewards.length === 0) return <div className="empty-state"><p className="empty-state-text">No rewards found for this selection.</p></div>;
              
              const activeRewards = filteredRewards.filter(r => r.is_active !== false);
              const inactiveRewards = filteredRewards.filter(r => r.is_active === false);

              return (
                <>
                  {activeRewards.map((r, idx) => renderReward(r, false, idx))}
                  
                  {inactiveRewards.length > 0 && (
                    <div style={{ marginTop: 'var(--space-2xl)' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>Saved for Later</h3>
                      {inactiveRewards.map((r, idx) => renderReward(r, true, idx))}
                    </div>
                  )}

                  {/* Reward Inspiration Box */}
                  <div style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '1.2rem' }}>💡</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>Reward Inspiration Library</h3>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>Swipe and tap any card below to instantly add it as a reward:</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {REWARD_LIBRARY.map(lib => (
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
                                onClick={() => setModal({ type: 'reward', data: { name: idea.name, icon: idea.icon, cost: idea.cost } })}
                                style={{
                                  minWidth: 110,
                                  flexShrink: 0,
                                  scrollSnapAlign: 'start',
                                  background: '#fff',
                                  border: '1px solid rgba(28, 28, 30, 0.08)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: '12px 10px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s, background 0.2s',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'var(--bg-surface-alt)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#fff'; }}
                              >
                                <div style={{ fontSize: '1.8rem', marginBottom: 6, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{idea.icon}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-bright)', lineHeight: 1.2, marginBottom: 6 }}>{idea.name}</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '10px' }}><GoldCoin /> {idea.cost}</div>
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
        </div>
      )}
    </div>
  );
}
