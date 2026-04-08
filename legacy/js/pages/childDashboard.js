// ============================================
// CHILD DASHBOARD PAGE
// ============================================

import { navigate } from '../router.js';
import { getChild, getMissions, getTodayCompletionsForChild, submitCompletion, clearLevelUp, updateChildTheme } from '../state.js';
import { getLevelForXP, getXPProgress, getXPDisplay } from '../utils/levels.js';
import { showToast, showLevelUpOverlay } from '../components/ui.js';
import { playClick, playSuccess, playLevelUp } from '../utils/sounds.js';
import { fireConfetti } from '../utils/confetti.js';

export async function renderChildDashboard(params) {
  const app = document.getElementById('app');
  const childId = params.id;

  async function render() {
    app.innerHTML = '<div class="page page-enter" style="display:flex;justify-content:center;align-items:center;height:100vh;">Loading Dashboard...</div>';
    
    const [child, missions, todayCompletions] = await Promise.all([
      getChild(childId),
      getMissions(),
      getTodayCompletionsForChild(childId)
    ]);

    if (!child) {
      document.body.className = '';
      navigate('/');
      return;
    }

    // Apply Theme
    document.body.className = `theme-${child.theme || 'indigo'}`;

    const levelInfo = getLevelForXP(child.xp);
    const xpProgress = getXPProgress(child.xp);

    // Determine mission states
    const missionStates = missions.map(m => {
      const thisMissionCompletions = todayCompletions.filter(c => c.missionId === m.id);
      
      const validCompletions = thisMissionCompletions.filter(c => c.status !== 'rejected');
      const rejectedCompletions = thisMissionCompletions.filter(c => c.status === 'rejected');
      
      const totalDone = validCompletions.length;
      const max = m.maxCompletions || 1;
      
      if (totalDone >= max) {
        return {
          ...m, totalDone, max,
          status: validCompletions.some(c => c.status === 'pending') ? 'pending' : 'approved'
        };
      }
      
      const isRetry = rejectedCompletions.length > 0 && totalDone === 0;
      
      return {
        ...m, totalDone, max,
        status: isRetry ? 'rejected' : 'available'
      };
    });

    app.innerHTML = `
      <div class="page page-enter">
        <!-- Header -->
        <div class="page-header">
          <button class="back-btn" id="back-btn">←</button>
          <h1 class="page-title">${child.name}'s Quest</h1>
        </div>

        <!-- Hero Card -->
        <div class="hero-card" style="box-shadow: 0 10px 30px var(--glow-primary); border-color: var(--primary-dim);">
          <div class="hero-avatar">${child.avatar}</div>
          <h2 class="hero-name">${child.name}</h2>
          <div class="hero-level" style="color: var(--primary);">Level ${levelInfo.level} — ${levelInfo.title} ${levelInfo.emoji}</div>

          <!-- XP Bar -->
          <div class="xp-bar-container">
            <div class="xp-bar-label">
              <span>${levelInfo.title}</span>
              <span>${getXPDisplay(child.xp)}</span>
            </div>
            <div class="xp-bar-track">
              <div class="xp-bar-fill" id="xp-fill" style="width: 0%; background: linear-gradient(90deg, var(--gold), var(--primary));"></div>
            </div>
          </div>

          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-icon">🪙</span>
              <span class="stat-value-amber">${child.coins}</span>
            </div>
            ${child.streak > 0 ? `
              <div class="stat-item">
                <span class="stat-icon">🔥</span>
                <span class="stat-value-cyan">${child.streak} day${child.streak > 1 ? 's' : ''}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Missions -->
        <div class="section">
          <div class="section-header">
            <h3 class="section-title">Today's Missions</h3>
          </div>

          ${missions.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-emoji">🎯</div>
              <p class="empty-state-text">No missions yet!<br/>Ask your parent to create some.</p>
            </div>
          ` : missionStates.map(m => `
            <div class="mission-card ${m.status === 'pending' ? 'pending' : ''}" data-mission-id="${m.id}" style="${m.status === 'available' ? 'border-left-color: var(--primary);' : ''}">
              <span class="mission-icon">${m.icon}</span>
              <div class="mission-info">
                <div class="mission-name">${m.name}</div>
                <div class="mission-rewards">
                  <span class="badge badge-gold">⭐ ${m.xpReward} XP</span>
                  <span class="badge badge-amber">🪙 ${m.coinReward}</span>
                </div>
              </div>
              <div class="mission-actions">
                ${m.status === 'available' || m.status === 'rejected' ? `
                  <button class="btn btn-primary btn-sm mission-done-btn" data-mission-id="${m.id}">
                    ${m.status === 'rejected' ? 'Retry ↻' : 'Done! ✓'} ${m.max > 1 ? `(${m.totalDone}/${m.max})` : ''}
                  </button>
                ` : m.status === 'pending' ? `
                  <span class="badge badge-gold">⏳ Pending ${m.max > 1 ? `(${m.totalDone}/${m.max})` : ''}</span>
                ` : `
                  <span class="badge badge-green">✅ Done ${m.max > 1 ? `(${m.max}/${m.max})` : ''}</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
          <button class="btn btn-gold btn-lg" id="shop-btn" style="flex: 2;">
            🛒 Reward Shop
          </button>
          <button class="btn btn-ghost btn-lg" id="theme-btn" style="flex: 1;" title="Theme">
            🎨 Color
          </button>
        </div>
      </div>
      
      <!-- Theme Modal -->
      <div class="modal-overlay" id="theme-modal" style="display: none; z-index: 5000;">
        <div class="modal-content" style="border-top: 4px solid var(--primary);">
          <h3 class="modal-title" style="text-align:center;">Choose Your Color 🎨</h3>
          <div class="avatar-grid" style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
             ${['indigo', 'gold', 'green', 'purple', 'cyan', 'red', 'amber'].map(t => `
               <button class="avatar-option theme-option ${child.theme === t ? 'selected' : ''}" data-theme="${t}">
                 <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--${t}); box-shadow: var(--glow-${t});"></div>
               </button>
             `).join('')}
          </div>
          <button class="btn btn-ghost btn-block" id="close-theme-btn">Done</button>
        </div>
      </div>
    `;

    // Animate XP bar
    requestAnimationFrame(() => {
      const fill = document.getElementById('xp-fill');
      if (fill) fill.style.width = `${Math.round(xpProgress * 100)}%`;
    });

    // Check for level up
    if (child.pendingLevelUp && child.newLevel) {
      const newLevel = child.newLevel;
      await clearLevelUp(childId);
      setTimeout(() => {
        playLevelUp();
        fireConfetti();
        showLevelUpOverlay(newLevel, () => render());
      }, 500);
    }

    attachEvents();
  }

  function attachEvents() {
    document.getElementById('back-btn')?.addEventListener('click', () => {
      playClick();
      // Reset body theme class upon leaving dashboard
      document.body.className = '';
      navigate('/');
    });

    document.querySelectorAll('.mission-done-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        playSuccess();
        const missionId = e.target.dataset.missionId;
        e.target.disabled = true;
        e.target.textContent = '...';
        await submitCompletion(missionId, childId);
        showToast('Mission submitted! ⏳ Waiting for approval');
        render();
      });
    });

    document.getElementById('shop-btn')?.addEventListener('click', () => {
      playClick();
      navigate(`/kid/${childId}/shop`);
    });

    const themeModal = document.getElementById('theme-modal');
    document.getElementById('theme-btn')?.addEventListener('click', () => {
      playClick();
      themeModal.style.display = 'flex';
    });

    document.getElementById('close-theme-btn')?.addEventListener('click', () => {
      playClick();
      themeModal.style.display = 'none';
    });

    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        playClick();
        const t = e.currentTarget.dataset.theme;
        await updateChildTheme(childId, t);
        await render();
        // ensure modal stays open during render since we re-rendered
        document.getElementById('theme-modal').style.display = 'flex';
      });
    });
  }

  await render();
}
