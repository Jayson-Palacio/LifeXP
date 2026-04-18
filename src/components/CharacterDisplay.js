'use client';
// ─── CharacterDisplay / Pet SVG Library ───────────────────────────────────────
// Ultra-clean, modern geometric flat-vector style. Minimalist and polished.
// ViewBox 0 0 60 70

import { PETS, RARITY_COLORS } from '../lib/character';

// ─── BEHAVIORS → CSS CLASSES ──────────────────────────────────────────────────
const BEHAVIOR_CLASS = {
  bounce: 'pet-bounce', sway: 'pet-sway', hop: 'pet-hop', wobble: 'pet-wobble',
  strut: 'pet-strut', jump: 'pet-hop', waddle: 'pet-waddle', wave: 'pet-sway',
  howl: 'pet-sway', flap: 'pet-float', float: 'pet-float', blaze: 'pet-pulse',
  flip: 'pet-flip', stomp: 'pet-stomp', guard: 'pet-guard', pulse: 'pet-pulse',
};

// ─── SVG PET COMPONENTS ───────────────────────────────────────────────────────

function PupPet() {
  const B = '#C27A4E'; const E = '#8B5030'; const D = '#3A271D'; const L = '#F4D2B8';
  return (
    <g>
      {/* Ears - Simple capsules */}
      <rect x="8" y="18" width="12" height="24" rx="6" fill={E} transform="rotate(-15 14 30)"/>
      <rect x="40" y="18" width="12" height="24" rx="6" fill={E} transform="rotate(15 46 30)"/>
      {/* Body - Smooth dome */}
      <path d="M18 62 C18 40 42 40 42 62 Z" fill={B}/>
      <path d="M24 62 C24 48 36 48 36 62 Z" fill={L}/>
      {/* Head - Circle */}
      <circle cx="30" cy="28" r="16" fill={B}/>
      {/* Snout */}
      <ellipse cx="30" cy="34" rx="8" ry="6" fill={L}/>
      <circle cx="30" cy="31" r="2.5" fill={D}/>
      {/* Eyes */}
      <circle cx="23" cy="26" r="3" fill={D}/>
      <circle cx="37" cy="26" r="3" fill={D}/>
      {/* Paws */}
      <rect x="20" y="60" width="8" height="4" rx="2" fill={E}/>
      <rect x="32" y="60" width="8" height="4" rx="2" fill={E}/>
      {/* Tail */}
      <g>
        <path d="M40 50 Q52 46 48 36" stroke={E} strokeWidth="6" strokeLinecap="round" fill="none"/>
        <animateTransform attributeName="transform" type="rotate" values="0 40 50; 12 40 50; 0 40 50" dur="0.9s" repeatCount="indefinite"/>
      </g>
    </g>
  );
}

function KittyPet() {
  const B = '#3B4252'; const D = '#2E3440'; const P = '#E5E9F0'; const E = '#D08770';
  return (
    <g>
      {/* Tail */}
      <g>
        <path d="M40 54 C58 54 55 35 48 40" stroke={D} strokeWidth="5" strokeLinecap="round" fill="none"/>
        <animateTransform attributeName="transform" type="rotate" values="-4 40 54; 6 40 54; -4 40 54" dur="2s" repeatCount="indefinite"/>
      </g>
      {/* Body */}
      <ellipse cx="30" cy="52" rx="12" ry="10" fill={B}/>
      {/* Ears */}
      <polygon points="18,18 12,6 26,14" fill={B}/>
      <polygon points="42,18 48,6 34,14" fill={B}/>
      <polygon points="18,17 14,9 23,14" fill={E}/>
      <polygon points="42,17 46,9 37,14" fill={E}/>
      {/* Head */}
      <circle cx="30" cy="26" r="14" fill={B}/>
      {/* Eyes */}
      <circle cx="23" cy="26" r="4" fill="#A3BE8C"/><ellipse cx="23" cy="26" rx="1.5" ry="3" fill={D}/>
      <circle cx="37" cy="26" r="4" fill="#A3BE8C"/><ellipse cx="37" cy="26" rx="1.5" ry="3" fill={D}/>
      <circle cx="24" cy="24.5" r="1" fill="#fff"/>
      <circle cx="38" cy="24.5" r="1" fill="#fff"/>
      {/* Nose/Mouth area */}
      <polygon points="30,32 28,30 32,30" fill={E}/>
      <path d="M27 34 Q30 36 33 34" stroke={P} strokeWidth="1" fill="none"/>
      {/* Feet */}
      <circle cx="24" cy="62" r="3" fill={D}/>
      <circle cx="36" cy="62" r="3" fill={D}/>
    </g>
  );
}

function BotPet() {
  const G = '#4C566A'; const L = '#88C0D0'; const W = '#ECEFF4'; const D = '#2E3440';
  return (
    <g>
      {/* Antenna */}
      <rect x="29" y="8" width="2" height="8" fill={G}/>
      <circle cx="30" cy="6" r="3" fill={L}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      {/* Thruster */}
      <path d="M26 56 L34 56 L30 64 Z" fill={L} opacity="0.8">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="0.2s" repeatCount="indefinite"/>
      </path>
      {/* Head/Screen */}
      <rect x="16" y="16" width="28" height="22" rx="4" fill={W}/>
      <rect x="20" y="20" width="20" height="14" rx="2" fill={D}/>
      {/* LED Eye line */}
      <rect x="22" y="26" width="16" height="2" rx="1" fill={L}/>
      <circle cx="26" cy="27" r="2" fill={L}/>
      <circle cx="34" cy="27" r="2" fill={L}/>
      {/* Body */}
      <rect x="22" y="40" width="16" height="16" rx="2" fill={G}/>
      <rect x="26" y="44" width="8" height="2" fill={L}/>
      {/* Arms */}
      <rect x="12" y="42" width="8" height="4" rx="2" fill={G}/>
      <rect x="40" y="42" width="8" height="4" rx="2" fill={G}/>
    </g>
  );
}

function NinjaPet() {
  const K = '#111827'; const R = '#EF4444'; const W = '#F9FAFB';
  return (
    <g>
      {/* Back Katana */}
      <line x1="16" y1="20" x2="44" y2="58" stroke="#6B7280" strokeWidth="4" strokeLinecap="round"/>
      <line x1="16" y1="20" x2="22" y2="28" stroke="#374151" strokeWidth="6" strokeLinecap="round"/>
      {/* Headband Ties */}
      <g>
        <path d="M42 28 Q52 24 55 30" stroke={R} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M42 28 Q54 36 48 42" stroke={R} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0; 1 2; 0 0" dur="1.5s" repeatCount="indefinite"/>
      </g>
      {/* Body Core */}
      <ellipse cx="30" cy="48" rx="12" ry="14" fill={K}/>
      {/* Head */}
      <circle cx="30" cy="26" r="15" fill={K}/>
      {/* Eye Slit */}
      <rect x="18" y="22" width="24" height="8" rx="4" fill={W}/>
      <circle cx="25" cy="26" r="2" fill={K}/>
      <circle cx="35" cy="26" r="2" fill={K}/>
      {/* Headband Base */}
      <rect x="16" y="20" width="28" height="3" fill={R}/>
      {/* Feet */}
      <circle cx="24" cy="62" r="3" fill={K}/>
      <circle cx="36" cy="62" r="3" fill={K}/>
    </g>
  );
}

function FoxPet() {
  const F = '#F97316'; const W = '#FFFCEB'; const D = '#431407';
  return (
    <g>
      {/* Big Geometric Tail */}
      <g>
        <path d="M40 48 Q60 40 50 20 Q44 26 42 36" fill={F}/>
        <path d="M50 20 Q44 26 42 36 Q48 30 50 20" fill={W}/>
        <animateTransform attributeName="transform" type="rotate" values="-4 40 48; 4 40 48; -4 40 48" dur="1.3s" repeatCount="indefinite"/>
      </g>
      {/* Body */}
      <path d="M22 62 C22 46 38 46 38 62 Z" fill={F}/>
      <path d="M26 62 C26 52 34 52 34 62 Z" fill={W}/>
      {/* Head */}
      <polygon points="12,18 30,36 48,18 38,10 22,10" fill={F}/>
      {/* Face Mask */}
      <polygon points="18,22 30,34 42,22 30,14" fill={W}/>
      {/* Eyes & Nose */}
      <circle cx="30" cy="34" r="2" fill={D}/>
      <rect x="23" y="24" width="4" height="2.5" rx="1" fill={D}/>
      <rect x="33" y="24" width="4" height="2.5" rx="1" fill={D}/>
      {/* Ears */}
      <polygon points="18,16 14,4 24,12" fill={F}/>
      <polygon points="42,16 46,4 36,12" fill={F}/>
      <polygon points="19,14 16,8 22,12" fill={D}/>
      <polygon points="41,14 44,8 38,12" fill={D}/>
      {/* Paws */}
      <rect x="22" y="60" width="6" height="4" rx="2" fill={D}/>
      <rect x="32" y="60" width="6" height="4" rx="2" fill={D}/>
    </g>
  );
}

function TrexPet() {
  const G = '#22C55E'; const D = '#14532D'; const L = '#86EFAC';
  return (
    <g>
      {/* Stiff Tail */}
      <polygon points="16,56 4,46 16,40" fill={G}/>
      {/* Body */}
      <rect x="18" y="26" width="20" height="34" rx="6" fill={G}/>
      {/* Belly */}
      <rect x="26" y="28" width="12" height="32" rx="4" fill={L}/>
      {/* Block Head */}
      <rect x="18" y="10" width="24" height="18" rx="4" fill={G}/>
      <rect x="28" y="20" width="14" height="8" rx="2" fill="#16A34A"/>
      {/* Eye */}
      <circle cx="30" cy="16" r="2" fill={D}/>
      {/* Tiny Arms */}
      <rect x="38" y="36" width="8" height="4" rx="2" fill={G}/>
      <rect x="38" y="44" width="6" height="4" rx="2" fill={G}/>
      {/* Feet */}
      <rect x="20" y="60" width="8" height="6" rx="2" fill={D}/>
      <rect x="32" y="60" width="8" height="6" rx="2" fill={D}/>
    </g>
  );
}

function PenguinPet() {
  const B = '#1E293B'; const W = '#FFFFFF'; const O = '#F59E0B';
  return (
    <g>
      {/* Main Shape */}
      <rect x="14" y="14" width="32" height="46" rx="16" fill={B}/>
      {/* White Belly */}
      <rect x="18" y="22" width="24" height="36" rx="12" fill={W}/>
      {/* Eyes */}
      <circle cx="25" cy="30" r="3" fill={B}/>
      <circle cx="35" cy="30" r="3" fill={B}/>
      <circle cx="26" cy="29" r="1" fill={W}/>
      <circle cx="36" cy="29" r="1" fill={W}/>
      {/* Yellow Beak */}
      <polygon points="26,34 34,34 30,40" fill={O}/>
      {/* Flippers */}
      <path d="M14 34 C8 42 10 50 14 50 Z" fill={B}/>
      <path d="M46 34 C52 42 50 50 46 50 Z" fill={B}/>
      {/* Feet */}
      <ellipse cx="22" cy="62" rx="6" ry="3" fill={O}/>
      <ellipse cx="38" cy="62" rx="6" ry="3" fill={O}/>
    </g>
  );
}

function KnightPet() {
  const A = '#D1D5DB'; const D = '#4B5563'; const G = '#EAB308'; const R = '#EF4444';
  return (
    <g>
      {/* Plume */}
      <path d="M30 4 Q20 -4 16 12" fill="none" stroke={R} strokeWidth="5" strokeLinecap="round"/>
      {/* Shield */}
      <polygon points="40,36 50,36 50,46 45,54 40,46" fill={G}/>
      <polygon points="42,39 48,39 48,46 45,50 42,46" fill={A}/>
      {/* Sword */}
      <rect x="8" y="20" width="4" height="34" rx="2" fill={A}/>
      <rect x="4" y="44" width="12" height="4" fill={G}/>
      {/* Body Armor */}
      <rect x="20" y="36" width="20" height="22" rx="4" fill={A}/>
      <line x1="20" y1="46" x2="40" y2="46" stroke={D} strokeWidth="2"/>
      <line x1="20" y1="52" x2="40" y2="52" stroke={D} strokeWidth="2"/>
      {/* Helmet (Bucket type) */}
      <rect x="18" y="14" width="24" height="24" rx="4" fill={A}/>
      {/* Visor Cross */}
      <rect x="28" y="20" width="4" height="14" fill={D}/>
      <rect x="20" y="24" width="20" height="4" fill={D}/>
      {/* Rivets */}
      <circle cx="22" cy="18" r="1" fill={D}/>
      <circle cx="38" cy="18" r="1" fill={D}/>
      {/* Feet */}
      <rect x="22" y="58" width="6" height="4" rx="1" fill={D}/>
      <rect x="32" y="58" width="6" height="4" rx="1" fill={D}/>
    </g>
  );
}

function WolfPet() {
  const G = '#64748B'; const L = '#CBD5E1'; const D = '#1E293B'; const C = '#38BDF8';
  return (
    <g>
      {/* Tail Base */}
      <path d="M42 50 C54 46 50 30 42 38" stroke={G} strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <path d="M20 62 C20 44 40 44 40 62 Z" fill={G}/>
      <polygon points="24,48 36,48 30,60" fill={L}/>
      {/* Head Geometric */}
      <polygon points="12,14 30,32 48,14 38,8 22,8" fill={G}/>
      {/* Muzzle */}
      <polygon points="22,26 38,26 30,36" fill={L}/>
      <circle cx="30" cy="34" r="2.5" fill={D}/>
      {/* Ice Eyes */}
      <rect x="22" y="22" width="6" height="3" fill={C} transform="rotate(10 22 22)"/>
      <rect x="32" y="22" width="6" height="3" fill={C} transform="rotate(-10 32 22)"/>
      {/* Outer Ears */}
      <polygon points="22,8 14,2 16,12" fill={G}/>
      <polygon points="38,8 46,2 44,12" fill={G}/>
      {/* Paws */}
      <rect x="20" y="60" width="6" height="4" rx="2" fill={D}/>
      <rect x="34" y="60" width="6" height="4" rx="2" fill={D}/>
    </g>
  );
}

function MechPet() {
  const M = '#4F46E5'; const D = '#1E1B4B'; const Y = '#FDE047'; const C = '#10B981';
  return (
    <g>
      {/* Shoulders */}
      <rect x="10" y="26" width="10" height="12" rx="2" fill={M}/>
      <rect x="40" y="26" width="10" height="12" rx="2" fill={M}/>
      {/* Arms Base */}
      <rect x="8" y="38" width="14" height="22" rx="2" fill={D}/>
      <rect x="38" y="38" width="14" height="22" rx="2" fill={D}/>
      {/* Hand Blades / Blasters */}
      <rect x="10" y="60" width="10" height="8" rx="2" fill={C}/>
      <rect x="40" y="60" width="10" height="8" rx="2" fill={C}/>
      {/* Torso Box */}
      <polygon points="20,26 40,26 44,52 16,52" fill={M}/>
      <polygon points="24,28 36,28 38,44 22,44" fill={D}/>
      {/* Core */}
      <circle cx="30" cy="38" r="5" fill={Y}/>
      <circle cx="30" cy="38" r="2" fill="#fff"/>
      {/* Head */}
      <rect x="22" y="8" width="16" height="16" rx="2" fill={D}/>
      <polygon points="30,12 20,4 26,16" fill={Y}/>
      <polygon points="30,12 40,4 34,16" fill={Y}/>
      <rect x="24" y="16" width="12" height="4" fill={C}/>
      {/* Sturdy Feet */}
      <rect x="18" y="54" width="8" height="14" rx="2" fill={D}/>
      <rect x="34" y="54" width="8" height="14" rx="2" fill={D}/>
      <rect x="14" y="68" width="14" height="4" rx="1" fill={M}/>
      <rect x="32" y="68" width="14" height="4" rx="1" fill={M}/>
    </g>
  );
}

// ─── PET MAP ─────────────────────────────────────────────────────────────────
const PET_MAP = {
  pup: PupPet, kitty: KittyPet, bot: BotPet, ninja: NinjaPet,
  fox: FoxPet, trex: TrexPet, penguin: PenguinPet, knight: KnightPet,
  wolf: WolfPet, mech: MechPet,
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
          <ellipse cx="30" cy="68" rx="16" ry="3" fill="rgba(0,0,0,0.2)"/>
          <PetComp/>
        </svg>
      </div>
    </div>
  );
}
