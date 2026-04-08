// ============================================
// SETUP WIZARD PAGE
// ============================================

import { navigate } from '../router.js';
import { addChild, addMission, completeSetup } from '../state.js';
import { AVATAR_EMOJIS, MISSION_EMOJIS } from '../components/ui.js';

export function renderSetup() {
  const app = document.getElementById('app');
  let step = 1;
  let pin = '';
  let childName = '';
  let childAvatar = AVATAR_EMOJIS[0];
  let missionName = '';
  let missionIcon = MISSION_EMOJIS[0];

  function render() {
    app.innerHTML = `
      <div class="setup-page">
        <div class="setup-step">
          <!-- Step indicator -->
          <div class="setup-step-indicator">
            <div class="setup-dot ${step === 1 ? 'active' : step > 1 ? 'done' : ''}"></div>
            <div class="setup-dot ${step === 2 ? 'active' : step > 2 ? 'done' : ''}"></div>
            <div class="setup-dot ${step === 3 ? 'active' : ''}"></div>
          </div>

          ${step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
        </div>
      </div>
    `;
    attachEvents();
  }

  function renderStep1() {
    return `
      <h2 class="setup-step-title">🔒 Set Parent PIN</h2>
      <p class="setup-step-desc">This protects the parent dashboard. Pick 4 digits you'll remember.</p>
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
    `;
  }

  function renderStep2() {
    return `
      <h2 class="setup-step-title">👶 Add Your First Kid</h2>
      <p class="setup-step-desc">What's their name? Pick a fun avatar!</p>
      <div class="input-group" style="margin-bottom: var(--space-lg);">
        <label for="child-name">Name</label>
        <input type="text" class="input" id="child-name" placeholder="e.g. Luna" value="${childName}" maxlength="20" autocomplete="off" />
      </div>
      <div class="input-group">
        <label>Avatar</label>
        <div class="avatar-grid" id="avatar-grid">
          ${AVATAR_EMOJIS.map(e => `<button class="avatar-option ${e === childAvatar ? 'selected' : ''}" data-avatar="${e}">${e}</button>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary btn-block btn-lg" id="step2-next" style="margin-top: var(--space-xl);" ${!childName.trim() ? 'disabled' : ''}>
        Next →
      </button>
    `;
  }

  function renderStep3() {
    return `
      <h2 class="setup-step-title">🎯 First Mission</h2>
      <p class="setup-step-desc">Create a task your kid can complete today!</p>
      <div class="input-group" style="margin-bottom: var(--space-lg);">
        <label for="mission-name">Mission Name</label>
        <input type="text" class="input" id="mission-name" placeholder="e.g. Make Your Bed" value="${missionName}" maxlength="40" autocomplete="off" />
      </div>
      <div class="input-group" style="margin-bottom: var(--space-lg);">
        <label>Icon</label>
        <div class="emoji-picker" id="mission-icon-grid">
          ${MISSION_EMOJIS.map(e => `<button class="emoji-option ${e === missionIcon ? 'selected' : ''}" data-icon="${e}">${e}</button>`).join('')}
        </div>
      </div>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: var(--space-lg);">
        Reward: ⭐ 10 XP &nbsp; 🪙 5 Coins (you can customize later)
      </p>
      <button class="btn btn-gold btn-block btn-lg" id="step3-finish" ${!missionName.trim() ? 'disabled' : ''}>
        🚀 Let's Go!
      </button>
    `;
  }

  function attachEvents() {
    if (step === 1) {
      const pad = document.getElementById('pin-pad');
      pad.addEventListener('click', (e) => {
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
        // Auto advance when 4 digits entered
        if (pin.length === 4) {
          setTimeout(() => {
            step = 2;
            render();
          }, 300);
        }
      });
    }

    if (step === 2) {
      const nameInput = document.getElementById('child-name');
      nameInput.focus();
      nameInput.addEventListener('input', (e) => {
        childName = e.target.value;
        document.getElementById('step2-next').disabled = !childName.trim();
      });

      document.getElementById('avatar-grid').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-avatar]');
        if (!btn) return;
        childAvatar = btn.dataset.avatar;
        document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
      });

      document.getElementById('step2-next').addEventListener('click', () => {
        if (!childName.trim()) return;
        step = 3;
        render();
      });
    }

    if (step === 3) {
      const nameInput = document.getElementById('mission-name');
      nameInput.focus();
      nameInput.addEventListener('input', (e) => {
        missionName = e.target.value;
        document.getElementById('step3-finish').disabled = !missionName.trim();
      });

      document.getElementById('mission-icon-grid').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-icon]');
        if (!btn) return;
        missionIcon = btn.dataset.icon;
        document.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
      });

      document.getElementById('step3-finish').addEventListener('click', async () => {
        if (!missionName.trim()) return;
        // Disable button while saving
        document.getElementById('step3-finish').disabled = true;
        document.getElementById('step3-finish').textContent = 'Saving...';
        // Save everything
        await completeSetup(pin);
        await addChild(childName.trim(), childAvatar);
        await addMission(missionName.trim(), 10, 5, missionIcon, true, 1);
        navigate('/');
      });
    }
  }

  render();
}
