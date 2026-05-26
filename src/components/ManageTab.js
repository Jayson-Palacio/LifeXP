"use client";

import { useState } from 'react';
import { MISSION_LIBRARY, REWARD_LIBRARY } from '../lib/missionLibrary';
import { playPop } from '../lib/sounds';
import GoldCoin from './GoldCoin';

export default function ManageTab({
  missions, rewards, children,
  isExiting, setIsExiting, router,
  setModal,
  handleDeleteMission, handleToggleActiveMission,
  handleDeleteReward, handleToggleActiveReward,
}) {
  const [manageTab, setManageTab] = useState('missions');
  const [selectedChildId, setSelectedChildId] = useState('all');

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
      background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
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
            background: isInactive ? 'rgba(255,255,255,0.08)' : 'var(--primary)',
            border: '1px solid rgba(255,255,255,0.12)',
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
            background: isInactive ? 'var(--text-muted)' : 'var(--bg-deep)',
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
      background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
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
            background: isInactive ? 'rgba(255,255,255,0.08)' : 'var(--primary)',
            border: '1px solid rgba(255,255,255,0.12)',
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
            background: isInactive ? 'var(--text-muted)' : 'var(--bg-deep)',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 'var(--space-md)' }}>
        <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', fontWeight: 800, margin: 0, lineHeight: 1.15 }}>Missions & Rewards</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.35 }}>Create, organize, and assign missions or rewards.</p>
        </div>
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
          <button className="cool-home-btn" onClick={() => {
              if (isExiting) return;
              if (playPop) playPop();
              setIsExiting(true);
              setTimeout(() => router.push('/'), 250);
          }}>
            {isExiting ? '🚀' : '🏠'} <span>{isExiting ? 'Warping...' : 'Home'}</span>
          </button>
        </div>
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
              border: '1px solid rgba(255,255,255,0.1)',
              background: selectedChildId === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
              color: selectedChildId === 'all' ? 'var(--bg-deep)' : 'var(--text-bright)',
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
                border: selectedChildId === child.id ? '2.5px solid var(--primary)' : '2px solid rgba(255,255,255,0.1)',
                background: selectedChildId === child.id ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                transition: 'all 0.2s',
                flexShrink: 0,
                overflow: 'hidden',
                boxShadow: selectedChildId === child.id ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none',
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
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
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
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, background: 'rgba(0, 0, 0, 0.3)', padding: '1px 7px', borderRadius: '10px', flexShrink: 0 }}>
                              {groupedActive[cat].length}
                            </span>
                          </h3>
                        </div>
                        <div style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(255, 255, 255, 0.06)',
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
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                border: '1px solid rgba(255,255,255,0.08)',
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
                              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'; }}
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
                                  background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                  border: '1px solid rgba(255,255,255,0.08)',
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
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'; }}
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
