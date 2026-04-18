'use client';
// ─── CharacterDisplay / Pet SVG Library ───────────────────────────────────────
// Clean, flat-vector modern style. Less sloppy overlaps.
// ViewBox 60×70 — perfectly scaled for UI display.

import { PETS, RARITY_COLORS } from '../lib/character';

// ─── BEHAVIORS → CSS CLASSES ──────────────────────────────────────────────────
const BEHAVIOR_CLASS = {
  bounce: 'pet-bounce', sway: 'pet-sway', hop: 'pet-hop', wobble: 'pet-wobble',
  strut: 'pet-strut', jump: 'pet-hop', waddle: 'pet-waddle', wave: 'pet-sway',
  howl: 'pet-sway', flap: 'pet-float', float: 'pet-float', blaze: 'pet-pulse',
  flip: 'pet-flip', stomp: 'pet-stomp', guard: 'pet-guard', pulse: 'pet-pulse',
};

// ─── CUTE & COMMON ────────────────────────────────────────────────────────────
function PupPet() {
  const F = '#DF9563'; const D = '#9E5B31'; const N = '#2A1F1A'; const C = '#FBE2D1';
  return (
    <g>
      {/* Ears */}
      <path d="M18 16 Q8 10 12 30 Z" fill={D} transform="rotate(-10 18 16)"/>
      <path d="M42 16 Q52 10 48 30 Z" fill={D} transform="rotate(10 42 16)"/>
      {/* Body */}
      <path d="M20 30 C 14 55 20 62 30 62 C 40 62 46 55 40 30 Z" fill={F}/>
      <path d="M24 40 C 20 54 26 58 30 58 C 34 58 40 54 36 40 Z" fill={C}/>
      {/* Head */}
      <rect x="16" y="16" width="28" height="24" rx="12" fill={F}/>
      {/* Eyes */}
      <circle cx="23" cy="25" r="4.5" fill={N}/><circle cx="24.5" cy="23.5" r="1.5" fill="#fff"/>
      <circle cx="37" cy="25" r="4.5" fill={N}/><circle cx="38.5" cy="23.5" r="1.5" fill="#fff"/>
      {/* Snout */}
      <ellipse cx="30" cy="31" rx="6" ry="4" fill={C}/>
      <ellipse cx="30" cy="29" rx="3" ry="2" fill={N}/>
      {/* Paws */}
      <ellipse cx="22" cy="62" rx="5" ry="3" fill={D}/>
      <ellipse cx="38" cy="62" rx="5" ry="3" fill={D}/>
      {/* Tail - Wags */}
      <g>
        <path d="M40 50 Q56 45 42 35" stroke={D} strokeWidth="5" fill="none" strokeLinecap="round"/>
        <animateTransform attributeName="transform" type="rotate" values="0 40 50; 15 40 50; 0 40 50" dur="0.8s" repeatCount="indefinite"/>
      </g>
    </g>
  );
}

function KittyPet() {
  const F = '#333A4A'; const D = '#1D2433'; const P = '#FCA5A5';
  return (
    <g>
      {/* Tail - Swish */}
      <g>
        <path d="M40 52 C55 52 55 30 45 40" stroke={D} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
        <animateTransform attributeName="transform" type="rotate" values="-5 40 52; 5 40 52; -5 40 52" dur="2s" repeatCount="indefinite"/>
      </g>
      {/* Ears */}
      <polygon points="17,20 12,6 25,18" fill={F}/>
      <polygon points="17,19 14,10 22,17" fill={P}/>
      <polygon points="43,20 48,6 35,18" fill={F}/>
      <polygon points="43,19 46,10 38,17" fill={P}/>
      {/* Body */}
      <ellipse cx="30" cy="50" rx="14" ry="12" fill={F}/>
      {/* Head */}
      <circle cx="30" cy="26" r="16" fill={F}/>
      {/* Eyes */}
      <circle cx="23" cy="26" r="5" fill="#4ADE80"/><circle cx="23" cy="26" r="2" fill={D}/>
      <circle cx="37" cy="26" r="5" fill="#4ADE80"/><circle cx="37" cy="26" r="2" fill={D}/>
      <circle cx="24" cy="24.5" r="1.5" fill="#fff"/>
      <circle cx="38" cy="24.5" r="1.5" fill="#fff"/>
      {/* Nose */}
      <polygon points="30,32 28,30 32,30" fill={P}/>
      {/* Paws */}
      <ellipse cx="23" cy="62" rx="4" ry="3" fill={D}/>
      <ellipse cx="37" cy="62" rx="4" ry="3" fill={D}/>
    </g>
  );
}

// ─── COOL & MODERN ────────────────────────────────────────────────────────────
function BotPet() {
  const B = '#64748B'; const D = '#334155'; const L = '#38BDF8'; const W = '#FFFFFF';
  return (
    <g>
      {/* Antenna */}
      <rect x="29" y="4" width="2" height="12" fill={D}/>
      <circle cx="30" cy="4" r="3" fill={L}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
      </circle>
      {/* Hover Jets */}
      <path d="M22 60 L26 66 L34 66 L38 60 Z" fill={D}/>
      <path d="M26 66 L30 72 L34 66 Z" fill={L} opacity="0.8">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.3s" repeatCount="indefinite"/>
      </path>
      {/* Head/Body */}
      <rect x="14" y="16" width="32" height="28" rx="8" fill={W}/>
      <rect x="18" y="20" width="24" height="14" rx="4" fill={D}/>
      <rect x="22" y="44" width="16" height="16" rx="4" fill={W}/>
      <rect x="18" y="34" width="24" height="2" fill={L}/>
      {/* Led Eyes */}
      <circle cx="25" cy="27" r="3.5" fill={L}/>
      <circle cx="35" cy="27" r="3.5" fill={L}/>
      {/* Arms */}
      <rect x="8" y="46" width="12" height="6" rx="3" fill={B}/>
      <rect x="40" y="46" width="12" height="6" rx="3" fill={B}/>
    </g>
  );
}

function NinjaPet() {
  const N = '#1F2937'; const D = '#111827'; const R = '#EF4444'; const W = '#F3F4F6';
  return (
    <g>
      {/* Headband Ties */}
      <g>
        <path d="M40 28 Q50 20 54 26" stroke={R} strokeWidth="3" fill="none"/>
        <path d="M40 28 Q55 35 50 42" stroke={R} strokeWidth="3" fill="none"/>
        <animateTransform attributeName="transform" type="translate" values="0 0; 2 2; 0 0" dur="2s" repeatCount="indefinite"/>
      </g>
      {/* Katana on Back */}
      <line x1="12" y1="20" x2="48" y2="60" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>
      <line x1="12" y1="20" x2="20" y2="28" stroke="#4B5563" strokeWidth="4.5" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="30" cy="50" rx="14" ry="12" fill={N}/>
      {/* Head */}
      <circle cx="30" cy="26" r="16" fill={N}/>
      <circle cx="30" cy="26" r="16" fill="none" stroke={D} strokeWidth="2"/>
      {/* Eye Slit */}
      <rect x="16" y="20" width="28" height="10" rx="5" fill={W}/>
      <rect x="16" y="20" width="28" height="10" rx="5" fill="none" stroke={D} strokeWidth="1.5"/>
      <circle cx="24" cy="25" r="2.5" fill={N}/>
      <circle cx="36" cy="25" r="2.5" fill={N}/>
      {/* Headband */}
      <rect x="14" y="20" width="32" height="3" fill={R}/>
      {/* Clean Feet */}
      <ellipse cx="23" cy="62" rx="4" ry="2.5" fill={D}/>
      <ellipse cx="37" cy="62" rx="4" ry="2.5" fill={D}/>
    </g>
  );
}

function TrexPet() {
  const G = '#22C55E'; const D = '#166534'; const W = '#FFFFFF';
  return (
    <g>
      {/* Heavy Stomp Tail */}
      <path d="M12 56 Q2 50 10 38" stroke={G} strokeWidth="10" fill="none" strokeLinecap="round"/>
      {/* Big Body */}
      <path d="M30 20 L40 20 L46 36 L40 60 L20 60 L20 40 Z" fill={G}/>
      <path d="M30 24 L36 24 L40 36 L36 56 L24 56 L24 40 Z" fill="#86EFAC"/>
      {/* Huge Blocky Head */}
      <rect x="20" y="8" width="26" height="18" rx="4" fill={G}/>
      {/* Eye */}
      <circle cx="28" cy="14" r="2" fill={D}/>
      {/* Tiny Arms */}
      <rect x="42" y="38" width="8" height="4" rx="2" fill={G}/>
      <rect x="36" y="42" width="8" height="4" rx="2" fill={G}/>
      {/* Clean Stomping Feet */}
      <rect x="22" y="60" width="8" height="6" rx="2" fill={D}/>
      <rect x="36" y="60" width="8" height="6" rx="2" fill={D}/>
    </g>
  );
}

function KnightPet() {
  const A = '#9CA3AF'; const D = '#374151'; const G = '#EAB308'; const R = '#EF4444';
  return (
    <g>
      {/* Plume (Feather on top) */}
      <path d="M30 2 Q20 -5 18 10" stroke={R} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Shield */}
      <path d="M42 36 L52 36 L52 46 Q52 56 47 62 Q42 56 42 46 Z" fill={G}/>
      <path d="M44 38 L50 38 L50 46 Q50 54 47 58 Q44 54 44 46 Z" fill={A}/>
      {/* Sword */}
      <rect x="8" y="24" width="4" height="28" fill={A}/>
      <rect x="4" y="46" width="12" height="3" fill={G}/>
      <rect x="8" y="48" width="4" height="6" fill={D}/>
      {/* Body Armor */}
      <rect x="20" y="34" width="20" height="24" rx="4" fill={A}/>
      <line x1="20" y1="42" x2="40" y2="42" stroke={D} strokeWidth="1.5"/>
      <line x1="20" y1="50" x2="40" y2="50" stroke={D} strokeWidth="1.5"/>
      {/* Helmet */}
      <rect x="18" y="10" width="24" height="24" rx="12" fill={A}/>
      <rect x="16" y="18" width="28" height="6" rx="2" fill={G}/>
      <rect x="24" y="18" width="12" height="14" rx="2" fill={G}/>
      {/* Visor Slits */}
      <rect x="28" y="22" width="4" height="8" fill={D}/>
      {/* Boots */}
      <rect x="22" y="58" width="6" height="6" rx="2" fill={D}/>
      <rect x="32" y="58" width="6" height="6" rx="2" fill={D}/>
    </g>
  );
}

function MechPet() {
  const M = '#6366F1'; const D = '#312E81'; const Y = '#FDE047'; const G = '#10B981';
  return (
    <g>
      {/* Shoulder Pads */}
      <rect x="10" y="26" width="12" height="12" rx="2" fill={M}/>
      <rect x="38" y="26" width="12" height="12" rx="2" fill={M}/>
      {/* Arms */}
      <rect x="6" y="38" width="10" height="20" rx="2" fill={D}/>
      <rect x="44" y="38" width="10" height="20" rx="2" fill={D}/>
      {/* Glowing Cannons */}
      <circle cx="11" cy="62" r="4" fill={G}>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="49" cy="62" r="4" fill={G}>
         <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite"/>
      </circle>
      {/* Torso */}
      <path d="M22 28 L38 28 L42 54 L18 54 Z" fill={M}/>
      <polygon points="26,30 34,30 36,46 24,46" fill={D}/>
      {/* Power Core */}
      <circle cx="30" cy="38" r="4" fill={Y}/>
      {/* Helmet */}
      <path d="M20 28 L24 10 L36 10 L40 28 Z" fill={D}/>
      {/* V-Fin (Gundam style) */}
      <polygon points="30,14 20,4 26,16" fill={Y}/>
      <polygon points="30,14 40,4 34,16" fill={Y}/>
      {/* Visor */}
      <rect x="24" y="18" width="12" height="4" rx="2" fill={G}/>
      {/* Legs */}
      <rect x="22" y="54" width="6" height="12" fill={D}/>
      <rect x="32" y="54" width="6" height="12" fill={D}/>
      {/* Heavy Feet */}
      <path d="M18 66 L28 66 L28 70 L16 70 Z" fill={M}/>
      <path d="M32 66 L42 66 L44 70 L32 70 Z" fill={M}/>
    </g>
  );
}

// ─── MAGIC / NATURE / COMMON CUTE ────────────
function FoxPet() {
  const F = '#F97316'; const W = '#FEF3C7'; const N = '#431407';
  return (
    <g>
      {/* Bushy Tail */}
      <path d="M42 46 C60 40 55 20 45 30" fill={F}/>
      <path d="M48 30 C58 20 53 28 45 30 Z" fill={W}/>
      {/* Body */}
      <ellipse cx="30" cy="52" rx="14" ry="12" fill={F}/>
      <ellipse cx="30" cy="54" rx="8" ry="10" fill={W}/>
      {/* Head */}
      <circle cx="30" cy="28" r="16" fill={F}/>
      {/* Ears */}
      <polygon points="17,16 12,4 24,14" fill={F}/>
      <polygon points="43,16 48,4 36,14" fill={F}/>
      {/* Face Mask */}
      <ellipse cx="30" cy="32" rx="12" ry="8" fill={W}/>
      {/* Nose */}
      <circle cx="30" cy="34" r="2.5" fill={N}/>
      {/* Eyes */}
      <rect x="22" y="27" width="5" height="3" rx="1.5" fill={N}/>
      <rect x="33" y="27" width="5" height="3" rx="1.5" fill={N}/>
      {/* Feet */}
      <circle cx="23" cy="62" r="3.5" fill={N}/>
      <circle cx="37" cy="62" r="3.5" fill={N}/>
    </g>
  );
}

function PenguinPet() {
  const B = '#1E293B'; const W = '#F8FAFC'; const Y = '#FBBF24';
  return (
    <g>
      {/* Body/Head Combo */}
      <rect x="14" y="16" width="32" height="42" rx="16" fill={B}/>
      {/* White Belly/Face */}
      <rect x="18" y="24" width="24" height="32" rx="12" fill={W}/>
      {/* Eyes */}
      <circle cx="26" cy="32" r="2.5" fill={B}/>
      <circle cx="34" cy="32" r="2.5" fill={B}/>
      {/* Beak */}
      <polygon points="30,38 26,34 34,34" fill={Y}/>
      {/* Flippers */}
      <ellipse cx="10" cy="40" rx="3" ry="12" fill={B}/>
      <ellipse cx="50" cy="40" rx="3" ry="12" fill={B}/>
      {/* Webbed Feet */}
      <ellipse cx="22" cy="60" rx="6" ry="3" fill={Y}/>
      <ellipse cx="38" cy="60" rx="6" ry="3" fill={Y}/>
    </g>
  );
}

function WolfPet() {
  const F = '#64748B'; const L = '#94A3B8'; const N = '#0F172A'; const E = '#E0F2FE';
  return (
    <g>
      {/* Tail */}
      <path d="M42 50 C55 45 50 30 40 38" stroke={F} strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <ellipse cx="30" cy="50" rx="16" ry="12" fill={F}/>
      {/* Chest Fluff */}
      <polygon points="20,44 40,44 30,56" fill={L}/>
      {/* Head */}
      <polygon points="14,14 20,28 14,32" fill={F}/>
      <polygon points="46,14 40,28 46,32" fill={F}/>
      <rect x="18" y="20" width="24" height="20" rx="8" fill={F}/>
      {/* Muzzle */}
      <rect x="22" y="32" width="16" height="10" rx="5" fill={L}/>
      <circle cx="30" cy="34" r="3" fill={N}/>
      {/* Eyes - Piercing Blue */}
      <rect x="23" y="26" width="5" height="3" fill={E} transform="rotate(10 23 26)"/>
      <rect x="32" y="26" width="5" height="3" fill={E} transform="rotate(-10 32 26)"/>
      {/* Feet */}
      <rect x="20" y="60" width="6" height="4" rx="2" fill={N}/>
      <rect x="34" y="60" width="6" height="4" rx="2" fill={N}/>
    </g>
  );
}

function DragonPet() {
  const F = '#DC2626'; const G = '#FCA5A5'; const Y = '#FEF08A';
  return (
    <g>
      {/* Wings */}
      <path d="M22 36 Q10 20 2 24 L10 36 Z" fill={F}/>
      <path d="M38 36 Q50 20 58 24 L50 36 Z" fill={F}/>
      {/* Tail */}
      <path d="M44 50 Q60 50 50 20 L55 18 L50 24" fill="none" stroke={F} strokeWidth="6" strokeLinecap="round"/>
      {/* Body */}
      <rect x="20" y="34" width="20" height="24" rx="10" fill={F}/>
      <rect x="24" y="38" width="12" height="18" rx="6" fill={Y}/>
      {/* Head */}
      <rect x="18" y="16" width="24" height="22" rx="8" fill={F}/>
      {/* Horns */}
      <polygon points="22,16 18,4 26,14" fill={G}/>
      <polygon points="38,16 42,4 34,14" fill={G}/>
      {/* Eyes */}
      <circle cx="24" cy="24" r="3" fill={Y}/><circle cx="24" cy="24" r="1.5" fill="#000"/>
      <circle cx="36" cy="24" r="3" fill={Y}/><circle cx="36" cy="24" r="1.5" fill="#000"/>
      {/* Snout */}
      <rect x="22" y="30" width="16" height="10" rx="4" fill={F}/>
      <circle cx="26" cy="34" r="1.5" fill={G}/>
      <circle cx="34" cy="34" r="1.5" fill={G}/>
      {/* Feet */}
      <rect x="20" y="58" width="8" height="4" rx="2" fill={F}/>
      <rect x="32" y="58" width="8" height="4" rx="2" fill={F}/>
    </g>
  );
}

function UnicornPet() {
  const W = '#FFFFFF'; const H = '#FDE047'; const M = '#F472B6';
  return (
    <g>
      {/* Colored Mane Flowing */}
      <path d="M20 16 Q8 26 12 40" fill="none" stroke="#2DD4BF" strokeWidth="4" strokeLinecap="round"/>
      <path d="M40 16 Q52 26 48 40" fill="none" stroke="#A855F7" strokeWidth="4" strokeLinecap="round"/>
      {/* Tail */}
      <path d="M44 50 Q55 45 48 35" fill="none" stroke={M} strokeWidth="6" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="30" cy="48" rx="16" ry="12" fill={W}/>
      {/* Head */}
      <ellipse cx="30" cy="28" rx="12" ry="14" fill={W}/>
      {/* Horn */}
      <polygon points="27,14 30,0 33,14" fill={H}/>
      {/* Ears */}
      <polygon points="20,16 16,8 24,18" fill={W}/>
      <polygon points="40,16 44,8 36,18" fill={W}/>
      {/* Eyes */}
      <path d="M22 26 Q25 24 28 26" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M38 26 Q35 24 32 26" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="22" cy="27" r="1.5" fill={M}/>
      <circle cx="38" cy="27" r="1.5" fill={M}/>
      {/* Snout */}
      <ellipse cx="30" cy="34" rx="6" ry="4" fill="#FCE7F3"/>
      {/* Feet */}
      <rect x="22" y="60" width="5" height="4" rx="1" fill={M}/>
      <rect x="33" y="60" width="5" height="4" rx="1" fill={M}/>
    </g>
  );
}

function PhoenixPet() {
  const R = '#EF4444'; const O = '#F97316'; const Y = '#FEF08A';
  return (
    <g>
      {/* Flame Glow Ring */}
      <circle cx="30" cy="30" r="28" fill="url(#fireGrad)" opacity="0.4">
        <animate attributeName="r" values="24;28;24" dur="1s" repeatCount="indefinite"/>
      </circle>
      <defs>
        <radialGradient id="fireGrad">
          <stop offset="0%" stopColor={Y}/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
      
      {/* Fire Wings */}
      <path d="M22 36 Q0 20 10 10" fill="none" stroke={O} strokeWidth="8" strokeLinecap="round"/>
      <path d="M38 36 Q60 20 50 10" fill="none" stroke={O} strokeWidth="8" strokeLinecap="round"/>
      {/* Fire Tail */}
      <path d="M30 46 L34 66 L26 66 Z" fill={R}/>
      <path d="M30 50 L32 60 L28 60 Z" fill={Y}/>
      {/* Body */}
      <polygon points="30,26 22,46 38,46" fill={O}/>
      {/* Head */}
      <circle cx="30" cy="24" r="12" fill={R}/>
      {/* Crest */}
      <polygon points="26,14 30,4 34,14" fill={Y}/>
      {/* Eyes */}
      <circle cx="26" cy="24" r="2.5" fill={Y}/>
      <circle cx="34" cy="24" r="2.5" fill={Y}/>
      {/* Beak */}
      <polygon points="28,28 30,34 32,28" fill={Y}/>
    </g>
  );
}

// ─── PET MAP ─────────────────────────────────────────────────────────────────
const PET_MAP = {
  pup: PupPet, kitty: KittyPet, bot: BotPet, ninja: NinjaPet,
  fox: FoxPet, trex: TrexPet, penguin: PenguinPet, knight: KnightPet,
  wolf: WolfPet, mech: MechPet, dragon: DragonPet, unicorn: UnicornPet,
  phoenix: PhoenixPet,
};

// ─── AMBIENT GLOW ────────────────────────────────────────────────────────────
const RARITY_GLOW = {
  common:    null,
  rare:      'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 65%)',
  epic:      'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 65%)',
  legendary: 'radial-gradient(circle, rgba(250,204,21,0.3) 0%, transparent 65%)',
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function CharacterDisplay({ characterData, size = 90, animated = true }) {
  const petId = characterData?.petId || null;
  if (!petId) return null;

  const petDef  = PETS.find(p => p.id === petId);
  const PetComp = PET_MAP[petId];
  if (!PetComp) return null;

  const w = size;
  const h = Math.round(size * (70 / 60));
  const animClass = animated ? (BEHAVIOR_CLASS[petDef?.behavior] || 'pet-bounce') : '';
  const glow = petDef ? RARITY_GLOW[petDef.rarity] : null;

  return (
    <div style={{ position: 'relative', width: w, height: h, display: 'inline-block' }}>
      {/* Rarity ambient glow */}
      {glow && animated && (
        <div style={{
          position: 'absolute', inset: '-15%', borderRadius: '50%',
          background: glow, zIndex: 0, pointerEvents: 'none',
          animation: 'aura-pulse 3s ease-in-out infinite',
        }}/>
      )}
      <div className={animClass} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        <svg
          viewBox="0 0 60 70"
          width={w} height={h}
          style={{ display: 'block', overflow: 'visible' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Drop shadow */}
          <ellipse cx="30" cy="65" rx="16" ry="3" fill="rgba(0,0,0,0.2)"/>
          <PetComp/>
        </svg>
      </div>
    </div>
  );
}
