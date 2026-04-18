'use client';

import { useState } from 'react';
import { BASE_CHARACTERS, HATS, FACE_ITEMS, AURAS, PETS, RARITY_COLORS } from '../lib/character';
import CharacterDisplay from './CharacterDisplay';

const TABS = [
  { id: 'base',  label: 'Hero',   icon: '🐾' },
  { id: 'hat',   label: 'Hat',    icon: '🎩' },
  { id: 'face',  label: 'Face',   icon: '😎' },
  { id: 'aura',  label: 'Aura',   icon: '✨' },
  { id: 'pet',   label: 'Pet',    icon: '🐣' },
];

const SLOT_ITEMS = { base: BASE_CHARACTERS, hat: HATS, face: FACE_ITEMS, aura: AURAS, pet: PETS };

const ITEM_ICONS = {
  // hats
  'top-hat': '🎩', cap: '🧢', crown: '👑', wizard: '🪄', 'diamond-crown': '💎', 'rainbow-hat': '🌈',
  // face
  shades: '🕶️', scuba: '🤿', 'star-eyes': '⭐',
  // pets
  chick: '🐣', butterfly: '🦋', dragon: '🐲', unicorn: '🦄',
};

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '148,163,184';
}

export default function CharacterEditor({ characterData, onSave, onClose, level = 1 }) {
  const [draft, setDraft] = useState({ base: 'cat', ...characterData });
  const [activeTab, setActiveTab] = useState('base');

  const handleSelect = (slot, id) => {
    setDraft(prev => ({
      ...prev,
      [slot]: (slot !== 'base' && prev[slot] === id) ? null : id,
    }));
  };

  const items = SLOT_ITEMS[activeTab] || [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 3000 }}
      />

      {/* Bottom Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 3001,
        background: 'var(--bg-deep)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }}/>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 12px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, background: 'linear-gradient(90deg, var(--primary), #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            My Hero
          </h2>
          <button
            onClick={() => { onSave(draft); onClose(); }}
            style={{
              background: 'var(--primary)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-full)', padding: '10px 24px',
              fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            }}
          >Save ✓</button>
        </div>

        {/* Live preview */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '16px 0', gap: 20,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <CharacterDisplay characterData={draft} size={96} animated />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Equipped</div>
            {['hat','face','aura','pet'].map(slot => draft[slot] && (
              <div key={slot} style={{ fontSize: '0.8rem', color: 'var(--text-bright)', fontWeight: 600, marginBottom: 2 }}>
                {ITEM_ICONS[draft[slot]] || '✦'} {[...HATS,...FACE_ITEMS,...AURAS,...PETS].find(i=>i.id===draft[slot])?.name}
              </div>
            ))}
            {!draft.hat && !draft.face && !draft.aura && !draft.pet && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Nothing equipped yet</div>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '10px 8px', border: 'none', background: 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '0.77rem', cursor: 'pointer',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                whiteSpace: 'nowrap', minWidth: 56,
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div style={{ overflowY: 'auto', padding: '14px 12px 32px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>

            {/* "None" option for non-base slots */}
            {activeTab !== 'base' && (
              <button
                onClick={() => handleSelect(activeTab, null)}
                style={itemStyle(!draft[activeTab], null)}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: 6, opacity: 0.35 }}>✕</div>
                <div style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)' }}>None</div>
              </button>
            )}

            {items.map(item => {
              const unlocked = level >= item.levelUnlock;
              const rarity   = RARITY_COLORS[item.rarity || 'common'];
              const selected  = activeTab === 'base' ? draft.base === item.id : draft[activeTab] === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => unlocked && handleSelect(activeTab, item.id)}
                  style={itemStyle(selected, rarity, !unlocked)}
                  title={unlocked ? item.name : `Unlocks at Level ${item.levelUnlock}`}
                >
                  {/* Preview */}
                  {activeTab === 'base' ? (
                    <div style={{ marginBottom: 4 }}>
                      <CharacterDisplay characterData={{ base: item.id }} size={52} animated={false}/>
                    </div>
                  ) : activeTab === 'aura' ? (
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', margin: '0 auto 6px',
                      background: item.color === 'rainbow'
                        ? 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)'
                        : item.color,
                      boxShadow: `0 0 14px ${item.color === 'rainbow' ? '#fff' : item.color}77`,
                      animation: unlocked ? 'aura-pulse 2.5s ease-in-out infinite' : 'none',
                    }}/>
                  ) : (
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>{ITEM_ICONS[item.id]}</div>
                  )}

                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: selected ? '#fff' : 'var(--text-bright)', lineHeight: 1.2 }}>
                    {item.name}
                  </div>

                  {!unlocked && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 3, fontWeight: 700 }}>
                      🔒 Lv {item.levelUnlock}
                    </div>
                  )}
                  {unlocked && item.rarity && item.rarity !== 'common' && (
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: rarity.color, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {rarity.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function itemStyle(selected, rarity, locked) {
  const col = rarity?.color || '#94a3b8';
  return {
    padding: '10px 6px',
    borderRadius: 'var(--radius-md)',
    border: `2px solid ${selected ? col : 'rgba(255,255,255,0.08)'}`,
    background: selected ? `rgba(${hexToRgb(col)},0.15)` : 'rgba(255,255,255,0.03)',
    boxShadow: selected ? `0 0 14px ${col}44` : 'none',
    cursor: locked ? 'not-allowed' : 'pointer',
    opacity: locked ? 0.38 : 1,
    transition: 'all 0.15s',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: '100%', textAlign: 'center',
  };
}


