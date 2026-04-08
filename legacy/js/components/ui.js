// ============================================
// UI HELPERS — Toast, Float, Confetti, Modal
// ============================================

// ---- TOAST ----

let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

export function showToast(message, type = 'success') {
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

// ---- FLOAT TEXT (coin/xp earn) ----

export function showFloat(text, color, x, y) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// ---- CONFETTI ----

const CONFETTI_COLORS = ['#facc15', '#a855f7', '#6366f1', '#22c55e', '#06b6d4', '#ef4444', '#f59e0b'];

export function showConfetti(count = 40) {
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

// ---- MODAL ----

export function showModal({ title, content, onConfirm, onCancel, confirmText = 'Save', cancelText = 'Cancel', confirmClass = 'btn-primary' }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal-content">
      <h3 class="modal-title">${title}</h3>
      <div id="modal-body"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="modal-cancel">${cancelText}</button>
        <button class="btn ${confirmClass}" id="modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const body = overlay.querySelector('#modal-body');
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }

  overlay.querySelector('#modal-cancel').onclick = () => {
    overlay.remove();
    if (onCancel) onCancel();
  };

  overlay.querySelector('#modal-confirm').onclick = async () => {
    if (onConfirm) {
      const btn = overlay.querySelector('#modal-confirm');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        const result = await onConfirm();
        if (result !== false) overlay.remove();
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } else {
      overlay.remove();
    }
  };

  // Close on backdrop click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onCancel) onCancel();
    }
  };

  return overlay;
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.remove();
}

// ---- LEVEL UP OVERLAY ----

export function showLevelUpOverlay(levelInfo, onDismiss) {
  showConfetti(50);

  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML = `
    <div class="level-up-emoji">${levelInfo.emoji}</div>
    <div class="level-up-text">LEVEL UP!</div>
    <div class="level-up-title">Level ${levelInfo.level} — ${levelInfo.title}</div>
    <div class="level-up-detail">Keep going! You're amazing! 🎉</div>
    <button class="btn btn-gold btn-lg" id="level-up-dismiss">Awesome!</button>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#level-up-dismiss').onclick = () => {
    overlay.remove();
    if (onDismiss) onDismiss();
  };
}

// ---- EMOJI SETS ----

export const AVATAR_EMOJIS = ['🦊', '🐱', '🐶', '🦁', '🐼', '🐸', '🦄', '🐲', '🐵', '🐰', '🐨', '🦋', '🐯', '🐧', '🦖', '🐙', '👾', '🤖', '🥷', '🦸', '🧙'];

export const MISSION_EMOJIS = ['⭐', '🛏️', '📚', '🧹', '🍽️', '🦷', '🎒', '✏️', '🏃', '🎵', '🐕', '🌱', '🧺', '🗑️', '💪', '🚿', '🪴', '🍎', '💦', '🧘', '🚲', '🎹', '🛠️', '📖'];

export const REWARD_EMOJIS = ['🍦', '📺', '🎮', '🌙', '🎬', '🍕', '🧸', '🎨', '🏊', '⚽', '🎪', '🍰', '📱', '🛍️', '🎁', '🎢', '🎟️', '🍟', '🍩', '🛴', '🧩', '🎳', '💸', '🏆'];
