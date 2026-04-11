// ============================================
// UI HELPERS — Toast, Float, Confetti, Modal (Adapted for Next.js)
// ============================================
import React from 'react';
import { createRoot } from 'react-dom/client';
import TierCrest from '../components/TierCrest';
import { playRandomSuccessSound, playTierUpSwell } from './sounds';

// ============================================
// EMOJI REGISTRY — Grouped by Category
// ============================================

export const AVATAR_EMOJI_GROUPS = [
  {
    label: '🐾 Animals',
    emojis: ['🦊','🐱','🐶','🦁','🐼','🐸','🦄','🐲','🐵','🐰','🐨','🦋','🐯','🐧','🦖','🐙','🦈','🦅','🦉','🐢','🐊','🦭','🦚','🦔','🐺','🦝','🦋','🐻','🐗','🐴','🦌','🦒','🐘','🦏','🦛','🦓','🐆','🐅','🦬','🐃','🦀','🦞','🦑','🐛','🦗','🦂','🦩','🦜','🦢','🕊️','🐓']
  },
  {
    label: '✨ Fantasy & Legend',
    emojis: ['🧙','🧝','🧜','🧚','🧟','🧛','🤖','👾','🥷','🦸','🦹','🧞','🧝‍♀️','🧙‍♀️','🧝‍♂️','🧌','🐉','🦄','🌟','⚡','🔮','🪄','🗡️','🛡️','👑','💫','🌙','☄️','🌀','🏹']
  },
  {
    label: '⚽ Sports & Action',
    emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🎿','🛹','🛷','🥋','🤺','🏋️','🤼','🏊','🏄','🎯','🎮','🎲','🎮','🏆','🥇','🎳','🏇','⛷️','🤸']
  },
  {
    label: '🚀 Space & Science',
    emojis: ['🚀','🛸','🌍','🌕','⭐','🌟','💫','☄️','🔭','🔬','⚗️','🧪','🧬','💡','🔋','🌌','🪐','🛰️','👨‍🚀','🌠','🌈','⚡','🔥','💥','🌊','🧲','💻','🤖','📡','🦾']
  },
  {
    label: '🎨 Art & Music',
    emojis: ['🎸','🎹','🎺','🎻','🥁','🎷','🎵','🎶','🎤','🎧','🎨','🖌️','✏️','📝','🎭','🎬','🎪','🤹','🎠','🎡','🎢','🎟️','🎆','🎇','🎑','🪁','🎯','🎮','🕹️','🎰']
  },
  {
    label: '🌿 Nature & Elements',
    emojis: ['🌻','🌺','🌸','🍀','🌿','🌱','🍁','🍂','🍃','🌊','🔥','💧','⚡','🌪️','⛄','🌈','🌙','☀️','🌤️','⛅','🌋','🏔️','🏝️','🌴','🌵','🎋','🎍','🍄','🌾','🌲']
  },
  {
    label: '🍕 Food & Treats',
    emojis: ['🍕','🍔','🍟','🌮','🍣','🍜','🍩','🍰','🎂','🍦','🍫','🍬','🍭','🍿','🧁','🥞','🥗','🍱','🧇','🥐','🍙','🍎','🍊','🍋','🍇','🍓','🍒','🫐','🥝','🍑']
  },
  {
    label: '💎 Epic & Rare',
    emojis: ['💎','👑','🏆','🥇','🌟','⚡','🔥','💫','✨','🌈','🎖️','🎗️','🪙','💰','💍','🔮','🪄','⚜️','🦁','🐉']
  }
];

// Flat list for backwards compatibility
export const AVATAR_EMOJIS = AVATAR_EMOJI_GROUPS.flatMap(g => g.emojis);

export const MISSION_EMOJI_GROUPS = [
  {
    label: '🏠 Home & Chores',
    emojis: ['🛏️','🧹','🍽️','🧺','🗑️','🚿','🪴','🪣','🧽','🧴','🫧','🪥','🪟','🚪','🛁','🪑','🧸','🪞','🧻','🪤','🔑','🧯','🪠','⚙️','🔧','🔨','🪚','🧲','🪜','🏠','🏡','🏗️','🔌','💡','🕯️','🪔','🧨','🧹','🫙','🪝']
  },
  {
    label: '📚 Learning',
    emojis: ['📚','✏️','📖','🎒','🔬','💡','🧮','📝','🖊️','📐','📏','🗂️','🗃️','📊','📈','🧩','🔭','🎓','📒','🖥️','📓','📔','📕','📗','📘','📙','📑','📄','📃','📋','🗒️','🗓️','📌','📍','🔎','💻','⌨️','🖱️','🗺️','🗾']
  },
  {
    label: '💪 Health & Fitness',
    emojis: ['🏃','💪','🦷','🧘','🚲','🍎','💦','🥗','🏋️','⚽','🏊','🤸','🧗','🛹','🏅','🥊','🎽','🏃‍♀️','🚶','🧘‍♀️','🏄','🤼','🏇','🛼','🛷','🏒','🏊‍♀️','🧜','🤺','⛷️','🏂','🤾','🏌️','🤽','🧥','🍇','🍊','🥑','🥦','🥕']
  },
  {
    label: '🐕 Pets & Nature',
    emojis: ['🐕','🐈','🌱','🌿','🌳','🐠','🐇','🐾','🪴','🌻','🐝','🦋','🌊','🏕️','🌧️','☀️','🌈','🍃','🍀','🌺','🐢','🦎','🦜','🐓','🌵','🎋','🎍','🍄','🌾','🌲','🐾','🐈‍⬛','🦮','🐩','🐦','🦢','🦩','🦚','🦜','🐸']
  },
  {
    label: '🎵 Creative',
    emojis: ['🎵','🎹','🎸','🎨','🖌️','🎭','✍️','🎬','📸','🪡','🧵','🪆','🎤','🎷','🥁','🎺','🎻','🎲','♟️','🎯','🖼️','🎠','🎡','🎢','🎪','🃏','🎴','🀄','🎰','🎳','📸','🎞️','🎥','📽️','🎦','🎟️','🎫','🧶','🪢','🎀']
  },
  {
    label: '🚀 Adventure',
    emojis: ['🚀','🌍','🗺️','⛏️','🏔️','🏕️','🧭','🗻','🌋','🏖️','🏝️','⛵','🛶','🎣','🤿','🏄','🧗','🪂','🎿','🛷','🏇','🌅','🌄','🌠','🌌','⭐','🌟','💫','✨','⚡','🌊','🌀','❄️','☄️','🌪️']
  },
  {
    label: '🤝 Social & Family',
    emojis: ['🤝','👨‍👩‍👧','👪','👋','🫱','🫶','💌','📱','☎️','📞','💬','🗣️','👂','🙌','🫂','🤗','😊','🥰','😇','🌸','🎊','🎉','🎈','🎁','🪅','🎀','💝','💖','💗','💓','🌹','💐','🫀','🪷','🌷']
  },
  {
    label: '⭐ Special',
    emojis: ['⭐','🌟','💫','✨','🎯','🏆','🥇','🏅','🎖️','👑','💎','🔥','⚡','💥','🌈','🎆','🎇','🪄','🔮','🌙','☀️','🌤️','⛅','🌦️','🌈','🌊','🌋','🏔️','🗻','🌁','🌃','🏙️','🌆','🌇','🌉']
  }
];

export const MISSION_EMOJIS = MISSION_EMOJI_GROUPS.flatMap(g => g.emojis);

export const REWARD_EMOJI_GROUPS = [
  {
    label: '🍭 Treats',
    emojis: ['🍦','🍕','🍟','🍩','🍰','🎂','🍫','🍬','🍭','🍿','🧁','🥞','🍔','🌮','🍣','🧇','🫐','🍓','🥐','🍜']
  },
  {
    label: '🎮 Entertainment',
    emojis: ['🎮','📺','🎬','📱','🎧','🕹️','🎪','🎠','🎡','🎢','🎭','🎟️','🎰','🎲','🧩','🎳','⚽','🏊','🛴','🛹']
  },
  {
    label: '🎁 Gifts & Extras',
    emojis: ['🎁','🛍️','💸','🏆','🌙','🥇','👑','💎','🎖️','🎗️','🪙','💰','✈️','🏕️','🎿','🏂','🎣','🎯','🎨','📸']
  }
];

export const REWARD_EMOJIS = REWARD_EMOJI_GROUPS.flatMap(g => g.emojis);

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
    
    if (themeHex && Math.random() > 0.3) {
       piece.style.background = themeHex === 'animated' ? '#facc15' : themeHex;
    } else {
       piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    }

    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    piece.style.animationDuration = `${0.8 + Math.random() * 1.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2500);
  }
}

export async function showLevelUp(level, tierName, newColorName) {
  if (typeof window === 'undefined') return;
  playRandomSuccessSound && playRandomSuccessSound();
  showConfetti(60);

  const container = document.createElement('div');
  container.className = 'level-up-overlay';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="level-up-emoji">🌟</div>
      <div className="level-up-text">Level {level}!</div>
      <div className="level-up-title">{tierName}</div>
      {newColorName && (
        <div className="level-up-detail">🎨 New theme unlocked: <strong>{newColorName}</strong></div>
      )}
      <div className="level-up-detail">Keep going — you're on fire!</div>
      <button
        className="btn btn-gold btn-lg"
        style={{ marginTop: '1.5rem', minWidth: 180 }}
        onClick={() => { root.unmount(); container.remove(); }}
      >
        Awesome! ✨
      </button>
    </div>
  );
}

export async function showTierUp(level, tierName) {
  if (typeof window === 'undefined') return;
  playTierUpSwell && playTierUpSwell();
  showConfetti(100);

  const container = document.createElement('div');
  container.className = 'level-up-overlay';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ width: 120, height: 120, margin: '0 auto 1rem' }}>
        <TierCrest tierName={tierName} glowColor="var(--gold)" />
      </div>
      <div className="level-up-text" style={{ fontSize: '2rem' }}>Tier Unlocked!</div>
      <div className="level-up-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tierName}</div>
      <div className="level-up-detail">You've reached a new era of greatness.</div>
      <button
        className="btn btn-gold btn-lg"
        style={{ marginTop: '1.5rem', minWidth: 180 }}
        onClick={() => { root.unmount(); container.remove(); }}
      >
        I'm Ready! 🔥
      </button>
    </div>
  );
}
