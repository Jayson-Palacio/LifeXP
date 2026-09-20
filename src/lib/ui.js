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
    emojis: ['🛏️','🧹','🍽️','🧺','🗑️','🚽','🚿','🛁','🛀','🧼','🧽','🧴','🫧','🪥','🪟','🚪','🪑','🧸','🧻','🪤','🔑','🧯','🪠','⚙️','🔧','🔨','🪚','🧲','🪜','🏠','🏡','🏗️','🔌','💡','🕯️','🪔','🧨','🫙','🪝','🧺','🪣','🧷','🧹','✂️','🔒','🪒','🧊','🍼','👕','👗','🧦','👟']
  },
  {
    label: '📚 Learning',
    emojis: ['📚','✏️','📖','🎒','🔬','💡','🧮','📝','🖊️','📐','📏','🗂️','🗃️','📊','📈','🧩','🔭','🎓','📒','🖥️','📓','📔','📕','📗','📘','📙','📑','📄','📃','📋','🗒️','🗓️','📌','📍','🔎','💻','⌨️','🖱️','🗺️','🗾','🧠','🗣️','⏱️','🕰️','🧲','🧪','🤖','🧬']
  },
  {
    label: '💪 Health & Fitness',
    emojis: ['🏃','💪','🦷','🧘','🚲','🍎','💦','🥗','🏋️','⚽','🏊','🤸','🧗','🛹','🏅','🥊','🎽','🏃‍♀️','🚶','🧘‍♀️','🏄','🤼','🏇','🛼','🛷','🏒','🏊‍♀️','🧜','🤺','⛷️','🏂','🤾','🏌️','🤽','🧥','🍇','🍊','🥑','🥦','🥕','👟','🎽','🥋','🏀','🏈','⚾','🎾','🏐']
  },
  {
    label: '🐕 Pets & Nature',
    emojis: ['🐕','🐈','🌱','🌿','🌳','🐠','🐇','🐾','🪴','🌻','🐝','🦋','🌊','🏕️','🌧️','☀️','🌈','🍃','🍀','🌺','🐢','🦎','🦜','🐓','🌵','🎋','🎍','🍄','🌾','🌲','🐈‍⬛','🦮','🐩','🐦','🦢','🦩','🦚','🐸','🐴','🐄','🐖','🐏','🦙','🐘','🦒','🐪','🐿️','🦔','🦇']
  },
  {
    label: '🎵 Creative',
    emojis: ['🎵','🎹','🎸','🎨','🖌️','🎭','✍️','🎬','📸','🪡','🧵','🪆','🎤','🎷','🥁','🎺','🎻','🎲','♟️','🎯','🖼️','🎠','🎡','🎢','🎪','🃏','🎴','🀄','🎰','🎳','🎞️','🎥','📽️','🎦','🎟️','🎫','🧶','🪢','🎀','🖍️','🖍','🖍️','🖍','🎼','🎧','🎤','🎬']
  },
  {
    label: '🚀 Adventure',
    emojis: ['🚀','🌍','🗺️','⛏️','🏔️','🏕️','🧭','🗻','🌋','🏖️','🏝️','⛵','🛶','🎣','🤿','🏄','🧗','🪂','🎿','🛷','🏇','🌅','🌄','🌠','🌌','⭐','🌟','💫','✨','⚡','🌊','🌀','❄️','☄️','🌪️','⛺','🛻','🚗','🚂','🚁','✈️','🚢','🚀','🛸','🛰️','🪐','🌓']
  },
  {
    label: '🤝 Social & Family',
    emojis: ['🤝','👨‍👩‍👧','👪','👋','🫱','🫶','💌','📱','☎️','📞','💬','🗣️','👂','🙌','🫂','🤗','😊','🥰','😇','🌸','🎊','🎉','🎈','🎁','🪅','🎀','💝','💖','💗','💓','🌹','💐','🫀','🪷','🌷','👦','👧','👨','👩','👴','👵','👶','👼','🧓','🧑','👫','🧑‍🤝‍🧑']
  },
  {
    label: '⭐ Special',
    emojis: ['⭐','🌟','💫','✨','🎯','🏆','🥇','🏅','🎖️','👑','💎','🔥','⚡','💥','🌈','🎆','🎇','🪄','🔮','🌙','☀️','🌤️','⛅','🌦️','🌊','🌋','🏔️','🗻','🌁','🌃','🏙️','🌆','🌇','🌉','💯','✅','☑️','✔️','🔔','📣','📢','💭','🗯️','💰','🪙','💎']
  }
];

export const MISSION_EMOJIS = MISSION_EMOJI_GROUPS.flatMap(g => g.emojis);

export const REWARD_EMOJI_GROUPS = [
  {
    label: '🍬 Sweet Treats',
    emojis: ['🍬','🍭','🍫','🍪','🍦','🍧','🍨','🍩','🍰','🎂','🧁','🥧','🥞','🧇','🍯','🍬','🍡','🍧','🍎','🍓','🍒','🍑','🍉','🍌','🍇','🍍','🥝','🥥','🥐','🥨']
  },
  {
    label: '🍕 Savory Food',
    emojis: ['🍕','🍔','🍟','🌭','🥪','🌮','🌯','🥙','🍗','🍖','🥩','🥓','🧀','🥗','🍜','🍝','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍘','🌶️','🌽','🥟','🥡','🧊','🥤']
  },
  {
    label: '🎮 Entertainment & Toys',
    emojis: ['🎮','📺','🎬','📱','🎧','🕹️','💻','🖥️','⌚','📱','🧸','🪀','🪁','🚂','🚗','🚜','🏎️','🚁','✈️','🚀','🛸','🤖','👾','🔫','🎲','🧩','🔮','🪄','🎨','🖍️']
  },
  {
    label: '🎪 Experiences',
    emojis: ['🎪','🎠','🎡','🎢','🎭','🎟️','🎫','🏕️','⛺','🏖️','🏝️','🏟️','🏞️','⛲','🚗','✈️','🚢','⛵','🏊','🚴','🧗','🏌️','🎳','⛸️','🎿','🏂','🎣','🤿','🏄','🏇']
  },
  {
    label: '🎁 Gifts & Extras',
    emojis: ['🎁','🛍️','💸','🏆','🌙','🥇','👑','💎','🎖️','🎗️','🪙','💰','💵','💶','💷','💳','🧾','🎀','🎈','🎉','🎊','🔮','🧸','👗','👕','👖','👟','🧢','🎒','🕶️']
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
  setTimeout(() => el.remove(), 1100);
}

const CONFETTI_COLORS = ['#c8920a', '#f5c518', '#f3e5ab', '#1c1c1e', '#d4d8de'];

export function showConfetti(count = 14, themeHex = null) {
  if (typeof window === 'undefined') return;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${12 + Math.random() * 76}vw`;
    piece.style.top = `${-8 - Math.random() * 12}px`;
    piece.style.background = themeHex && themeHex !== 'animated' && Math.random() > 0.45
      ? themeHex
      : CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.width = `${5 + Math.random() * 5}px`;
    piece.style.height = `${5 + Math.random() * 5}px`;
    piece.style.animationDuration = `${0.7 + Math.random() * 0.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.18}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1400);
  }
}

function showCelebrate({ sound, confetti = 14, autoMs = 2400, children }) {
  if (typeof window === 'undefined') return;
  if (sound) sound();
  showConfetti(confetti);

  const container = document.createElement('div');
  container.className = 'level-up-overlay';
  document.body.appendChild(container);
  const root = createRoot(container);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    container.classList.add('is-leaving');
    setTimeout(() => {
      root.unmount();
      container.remove();
    }, 200);
  };

  root.render(
    <div className="level-up-card" onClick={(e) => e.stopPropagation()}>
      {children}
      <button className="btn btn-gold" type="button" onClick={close}>Nice</button>
    </div>
  );
  container.addEventListener('click', close);
  setTimeout(close, autoMs);
}

export async function showLevelUp(level, tierName, newColorName) {
  showCelebrate({
    sound: playRandomSuccessSound,
    confetti: 14,
    children: (
      <>
        <p className="level-up-kicker">Level up</p>
        <div className="level-up-text">Level {level}</div>
        <div className="level-up-title">{tierName}</div>
        {newColorName ? (
          <div className="level-up-detail">New theme: {newColorName}</div>
        ) : null}
      </>
    ),
  });
}

export async function showTierUp(level, tierName) {
  showCelebrate({
    sound: playTierUpSwell,
    confetti: 18,
    autoMs: 2800,
    children: (
      <>
        <div className="level-up-crest">
          <TierCrest tierName={tierName} glowColor="var(--gold)" />
        </div>
        <p className="level-up-kicker">New tier</p>
        <div className="level-up-text">Level {level}</div>
        <div className="level-up-title">{tierName}</div>
      </>
    ),
  });
}
