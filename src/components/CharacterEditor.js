'use client';

import { useState } from 'react';
import { PETS, RARITY_COLORS } from '../lib/character';
import CharacterDisplay from './CharacterDisplay';

export default function CharacterEditor({ characterData, onSave, onClose, level = 1 }) {
  const [selected, setSelected] = useState(characterData?.petId || null);

  const handleSave = () => {
    if (selected) onSave({ petId: selected });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 3000 }}/>

      {/* Bottom Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 3001,
        background: 'var(--bg-deep)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }}/>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 0' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, background: 'linear-gradient(90deg, var(--primary), #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Choose Your Pet
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Level up to unlock rarer companions
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={!selected}
            style={{
              background: selected ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
              color: selected ? '#fff' : 'var(--text-dim)',
              border: 'none', borderRadius: 'var(--radius-full)',
              padding: '10px 22px', fontWeight: 800, fontSize: '0.95rem',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: selected ? '0 4px 14px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {selected ? 'Choose ✓' : 'Pick one'}
          </button>
        </div>

        {/* Live preview of selected pet */}
        {selected && (() => {
          const def = PETS.find(p => p.id === selected);
          const rar = RARITY_COLORS[def?.rarity || 'common'];
          return (
            <div style={{
              margin: '12px 16px 0',
              padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${rar.color}44`,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <CharacterDisplay characterData={{ petId: selected }} size={56} animated />
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-bright)' }}>{def?.name}</div>
                <div style={{ fontSize: '0.75rem', color: rar.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{rar.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{def?.tag}</div>
              </div>
            </div>
          );
        })()}

        {/* Pet grid */}
        <div style={{ overflowY: 'auto', padding: '14px 12px 36px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {PETS.map(pet => {
              const unlocked = level >= pet.levelUnlock;
              const isSelected = selected === pet.id;
              const rar = RARITY_COLORS[pet.rarity];

              return (
                <button
                  key={pet.id}
                  onClick={() => unlocked && setSelected(pet.id)}
                  style={{
                    padding: '12px 8px 10px',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? rar.color : 'rgba(255,255,255,0.08)'}`,
                    background: isSelected
                      ? `rgba(${hexToRgb(rar.color)},0.12)`
                      : 'rgba(255,255,255,0.03)',
                    boxShadow: isSelected ? `0 0 16px ${rar.color}44` : 'none',
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    opacity: unlocked ? 1 : 0.38,
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Pet preview */}
                  {unlocked ? (
                    <CharacterDisplay characterData={{ petId: pet.id }} size={60} animated={isSelected} />
                  ) : (
                    <div style={{
                      width: 60, height: 70, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      <span style={{ fontSize: '1.8rem', filter: 'grayscale(1)', opacity: 0.4 }}>{pet.emoji}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isSelected ? rar.color : 'var(--text-bright)', marginTop: 4, textAlign: 'center' }}>
                    {pet.name}
                  </div>

                  {/* Lock or rarity */}
                  {!unlocked ? (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 2, fontWeight: 700 }}>
                      🔒 Lv {pet.levelUnlock}
                    </div>
                  ) : pet.rarity !== 'common' ? (
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: rar.color, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {rar.label}
                    </div>
                  ) : null}

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 18, height: 18, borderRadius: '50%',
                      background: rar.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', color: '#fff', fontWeight: 900,
                    }}>✓</div>
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

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '148,163,184';
}
