// ============================================
// UI HELPERS — Toast, Float, Confetti, Modal (Adapted for Next.js)
// ============================================

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

export function showConfetti(count = 40) {
  if (typeof window === 'undefined') return;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = `${-10 - Math.random() * 20}px`;
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3500);
  }
}
