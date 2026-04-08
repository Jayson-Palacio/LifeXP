// ============================================
// REWARD SHOP PAGE
// ============================================

import { navigate } from '../router.js';
import { getChild, getRewards, redeemReward } from '../state.js';
import { showToast, showFloat } from '../components/ui.js';
import { playClick, playCoin, playSuccess } from '../utils/sounds.js';
import { fireConfetti } from '../utils/confetti.js';

export async function renderRewardShop(params) {
  const app = document.getElementById('app');
  const childId = params.id;

  async function render() {
    app.innerHTML = '<div class="page page-enter" style="display:flex;justify-content:center;align-items:center;height:100vh;">Loading Shop...</div>';
    const child = await getChild(childId);
    if (!child) {
      document.body.className = '';
      navigate('/');
      return;
    }

    // Apply Theme
    document.body.className = `theme-${child.theme || 'indigo'}`;
    const rewards = await getRewards();

    app.innerHTML = `
      <div class="page page-enter">
        <!-- Header -->
        <div class="page-header">
          <button class="back-btn" id="back-btn">←</button>
          <h1 class="page-title">Reward Shop</h1>
          <div class="stat-item" style="margin-left: auto;">
            <span class="stat-icon">🪙</span>
            <span class="stat-value-amber" id="coin-count">${child.coins}</span>
          </div>
        </div>

        ${rewards.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-emoji">🛒</div>
            <p class="empty-state-text">No rewards yet!<br/>Ask your parent to add some.</p>
          </div>
        ` : `
          <div class="reward-grid">
            ${rewards.map(r => {
              const canAfford = child.coins >= r.cost;
              return `
                <div class="reward-card" style="border-top: 2px solid ${canAfford ? 'var(--primary)' : 'transparent'};">
                  <div class="reward-icon">${r.icon}</div>
                  <div class="reward-name">${r.name}</div>
                  <div class="reward-cost">🪙 ${r.cost}</div>
                  <button class="btn ${canAfford ? 'btn-gold' : 'btn-ghost'} btn-sm btn-block redeem-btn"
                    data-reward-id="${r.id}" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? 'Redeem!' : 'Need more 🪙'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    document.getElementById('back-btn')?.addEventListener('click', () => {
      playClick();
      navigate(`/kid/${childId}`);
    });

    document.querySelectorAll('.redeem-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        playClick();
        btn.disabled = true;
        btn.textContent = '...';
        const rewardId = e.target.dataset.rewardId;
        const result = await redeemReward(rewardId, childId);
        if (result) {
          // Play sounds & confetti
          setTimeout(playSuccess, 50);
          setTimeout(playCoin, 200);
          fireConfetti();
          // Float animation
          const rect = e.target.getBoundingClientRect();
          showFloat(`-${result.reward.cost} 🪙`, '#f59e0b', rect.left + rect.width / 2, rect.top);
          showToast(`🎉 Redeemed: ${result.reward.name}!`);
          render();
        } else {
          btn.disabled = false;
          btn.textContent = 'Need more 🪙';
          showToast('Not enough coins or error!', 'error');
        }
      });
    });
  }

  await render();
}
