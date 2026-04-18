'use client';
// ─── PetDisplay ──────────────────────────────────────────────────────────────
// Renders an animated cute-modern pet SVG.
// Character data shape: { petId: 'dog' }
// ViewBox 60×68 — smooth modern illustration style (not pixel art).

import { PETS, RARITY_COLORS } from '../lib/character';

// ─── BEHAVIOR → CSS ANIMATION CLASS ──────────────────────────────────────────
// These are applied to the outer <div> wrapper so the whole pet moves.
const BEHAVIOR_CLASS = {
  bounce: 'pet-bounce',
  sway:   'pet-sway',
  hop:    'pet-hop',
  wobble: 'pet-wobble',
  strut:  'pet-strut',
  jump:   'pet-hop',
  waddle: 'pet-waddle',
  wave:   'pet-sway',
  howl:   'pet-sway',
  flap:   'pet-float',
  float:  'pet-float',
  blaze:  'pet-pulse',
};

// ─── SVG PETS ─────────────────────────────────────────────────────────────────

function DogPet() {
  const F = '#E8A87C'; const D = '#C06B30'; const N = '#1a0800';
  return (
    <g>
      {/* Body */}
      <ellipse cx="30" cy="53" rx="16" ry="12" fill={F}/>
      {/* Head */}
      <circle cx="30" cy="29" r="18" fill={F}/>
      {/* Ears */}
      <ellipse cx="16" cy="18" rx="7" ry="10" fill={D} transform="rotate(-15 16 18)"/>
      <ellipse cx="44" cy="18" rx="7" ry="10" fill={D} transform="rotate(15 44 18)"/>
      {/* Eyes */}
      <circle cx="23" cy="27" r="5.5" fill="#fff"/>
      <circle cx="37" cy="27" r="5.5" fill="#fff"/>
      <circle cx="23" cy="28" r="3.5" fill={N}/>
      <circle cx="37" cy="28" r="3.5" fill={N}/>
      <circle cx="24.5" cy="26" r="1.5" fill="#fff"/>
      <circle cx="38.5" cy="26" r="1.5" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="30" cy="34" rx="4.5" ry="3" fill={N}/>
      <ellipse cx="29" cy="33" rx="1.5" ry="1" fill="rgba(255,255,255,0.25)"/>
      {/* Smile */}
      <path d="M26 37 Q30 41 34 37" stroke={N} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Cheeks */}
      <circle cx="17" cy="32" r="4.5" fill="rgba(255,120,100,0.22)"/>
      <circle cx="43" cy="32" r="4.5" fill="rgba(255,120,100,0.22)"/>
      {/* Paws */}
      <ellipse cx="21" cy="63" rx="7" ry="4.5" fill={D}/>
      <ellipse cx="39" cy="63" rx="7" ry="4.5" fill={D}/>
      {/* Tail - wags */}
      <g>
        <path d="M44 50 Q56 42 53 30 Q51 22 46 26" stroke={D} strokeWidth="5.5" fill="none" strokeLinecap="round"/>
        <animateTransform attributeName="transform" type="rotate" values="-12 44 50;14 44 50;-12 44 50" dur="0.7s" repeatCount="indefinite"/>
      </g>
    </g>
  );
}

function CatPet() {
  const F = '#7B8FA6'; const D = '#4A5F74'; const P = '#FFB3C6';
  return (
    <g>
      {/* Body */}
      <ellipse cx="30" cy="53" rx="14" ry="12" fill={F}/>
      {/* Head */}
      <circle cx="30" cy="29" r="17" fill={F}/>
      {/* Pointy ears */}
      <polygon points="14,20 10,3 24,14" fill={F}/>
      <polygon points="46,20 50,3 36,14" fill={F}/>
      <polygon points="15,19 13,8 22,14" fill={P}/>
      <polygon points="45,19 47,8 38,14" fill={P}/>
      {/* Eyes - cat slit pupils */}
      <ellipse cx="23" cy="27" rx="5" ry="4" fill="#5BAD6F"/>
      <ellipse cx="37" cy="27" rx="5" ry="4" fill="#5BAD6F"/>
      <ellipse cx="23" cy="27" rx="2" ry="4" fill="#0a0a1a"/>
      <ellipse cx="37" cy="27" rx="2" ry="4" fill="#0a0a1a"/>
      <circle cx="24.5" cy="25.5" r="1.3" fill="#fff"/>
      <circle cx="38.5" cy="25.5" r="1.3" fill="#fff"/>
      {/* Nose */}
      <path d="M27.5 32 L30 35 L32.5 32 L30 30.5 Z" fill={P}/>
      {/* Whiskers */}
      <line x1="6" y1="30" x2="22" y2="33" stroke="#334" strokeWidth="0.9" opacity="0.45"/>
      <line x1="6" y1="33" x2="22" y2="34.5" stroke="#334" strokeWidth="0.9" opacity="0.45"/>
      <line x1="38" y1="33" x2="54" y2="30" stroke="#334" strokeWidth="0.9" opacity="0.45"/>
      <line x1="38" y1="34.5" x2="54" y2="33" stroke="#334" strokeWidth="0.9" opacity="0.45"/>
      {/* Paws */}
      <ellipse cx="21" cy="63" rx="6" ry="4" fill={D}/>
      <ellipse cx="39" cy="63" rx="6" ry="4" fill={D}/>
      {/* Long tail - swishes */}
      <g>
        <path d="M44 52 Q60 44 56 30 Q52 18 46 24" stroke={D} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
        <animateTransform attributeName="transform" type="rotate" values="-7 44 52;8 44 52;-7 44 52" dur="1.6s" repeatCount="indefinite"/>
      </g>
    </g>
  );
}

function BunnyPet() {
  const F = '#EDE8E0'; const D = '#C8BFB0'; const P = '#FFB3C6';
  return (
    <g>
      {/* Long ears - they wiggle */}
      <g>
        <ellipse cx="21" cy="11" rx="6" ry="14" fill={F}/>
        <ellipse cx="21" cy="11" rx="3.5" ry="11" fill={P}/>
        <animateTransform attributeName="transform" type="rotate" values="-6 21 24;4 21 24;-6 21 24" dur="1.1s" repeatCount="indefinite"/>
      </g>
      <g>
        <ellipse cx="39" cy="11" rx="6" ry="14" fill={F}/>
        <ellipse cx="39" cy="11" rx="3.5" ry="11" fill={P}/>
        <animateTransform attributeName="transform" type="rotate" values="6 39 24;-4 39 24;6 39 24" dur="1.1s" repeatCount="indefinite"/>
      </g>
      {/* Body */}
      <ellipse cx="30" cy="54" rx="16" ry="13" fill={F}/>
      {/* Belly */}
      <ellipse cx="30" cy="55" rx="10" ry="9" fill="#F5F0EC"/>
      {/* Head */}
      <circle cx="30" cy="29" r="17" fill={F}/>
      {/* Eyes */}
      <circle cx="23" cy="27" r="5" fill="#C084FC"/>
      <circle cx="37" cy="27" r="5" fill="#C084FC"/>
      <circle cx="23" cy="28" r="3" fill="#0a0a1a"/>
      <circle cx="37" cy="28" r="3" fill="#0a0a1a"/>
      <circle cx="24.5" cy="26" r="1.5" fill="#fff"/>
      <circle cx="38.5" cy="26" r="1.5" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="30" cy="33" rx="3" ry="2" fill={P}/>
      {/* Mouth */}
      <path d="M27 35 Q30 38.5 33 35" stroke="#bb8888" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Cheeks */}
      <circle cx="18" cy="32" r="4" fill="rgba(255,150,150,0.28)"/>
      <circle cx="42" cy="32" r="4" fill="rgba(255,150,150,0.28)"/>
      {/* Paws */}
      <ellipse cx="21" cy="64" rx="7" ry="4.5" fill={D}/>
      <ellipse cx="39" cy="64" rx="7" ry="4.5" fill={D}/>
    </g>
  );
}

function HamsterPet() {
  const F = '#EDBB88'; const D = '#C8834A'; const P = '#FFB3C6'; const C = '#F5D0A9';
  return (
    <g>
      {/* Body (chubby round) */}
      <ellipse cx="30" cy="52" rx="18" ry="15" fill={F}/>
      {/* BIG chubby cheeks - defining feature */}
      <circle cx="11" cy="35" r="11" fill={C}/>
      <circle cx="49" cy="35" r="11" fill={C}/>
      {/* Head */}
      <circle cx="30" cy="28" r="16" fill={F}/>
      {/* Tiny ears */}
      <circle cx="18" cy="16" r="6" fill={D}/>
      <circle cx="18" cy="16" r="3.5" fill={P}/>
      <circle cx="42" cy="16" r="6" fill={D}/>
      <circle cx="42" cy="16" r="3.5" fill={P}/>
      {/* Eyes */}
      <circle cx="23" cy="26" r="5" fill="#0a0a0f"/>
      <circle cx="37" cy="26" r="5" fill="#0a0a0f"/>
      <circle cx="24.5" cy="24.5" r="2" fill="#fff"/>
      <circle cx="38.5" cy="24.5" r="2" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="30" cy="32" rx="3.5" ry="2.5" fill={P}/>
      {/* Mouth */}
      <path d="M27 34 Q30 37 33 34" stroke="#bb8888" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Tiny arms */}
      <ellipse cx="16" cy="52" rx="5" ry="7" fill={D} transform="rotate(-20 16 52)"/>
      <ellipse cx="44" cy="52" rx="5" ry="7" fill={D} transform="rotate(20 44 52)"/>
      {/* Feet */}
      <ellipse cx="21" cy="64" rx="7" ry="4" fill={D}/>
      <ellipse cx="39" cy="64" rx="7" ry="4" fill={D}/>
    </g>
  );
}

function FoxPet() {
  const F = '#E05C17'; const W = '#F5E8D0'; const D = '#8B2A00'; const Y = '#E0A830';
  return (
    <g>
      {/* Body */}
      <ellipse cx="30" cy="53" rx="15" ry="12" fill={F}/>
      {/* White chest */}
      <ellipse cx="30" cy="55" rx="9" ry="9" fill={W}/>
      {/* Head */}
      <circle cx="30" cy="28" r="17" fill={F}/>
      {/* Pointy ears with dark tips */}
      <polygon points="13,19 9,2 23,13" fill={F}/>
      <polygon points="47,19 51,2 37,13" fill={F}/>
      <polygon points="14,17 11,5 21,12" fill={D}/>
      <polygon points="46,17 49,5 39,12" fill={D}/>
      {/* White face mask */}
      <ellipse cx="30" cy="32" rx="11" ry="9" fill={W}/>
      {/* Amber eyes */}
      <circle cx="23" cy="27" r="5" fill={Y}/>
      <circle cx="37" cy="27" r="5" fill={Y}/>
      <ellipse cx="23" cy="28" rx="2.5" ry="3.5" fill="#0a0a1a"/>
      <ellipse cx="37" cy="28" rx="2.5" ry="3.5" fill="#0a0a1a"/>
      <circle cx="24.5" cy="26" r="1.5" fill="#fff"/>
      <circle cx="38.5" cy="26" r="1.5" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="30" cy="33" rx="3.5" ry="2.5" fill={D}/>
      {/* Paws */}
      <ellipse cx="21" cy="63" rx="6" ry="4" fill={D}/>
      <ellipse cx="39" cy="63" rx="6" ry="4" fill={D}/>
      {/* Bushy tail with white tip - wags */}
      <g>
        <path d="M44 50 Q60 40 56 26 Q52 14 45 20" stroke={F} strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M56 26 Q52 14 45 20" stroke={W} strokeWidth="5" fill="none" strokeLinecap="round"/>
        <animateTransform attributeName="transform" type="rotate" values="-10 44 50;12 44 50;-10 44 50" dur="0.9s" repeatCount="indefinite"/>
      </g>
    </g>
  );
}

function FrogPet() {
  const G = '#5BBB6A'; const D = '#3D8C47'; const L = '#8EE5A0'; const Y = '#FFE44D';
  return (
    <g>
      {/* Wide flat body */}
      <ellipse cx="30" cy="56" rx="20" ry="12" fill={G}/>
      {/* Belly */}
      <ellipse cx="30" cy="57" rx="14" ry="8" fill={L}/>
      {/* Head - wide too */}
      <ellipse cx="30" cy="32" rx="20" ry="16" fill={G}/>
      {/* Eye bumps on TOP */}
      <circle cx="18" cy="20" r="9" fill={G}/>
      <circle cx="42" cy="20" r="9" fill={G}/>
      {/* Eyes */}
      <circle cx="18" cy="19" r="7" fill={Y}/>
      <circle cx="42" cy="19" r="7" fill={Y}/>
      <circle cx="18" cy="20" r="4" fill="#0a0a1a"/>
      <circle cx="42" cy="20" r="4" fill="#0a0a1a"/>
      <circle cx="19.5" cy="18" r="1.5" fill="#fff"/>
      <circle cx="43.5" cy="18" r="1.5" fill="#fff"/>
      {/* Wide mouth */}
      <path d="M12 36 Q30 45 48 36" stroke={D} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Tiny nostrils */}
      <circle cx="27" cy="32" r="1.5" fill={D}/>
      <circle cx="33" cy="32" r="1.5" fill={D}/>
      {/* Little arms */}
      <ellipse cx="11" cy="50" rx="6" ry="8" fill={G} transform="rotate(-30 11 50)"/>
      <ellipse cx="49" cy="50" rx="6" ry="8" fill={G} transform="rotate(30 49 50)"/>
      {/* Wide webbed feet */}
      <ellipse cx="16" cy="65" rx="10" ry="5" fill={D}/>
      <ellipse cx="44" cy="65" rx="10" ry="5" fill={D}/>
    </g>
  );
}

function PenguinPet() {
  const B = '#1a1f2e'; const W = '#F0F0EE'; const O = '#F97316';
  return (
    <g>
      {/* Body */}
      <ellipse cx="30" cy="52" rx="16" ry="17" fill={B}/>
      {/* White belly */}
      <ellipse cx="30" cy="54" rx="11" ry="13" fill={W}/>
      {/* Head */}
      <circle cx="30" cy="28" r="16" fill={B}/>
      {/* Eyes */}
      <circle cx="24" cy="26" r="5" fill={W}/>
      <circle cx="36" cy="26" r="5" fill={W}/>
      <circle cx="24" cy="27" r="3" fill="#0a0a1a"/>
      <circle cx="36" cy="27" r="3" fill="#0a0a1a"/>
      <circle cx="25" cy="25.5" r="1.3" fill="#fff"/>
      <circle cx="37" cy="25.5" r="1.3" fill="#fff"/>
      {/* Orange beak */}
      <path d="M26 33 L30 38 L34 33 Z" fill={O}/>
      {/* Wings - flap */}
      <g>
        <ellipse cx="13" cy="48" rx="6" ry="14" fill={B} transform="rotate(-20 13 48)"/>
        <animateTransform attributeName="transform" type="rotate" values="-20 13 48;-5 13 48;-20 13 48" dur="1.4s" repeatCount="indefinite"/>
      </g>
      <g>
        <ellipse cx="47" cy="48" rx="6" ry="14" fill={B} transform="rotate(20 47 48)"/>
        <animateTransform attributeName="transform" type="rotate" values="20 47 48;5 47 48;20 47 48" dur="1.4s" repeatCount="indefinite"/>
      </g>
      {/* Orange feet */}
      <ellipse cx="23" cy="66" rx="8" ry="4" fill={O}/>
      <ellipse cx="37" cy="66" rx="8" ry="4" fill={O}/>
    </g>
  );
}

function PandaPet() {
  const W = '#EEECEA'; const B = '#1a1a2e'; const G = '#D0CEC8';
  return (
    <g>
      {/* Body */}
      <ellipse cx="30" cy="53" rx="17" ry="14" fill={W}/>
      {/* Black arms */}
      <ellipse cx="14" cy="52" rx="7" ry="11" fill={B} transform="rotate(-15 14 52)"/>
      {/* Right arm - waves */}
      <g>
        <ellipse cx="46" cy="46" rx="7" ry="11" fill={B} transform="rotate(15 46 46)"/>
        <animateTransform attributeName="transform" type="rotate" values="10 46 58;35 46 58;10 46 58" dur="1.8s" repeatCount="indefinite"/>
      </g>
      {/* Black ears */}
      <circle cx="16" cy="16" r="9" fill={B}/>
      <circle cx="44" cy="16" r="9" fill={B}/>
      {/* Head */}
      <circle cx="30" cy="28" r="18" fill={W}/>
      {/* Black eye patches */}
      <ellipse cx="21" cy="27" rx="8" ry="7" fill={B}/>
      <ellipse cx="39" cy="27" rx="8" ry="7" fill={B}/>
      {/* Eyes */}
      <circle cx="21" cy="27" r="4.5" fill={W}/>
      <circle cx="39" cy="27" r="4.5" fill={W}/>
      <circle cx="21" cy="28" r="3" fill="#0a0a1a"/>
      <circle cx="39" cy="28" r="3" fill="#0a0a1a"/>
      <circle cx="22.5" cy="26.5" r="1.3" fill="#fff"/>
      <circle cx="40.5" cy="26.5" r="1.3" fill="#fff"/>
      {/* Nose + mouth */}
      <ellipse cx="30" cy="34" rx="4" ry="2.5" fill={B}/>
      <path d="M27 37 Q30 40 33 37" stroke="#888" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Cheeks */}
      <circle cx="17" cy="33" r="4" fill="rgba(255,130,130,0.2)"/>
      <circle cx="43" cy="33" r="4" fill="rgba(255,130,130,0.2)"/>
      {/* Feet */}
      <ellipse cx="21" cy="64" rx="7" ry="4.5" fill={B}/>
      <ellipse cx="39" cy="64" rx="7" ry="4.5" fill={B}/>
    </g>
  );
}

function WolfPet() {
  const F = '#4A5568'; const D = '#2D3748'; const L = '#A0AEC0'; const I = '#63B3ED';
  return (
    <g>
      {/* Body */}
      <ellipse cx="30" cy="53" rx="16" ry="12" fill={F}/>
      {/* Chest lighter */}
      <ellipse cx="30" cy="55" rx="9" ry="8" fill={L}/>
      {/* Head */}
      <circle cx="30" cy="28" r="17" fill={F}/>
      {/* Head fur lighter on top */}
      <ellipse cx="30" cy="22" rx="13" ry="8" fill={L}/>
      {/* Pointed ears */}
      <polygon points="13,18 10,1 24,13" fill={F}/>
      <polygon points="47,18 50,1 36,13" fill={F}/>
      <polygon points="14.5,17 12,6 22,13" fill={L}/>
      <polygon points="45.5,17 48,6 38,13" fill={L}/>
      {/* Muzzle */}
      <ellipse cx="30" cy="33" rx="10" ry="7" fill={L}/>
      {/* Eyes - piercing blue */}
      <circle cx="23" cy="27" r="5" fill={I}/>
      <circle cx="37" cy="27" r="5" fill={I}/>
      <circle cx="23" cy="28" r="3" fill="#0a0a1a"/>
      <circle cx="37" cy="28" r="3" fill="#0a0a1a"/>
      <circle cx="24.5" cy="26" r="1.5" fill="#cceeff"/>
      <circle cx="38.5" cy="26" r="1.5" fill="#cceeff"/>
      {/* Nose */}
      <ellipse cx="30" cy="33" rx="4" ry="2.5" fill={D}/>
      {/* Serious mouth line */}
      <path d="M26 36.5 Q30 39 34 36.5" stroke={D} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Paws */}
      <ellipse cx="21" cy="63" rx="7" ry="4.5" fill={D}/>
      <ellipse cx="39" cy="63" rx="7" ry="4.5" fill={D}/>
      {/* Tail */}
      <g>
        <path d="M44 51 Q58 42 54 28 Q50 16 44 22" stroke={F} strokeWidth="6" fill="none" strokeLinecap="round"/>
        <animateTransform attributeName="transform" type="rotate" values="-8 44 51;6 44 51;-8 44 51" dur="1.3s" repeatCount="indefinite"/>
      </g>
    </g>
  );
}

function DragonPet() {
  const F = '#0EA5E9'; const D = '#0369A1'; const G = '#67E8F9'; const Y = '#FBBF24';
  return (
    <g>
      {/* Wings - flap */}
      <g>
        <path d="M18 38 Q2 20 8 10 Q14 0 22 18 Z" fill={D} opacity="0.8"/>
        <animateTransform attributeName="transform" type="rotate" values="0 18 42;-20 18 42;0 18 42" dur="0.9s" repeatCount="indefinite"/>
      </g>
      <g>
        <path d="M42 38 Q58 20 52 10 Q46 0 38 18 Z" fill={D} opacity="0.8"/>
        <animateTransform attributeName="transform" type="rotate" values="0 42 42;20 42 42;0 42 42" dur="0.9s" repeatCount="indefinite"/>
      </g>
      {/* Body */}
      <ellipse cx="30" cy="53" rx="15" ry="13" fill={F}/>
      {/* Belly scales */}
      <ellipse cx="30" cy="55" rx="9" ry="10" fill={G}/>
      {/* Head */}
      <circle cx="30" cy="28" r="16" fill={F}/>
      {/* Horns */}
      <path d="M21 14 L18 2 L24 10 Z" fill={D}/>
      <path d="M39 14 L42 2 L36 10 Z" fill={D}/>
      {/* Eyes - sparkle */}
      <circle cx="23" cy="27" r="5.5" fill={Y}/>
      <circle cx="37" cy="27" r="5.5" fill={Y}/>
      <circle cx="23" cy="28" r="3.5" fill="#0a0a1a"/>
      <circle cx="37" cy="28" r="3.5" fill="#0a0a1a"/>
      <circle cx="24.5" cy="26" r="2" fill="#fff"/>
      <circle cx="38.5" cy="26" r="2" fill="#fff"/>
      {/* Snout */}
      <ellipse cx="30" cy="34" rx="7" ry="5" fill={D}/>
      <circle cx="28" cy="33" r="2" fill={F}/>
      <circle cx="32" cy="33" r="2" fill={F}/>
      {/* Little flame breath */}
      <g opacity="0.85">
        <ellipse cx="30" cy="41" rx="4" ry="3" fill="#F97316"/>
        <ellipse cx="30" cy="43" rx="3" ry="2" fill={Y}/>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="0.5s" repeatCount="indefinite"/>
      </g>
      {/* Paws */}
      <ellipse cx="21" cy="63" rx="6" ry="4" fill={D}/>
      <ellipse cx="39" cy="63" rx="6" ry="4" fill={D}/>
    </g>
  );
}

function UnicornPet() {
  const W = '#F5F0FF'; const M = '#C084FC'; const G = '#E879F9'; const H = '#FBBF24';
  const rainbowColors = ['#FF6B6B','#FFB347','#FFD166','#06D6A0','#118AB2','#A855F7'];
  return (
    <g>
      {/* Rainbow mane floating behind */}
      {rainbowColors.map((c, i) => (
        <ellipse key={i} cx={22 + i * 1.5} cy={18 + i * 3} rx="5" ry="3" fill={c} opacity="0.7" transform={`rotate(${-30 + i * 5} ${22 + i*1.5} ${18 + i*3})`}/>
      ))}
      {/* Body */}
      <ellipse cx="30" cy="53" rx="16" ry="12" fill={W}/>
      {/* Rainbow tail */}
      {rainbowColors.map((c, i) => (
        <path key={i} d={`M44 ${52 + i} Q${58 - i*2} ${44 + i} ${55 - i} ${32 + i*2}`}
          stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
      ))}
      {/* Head */}
      <circle cx="30" cy="28" r="17" fill={W}/>
      {/* Rainbow horn */}
      <polygon points="26,12 30,0 34,12" fill={H}/>
      <polygon points="27,11 30,2 33,11" fill="url(#hornGrad)"/>
      <defs>
        <linearGradient id="hornGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B"/>
          <stop offset="50%" stopColor="#06D6A0"/>
          <stop offset="100%" stopColor="#A855F7"/>
        </linearGradient>
      </defs>
      {/* Star eyes */}
      <circle cx="23" cy="28" r="5.5" fill={M}/>
      <circle cx="37" cy="28" r="5.5" fill={M}/>
      <circle cx="23" cy="29" r="3.5" fill="#0a0a1a"/>
      <circle cx="37" cy="29" r="3.5" fill="#0a0a1a"/>
      <circle cx="24.5" cy="27" r="1.8" fill="#fff"/>
      <circle cx="38.5" cy="27" r="1.8" fill="#fff"/>
      {/* Small star sparkle in eye */}
      <text x="20.5" y="30" fontSize="5" fill="#fff" opacity="0.9">✦</text>
      <text x="34.5" y="30" fontSize="5" fill="#fff" opacity="0.9">✦</text>
      {/* Nose */}
      <ellipse cx="30" cy="34" rx="3.5" ry="2" fill={G}/>
      {/* Cheeks */}
      <circle cx="18" cy="33" r="4" fill="rgba(192,132,252,0.3)"/>
      <circle cx="42" cy="33" r="4" fill="rgba(192,132,252,0.3)"/>
      {/* Paws */}
      <ellipse cx="21" cy="63" rx="7" ry="4.5" fill={M}/>
      <ellipse cx="39" cy="63" rx="7" ry="4.5" fill={M}/>
    </g>
  );
}

function PhoenixPet() {
  const R = '#DC2626'; const O = '#F97316'; const Y = '#FBBF24'; const G = '#D97706';
  return (
    <g>
      {/* Flame wings */}
      <g opacity="0.9">
        <path d="M16 38 Q0 18 6 2 Q10 -5 18 14 Q20 20 18 30 Z" fill={O}/>
        <path d="M16 38 Q4 22 9 8 Q13 0 20 16 Z" fill={Y}/>
        <animateTransform attributeName="transform" type="rotate" values="-8 16 40;5 16 40;-8 16 40" dur="0.6s" repeatCount="indefinite"/>
      </g>
      <g opacity="0.9">
        <path d="M44 38 Q60 18 54 2 Q50 -5 42 14 Q40 20 42 30 Z" fill={O}/>
        <path d="M44 38 Q56 22 51 8 Q47 0 40 16 Z" fill={Y}/>
        <animateTransform attributeName="transform" type="rotate" values="8 44 40;-5 44 40;8 44 40" dur="0.6s" repeatCount="indefinite"/>
      </g>
      {/* Body + flame tail */}
      <ellipse cx="30" cy="52" rx="14" ry="12" fill={R}/>
      <path d="M22 60 Q16 72 10 68 Q18 75 22 68 Q26 74 20 80" stroke={O} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M38 60 Q44 72 50 68 Q42 75 38 68 Q34 74 40 80" stroke={O} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <circle cx="30" cy="27" r="16" fill={R}/>
      {/* Flame crest */}
      <path d="M22 16 Q25 4 30 0 Q35 4 38 16 Q34 10 30 8 Q26 10 22 16 Z" fill={O}/>
      <path d="M25 16 Q27 6 30 3 Q33 6 35 16 Q33 11 30 9 Q27 11 25 16 Z" fill={Y}/>
      {/* Eyes - golden glow */}
      <circle cx="23" cy="27" r="5.5" fill={Y}/>
      <circle cx="37" cy="27" r="5.5" fill={Y}/>
      <circle cx="23" cy="28" r="3.5" fill={G}/>
      <circle cx="37" cy="28" r="3.5" fill={G}/>
      <circle cx="24.5" cy="26" r="1.8" fill="#fff"/>
      <circle cx="38.5" cy="26" r="1.8" fill="#fff"/>
      {/* Beak */}
      <path d="M27 33 L30 38 L33 33 Z" fill={Y}/>
      {/* Glow pulse */}
      <circle cx="30" cy="27" r="18" fill="none" stroke={Y} strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.1;0.5;0.1" dur="0.8s" repeatCount="indefinite"/>
        <animate attributeName="r" values="17;20;17" dur="0.8s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

// ─── PET MAP ─────────────────────────────────────────────────────────────────
const PET_MAP = {
  dog: DogPet, cat: CatPet, bunny: BunnyPet, hamster: HamsterPet,
  fox: FoxPet, frog: FrogPet, penguin: PenguinPet, panda: PandaPet,
  wolf: WolfPet, dragon: DragonPet, unicorn: UnicornPet, phoenix: PhoenixPet,
};

// ─── RARITY AURA ─────────────────────────────────────────────────────────────
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
          <ellipse cx="30" cy="67" rx="14" ry="3" fill="rgba(0,0,0,0.2)"/>
          <PetComp/>
        </svg>
      </div>
    </div>
  );
}
