// ============================================
// ROLE SELECT PAGE
// ============================================

import { navigate } from '../router.js';
import { getChildren, verifyPin, isSetupComplete } from '../state.js';

export async function renderRoleSelect() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="page page-enter" style="display:flex;justify-content:center;align-items:center;height:100vh;">Loading...</div>';

  const setupComplete = await isSetupComplete();
  if (!setupComplete) {
    navigate('/setup');
    return;
  }

  const children = await getChildren();

  app.innerHTML = `
    <div class="role-select-page page-enter">
      <div class="role-select-logo">⚡</div>
      <h1 class="role-select-title">LifeXP</h1>
      <p class="role-select-subtitle">Turn real life into a game</p>

      <div class="role-select-buttons">
        <button class="role-btn role-btn-parent" id="btn-parent">
          <span class="role-btn-emoji">🔒</span>
          <span class="role-btn-text">
            <span class="role-btn-name">Parent Mode</span>
            <span class="role-btn-desc">Manage missions & rewards</span>
          </span>
        </button>

        ${children.length > 0 ? `
          <div class="role-divider">Players</div>
          ${children.map(child => `
            <button class="role-btn role-btn-child" data-child-id="${child.id}">
              <span class="role-btn-emoji">${child.avatar}</span>
              <span class="role-btn-text">
                <span class="role-btn-name">${child.name}</span>
                <span class="role-btn-desc">Level ${child.level} • ${child.xp} XP • ${child.coins} 🪙</span>
              </span>
            </button>
          `).join('')}
        ` : ''}
      </div>
    </div>
  `;

  // Parent button → PIN entry
  document.getElementById('btn-parent').addEventListener('click', () => {
    showPinEntry();
  });

  // Child buttons → direct entry
  document.querySelectorAll('[data-child-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.childId;
      navigate(`/kid/${id}`);
    });
  });
}

async function showPinEntry() {
  const app = document.getElementById('app');
  let pin = '';

  function render() {
    app.innerHTML = `
      <div class="pin-page page-enter">
        <button class="back-btn" id="pin-back" style="position:absolute; top: var(--space-lg); left: var(--space-lg);">←</button>
        <h2 class="pin-title">🔒 Enter Parent PIN</h2>
        <div class="pin-display" id="pin-dots">
          ${[0,1,2,3].map(i => `<div class="pin-dot ${i < pin.length ? 'filled' : ''}"></div>`).join('')}
        </div>
        <div class="pin-pad" id="pin-pad">
          ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-key" data-key="${n}">${n}</button>`).join('')}
          <button class="pin-key pin-key-empty"></button>
          <button class="pin-key" data-key="0">0</button>
          <button class="pin-key pin-key-delete" data-key="del">←</button>
        </div>
        <div class="pin-error" id="pin-error"></div>
      </div>
    `;

    document.getElementById('pin-back').addEventListener('click', () => navigate('/'));

    document.getElementById('pin-pad').addEventListener('click', (e) => {
      const key = e.target.closest('[data-key]');
      if (!key) return;
      const val = key.dataset.key;

      if (val === 'del') {
        pin = pin.slice(0, -1);
      } else if (pin.length < 4) {
        pin += val;
      }

      // Update dots
      document.querySelectorAll('.pin-dot').forEach((dot, i) => {
        dot.classList.toggle('filled', i < pin.length);
      });

      // Check PIN when 4 digits
      if (pin.length === 4) {
        setTimeout(() => {
          if (verifyPin(pin)) {
            navigate('/parent');
          } else {
            // Wrong PIN — shake and reset
            const dots = document.getElementById('pin-dots');
            const error = document.getElementById('pin-error');
            dots.classList.add('shake');
            error.textContent = 'Wrong PIN. Try again.';
            setTimeout(() => {
              pin = '';
              dots.classList.remove('shake');
              document.querySelectorAll('.pin-dot').forEach(d => d.classList.remove('filled'));
            }, 600);
          }
        }, 200);
      }
    });
  }

  render();
}
