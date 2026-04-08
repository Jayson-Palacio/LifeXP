// ============================================
// PARENT DASHBOARD PAGE
// ============================================

import { navigate } from '../router.js';
import {
  getChildren, addChild, updateChild, deleteChild,
  getMissions, addMission, updateMission, deleteMission,
  getRewards, addReward, updateReward, deleteReward,
  getPendingCompletions, approveCompletion, rejectCompletion,
  getRedemptions,
} from '../state.js';
import { getLevelForXP } from '../utils/levels.js';
import { showToast, showModal, showFloat, AVATAR_EMOJIS, MISSION_EMOJIS, REWARD_EMOJIS } from '../components/ui.js';

export async function renderParentDashboard() {
  const app = document.getElementById('app');
  let activeTab = 'approvals';

  async function render() {
    // Show quick skeleton / loader
    if (app.innerHTML === '') {
      app.innerHTML = '<div class="page page-enter" style="display:flex;justify-content:center;align-items:center;height:100vh;">Loading Dashboard...</div>';
    }

    const [children, missions, rewards, pending] = await Promise.all([
      getChildren(),
      getMissions(),
      getRewards(),
      getPendingCompletions()
    ]);

    app.innerHTML = `
      <div class="page page-enter">
        <!-- Header -->
        <div class="page-header">
          <button class="back-btn" id="back-btn">←</button>
          <h1 class="page-title">Parent Dashboard</h1>
        </div>

        <!-- Tabs -->
        <div class="parent-tabs">
          <button class="parent-tab ${activeTab === 'approvals' ? 'active' : ''}" data-tab="approvals">
            Approvals
            ${pending.length > 0 ? `<span class="notification-dot"></span>` : ''}
          </button>
          <button class="parent-tab ${activeTab === 'missions' ? 'active' : ''}" data-tab="missions">Missions</button>
          <button class="parent-tab ${activeTab === 'rewards' ? 'active' : ''}" data-tab="rewards">Rewards</button>
          <button class="parent-tab ${activeTab === 'kids' ? 'active' : ''}" data-tab="kids">Kids</button>
        </div>

        <!-- Tab Content -->
        <div id="tab-content">
          ${activeTab === 'approvals' ? renderApprovals(pending, children, missions) : ''}
          ${activeTab === 'missions' ? renderMissions(missions) : ''}
          ${activeTab === 'rewards' ? renderRewards(rewards) : ''}
          ${activeTab === 'kids' ? renderKids(children) : ''}
        </div>
      </div>
    `;

    attachEvents(children, missions, rewards);
  }

  // ---- TAB: APPROVALS ----
  function renderApprovals(pending, children, missions) {
    if (pending.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-emoji">✅</div>
          <p class="empty-state-text">All caught up!<br/>No pending approvals.</p>
        </div>
      `;
    }

    return pending.map(comp => {
      const child = children.find(c => c.id === comp.childId);
      const mission = missions.find(m => m.id === comp.missionId);
      if (!child || !mission) return '';

      return `
        <div class="approval-card" data-comp-id="${comp.id}">
          <span class="mission-icon">${mission.icon}</span>
          <div class="approval-info">
            <div class="approval-child">${child.avatar} ${child.name}</div>
            <div class="approval-mission">${mission.name}</div>
            <div class="mission-rewards" style="margin-top: 4px;">
              <span class="badge badge-gold">⭐ ${mission.xpReward} XP</span>
              <span class="badge badge-amber">🪙 ${mission.coinReward}</span>
            </div>
          </div>
          <div class="approval-actions">
            <button class="btn btn-success btn-icon approve-btn" data-comp-id="${comp.id}" title="Approve">✓</button>
            <button class="btn btn-danger btn-icon reject-btn" data-comp-id="${comp.id}" title="Reject">✗</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ---- TAB: MISSIONS ----
  function renderMissions(missions) {
    return `
      <button class="btn btn-primary btn-block" id="add-mission-btn" style="margin-bottom: var(--space-lg);">+ Add Mission</button>
      ${missions.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-emoji">🎯</div>
          <p class="empty-state-text">No missions yet.<br/>Add one to get started!</p>
        </div>
      ` : missions.map(m => `
        <div class="mission-card">
          <span class="mission-icon">${m.icon}</span>
          <div class="mission-info">
            <div class="mission-name">${m.name}</div>
            <div class="mission-rewards">
              <span class="badge badge-gold">⭐ ${m.xpReward}</span>
              <span class="badge badge-amber">🪙 ${m.coinReward}</span>
            </div>
          </div>
          <div class="mission-actions">
            <button class="btn btn-ghost btn-icon edit-mission-btn" data-id="${m.id}" title="Edit">✎</button>
            <button class="btn btn-ghost btn-icon delete-mission-btn" data-id="${m.id}" title="Delete">🗑</button>
          </div>
        </div>
      `).join('')}
    `;
  }

  // ---- TAB: REWARDS ----
  function renderRewards(rewards) {
    return `
      <button class="btn btn-primary btn-block" id="add-reward-btn" style="margin-bottom: var(--space-lg);">+ Add Reward</button>
      ${rewards.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-emoji">🎁</div>
          <p class="empty-state-text">No rewards yet.<br/>Add treats your kids can earn!</p>
        </div>
      ` : `
        <div class="reward-grid">
          ${rewards.map(r => `
            <div class="reward-card">
              <div class="reward-icon">${r.icon}</div>
              <div class="reward-name">${r.name}</div>
              <div class="reward-cost">🪙 ${r.cost}</div>
              <div style="display:flex; gap: 4px; justify-content: center;">
                <button class="btn btn-ghost btn-sm edit-reward-btn" data-id="${r.id}">Edit</button>
                <button class="btn btn-ghost btn-sm delete-reward-btn" data-id="${r.id}">🗑</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  }

  // ---- TAB: KIDS ----
  function renderKids(children) {
    return `
      <button class="btn btn-primary btn-block" id="add-child-btn" style="margin-bottom: var(--space-lg);">+ Add Kid</button>
      ${children.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-emoji">👶</div>
          <p class="empty-state-text">No kids added yet.</p>
        </div>
      ` : children.map(c => {
        const lvl = getLevelForXP(c.xp);
        return `
          <div class="child-card">
            <span class="child-card-avatar">${c.avatar}</span>
            <div class="child-card-info">
              <div class="child-card-name">${c.name}</div>
              <div class="child-card-stats">
                <span>Lv ${lvl.level} ${lvl.emoji}</span>
                <span>⭐ ${c.xp} XP</span>
                <span>🪙 ${c.coins}</span>
                ${c.streak > 0 ? `<span>🔥 ${c.streak}</span>` : ''}
              </div>
            </div>
            <div style="display:flex; gap: 4px;">
              <button class="btn btn-ghost btn-icon edit-child-btn" data-id="${c.id}" title="Edit">✎</button>
              <button class="btn btn-ghost btn-icon delete-child-btn" data-id="${c.id}" title="Delete">🗑</button>
            </div>
          </div>
        `;
      }).join('')}
    `;
  }

  // ---- EVENTS ----
  function attachEvents(children, missions, rewards) {
    // Back
    document.getElementById('back-btn')?.addEventListener('click', () => navigate('/'));

    // Tabs
    document.querySelectorAll('.parent-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        render(); // Don't await on tab click, let it rerender
      });
    });

    // Approve / Reject
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        btn.disabled = true;
        const compId = btn.dataset.compId;
        const result = await approveCompletion(compId);
        if (result) {
          const rect = btn.getBoundingClientRect();
          showFloat(`+${result.mission.xpReward} ⭐`, '#facc15', rect.left, rect.top);
          showToast(`✅ Approved! ${result.child.name} earned ${result.mission.xpReward} XP${result.bonusXP ? ` (+${result.bonusXP} streak bonus)` : ''}`);
          if (result.leveledUp) {
            showToast(`🎉 ${result.child.name} leveled up to ${result.child.level}!`, 'info');
          }
        }
        await render();
      });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        btn.disabled = true;
        await rejectCompletion(btn.dataset.compId);
        showToast('❌ Mission rejected', 'error');
        await render();
      });
    });

    // Add mission
    document.getElementById('add-mission-btn')?.addEventListener('click', () => {
      showMissionForm();
    });

    // Edit mission
    document.querySelectorAll('.edit-mission-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mission = missions.find(m => m.id === btn.dataset.id);
        if (mission) showMissionForm(mission);
      });
    });

    // Delete mission
    document.querySelectorAll('.delete-mission-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        await deleteMission(btn.dataset.id);
        showToast('Mission deleted');
        await render();
      });
    });

    // Add reward
    document.getElementById('add-reward-btn')?.addEventListener('click', () => {
      showRewardForm();
    });

    // Edit reward
    document.querySelectorAll('.edit-reward-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const reward = rewards.find(r => r.id === btn.dataset.id);
        if (reward) showRewardForm(reward);
      });
    });

    // Delete reward
    document.querySelectorAll('.delete-reward-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        await deleteReward(btn.dataset.id);
        showToast('Reward deleted');
        await render();
      });
    });

    // Add child
    document.getElementById('add-child-btn')?.addEventListener('click', () => {
      showChildForm();
    });

    // Edit child
    document.querySelectorAll('.edit-child-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const child = children.find(c => c.id === btn.dataset.id);
        if (child) showChildForm(child);
      });
    });

    // Delete child
    document.querySelectorAll('.delete-child-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const child = children.find(c => c.id === btn.dataset.id);
        if (!child) return;
        showModal({
          title: `Delete ${child.name}?`,
          content: `<p style="color: var(--text-muted);">This will remove ${child.name} and all their progress. This cannot be undone.</p>`,
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: async () => {
            await deleteChild(btn.dataset.id);
            showToast(`${child.name} removed`);
            await render();
          },
        });
      });
    });
  }

  // ---- MODAL FORMS ----

  function showMissionForm(existing = null) {
    let selectedIcon = existing?.icon || MISSION_EMOJIS[0];

    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div class="input-group" style="margin-bottom: var(--space-md);">
        <label for="m-name">Mission Name</label>
        <input type="text" class="input" id="m-name" value="${existing?.name || ''}" placeholder="e.g. Make Your Bed" maxlength="40" autocomplete="off" />
      </div>
      <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-md);">
        <div class="input-group" style="flex:1;">
          <label for="m-xp">XP Reward</label>
          <input type="number" class="input" id="m-xp" value="${existing?.xpReward || 10}" min="1" max="100" />
        </div>
        <div class="input-group" style="flex:1;">
          <label for="m-coin">Coins</label>
          <input type="number" class="input" id="m-coin" value="${existing?.coinReward || 5}" min="1" max="100" />
        </div>
        <div class="input-group" style="flex:1;">
          <label for="m-max" title="Max times per day">Limit</label>
          <input type="number" class="input" id="m-max" value="${existing?.maxCompletions || 1}" min="1" max="50" />
        </div>
      </div>
      <div class="input-group">
        <label>Icon</label>
        <div class="emoji-picker" id="m-icon-grid">
          ${MISSION_EMOJIS.map(e => `<button class="emoji-option ${e === selectedIcon ? 'selected' : ''}" data-icon="${e}" type="button">${e}</button>`).join('')}
        </div>
      </div>
    `;

    formEl.querySelector('#m-icon-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-icon]');
      if (!btn) return;
      selectedIcon = btn.dataset.icon;
      formEl.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
    });

    showModal({
      title: existing ? 'Edit Mission' : 'New Mission',
      content: formEl,
      confirmText: existing ? 'Save' : 'Create',
      onConfirm: async () => {
        const name = formEl.querySelector('#m-name').value.trim();
        const xp = parseInt(formEl.querySelector('#m-xp').value) || 10;
        const coin = parseInt(formEl.querySelector('#m-coin').value) || 5;
        const max = parseInt(formEl.querySelector('#m-max').value) || 1;
        if (!name) {
          showToast('Name is required', 'error');
          return false; // keeps modal open
        }
        if (existing) {
          await updateMission(existing.id, { name, xpReward: xp, coinReward: coin, icon: selectedIcon, maxCompletions: max });
          showToast('Mission updated!');
        } else {
          await addMission(name, xp, coin, selectedIcon, true, max);
          showToast('Mission created! 🎯');
        }
        await render();
      },
    });

    setTimeout(() => formEl.querySelector('#m-name')?.focus(), 100);
  }

  function showRewardForm(existing = null) {
    let selectedIcon = existing?.icon || REWARD_EMOJIS[0];

    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div class="input-group" style="margin-bottom: var(--space-md);">
        <label for="r-name">Reward Name</label>
        <input type="text" class="input" id="r-name" value="${existing?.name || ''}" placeholder="e.g. Ice Cream" maxlength="40" autocomplete="off" />
      </div>
      <div class="input-group" style="margin-bottom: var(--space-md);">
        <label for="r-cost">Cost (coins)</label>
        <input type="number" class="input" id="r-cost" value="${existing?.cost || 20}" min="1" max="1000" />
      </div>
      <div class="input-group">
        <label>Icon</label>
        <div class="emoji-picker" id="r-icon-grid">
          ${REWARD_EMOJIS.map(e => `<button class="emoji-option ${e === selectedIcon ? 'selected' : ''}" data-icon="${e}" type="button">${e}</button>`).join('')}
        </div>
      </div>
    `;

    formEl.querySelector('#r-icon-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-icon]');
      if (!btn) return;
      selectedIcon = btn.dataset.icon;
      formEl.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
    });

    showModal({
      title: existing ? 'Edit Reward' : 'New Reward',
      content: formEl,
      confirmText: existing ? 'Save' : 'Create',
      onConfirm: async () => {
        const name = formEl.querySelector('#r-name').value.trim();
        const cost = parseInt(formEl.querySelector('#r-cost').value) || 20;
        if (!name) {
          showToast('Name is required', 'error');
          return false;
        }
        if (existing) {
          await updateReward(existing.id, { name, cost, icon: selectedIcon });
          showToast('Reward updated!');
        } else {
          await addReward(name, cost, selectedIcon);
          showToast('Reward created! 🎁');
        }
        await render();
      },
    });

    setTimeout(() => formEl.querySelector('#r-name')?.focus(), 100);
  }

  function showChildForm(existing = null) {
    let selectedAvatar = existing?.avatar || AVATAR_EMOJIS[0];

    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div class="input-group" style="margin-bottom: var(--space-md);">
        <label for="c-name">Name</label>
        <input type="text" class="input" id="c-name" value="${existing?.name || ''}" placeholder="Kid's name" maxlength="20" autocomplete="off" />
      </div>
      <div class="input-group">
        <label>Avatar</label>
        <div class="avatar-grid" id="c-avatar-grid">
          ${AVATAR_EMOJIS.map(e => `<button class="avatar-option ${e === selectedAvatar ? 'selected' : ''}" data-avatar="${e}" type="button">${e}</button>`).join('')}
        </div>
      </div>
    `;

    formEl.querySelector('#c-avatar-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-avatar]');
      if (!btn) return;
      selectedAvatar = btn.dataset.avatar;
      formEl.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
    });

    showModal({
      title: existing ? `Edit ${existing.name}` : 'Add Kid',
      content: formEl,
      confirmText: existing ? 'Save' : 'Add',
      onConfirm: async () => {
        const name = formEl.querySelector('#c-name').value.trim();
        if (!name) {
          showToast('Name is required', 'error');
          return false;
        }
        if (existing) {
          await updateChild(existing.id, { name, avatar: selectedAvatar });
          showToast(`${name} updated!`);
        } else {
          await addChild(name, selectedAvatar);
          showToast(`${name} added! 🎉`);
        }
        await render();
      },
    });

    setTimeout(() => formEl.querySelector('#c-name')?.focus(), 100);
  }

  await render();
}
