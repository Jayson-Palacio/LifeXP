// ============================================
// UI HELPERS — Toast, Float, Confetti, Modal (Adapted for Next.js)
// ============================================
import React from 'react';
import { createRoot } from 'react-dom/client';
import TierCrest from '../components/TierCrest';
import { playRandomSuccessSound, playTierUpSwell } from './sounds';

export const AVATAR_EMOJIS = ['🦊', '🐱', '🐶', '🦁', '🐼', '🐸', '🦄', '🐲', '🐵', '🐰', '🐨', '🦋', '🐯', '🐧', '🦖', '🐙', '👾', '🤖', '🥷', '🦸', '🧙'];
export const MISSION_EMOJIS = ['⭐', '🛏️', '📚', '🧹', '🍽️', '🦷', '🎒', '✏️', '🏃', '🎵', '🐕', '🌱', '🧺', '🗑️', '💪', '🚿', '🪴', '🍎', '💦', '🧘', '🚲', '🎹', '🛠️', '📖'];
export const REWARD_EMOJIS = ['🍦', '📺', '🎮', '🌙', '🎬', '🍕', '🧸', '🎨', '🏊', '⚽', '🎪', '🍰', '📱', '🛍️', '🎁', '🎢', '🎟️', '🍟', '🍩', '🛴', '🧩', '🎳', '💸', '🏆'];

let toastContainer = null;

function ensureToastContainer() {
  if (typeof window === 'undefined') return;
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

export function showToast(message, type = 'success') {
  if (typeof window === 'undefined') return;
  ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

export function showFloat(text, color, x, y) {
  if (typeof window === 'undefined') return;
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

const CONFETTI_COLORS = ['#facc15', '#a855f7', '#6366f1', '#22c55e', '#06b6d4', '#ef4444', '#f59e0b'];

export function showConfetti(count = 40, themeHex = null) {
  if (typeof window === 'undefined') return;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = `${-10 - Math.random() * 20}px`;
    
    // Use theme color predominantly if provided, otherwise random mixed
    if (themeHex && Math.random() > 0.3) {
       // if themeHex is 'animated' string, fallback to gold
       piece.style.background = themeHex === 'animated' ? '#facc15' : themeHex;
    } else {
       piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    }

    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3500);
  }
}

// ---------------------------------------------------------
// CELEBRATION CEREMONIES
// ---------------------------------------------------------

function insertOverlay(contentElement, durationMs = 5000) {
  if (typeof window === 'undefined') return;
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  document.body.appendChild(overlay);

  const root = createRoot(overlay);
  root.render(contentElement);

  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 500ms ease';
    setTimeout(() => {
      root.unmount();
      overlay.remove();
    }, 500);
  }, durationMs);
}

export function showLevelUp(level, tierName, unlockedColorObj = null) {
  playRandomSuccessSound();
  
  if (unlockedColorObj) {
      showConfetti(60, unlockedColorObj.hex);
  } else {
      showConfetti();
  }

  insertOverlay(
    <>
      <div style={{ width: 180, height: 180, animation: 'levelUpPulse 0.8s var(--ease-bounce)' }}>
         <TierCrest tierName={tierName} glowColor="var(--primary)" />
      </div>
      <div className="level-up-text">Level {level}</div>
      <div className="level-up-detail">{tierName}</div>
      
      {unlockedColorObj && (
        <div style={{ marginTop: 24, padding: '16px 24px', background: 'var(--bg-surface)', border: `1px solid ${unlockedColorObj.hex === 'animated' ? 'var(--gold)' : unlockedColorObj.hex}`, borderRadius: 'var(--radius-lg)', animation: 'slideUp 0.8s ease-out 0.5s both', display: 'flex', alignItems: 'center', gap: 16 }}>
           <div style={{ width: 32, height: 32, borderRadius: '50%', background: unlockedColorObj.hex === 'animated' ? 'linear-gradient(135deg, #facc15, #a855f7, #06b6d4)' : unlockedColorObj.hex }} />
           <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Theme Unlocked</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{unlockedColorObj.name}</div>
           </div>
        </div>
      )}
    </>
  , 4000);
}

export function showTierUp(level, tierName) {
  playTierUpSwell();
  showConfetti(100);

  // For Tier Up, we use a more dramatic background via inline style overlay wrapper if possible, 
  // but CSS class 'level-up-overlay' has backdrop-blur which is already very dramatic.
  insertOverlay(
    <>
      <div style={{ width: 250, height: 250, animation: 'scaleIn 1.5s var(--ease-bounce)' }}>
         <TierCrest tierName={tierName} glowColor="var(--primary)" />
      </div>
      <div style={{ marginTop: 32, fontSize: '1.5rem', opacity: 0.8, animation: 'fadeIn 2s ease-in 1s both' }}>You are now...</div>
      <div className="level-up-text" style={{ fontSize: '3.5rem', animation: 'levelUpGlow 2s infinite, slideUp 1s ease-out 1.5s both' }}>
         {tierName}
      </div>
    </>
  , 6000);
}
