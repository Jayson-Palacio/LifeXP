const fs = require('fs');
const path = require('path');

// ─── character.js ──────────────────────────────────────────────────────────
const characterJs = `// ─── CHARACTER CONFIGURATION ─────────────────────────────────────────────────

export const PETS = [
  // ─── ANIMALS ──────────────────────────────────────────────────────────────
  { id: 'pup',     name: 'Pup',     levelUnlock: 1,   rarity: 'common',    emoji: '🐶', behavior: 'bounce', tag: 'Loyal & playful' },
  { id: 'kitty',   name: 'Kitty',   levelUnlock: 3,   rarity: 'common',    emoji: '🐱', behavior: 'sway',   tag: 'Purrfect friend' },
  { id: 'bunny',   name: 'Bunny',   levelUnlock: 6,   rarity: 'common',    emoji: '🐰', behavior: 'hop',    tag: 'Quick & fluffy' },
  { id: 'penguin', name: 'Penguin', levelUnlock: 10,  rarity: 'common',    emoji: '🐧', behavior: 'wobble', tag: 'Cool & chill' },
  { id: 'fox',     name: 'Fox',     levelUnlock: 15,  rarity: 'rare',      emoji: '🦊', behavior: 'strut',  tag: 'Clever & sly' },
  { id: 'bear',    name: 'Bear',    levelUnlock: 20,  rarity: 'rare',      emoji: '🐻', behavior: 'stomp',  tag: 'Strong protector' },
  { id: 'panda',   name: 'Panda',   levelUnlock: 30,  rarity: 'rare',      emoji: '🐼', behavior: 'wobble', tag: 'Peaceful giant' },
  { id: 'owl',     name: 'Owl',     levelUnlock: 40,  rarity: 'epic',      emoji: '🦉', behavior: 'sway',   tag: 'Wise & watchful' },
  { id: 'lion',    name: 'Lion',    levelUnlock: 60,  rarity: 'epic',      emoji: '🦁', behavior: 'strut',  tag: 'Majestic king' },
  { id: 'dragon',  name: 'Dragon',  levelUnlock: 80,  rarity: 'legendary', emoji: '🐉', behavior: 'float',  tag: 'Fire-breathing ancient' },

  // ─── ROBOTS ───────────────────────────────────────────────────────────────
  { id: 'bot',    name: 'Bot',    levelUnlock: 2,   rarity: 'common',    emoji: '🤖', behavior: 'bounce', tag: 'Helpful little buddy' },
  { id: 'pixel',  name: 'Pixel',  levelUnlock: 5,   rarity: 'common',    emoji: '👾', behavior: 'hop',    tag: '8-bit adventurer' },
  { id: 'spark',  name: 'Spark',  levelUnlock: 8,   rarity: 'common',    emoji: '⚡', behavior: 'flip',   tag: 'Shocking fast!' },
  { id: 'gear',   name: 'Gear',   levelUnlock: 12,  rarity: 'rare',      emoji: '⚙️', behavior: 'pulse',  tag: 'Spinning mechanic' },
  { id: 'astro',  name: 'Astro',  levelUnlock: 18,  rarity: 'rare',      emoji: '🚀', behavior: 'float',  tag: 'Space explorer' },
  { id: 'turbo',  name: 'Turbo',  levelUnlock: 25,  rarity: 'rare',      emoji: '🏎️', behavior: 'strut',  tag: 'Blazing speed' },
  { id: 'chrome', name: 'Chrome', levelUnlock: 35,  rarity: 'epic',      emoji: '🪩', behavior: 'sway',   tag: 'Mirror-polished elite' },
  { id: 'glitch', name: 'Glitch', levelUnlock: 50,  rarity: 'epic',      emoji: '💠', behavior: 'flip',   tag: 'Matrix entity' },
  { id: 'nova',   name: 'Nova',   levelUnlock: 70,  rarity: 'epic',      emoji: '🌌', behavior: 'pulse',  tag: 'Star-powered' },
  { id: 'zenith', name: 'Zenith', levelUnlock: 100, rarity: 'legendary', emoji: '👑', behavior: 'float',  tag: 'The ultimate machine' },
];

export const RARITY_COLORS = {
  common:    { bg: '#1E293B', text: '#94A3B8', border: '#334155', glow: false },
  rare:      { bg: '#0C4A6E', text: '#38BDF8', border: '#0284C7', glow: true },
  epic:      { bg: '#4C1D95', text: '#C084FC', border: '#7C3AED', glow: true },
  legendary: { bg: '#713F12', text: '#FDE047', border: '#CA8A04', glow: true },
};

export function checkCharacterUnlocks(oldLevel, newLevel) {
  if (newLevel <= oldLevel) return [];
  return PETS.filter(p => p.levelUnlock > oldLevel && p.levelUnlock <= newLevel);
}

export function getUnlockedPets(level) {
  return PETS.filter(p => level >= p.levelUnlock);
}

export function parseCharacter(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}
`;

// ─── CharacterDisplay.js ──────────────────────────────────────────────────
const displayJs = `'use client';
import { PETS } from '../lib/character';

const BEHAVIOR_CLASS = {
  bounce:'pet-bounce', sway:'pet-sway', hop:'pet-hop', wobble:'pet-wobble',
  strut:'pet-sway', float:'pet-float', flip:'pet-flip', pulse:'pet-pulse',
  stomp:'pet-bounce', guard:'pet-pulse', howl:'pet-sway',
};

// Shared shiny eye helper
const Eye = ({ cx, cy, r=7, iris='#1E293B', irisR }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="white"/>
    <circle cx={cx} cy={cy} r={irisR||r*0.65} fill={iris}/>
    <circle cx={cx+r*0.25} cy={cy-r*0.3} r={r*0.22} fill="rgba(255,255,255,0.9)"/>
    <circle cx={cx-r*0.15} cy={cy-r*0.1} r={r*0.1} fill="rgba(255,255,255,0.5)"/>
  </g>
);

// ── ANIMALS ───────────────────────────────────────────────────────────────────

const Pup = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pup-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#FCD34D"/><stop offset="100%" stopColor="#D97706"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* floppy ears */}
    <ellipse cx="26" cy="48" rx="13" ry="19" fill="#B45309" transform="rotate(12 26 48)"/>
    <ellipse cx="74" cy="48" rx="13" ry="19" fill="#B45309" transform="rotate(-12 74 48)"/>
    <ellipse cx="26" cy="49" rx="9" ry="14" fill="#D97706" transform="rotate(12 26 49)"/>
    <ellipse cx="74" cy="49" rx="9" ry="14" fill="#D97706" transform="rotate(-12 74 49)"/>
    {/* body */}
    <ellipse cx="50" cy="83" rx="19" ry="13" fill="url(#pup-h)"/>
    {/* head */}
    <circle cx="50" cy="48" r="30" fill="url(#pup-h)"/>
    {/* muzzle */}
    <ellipse cx="50" cy="58" rx="13" ry="10" fill="#FEF3C7"/>
    {/* nose */}
    <ellipse cx="50" cy="53" rx="5" ry="3.5" fill="#1C1917"/>
    <ellipse cx="48.5" cy="52" rx="1.5" ry="1" fill="rgba(255,255,255,0.5)"/>
    {/* tongue */}
    <ellipse cx="50" cy="63" rx="5" ry="4" fill="#F87171"/>
    <path d="M45 63 Q50 68 55 63" fill="#EF4444"/>
    {/* eyes */}
    <Eye cx={38} cy={44} r={7} iris="#1C1917"/>
    <Eye cx={62} cy={44} r={7} iris="#1C1917"/>
    {/* brows */}
    <path d="M31 36 Q38 32 44 36" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
    <path d="M56 36 Q62 32 69 36" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
    {/* highlight */}
    <ellipse cx="43" cy="34" rx="12" ry="6" fill="rgba(255,255,255,0.2)" transform="rotate(-10 43 34)"/>
  </svg>
);

const Kitty = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="kit-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#FED7AA"/><stop offset="100%" stopColor="#EA580C"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* pointy ears */}
    <polygon points="22,40 30,14 42,40" fill="#EA580C"/>
    <polygon points="58,40 70,14 78,40" fill="#EA580C"/>
    <polygon points="26,38 31,21 40,38" fill="#FCA5A5"/>
    <polygon points="60,38 69,21 74,38" fill="#FCA5A5"/>
    {/* body */}
    <ellipse cx="50" cy="83" rx="19" ry="13" fill="url(#kit-h)"/>
    {/* head */}
    <circle cx="50" cy="48" r="28" fill="url(#kit-h)"/>
    {/* muzzle */}
    <ellipse cx="50" cy="57" rx="11" ry="8" fill="#FEF2E7"/>
    {/* nose */}
    <path d="M48 53 L50 55 L52 53 Q50 51 48 53 Z" fill="#F472B6"/>
    {/* whiskers */}
    <line x1="20" y1="55" x2="39" y2="57" stroke="#92400E" strokeWidth="1" opacity="0.5"/>
    <line x1="20" y1="59" x2="39" y2="59" stroke="#92400E" strokeWidth="1" opacity="0.5"/>
    <line x1="61" y1="57" x2="80" y2="55" stroke="#92400E" strokeWidth="1" opacity="0.5"/>
    <line x1="61" y1="59" x2="80" y2="59" stroke="#92400E" strokeWidth="1" opacity="0.5"/>
    {/* eyes */}
    <Eye cx={38} cy={44} r={7} iris="#15803D"/>
    <Eye cx={62} cy={44} r={7} iris="#15803D"/>
    {/* tabby brow stripes */}
    <path d="M44 30 Q50 27 56 30" fill="none" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    <path d="M42 35 Q50 32 58 35" fill="none" stroke="#C2410C" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    <ellipse cx="44" cy="36" rx="11" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-10 44 36)"/>
  </svg>
);

const Bunny = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bun-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#F5F3FF"/><stop offset="100%" stopColor="#C4B5FD"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* ears */}
    <ellipse cx="34" cy="20" rx="9" ry="25" fill="#DDD6FE"/>
    <ellipse cx="66" cy="20" rx="9" ry="25" fill="#DDD6FE"/>
    <ellipse cx="34" cy="20" rx="5" ry="20" fill="#F9A8D4"/>
    <ellipse cx="66" cy="20" rx="5" ry="20" fill="#F9A8D4"/>
    {/* body */}
    <ellipse cx="50" cy="83" rx="19" ry="13" fill="url(#bun-h)"/>
    {/* head */}
    <circle cx="50" cy="52" r="27" fill="url(#bun-h)"/>
    {/* cheeks */}
    <ellipse cx="36" cy="58" rx="5" ry="3" fill="#FCA5A5" opacity="0.6"/>
    <ellipse cx="64" cy="58" rx="5" ry="3" fill="#FCA5A5" opacity="0.6"/>
    {/* nose */}
    <ellipse cx="50" cy="57" rx="2.5" ry="2" fill="#F472B6"/>
    {/* mouth */}
    <path d="M47 59 Q50 62 53 59" fill="none" stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round"/>
    {/* eyes */}
    <Eye cx={38} cy={48} r={7} iris="#7C3AED"/>
    <Eye cx={62} cy={48} r={7} iris="#7C3AED"/>
    <ellipse cx="44" cy="38" rx="11" ry="5" fill="rgba(255,255,255,0.25)" transform="rotate(-10 44 38)"/>
  </svg>
);

const Penguin = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pge-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#475569"/><stop offset="100%" stopColor="#0F172A"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* body */}
    <ellipse cx="50" cy="76" rx="22" ry="22" fill="url(#pge-h)"/>
    {/* white belly */}
    <ellipse cx="50" cy="78" rx="14" ry="18" fill="#F8FAFC"/>
    {/* flippers */}
    <ellipse cx="23" cy="72" rx="7" ry="14" fill="#1E293B" transform="rotate(-10 23 72)"/>
    <ellipse cx="77" cy="72" rx="7" ry="14" fill="#1E293B" transform="rotate(10 77 72)"/>
    {/* feet */}
    <ellipse cx="40" cy="94" rx="8" ry="3.5" fill="#F97316"/>
    <ellipse cx="60" cy="94" rx="8" ry="3.5" fill="#F97316"/>
    {/* head */}
    <circle cx="50" cy="46" r="26" fill="url(#pge-h)"/>
    {/* white face */}
    <ellipse cx="50" cy="50" rx="17" ry="20" fill="#F8FAFC"/>
    {/* beak */}
    <path d="M44 54 L50 61 L56 54 Z" fill="#F97316"/>
    {/* eyes */}
    <Eye cx={38} cy={44} r={6.5} iris="#1E293B"/>
    <Eye cx={62} cy={44} r={6.5} iris="#1E293B"/>
    {/* cheeks */}
    <ellipse cx="32" cy="52" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.5"/>
    <ellipse cx="68" cy="52" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.5"/>
  </svg>
);

const Fox = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="fox-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#FED7AA"/><stop offset="100%" stopColor="#C2410C"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* pointy ears */}
    <polygon points="24,42 30,10 44,40" fill="#C2410C"/>
    <polygon points="56,40 70,10 76,42" fill="#C2410C"/>
    <polygon points="27,40 31,18 41,40" fill="#FEF9C3"/>
    <polygon points="59,40 69,18 73,40" fill="#FEF9C3"/>
    {/* body + white belly */}
    <ellipse cx="50" cy="83" rx="19" ry="13" fill="url(#fox-h)"/>
    <ellipse cx="50" cy="86" rx="12" ry="8" fill="#FEF9C3"/>
    {/* head */}
    <circle cx="50" cy="48" r="28" fill="url(#fox-h)"/>
    {/* white muzzle mask */}
    <ellipse cx="50" cy="55" rx="14" ry="11" fill="#FEF9C3"/>
    {/* nose */}
    <ellipse cx="50" cy="52" rx="4" ry="3" fill="#1C1917"/>
    <ellipse cx="48.5" cy="51" rx="1.5" ry="1" fill="rgba(255,255,255,0.5)"/>
    <path d="M44 57 Q50 61 56 57" fill="none" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round"/>
    {/* eyes */}
    <Eye cx={38} cy={44} r={7} iris="#C2410C" irisR={4.5}/>
    <Eye cx={62} cy={44} r={7} iris="#C2410C" irisR={4.5}/>
    <ellipse cx="44" cy="36" rx="12" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-10 44 36)"/>
  </svg>
);

const Bear = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bea-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#D6A75A"/><stop offset="100%" stopColor="#92400E"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* ears */}
    <circle cx="26" cy="27" r="14" fill="#92400E"/>
    <circle cx="74" cy="27" r="14" fill="#92400E"/>
    <circle cx="26" cy="28" r="9" fill="#D6A75A"/>
    <circle cx="74" cy="28" r="9" fill="#D6A75A"/>
    {/* body */}
    <ellipse cx="50" cy="83" rx="20" ry="13" fill="url(#bea-h)"/>
    <ellipse cx="50" cy="86" rx="12" ry="8" fill="#D6A75A"/>
    {/* head */}
    <circle cx="50" cy="50" r="30" fill="url(#bea-h)"/>
    {/* muzzle */}
    <ellipse cx="50" cy="60" rx="13" ry="9" fill="#D6A75A"/>
    {/* nose */}
    <ellipse cx="50" cy="55" rx="5" ry="3.5" fill="#1C1917"/>
    <ellipse cx="48.5" cy="54" rx="1.5" ry="1" fill="rgba(255,255,255,0.5)"/>
    <path d="M44 60 Q50 64 56 60" fill="none" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round"/>
    {/* eyes */}
    <Eye cx={37} cy={46} r={7} iris="#1C1917"/>
    <Eye cx={63} cy={46} r={7} iris="#1C1917"/>
    <ellipse cx="43" cy="37" rx="12" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-10 43 37)"/>
  </svg>
);

const Panda = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pan-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#F8FAFC"/><stop offset="100%" stopColor="#CBD5E1"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* ears */}
    <circle cx="26" cy="27" r="13" fill="#1E293B"/>
    <circle cx="74" cy="27" r="13" fill="#1E293B"/>
    {/* body */}
    <ellipse cx="50" cy="83" rx="20" ry="13" fill="url(#pan-h)"/>
    <ellipse cx="32" cy="82" rx="12" ry="10" fill="#1E293B"/>
    <ellipse cx="68" cy="82" rx="12" ry="10" fill="#1E293B"/>
    {/* head */}
    <circle cx="50" cy="50" r="30" fill="url(#pan-h)"/>
    {/* eye patches */}
    <ellipse cx="37" cy="46" rx="10" ry="9" fill="#1E293B"/>
    <ellipse cx="63" cy="46" rx="10" ry="9" fill="#1E293B"/>
    {/* eyes */}
    <Eye cx={37} cy={45} r={6} iris="#0F172A"/>
    <Eye cx={63} cy={45} r={6} iris="#0F172A"/>
    {/* muzzle */}
    <ellipse cx="50" cy="60" rx="12" ry="8" fill="#F1F5F9"/>
    <ellipse cx="50" cy="55" rx="4" ry="3" fill="#1E293B"/>
    <ellipse cx="48.5" cy="54" rx="1.5" ry="1" fill="rgba(255,255,255,0.4)"/>
    <path d="M44 60 Q50 64 56 60" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="44" cy="37" rx="12" ry="5" fill="rgba(255,255,255,0.25)" transform="rotate(-10 44 37)"/>
  </svg>
);

const Owl = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="owl-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#D97706"/><stop offset="100%" stopColor="#78350F"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* body */}
    <ellipse cx="50" cy="78" rx="22" ry="22" fill="url(#owl-h)"/>
    {/* wing detail */}
    <path d="M28 68 Q22 80 30 92" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round"/>
    <path d="M72 68 Q78 80 70 92" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round"/>
    {/* belly */}
    <ellipse cx="50" cy="80" rx="15" ry="17" fill="#FEF3C7"/>
    <path d="M38 73 Q50 68 62 73 Q55 78 50 76 Q45 78 38 73Z" fill="#FCD34D" opacity="0.5"/>
    <path d="M36 82 Q50 77 64 82 Q57 87 50 85 Q43 87 36 82Z" fill="#FCD34D" opacity="0.4"/>
    {/* ear tufts */}
    <polygon points="30,28 26,8 40,28" fill="#92400E"/>
    <polygon points="60,28 74,8 70,28" fill="#92400E"/>
    {/* head */}
    <circle cx="50" cy="46" r="26" fill="url(#owl-h)"/>
    {/* facial disc */}
    <ellipse cx="50" cy="50" rx="20" ry="18" fill="#FEF3C7"/>
    {/* big eye rings */}
    <circle cx="38" cy="46" r="10" fill="#FCD34D"/>
    <circle cx="62" cy="46" r="10" fill="#FCD34D"/>
    <Eye cx={38} cy={46} r={7.5} iris="#78350F" irisR={5}/>
    <Eye cx={62} cy={46} r={7.5} iris="#78350F" irisR={5}/>
    {/* beak */}
    <path d="M45 55 L50 61 L55 55 Z" fill="#F59E0B"/>
    <ellipse cx="50" cy="55" rx="5" ry="2" fill="#D97706"/>
    <ellipse cx="44" cy="37" rx="10" ry="4" fill="rgba(255,255,255,0.2)" transform="rotate(-10 44 37)"/>
  </svg>
);

const Lion = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="lio-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#FCD34D"/><stop offset="100%" stopColor="#B45309"/></radialGradient>
      <radialGradient id="lio-m" cx="50%" cy="50%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#92400E"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* mane */}
    <circle cx="50" cy="48" r="38" fill="url(#lio-m)"/>
    {/* mane texture strands */}
    {[0,36,72,108,144,180,216,252,288,324].map((a, i) => (
      <line key={i} x1="50" y1="48" x2={50 + 40*Math.cos(a*Math.PI/180)} y2={48 + 40*Math.sin(a*Math.PI/180)} stroke="#92400E" strokeWidth="4" strokeLinecap="round" opacity="0.25"/>
    ))}
    {/* body */}
    <ellipse cx="50" cy="85" rx="18" ry="11" fill="url(#lio-h)"/>
    {/* ears */}
    <circle cx="27" cy="27" r="8" fill="#D97706"/>
    <circle cx="73" cy="27" r="8" fill="#D97706"/>
    <circle cx="27" cy="28" r="5" fill="#FCD34D"/>
    <circle cx="73" cy="28" r="5" fill="#FCD34D"/>
    {/* head */}
    <circle cx="50" cy="48" r="26" fill="url(#lio-h)"/>
    {/* muzzle */}
    <ellipse cx="50" cy="57" rx="12" ry="9" fill="#FEF3C7"/>
    {/* nose */}
    <path d="M47 53 L50 56 L53 53 Q50 50 47 53 Z" fill="#EC4899"/>
    <path d="M44 57 Q50 61 56 57" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
    {/* eyes */}
    <Eye cx={38} cy={43} r={7} iris="#92400E" irisR={4.5}/>
    <Eye cx={62} cy={43} r={7} iris="#92400E" irisR={4.5}/>
    <ellipse cx="44" cy="35" rx="11" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-10 44 35)"/>
  </svg>
);

const Dragon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="dra-h" cx="40%" cy="35%"><stop offset="0%" stopColor="#6EE7B7"/><stop offset="100%" stopColor="#065F46"/></radialGradient>
      <radialGradient id="dra-b" cx="40%" cy="35%"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#047857"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* wings */}
    <path d="M20 55 Q4 34 14 18 Q26 30 30 50 Z" fill="#059669" opacity="0.85"/>
    <path d="M80 55 Q96 34 86 18 Q74 30 70 50 Z" fill="#059669" opacity="0.85"/>
    <path d="M20 55 Q8 36 15 22 Q24 32 28 50 Z" fill="#6EE7B7" opacity="0.3"/>
    {/* body */}
    <ellipse cx="50" cy="81" rx="18" ry="14" fill="url(#dra-b)"/>
    <ellipse cx="50" cy="84" rx="11" ry="8" fill="#A7F3D0"/>
    {/* horns */}
    <polygon points="38,24 34,7 42,22" fill="#059669"/>
    <polygon points="62,24 66,7 58,22" fill="#059669"/>
    {/* head */}
    <circle cx="50" cy="48" r="28" fill="url(#dra-h)"/>
    {/* snout */}
    <ellipse cx="50" cy="58" rx="11" ry="7" fill="#34D399"/>
    <ellipse cx="46" cy="56" rx="2.5" ry="1.5" fill="#1C1917" opacity="0.6"/>
    <ellipse cx="54" cy="56" rx="2.5" ry="1.5" fill="#1C1917" opacity="0.6"/>
    {/* flame */}
    <ellipse cx="50" cy="66" rx="6" ry="4.5" fill="#FCD34D" opacity="0.8"/>
    <ellipse cx="50" cy="68" rx="4" ry="3.5" fill="#F97316" opacity="0.9"/>
    {/* eyes */}
    <Eye cx={37} cy={43} r={7} iris="#065F46" irisR={4.5}/>
    <Eye cx={63} cy={43} r={7} iris="#065F46" irisR={4.5}/>
    {/* slit pupils */}
    <ellipse cx={37} cy={43} rx={1.5} ry={3.5} fill="#1C1917"/>
    <ellipse cx={63} cy={43} rx={1.5} ry={3.5} fill="#1C1917"/>
    <ellipse cx="44" cy="36" rx="12" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-10 44 36)"/>
  </svg>
);

// ── ROBOTS ────────────────────────────────────────────────────────────────────

const Bot = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bot-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#93C5FD"/><stop offset="100%" stopColor="#1D4ED8"/></radialGradient>
      <radialGradient id="bot-b" cx="35%" cy="30%"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1E40AF"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* antenna */}
    <line x1="50" y1="14" x2="50" y2="23" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="50" cy="11" r="5" fill="#FCD34D"/>
    <circle cx="50" cy="11" r="2.5" fill="#F59E0B"/>
    {/* body */}
    <rect x="30" y="66" width="40" height="28" rx="8" fill="url(#bot-b)"/>
    <rect x="36" y="72" width="28" height="14" rx="4" fill="rgba(255,255,255,0.15)"/>
    <circle cx="42" cy="85" r="3" fill="#FCD34D"/>
    <circle cx="50" cy="85" r="3" fill="#4ADE80"/>
    <circle cx="58" cy="85" r="3" fill="#F87171"/>
    {/* arms */}
    <rect x="14" y="66" width="13" height="22" rx="6" fill="url(#bot-b)"/>
    <rect x="73" y="66" width="13" height="22" rx="6" fill="url(#bot-b)"/>
    <circle cx="20.5" cy="91" r="5" fill="url(#bot-h)"/>
    <circle cx="79.5" cy="91" r="5" fill="url(#bot-h)"/>
    {/* head */}
    <rect x="22" y="24" width="56" height="44" rx="14" fill="url(#bot-h)"/>
    {/* screen */}
    <rect x="30" y="32" width="40" height="28" rx="8" fill="#1E3A8A"/>
    {/* happy eyes */}
    <circle cx="39" cy="44" r="6" fill="#38BDF8"/>
    <circle cx="61" cy="44" r="6" fill="#38BDF8"/>
    <circle cx="39" cy="44" r="3" fill="white" opacity="0.9"/>
    <circle cx="61" cy="44" r="3" fill="white" opacity="0.9"/>
    <circle cx="40.5" cy="42.5" r="1" fill="white"/>
    <circle cx="62.5" cy="42.5" r="1" fill="white"/>
    {/* smile */}
    <path d="M36 52 Q50 59 64 52" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="38" cy="30" rx="13" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-5 38 30)"/>
  </svg>
);

const Pixel = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pix-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#86EFAC"/><stop offset="100%" stopColor="#15803D"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* chunky body */}
    <rect x="28" y="64" width="44" height="30" rx="4" fill="url(#pix-h)"/>
    <rect x="34" y="70" width="14" height="10" rx="1" fill="rgba(0,0,0,0.15)"/>
    <rect x="52" y="70" width="14" height="10" rx="1" fill="rgba(0,0,0,0.15)"/>
    <rect x="40" y="78" width="20" height="6" rx="1" fill="rgba(0,0,0,0.12)"/>
    {/* arms */}
    <rect x="12" y="64" width="14" height="22" rx="4" fill="url(#pix-h)"/>
    <rect x="74" y="64" width="14" height="22" rx="4" fill="url(#pix-h)"/>
    <rect x="10" y="83" width="10" height="6" rx="2" fill="#15803D"/>
    <rect x="80" y="83" width="10" height="6" rx="2" fill="#15803D"/>
    {/* head - square pixel */}
    <rect x="20" y="23" width="60" height="44" rx="6" fill="url(#pix-h)"/>
    {/* pixel eyes */}
    <rect x="28" y="33" width="16" height="16" rx="2" fill="#14532D"/>
    <rect x="56" y="33" width="16" height="16" rx="2" fill="#14532D"/>
    <rect x="30" y="35" width="12" height="12" rx="1" fill="#4ADE80"/>
    <rect x="58" y="35" width="12" height="12" rx="1" fill="#4ADE80"/>
    <rect x="36" y="38" width="5" height="5" fill="white"/>
    <rect x="64" y="38" width="5" height="5" fill="white"/>
    {/* pixel mouth */}
    <rect x="36" y="51" width="4" height="4" fill="#14532D"/>
    <rect x="42" y="55" width="16" height="4" fill="#14532D"/>
    <rect x="60" y="51" width="4" height="4" fill="#14532D"/>
  </svg>
);

const Spark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="spk-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#FEF08A"/><stop offset="100%" stopColor="#CA8A04"/></radialGradient>
      <radialGradient id="spk-b" cx="35%" cy="30%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#A16207"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* electric arcs */}
    <path d="M18 55 Q24 50 30 58 Q28 48 35 44" fill="none" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
    <path d="M82 55 Q76 50 70 58 Q72 48 65 44" fill="none" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
    {/* antenna */}
    <line x1="50" y1="14" x2="50" y2="23" stroke="#CA8A04" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="50" cy="11" r="5" fill="#FBBF24"/>
    {/* lightning bolt on antenna orb */}
    <path d="M48 8 L46 13 L50 12 L48 17" fill="none" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
    {/* body */}
    <rect x="30" y="66" width="40" height="28" rx="8" fill="url(#spk-b)"/>
    <rect x="36" y="72" width="28" height="14" rx="4" fill="rgba(255,255,255,0.15)"/>
    {/* arms */}
    <rect x="14" y="66" width="13" height="22" rx="6" fill="url(#spk-b)"/>
    <rect x="73" y="66" width="13" height="22" rx="6" fill="url(#spk-b)"/>
    <circle cx="20.5" cy="91" r="5" fill="url(#spk-h)"/>
    <circle cx="79.5" cy="91" r="5" fill="url(#spk-h)"/>
    {/* head */}
    <rect x="22" y="24" width="56" height="44" rx="14" fill="url(#spk-h)"/>
    {/* screen */}
    <rect x="30" y="32" width="40" height="28" rx="8" fill="#713F12"/>
    {/* zigzag eyes */}
    <path d="M31 45 L35 39 L39 45 L43 39" fill="none" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M57 45 L61 39 L65 45 L69 39" fill="none" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* grin */}
    <path d="M35 54 L41 50 L47 54 L53 50 L59 54 L65 50" fill="none" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="38" cy="30" rx="13" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-5 38 30)"/>
  </svg>
);

const Gear = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ger-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#FED7AA"/><stop offset="100%" stopColor="#C2410C"/></radialGradient>
      <radialGradient id="ger-b" cx="35%" cy="30%"><stop offset="0%" stopColor="#FB923C"/><stop offset="100%" stopColor="#9A3412"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* gear teeth on head rim */}
    {[0,45,90,135,180,225,270,315].map((a,i) => (
      <rect key={i} x="47" y="15" width="6" height="10" rx="2" fill="#9A3412" transform={\`rotate(\${a} 50 50)\`}/>
    ))}
    {/* body */}
    <rect x="30" y="66" width="40" height="28" rx="8" fill="url(#ger-b)"/>
    <rect x="36" y="72" width="28" height="14" rx="4" fill="rgba(255,255,255,0.15)"/>
    <circle cx="50" cy="79" r="5" fill="#C2410C"/>
    <circle cx="50" cy="79" r="3" fill="#9A3412"/>
    {/* wrench arms */}
    <rect x="14" y="66" width="13" height="22" rx="6" fill="url(#ger-b)"/>
    <rect x="73" y="66" width="13" height="22" rx="6" fill="url(#ger-b)"/>
    <rect x="10" y="86" width="10" height="4" rx="2" fill="#78350F"/>
    <rect x="80" y="86" width="10" height="4" rx="2" fill="#78350F"/>
    {/* head circle */}
    <circle cx="50" cy="44" r="26" fill="url(#ger-h)"/>
    {/* screen */}
    <rect x="32" y="34" width="36" height="22" rx="7" fill="#431407"/>
    {/* eyes */}
    <circle cx="41" cy="44" r="6" fill="#FB923C"/>
    <circle cx="59" cy="44" r="6" fill="#FB923C"/>
    <circle cx="41" cy="44" r="3" fill="#1C1917"/>
    <circle cx="59" cy="44" r="3" fill="#1C1917"/>
    <circle cx="42.5" cy="42.5" r="1.2" fill="white"/>
    <circle cx="60.5" cy="42.5" r="1.2" fill="white"/>
    <path d="M40 52 Q50 57 60 52" fill="none" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="40" cy="36" rx="10" ry="4" fill="rgba(255,255,255,0.2)" transform="rotate(-5 40 36)"/>
  </svg>
);

const Astro = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ast-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#E2E8F0"/><stop offset="100%" stopColor="#64748B"/></radialGradient>
      <radialGradient id="ast-v" cx="35%" cy="30%"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#0369A1"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* jetpack */}
    <rect x="34" y="62" width="32" height="32" rx="6" fill="#475569"/>
    <rect x="38" y="66" width="11" height="20" rx="4" fill="#334155"/>
    <rect x="51" y="66" width="11" height="20" rx="4" fill="#334155"/>
    {/* thrusters */}
    <ellipse cx="43.5" cy="89" rx="4" ry="6" fill="#FCD34D" opacity="0.8"/>
    <ellipse cx="56.5" cy="89" rx="4" ry="6" fill="#FCD34D" opacity="0.8"/>
    <ellipse cx="43.5" cy="91" rx="2.5" ry="4" fill="#F97316"/>
    <ellipse cx="56.5" cy="91" rx="2.5" ry="4" fill="#F97316"/>
    {/* arms */}
    <rect x="14" y="62" width="14" height="20" rx="7" fill="url(#ast-h)"/>
    <rect x="72" y="62" width="14" height="20" rx="7" fill="url(#ast-h)"/>
    <circle cx="21" cy="84" r="5" fill="#CBD5E1"/>
    <circle cx="79" cy="84" r="5" fill="#CBD5E1"/>
    {/* suit body */}
    <ellipse cx="50" cy="66" rx="18" ry="10" fill="url(#ast-h)"/>
    {/* helmet */}
    <circle cx="50" cy="46" r="28" fill="url(#ast-h)"/>
    {/* visor */}
    <ellipse cx="50" cy="46" rx="19" ry="18" fill="url(#ast-v)"/>
    {/* reflection */}
    <ellipse cx="43" cy="37" rx="8" ry="5" fill="rgba(255,255,255,0.25)" transform="rotate(-10 43 37)"/>
    {/* face */}
    <Eye cx={40} cy={46} r={6} iris="#1E293B"/>
    <Eye cx={60} cy={46} r={6} iris="#1E293B"/>
    <path d="M42 55 Q50 59 58 55" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="38" cy="30" rx="13" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-10 38 30)"/>
  </svg>
);

const Turbo = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="trb-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#FCA5A5"/><stop offset="100%" stopColor="#B91C1C"/></radialGradient>
      <radialGradient id="trb-b" cx="35%" cy="30%"><stop offset="0%" stopColor="#F87171"/><stop offset="100%" stopColor="#991B1B"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* speed lines */}
    <line x1="4" y1="44" x2="20" y2="44" stroke="#F87171" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
    <line x1="2" y1="50" x2="18" y2="50" stroke="#F87171" strokeWidth="3" opacity="0.6" strokeLinecap="round"/>
    <line x1="4" y1="56" x2="20" y2="56" stroke="#F87171" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
    {/* exhaust flame */}
    <ellipse cx="13" cy="79" rx="5" ry="8" fill="#FCD34D" opacity="0.6"/>
    <ellipse cx="13" cy="82" rx="3" ry="5" fill="#F97316" opacity="0.7"/>
    {/* body */}
    <path d="M25 65 L75 65 L80 93 L20 93 Z" fill="url(#trb-b)"/>
    {/* racing stripes */}
    <path d="M38 65 L42 93" stroke="white" strokeWidth="3" opacity="0.3"/>
    <path d="M58 65 L62 93" stroke="white" strokeWidth="3" opacity="0.3"/>
    {/* arms */}
    <rect x="10" y="62" width="14" height="24" rx="7" fill="url(#trb-b)"/>
    <rect x="76" y="62" width="14" height="24" rx="7" fill="url(#trb-b)"/>
    <circle cx="17" cy="89" r="5" fill="url(#trb-h)"/>
    <circle cx="83" cy="89" r="5" fill="url(#trb-h)"/>
    {/* spoiler */}
    <polygon points="36,14 50,24 64,14 58,8 42,8" fill="#B91C1C"/>
    {/* head */}
    <rect x="22" y="22" width="56" height="44" rx="12" fill="url(#trb-h)"/>
    {/* visor */}
    <rect x="28" y="30" width="44" height="24" rx="8" fill="#450A0A"/>
    {/* eyes */}
    <ellipse cx="39" cy="41" rx="7" ry="5" fill="#F87171"/>
    <ellipse cx="61" cy="41" rx="7" ry="5" fill="#F87171"/>
    <ellipse cx="39" cy="41" rx="3.5" ry="2.5" fill="white" opacity="0.9"/>
    <ellipse cx="61" cy="41" rx="3.5" ry="2.5" fill="white" opacity="0.9"/>
    {/* determined flat mouth */}
    <path d="M36 49 L64 49" stroke="#F87171" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="38" cy="28" rx="14" ry="4" fill="rgba(255,255,255,0.18)" transform="rotate(-3 38 28)"/>
  </svg>
);

const Chrome = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chr-h" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F1F5F9"/><stop offset="50%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#E2E8F0"/></linearGradient>
      <linearGradient id="chr-b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#CBD5E1"/><stop offset="100%" stopColor="#475569"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* antenna */}
    <line x1="50" y1="14" x2="50" y2="23" stroke="#64748B" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="50" cy="11" r="4" fill="#CBD5E1"/>
    <circle cx="50" cy="11" r="2.5" fill="#94A3B8"/>
    {/* body */}
    <rect x="30" y="66" width="40" height="28" rx="8" fill="url(#chr-b)"/>
    <ellipse cx="40" cy="70" rx="8" ry="3" fill="rgba(255,255,255,0.35)" transform="rotate(-10 40 70)"/>
    <rect x="36" y="76" width="28" height="10" rx="3" fill="rgba(255,255,255,0.1)"/>
    {/* arms */}
    <rect x="14" y="66" width="13" height="22" rx="6" fill="url(#chr-b)"/>
    <rect x="73" y="66" width="13" height="22" rx="6" fill="url(#chr-b)"/>
    <circle cx="20.5" cy="91" r="5" fill="url(#chr-h)"/>
    <circle cx="79.5" cy="91" r="5" fill="url(#chr-h)"/>
    {/* head */}
    <rect x="20" y="22" width="60" height="46" rx="16" fill="url(#chr-h)"/>
    {/* chrome shine sweeps */}
    <ellipse cx="34" cy="28" rx="15" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(-10 34 28)"/>
    <ellipse cx="68" cy="60" rx="8" ry="3" fill="rgba(255,255,255,0.2)" transform="rotate(10 68 60)"/>
    {/* screen */}
    <rect x="28" y="32" width="44" height="26" rx="8" fill="#0F172A"/>
    {/* mirror eyes */}
    <circle cx="39" cy="44" r="7" fill="#E2E8F0"/>
    <circle cx="61" cy="44" r="7" fill="#E2E8F0"/>
    <circle cx="39" cy="44" r="4" fill="#94A3B8"/>
    <circle cx="61" cy="44" r="4" fill="#94A3B8"/>
    <circle cx="40.5" cy="42.5" r="2" fill="white"/>
    <circle cx="62.5" cy="42.5" r="2" fill="white"/>
    <path d="M36 52 Q50 58 64 52" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Glitch = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gli-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#67E8F9"/><stop offset="100%" stopColor="#0E7490"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* glitch shadow copies */}
    <rect x="23" y="27" width="54" height="42" rx="12" fill="#F0ABFC" opacity="0.3" transform="translate(-3,2)"/>
    <rect x="23" y="27" width="54" height="42" rx="12" fill="#F87171" opacity="0.2" transform="translate(3,-2)"/>
    {/* body */}
    <rect x="30" y="68" width="40" height="26" rx="8" fill="url(#gli-h)"/>
    <rect x="30" y="74" width="40" height="3" fill="#F0ABFC" opacity="0.4"/>
    <rect x="30" y="81" width="40" height="2" fill="#F87171" opacity="0.3"/>
    {/* arms */}
    <rect x="14" y="68" width="13" height="20" rx="6" fill="url(#gli-h)"/>
    <rect x="73" y="68" width="13" height="20" rx="6" fill="url(#gli-h)"/>
    <circle cx="20.5" cy="91" r="5" fill="#22D3EE"/>
    <circle cx="79.5" cy="91" r="5" fill="#22D3EE"/>
    {/* head */}
    <rect x="23" y="26" width="54" height="44" rx="12" fill="url(#gli-h)"/>
    {/* screen */}
    <rect x="31" y="34" width="38" height="26" rx="7" fill="#164E63"/>
    {/* glitchy eyes */}
    <rect x="33" y="41" width="12" height="8" rx="2" fill="#22D3EE"/>
    <rect x="36" y="40" width="6" height="4" rx="1" fill="#F0ABFC" opacity="0.7"/>
    <rect x="55" y="41" width="12" height="8" rx="2" fill="#22D3EE"/>
    <rect x="58" y="40" width="6" height="4" rx="1" fill="#F87171" opacity="0.7"/>
    {/* glitch mouth bar */}
    <rect x="35" y="54" width="30" height="4" rx="2" fill="#22D3EE"/>
    <rect x="37" y="53" width="10" height="3" rx="1" fill="#F0ABFC" opacity="0.6"/>
    <ellipse cx="38" cy="32" rx="12" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-5 38 32)"/>
  </svg>
);

const Nova = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="nov-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#E879F9"/><stop offset="100%" stopColor="#7E22CE"/></radialGradient>
      <radialGradient id="nov-b" cx="35%" cy="30%"><stop offset="0%" stopColor="#D946EF"/><stop offset="100%" stopColor="#6B21A8"/></radialGradient>
      <radialGradient id="nov-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(232,121,249,0.4)"/><stop offset="100%" stopColor="rgba(232,121,249,0)"/></radialGradient>
    </defs>
    {/* cosmic glow */}
    <circle cx="50" cy="48" r="48" fill="url(#nov-glow)"/>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* star rays */}
    {[0,60,120,180,240,300].map((a,i) => (
      <line key={i} x1="50" y1="48" x2={50+38*Math.cos(a*Math.PI/180)} y2={48+38*Math.sin(a*Math.PI/180)} stroke="#E879F9" strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
    ))}
    {/* antenna + star */}
    <line x1="50" y1="14" x2="50" y2="23" stroke="#7E22CE" strokeWidth="3" strokeLinecap="round"/>
    <polygon points="50,6 52,11 57,11 53,14 55,19 50,16 45,19 47,14 43,11 48,11" fill="#FDE047"/>
    {/* body */}
    <rect x="30" y="66" width="40" height="28" rx="8" fill="url(#nov-b)"/>
    <rect x="36" y="72" width="28" height="14" rx="4" fill="rgba(255,255,255,0.15)"/>
    <polygon points="50,73 52,78 57,78 53,81 55,86 50,83 45,86 47,81 43,78 48,78" fill="#FDE047" opacity="0.8"/>
    {/* arms */}
    <rect x="14" y="66" width="13" height="22" rx="6" fill="url(#nov-b)"/>
    <rect x="73" y="66" width="13" height="22" rx="6" fill="url(#nov-b)"/>
    <circle cx="20.5" cy="91" r="5" fill="url(#nov-h)"/>
    <circle cx="79.5" cy="91" r="5" fill="url(#nov-h)"/>
    {/* head */}
    <rect x="22" y="24" width="56" height="44" rx="14" fill="url(#nov-h)"/>
    {/* screen */}
    <rect x="30" y="32" width="40" height="28" rx="8" fill="#2E1065"/>
    {/* star eyes */}
    <polygon points="39,38 41,44 47,44 42,47 44,53 39,50 34,53 36,47 31,44 37,44" fill="#FDE047"/>
    <polygon points="61,38 63,44 69,44 64,47 66,53 61,50 56,53 58,47 53,44 59,44" fill="#FDE047"/>
    {/* smile */}
    <path d="M38 55 Q50 61 62 55" fill="none" stroke="#E879F9" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="38" cy="30" rx="13" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-5 38 30)"/>
  </svg>
);

const Zenith = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="zen-h" cx="35%" cy="30%"><stop offset="0%" stopColor="#FEF08A"/><stop offset="100%" stopColor="#B45309"/></radialGradient>
      <radialGradient id="zen-b" cx="35%" cy="30%"><stop offset="0%" stopColor="#FCD34D"/><stop offset="100%" stopColor="#92400E"/></radialGradient>
      <radialGradient id="zen-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(253,224,71,0.55)"/><stop offset="100%" stopColor="rgba(253,224,71,0)"/></radialGradient>
    </defs>
    {/* legendary aura */}
    <circle cx="50" cy="50" r="50" fill="url(#zen-glow)"/>
    <ellipse cx="50" cy="95" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
    {/* gold wings */}
    <path d="M22 54 Q2 36 8 16 Q20 30 26 50 Z" fill="#FCD34D"/>
    <path d="M78 54 Q98 36 92 16 Q80 30 74 50 Z" fill="#FCD34D"/>
    <path d="M22 54 Q6 38 10 20 Q20 33 24 50 Z" fill="#FEF9C3" opacity="0.5"/>
    <path d="M78 54 Q94 38 90 20 Q80 33 76 50 Z" fill="#FEF9C3" opacity="0.5"/>
    {/* crown */}
    <polygon points="34,24 38,10 44,24" fill="#F59E0B"/>
    <polygon points="46,22 50,8 54,22" fill="#F59E0B"/>
    <polygon points="56,24 62,10 66,24" fill="#F59E0B"/>
    <circle cx="38" cy="10" r="2.5" fill="#EF4444"/>
    <circle cx="50" cy="8" r="2.5" fill="#38BDF8"/>
    <circle cx="62" cy="10" r="2.5" fill="#4ADE80"/>
    {/* body */}
    <rect x="28" y="66" width="44" height="28" rx="10" fill="url(#zen-b)"/>
    <ellipse cx="44" cy="70" rx="10" ry="4" fill="rgba(255,255,255,0.3)" transform="rotate(-10 44 70)"/>
    {/* arms */}
    <rect x="12" y="66" width="14" height="24" rx="7" fill="url(#zen-b)"/>
    <rect x="74" y="66" width="14" height="24" rx="7" fill="url(#zen-b)"/>
    <circle cx="19" cy="93" r="6" fill="#FCD34D"/>
    <circle cx="81" cy="93" r="6" fill="#FCD34D"/>
    {/* head */}
    <rect x="20" y="24" width="60" height="44" rx="16" fill="url(#zen-h)"/>
    {/* shine */}
    <ellipse cx="36" cy="30" rx="16" ry="6" fill="rgba(255,255,255,0.3)" transform="rotate(-8 36 30)"/>
    {/* screen */}
    <rect x="28" y="32" width="44" height="28" rx="9" fill="#1C1403"/>
    {/* golden eyes */}
    <circle cx="39" cy="44" r="8" fill="#FCD34D"/>
    <circle cx="61" cy="44" r="8" fill="#FCD34D"/>
    <circle cx="39" cy="44" r="5" fill="#F59E0B"/>
    <circle cx="61" cy="44" r="5" fill="#F59E0B"/>
    <circle cx="39" cy="44" r="2.5" fill="#1C1403"/>
    <circle cx="61" cy="44" r="2.5" fill="#1C1403"/>
    <circle cx="40.5" cy="42" r="1.5" fill="white"/>
    <circle cx="62.5" cy="42" r="1.5" fill="white"/>
    {/* regal smile */}
    <path d="M36 54 Q50 62 64 54" fill="none" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// ── PET MAP ───────────────────────────────────────────────────────────────────
const PET_MAP = {
  pup:Pup, kitty:Kitty, bunny:Bunny, penguin:Penguin, fox:Fox,
  bear:Bear, panda:Panda, owl:Owl, lion:Lion, dragon:Dragon,
  bot:Bot, pixel:Pixel, spark:Spark, gear:Gear, astro:Astro,
  turbo:Turbo, chrome:Chrome, glitch:Glitch, nova:Nova, zenith:Zenith,
};

const RARITY_GLOW = {
  common:    null,
  rare:      'radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)',
  epic:      'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
  legendary: 'radial-gradient(circle, rgba(250,204,21,0.5) 0%, transparent 70%)',
};

export default function CharacterDisplay({ characterData, size = 90, animated = true }) {
  const petId   = characterData?.petId || null;
  if (!petId) return null;
  const petDef  = PETS.find(p => p.id === petId);
  const PetComp = PET_MAP[petId];
  if (!PetComp) return null;
  const animClass = animated ? (BEHAVIOR_CLASS[petDef?.behavior] || 'pet-bounce') : '';
  const glow = petDef ? RARITY_GLOW[petDef.rarity] : null;
  return (
    <div style={{ position:'relative', width:size, height:size, display:'inline-block' }}>
      {glow && animated && (
        <div style={{
          position:'absolute', inset:'-20%', borderRadius:'50%',
          background:glow, zIndex:0, pointerEvents:'none',
          animation:'aura-pulse 3s ease-in-out infinite',
        }}/>
      )}
      <div className={animClass} style={{ width:'100%', height:'100%', position:'relative', zIndex:1 }}>
        <PetComp/>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/character.js'), characterJs, 'utf8');
fs.writeFileSync(path.join(__dirname, '../src/components/CharacterDisplay.js'), displayJs, 'utf8');
console.log('✅ character.js and CharacterDisplay.js written successfully!');
