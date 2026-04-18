'use client';
import { PETS } from '../lib/character';

const BEHAVIOR_CLASS = {
  bounce: 'pet-bounce', sway: 'pet-sway', hop: 'pet-hop', wobble: 'pet-wobble',
  strut: 'pet-sway', waddle: 'pet-wobble', flap: 'pet-float', float: 'pet-float',
  flip: 'pet-flip', stomp: 'pet-bounce', guard: 'pet-pulse', pulse: 'pet-pulse',
  howl: 'pet-sway'
};

// ─── 🐾 ANIMALS ─────────────────────────────────────────────────────────────

// Pup: Round golden dog face with big floppy ears hanging down
const Pup = () => (
  <g>
    {/* Shadow */}
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Floppy ears */}
    <ellipse cx="22" cy="52" rx="14" ry="22" fill="#B45309" transform="rotate(10 22 52)"/>
    <ellipse cx="78" cy="52" rx="14" ry="22" fill="#B45309" transform="rotate(-10 78 52)"/>
    {/* Head */}
    <circle cx="50" cy="45" r="34" fill="#D97706"/>
    {/* Snout */}
    <ellipse cx="50" cy="58" rx="16" ry="12" fill="#FEF3C7"/>
    {/* Nose */}
    <ellipse cx="50" cy="53" rx="7" ry="5" fill="#1E293B"/>
    {/* Eyes */}
    <circle cx="37" cy="40" r="6" fill="#1E293B"/>
    <circle cx="63" cy="40" r="6" fill="#1E293B"/>
    <circle cx="39" cy="38" r="2" fill="white"/>
    <circle cx="65" cy="38" r="2" fill="white"/>
    {/* Smile */}
    <path d="M42 64 Q50 72 58 64" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Tongue */}
    <ellipse cx="50" cy="69" rx="5" ry="4" fill="#EF4444"/>
  </g>
);

// Kitty: Triangle ears on a round dark cat face, glowing green eyes
const Kitty = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Ears */}
    <polygon points="22,30 32,8 45,28" fill="#1E293B"/>
    <polygon points="26,28 32,12 42,27" fill="#F472B6"/>
    <polygon points="78,30 68,8 55,28" fill="#1E293B"/>
    <polygon points="74,28 68,12 58,27" fill="#F472B6"/>
    {/* Head */}
    <circle cx="50" cy="50" r="35" fill="#334155"/>
    {/* Eye glow */}
    <ellipse cx="37" cy="46" rx="8" ry="10" fill="#A7F3D0"/>
    <ellipse cx="63" cy="46" rx="8" ry="10" fill="#A7F3D0"/>
    <ellipse cx="37" cy="46" rx="4" ry="8" fill="#065F46"/>
    <ellipse cx="63" cy="46" rx="4" ry="8" fill="#065F46"/>
    <circle cx="39" cy="44" r="1.5" fill="white"/>
    <circle cx="65" cy="44" r="1.5" fill="white"/>
    {/* Nose & muzzle */}
    <ellipse cx="50" cy="58" rx="10" ry="7" fill="#475569"/>
    <path d="M47 59 L50 55 L53 59" fill="#F472B6"/>
    {/* Whiskers */}
    <line x1="10" y1="56" x2="38" y2="60" stroke="#94A3B8" strokeWidth="1.5"/>
    <line x1="10" y1="62" x2="38" y2="62" stroke="#94A3B8" strokeWidth="1.5"/>
    <line x1="90" y1="56" x2="62" y2="60" stroke="#94A3B8" strokeWidth="1.5"/>
    <line x1="90" y1="62" x2="62" y2="62" stroke="#94A3B8" strokeWidth="1.5"/>
    {/* Tail curving up */}
    <path d="M70 90 Q95 80 90 55 Q88 45 80 48" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round"/>
  </g>
);

// Bunny: Massive tall ears, round white face
const Bunny = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Left long ear */}
    <ellipse cx="35" cy="18" rx="10" ry="28" fill="#F1F5F9"/>
    <ellipse cx="35" cy="18" rx="5" ry="22" fill="#FDA4AF"/>
    {/* Right long ear */}
    <ellipse cx="65" cy="18" rx="10" ry="28" fill="#F1F5F9"/>
    <ellipse cx="65" cy="18" rx="5" ry="22" fill="#FDA4AF"/>
    {/* Body */}
    <ellipse cx="50" cy="80" rx="22" ry="18" fill="#F1F5F9"/>
    {/* Head */}
    <circle cx="50" cy="55" r="28" fill="#FFFFFF"/>
    {/* Eyes */}
    <circle cx="39" cy="50" r="5" fill="#FDA4AF"/>
    <circle cx="61" cy="50" r="5" fill="#FDA4AF"/>
    <circle cx="39" cy="50" r="3" fill="#1E293B"/>
    <circle cx="61" cy="50" r="3" fill="#1E293B"/>
    <circle cx="40" cy="49" r="1" fill="white"/>
    <circle cx="62" cy="49" r="1" fill="white"/>
    {/* Nose */}
    <path d="M47 58 L50 55 L53 58" fill="#F472B6"/>
    <ellipse cx="50" cy="59" rx="4" ry="3" fill="#F472B6"/>
    {/* Mouth */}
    <path d="M45 62 Q50 66 55 62" fill="none" stroke="#CBD5E1" strokeWidth="1.5"/>
    {/* Fluffy tail */}
    <circle cx="73" cy="82" r="8" fill="#E2E8F0"/>
  </g>
);

// Fox: Sharp triangular ears, long tapered snout, bushy tail
const Fox = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Big bushy tail */}
    <path d="M62 78 Q90 65 88 90 Q75 98 60 90 Z" fill="#EA580C"/>
    <path d="M68 82 Q86 72 84 88 Q74 94 65 88 Z" fill="#FEF3C7"/>
    {/* Body */}
    <ellipse cx="46" cy="80" rx="20" ry="16" fill="#EA580C"/>
    {/* Chest patch */}
    <ellipse cx="46" cy="83" rx="11" ry="10" fill="#FEF3C7"/>
    {/* Sharp ears */}
    <polygon points="29,30 20,4 42,24" fill="#EA580C"/>
    <polygon points="32,28 24,10 39,23" fill="#FDA4AF"/>
    <polygon points="71,30 80,4 58,24" fill="#EA580C"/>
    <polygon points="68,28 76,10 61,23" fill="#FDA4AF"/>
    {/* Head */}
    <circle cx="50" cy="44" r="28" fill="#EA580C"/>
    {/* White face mask */}
    <ellipse cx="50" cy="52" rx="16" ry="14" fill="#FEF3C7"/>
    {/* Eyes */}
    <circle cx="38" cy="38" r="6" fill="#1E293B"/>
    <circle cx="62" cy="38" r="6" fill="#1E293B"/>
    <circle cx="36" cy="36" r="2" fill="#FDE047"/>
    <circle cx="60" cy="36" r="2" fill="#FDE047"/>
    {/* Elongated snout */}
    <ellipse cx="50" cy="52" rx="10" ry="7" fill="#FEF3C7"/>
    <ellipse cx="50" cy="47" rx="6" ry="4" fill="#1E293B"/>
  </g>
);

// Bear: Big round brown bear with visible snout and small round ears
const Bear = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Body */}
    <ellipse cx="50" cy="82" rx="25" ry="19" fill="#92400E"/>
    {/* Round ears */}
    <circle cx="24" cy="28" r="14" fill="#92400E"/>
    <circle cx="24" cy="28" r="8" fill="#B45309"/>
    <circle cx="76" cy="28" r="14" fill="#92400E"/>
    <circle cx="76" cy="28" r="8" fill="#B45309"/>
    {/* Head */}
    <circle cx="50" cy="48" r="33" fill="#92400E"/>
    {/* Snout */}
    <ellipse cx="50" cy="60" rx="18" ry="14" fill="#B45309"/>
    {/* Nose */}
    <path d="M43 55 Q50 52 57 55 Q50 62 43 55 Z" fill="#1E293B"/>
    {/* Eyes */}
    <circle cx="36" cy="42" r="6" fill="#1E293B"/>
    <circle cx="64" cy="42" r="6" fill="#1E293B"/>
    <circle cx="38" cy="40" r="2" fill="white"/>
    <circle cx="66" cy="40" r="2" fill="white"/>
    {/* Mouth */}
    <path d="M44 65 Q50 70 56 65" fill="none" stroke="#1E293B" strokeWidth="2"/>
  </g>
);

// Wolf: Angular pointed snout, angular ears, icy blue eyes
const Wolf = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Body */}
    <ellipse cx="50" cy="82" rx="22" ry="17" fill="#475569"/>
    {/* Tail up */}
    <path d="M68 75 Q90 55 82 30" fill="none" stroke="#475569" strokeWidth="12" strokeLinecap="round"/>
    {/* Pointed ears */}
    <polygon points="24,30 16,4 40,22" fill="#475569"/>
    <polygon points="27,28 22,10 37,22" fill="#64748B"/>
    <polygon points="76,30 84,4 60,22" fill="#475569"/>
    <polygon points="73,28 78,10 63,22" fill="#64748B"/>
    {/* Head */}
    <circle cx="50" cy="46" r="30" fill="#475569"/>
    {/* Muzzle - angular wolf snout */}
    <path d="M34 52 Q50 72 66 52 Q58 58 50 60 Q42 58 34 52 Z" fill="#94A3B8"/>
    {/* Eyes - icy blue */}
    <circle cx="37" cy="40" r="7" fill="#38BDF8"/>
    <circle cx="63" cy="40" r="7" fill="#38BDF8"/>
    <circle cx="37" cy="40" r="4" fill="#0F172A"/>
    <circle cx="63" cy="40" r="4" fill="#0F172A"/>
    <circle cx="39" cy="38" r="1.5" fill="white"/>
    <circle cx="65" cy="38" r="1.5" fill="white"/>
    {/* Nose */}
    <ellipse cx="50" cy="55" rx="6" ry="4" fill="#1E293B"/>
  </g>
);

// Lion: Huge mane all around, wide flat nose, regal look
const Lion = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Mane - big sunburst behind */}
    <circle cx="50" cy="48" r="42" fill="#92400E"/>
    {/* Body */}
    <ellipse cx="50" cy="83" rx="20" ry="15" fill="#F59E0B"/>
    {/* Face */}
    <circle cx="50" cy="48" r="28" fill="#F59E0B"/>
    {/* Cheek tufts */}
    <ellipse cx="22" cy="56" rx="8" ry="10" fill="#D97706"/>
    <ellipse cx="78" cy="56" rx="8" ry="10" fill="#D97706"/>
    {/* Muzzle flat wide */}
    <ellipse cx="50" cy="58" rx="16" ry="12" fill="#FEF3C7"/>
    {/* Wide flat nose */}
    <path d="M42 54 Q50 50 58 54 Q56 60 50 62 Q44 60 42 54 Z" fill="#1E293B"/>
    {/* Eyes - golden */}
    <circle cx="36" cy="42" r="7" fill="#CA8A04"/>
    <circle cx="64" cy="42" r="7" fill="#CA8A04"/>
    <circle cx="36" cy="42" r="4" fill="#1E293B"/>
    <circle cx="64" cy="42" r="4" fill="#1E293B"/>
    <circle cx="38" cy="40" r="1.5" fill="white"/>
    <circle cx="66" cy="40" r="1.5" fill="white"/>
    {/* Mouth */}
    <path d="M44 65 Q50 70 56 65" fill="none" stroke="#92400E" strokeWidth="2"/>
  </g>
);

// Eagle: White head, brown body, yellow beak, spread wings visible
const Eagle = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Wings spread */}
    <path d="M50 55 Q20 45 5 60 Q15 40 50 48 Z" fill="#451A03"/>
    <path d="M50 55 Q80 45 95 60 Q85 40 50 48 Z" fill="#451A03"/>
    {/* Body */}
    <ellipse cx="50" cy="75" rx="18" ry="20" fill="#451A03"/>
    {/* White head */}
    <circle cx="50" cy="42" r="26" fill="#FFFFFF"/>
    {/* Yellow hooked beak */}
    <path d="M38 52 L62 52 L50 72 Z" fill="#F59E0B"/>
    <path d="M38 52 L62 52 L54 60 Z" fill="#D97706"/>
    {/* Eyes - sharp */}
    <circle cx="37" cy="40" r="7" fill="#1E293B"/>
    <circle cx="63" cy="40" r="7" fill="#1E293B"/>
    <circle cx="35" cy="38" r="2.5" fill="#FBBF24"/>
    <circle cx="61" cy="38" r="2.5" fill="#FBBF24"/>
  </g>
);

// Panther: Sleek all-black with glowing yellow eyes, muscular silhouette
const Panther = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Body lean */}
    <ellipse cx="50" cy="80" rx="21" ry="17" fill="#0F172A"/>
    {/* Tail long */}
    <path d="M65 78 Q88 65 86 45" fill="none" stroke="#0F172A" strokeWidth="10" strokeLinecap="round"/>
    <circle cx="86" cy="42" r="6" fill="#0F172A"/>
    {/* Ears sleek pointed */}
    <polygon points="26,28 18,6 40,22" fill="#0F172A"/>
    <polygon points="74,28 82,6 60,22" fill="#0F172A"/>
    {/* Head */}
    <circle cx="50" cy="46" r="29" fill="#0F172A"/>
    {/* Glowing yellow eyes */}
    <circle cx="37" cy="40" r="8" fill="#FDE047"/>
    <circle cx="63" cy="40" r="8" fill="#FDE047"/>
    <ellipse cx="37" cy="40" rx="4" ry="6" fill="#0F172A"/>
    <ellipse cx="63" cy="40" rx="4" ry="6" fill="#0F172A"/>
    <circle cx="38" cy="38" r="1.5" fill="rgba(255,255,255,0.6)"/>
    <circle cx="64" cy="38" r="1.5" fill="rgba(255,255,255,0.6)"/>
    {/* Subtle markings */}
    <path d="M32 56 Q50 68 68 56" fill="none" stroke="#1E293B" strokeWidth="3"/>
  </g>
);

// Panda: Classic B&W markings, round, chubby cute face
const Panda = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Body white */}
    <ellipse cx="50" cy="82" rx="26" ry="18" fill="#FFFFFF"/>
    {/* Black ears */}
    <circle cx="24" cy="26" r="16" fill="#0F172A"/>
    <circle cx="76" cy="26" r="16" fill="#0F172A"/>
    {/* Head white */}
    <circle cx="50" cy="50" r="32" fill="#FFFFFF"/>
    {/* Black eye patches */}
    <ellipse cx="34" cy="43" rx="12" ry="10" fill="#0F172A" transform="rotate(-20 34 43)"/>
    <ellipse cx="66" cy="43" rx="12" ry="10" fill="#0F172A" transform="rotate(20 66 43)"/>
    {/* Eyes inside patches */}
    <circle cx="34" cy="44" r="5" fill="#F1F5F9"/>
    <circle cx="66" cy="44" r="5" fill="#F1F5F9"/>
    <circle cx="34" cy="44" r="3" fill="#0F172A"/>
    <circle cx="66" cy="44" r="3" fill="#0F172A"/>
    <circle cx="35" cy="43" r="1" fill="white"/>
    <circle cx="67" cy="43" r="1" fill="white"/>
    {/* Snout */}
    <ellipse cx="50" cy="60" rx="12" ry="9" fill="#E2E8F0"/>
    <ellipse cx="50" cy="56" rx="5" ry="4" fill="#0F172A"/>
    {/* Mouth */}
    <path d="M45 63 Q50 68 55 63" fill="none" stroke="#94A3B8" strokeWidth="2"/>
  </g>
);

// ─── 🦖 DINOS & MYTHIC ──────────────────────────────────────────────────────

// Trike: Front-facing triceratops with three big horns and frill
const Trike = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Bony frill */}
    <path d="M10 30 Q50 0 90 30 Q70 50 50 48 Q30 50 10 30 Z" fill="#B45309"/>
    <path d="M15 35 Q50 8 85 35 Q65 48 50 46 Q35 48 15 35 Z" fill="#D97706"/>
    {/* Horns */}
    <polygon points="50,10 46,32 54,32" fill="#FEF3C7"/>
    <polygon points="28,28 22,50 34,48" fill="#FEF3C7"/>
    <polygon points="72,28 78,50 66,48" fill="#FEF3C7"/>
    {/* Head */}
    <ellipse cx="50" cy="62" rx="32" ry="26" fill="#F59E0B"/>
    {/* Beak */}
    <ellipse cx="50" cy="72" rx="14" ry="10" fill="#D97706"/>
    {/* Eyes */}
    <circle cx="32" cy="55" r="8" fill="#1E293B"/>
    <circle cx="68" cy="55" r="8" fill="#1E293B"/>
    <circle cx="30" cy="53" r="3" fill="#CA8A04"/>
    <circle cx="66" cy="53" r="3" fill="#CA8A04"/>
    {/* Nostrils */}
    <circle cx="44" cy="72" r="3" fill="#B45309"/>
    <circle cx="56" cy="72" r="3" fill="#B45309"/>
  </g>
);

// Raptor: Sleek side profile — narrow intelligent eyes, speed lines
const Raptor = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Counter-balancing tail */}
    <path d="M28 72 Q5 60 8 38" fill="none" stroke="#0F766E" strokeWidth="12" strokeLinecap="round"/>
    {/* Body lean forward */}
    <ellipse cx="52" cy="70" rx="22" ry="30" fill="#14B8A6" transform="rotate(-15 52 70)"/>
    {/* Little arms */}
    <path d="M40 58 Q28 55 26 62" stroke="#0F766E" strokeWidth="8" strokeLinecap="round" fill="none"/>
    {/* Neck + head angled */}
    <ellipse cx="65" cy="40" rx="20" ry="26" fill="#14B8A6" transform="rotate(20 65 40)"/>
    {/* Snout */}
    <ellipse cx="78" cy="32" rx="18" ry="10" fill="#14B8A6" transform="rotate(20 78 32)"/>
    {/* Teeth */}
    <path d="M68 26 L72 20 L76 26 L80 20 L84 26" fill="none" stroke="#FEF3C7" strokeWidth="2.5"/>
    {/* Eye */}
    <circle cx="72" cy="30" r="6" fill="#FDE047"/>
    <circle cx="72" cy="30" r="3" fill="#0F172A"/>
    {/* Speed fin */}
    <path d="M45 55 Q55 35 60 30" fill="none" stroke="#CCFBF1" strokeWidth="4" strokeLinecap="round"/>
  </g>
);

// Ptero: Spreading wings, long beak, crested head
const Ptero = () => (
  <g>
    <ellipse cx="50" cy="97" rx="25" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Wings spread wide */}
    <path d="M50 50 Q15 25 2 50 Q20 70 50 60 Z" fill="#6366F1"/>
    <path d="M50 50 Q85 25 98 50 Q80 70 50 60 Z" fill="#6366F1"/>
    {/* Wing membranes */}
    <path d="M50 50 Q15 25 2 50 Q20 55 50 55 Z" fill="#818CF8"/>
    <path d="M50 50 Q85 25 98 50 Q80 55 50 55 Z" fill="#818CF8"/>
    {/* Body */}
    <ellipse cx="50" cy="58" rx="12" ry="18" fill="#4F46E5"/>
    {/* Crest spike on head */}
    <polygon points="50,18 44,35 56,35" fill="#E0E7FF"/>
    {/* Head */}
    <ellipse cx="50" cy="40" rx="14" ry="16" fill="#6366F1"/>
    {/* Long beak */}
    <polygon points="30,46 70,46 50,85" fill="#FDE047"/>
    <polygon points="35,46 65,46 50,72" fill="#FBBF24"/>
    {/* Eyes */}
    <circle cx="40" cy="38" r="5" fill="#1E293B"/>
    <circle cx="60" cy="38" r="5" fill="#1E293B"/>
    <circle cx="39" cy="37" r="1.5" fill="white"/>
    <circle cx="59" cy="37" r="1.5" fill="white"/>
  </g>
);

// Stego: Side facing with large leaf-like dorsal plates, four stubby legs
const Stego = () => (
  <g>
    <ellipse cx="50" cy="97" rx="32" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Tail spike */}
    <path d="M78 78 Q92 72 96 60" fill="none" stroke="#3F6212" strokeWidth="10" strokeLinecap="round"/>
    <polygon points="94,58 100,50 88,52" fill="#65A30D"/>
    {/* Body */}
    <ellipse cx="48" cy="75" rx="35" ry="20" fill="#65A30D"/>
    {/* Dorsal plates */}
    <path d="M25 70 Q28 48 34 40" fill="none" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round"/>
    <path d="M38 65 Q42 40 48 30" fill="none" stroke="#FBBF24" strokeWidth="14" strokeLinecap="round"/>
    <path d="M52 65 Q56 42 62 35" fill="none" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round"/>
    <path d="M65 70 Q68 50 72 45" fill="none" stroke="#EAB308" strokeWidth="10" strokeLinecap="round"/>
    {/* Head small */}
    <ellipse cx="20" cy="72" rx="16" ry="12" fill="#65A30D"/>
    {/* Eye */}
    <circle cx="14" cy="70" r="4" fill="#1E293B"/>
    <circle cx="13" cy="69" r="1.5" fill="white"/>
    {/* Mouth */}
    <path d="M10 76 Q20 80 28 76" fill="none" stroke="#3F6212" strokeWidth="2.5"/>
    {/* Legs */}
    <rect x="28" y="88" width="10" height="10" rx="3" fill="#3F6212"/>
    <rect x="48" y="88" width="10" height="10" rx="3" fill="#3F6212"/>
    <rect x="60" y="88" width="10" height="10" rx="3" fill="#3F6212"/>
  </g>
);

// Ankylo: Wide armored shell body with club tail — very low and wide
const Ankylo = () => (
  <g>
    <ellipse cx="50" cy="97" rx="35" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Club tail */}
    <path d="M78 78 Q90 70 95 60" fill="none" stroke="#92400E" strokeWidth="10" strokeLinecap="round"/>
    <circle cx="96" cy="57" r="10" fill="#78350F"/>
    {/* Armored shell */}
    <ellipse cx="48" cy="72" rx="38" ry="22" fill="#D97706"/>
    {/* Armor plates */}
    <circle cx="25" cy="65" r="10" fill="#B45309" opacity="0.6"/>
    <circle cx="45" cy="60" r="12" fill="#B45309" opacity="0.6"/>
    <circle cx="65" cy="65" r="10" fill="#B45309" opacity="0.6"/>
    <circle cx="35" cy="75" r="8" fill="#92400E" opacity="0.5"/>
    <circle cx="55" cy="75" r="8" fill="#92400E" opacity="0.5"/>
    {/* Spikes on back */}
    <polygon points="20,60 16,45 24,58" fill="#FEF3C7"/>
    <polygon points="35,55 32,38 40,54" fill="#FEF3C7"/>
    <polygon points="50,52 47,36 55,52" fill="#FEF3C7"/>
    <polygon points="65,55 63,40 70,55" fill="#FEF3C7"/>
    {/* Head */}
    <ellipse cx="14" cy="72" rx="14" ry="11" fill="#D97706"/>
    <circle cx="8" cy="70" r="4" fill="#1E293B"/>
    <circle cx="7" cy="69" r="1.5" fill="white"/>
    {/* Legs */}
    <rect x="22" y="86" width="12" height="10" rx="4" fill="#92400E"/>
    <rect x="58" y="86" width="12" height="10" rx="4" fill="#92400E"/>
  </g>
);

// Rex: Giant head, TINY arms, massive jaw with sharp teeth from front
const Rex = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Body */}
    <ellipse cx="50" cy="80" rx="20" ry="16" fill="#10B981"/>
    {/* Tiny arms sticking out — the key T-Rex feature */}
    <path d="M33 60 Q15 55 18 68" stroke="#047857" strokeWidth="8" strokeLinecap="round" fill="none"/>
    <path d="M67 60 Q85 55 82 68" stroke="#047857" strokeWidth="8" strokeLinecap="round" fill="none"/>
    {/* Little claws */}
    <path d="M18 68 L14 72 M18 68 L20 73" stroke="#047857" strokeWidth="3" strokeLinecap="round"/>
    <path d="M82 68 L86 72 M82 68 L80 73" stroke="#047857" strokeWidth="3" strokeLinecap="round"/>
    {/* Huge head */}
    <ellipse cx="50" cy="44" rx="32" ry="28" fill="#10B981"/>
    {/* Upper jaw */}
    <rect x="26" y="54" width="48" height="14" rx="4" fill="#059669"/>
    {/* Lower jaw big */}
    <rect x="24" y="64" width="52" height="20" rx="8" fill="#047857"/>
    {/* Teeth sharp */}
    <polygon points="30,64 34,56 38,64" fill="#F1F5F9"/>
    <polygon points="40,64 44,56 48,64" fill="#F1F5F9"/>
    <polygon points="52,64 56,56 60,64" fill="#F1F5F9"/>
    <polygon points="62,64 66,52 70,64" fill="#F1F5F9"/>
    {/* Eyes small and evil */}
    <circle cx="34" cy="38" r="8" fill="#FDE047"/>
    <circle cx="66" cy="38" r="8" fill="#FDE047"/>
    <ellipse cx="34" cy="38" rx="4" ry="5" fill="#0F172A"/>
    <ellipse cx="66" cy="38" rx="4" ry="5" fill="#0F172A"/>
  </g>
);

// Spino: Side profile with the dramatic sail fin on its back
const Spino = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Tail */}
    <path d="M70 82 Q90 75 95 55" fill="none" stroke="#9F1239" strokeWidth="14" strokeLinecap="round"/>
    {/* Body */}
    <ellipse cx="46" cy="76" rx="30" ry="20" fill="#E11D48"/>
    {/* THE sail fin */}
    <path d="M30 68 Q30 20 50 8 Q70 18 72 68" fill="#BE123C"/>
    <path d="M34 68 Q34 26 50 14 Q66 24 68 68" fill="#F43F5E"/>
    {/* Fin stripes */}
    <line x1="40" y1="68" x2="44" y2="18" stroke="#FF7096" strokeWidth="2"/>
    <line x1="50" y1="68" x2="52" y2="12" stroke="#FF7096" strokeWidth="2"/>
    <line x1="60" y1="68" x2="58" y2="18" stroke="#FF7096" strokeWidth="2"/>
    {/* Head */}
    <ellipse cx="22" cy="64" rx="22" ry="16" fill="#E11D48"/>
    {/* Long snout */}
    <ellipse cx="8" cy="68" rx="14" ry="7" fill="#BE123C"/>
    {/* Teeth */}
    <polygon points="4,66 8,60 12,66" fill="#FFF"/>
    <polygon points="14,66 18,60 22,66" fill="#FFF"/>
    {/* Eye */}
    <circle cx="18" cy="60" r="5" fill="#FDE047"/>
    <circle cx="18" cy="60" r="2.5" fill="#0F172A"/>
    {/* Legs stubby */}
    <rect x="38" y="88" width="12" height="10" rx="4" fill="#9F1239"/>
    <rect x="56" y="88" width="12" height="10" rx="4" fill="#9F1239"/>
  </g>
);

// Griffin: Lion body, eagle head and wings
const Griffin = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Lion hind body */}
    <ellipse cx="60" cy="78" rx="30" ry="18" fill="#D97706"/>
    {/* Lion tail */}
    <path d="M88 70 Q100 55 94 38" fill="none" stroke="#D97706" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="93" cy="35" r="9" fill="#92400E"/>
    {/* Eagle wings */}
    <path d="M50 48 Q18 28 5 50 Q22 68 50 60 Z" fill="#451A03"/>
    <path d="M50 48 Q82 28 95 50 Q78 68 50 60 Z" fill="#451A03"/>
    {/* Eagle white head */}
    <circle cx="35" cy="36" r="22" fill="#FFFFFF"/>
    {/* Hooked beak */}
    <path d="M20,48 L48,48 L34,72 Z" fill="#F59E0B"/>
    <path d="M22,48 L46,48 L34,62 Z" fill="#D97706"/>
    {/* Fierce eagle eye */}
    <circle cx="28" cy="34" r="7" fill="#1E293B"/>
    <circle cx="26" cy="32" r="2.5" fill="#FBBF24"/>
  </g>
);

// Dragon: Scales, horns, wings, fire breath — the full deal
const Dragon = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Wings */}
    <path d="M35 42 Q8 12 2 38 Q18 55 38 50 Z" fill="#047857"/>
    <path d="M65 42 Q92 12 98 38 Q82 55 62 50 Z" fill="#047857"/>
    <path d="M35 42 Q10 18 6 38 Q20 50 38 48 Z" fill="#10B981"/>
    <path d="M65 42 Q90 18 94 38 Q80 50 62 48 Z" fill="#10B981"/>
    {/* Body scaled */}
    <ellipse cx="50" cy="76" rx="22" ry="18" fill="#047857"/>
    <path d="M38 70 Q50 68 62 70 Q50 80 38 70 Z" fill="#10B981"/>
    {/* Horns */}
    <polygon points="36,18 30,0 42,14" fill="#064E3B"/>
    <polygon points="64,18 70,0 58,14" fill="#064E3B"/>
    {/* Head */}
    <ellipse cx="50" cy="38" rx="28" ry="24" fill="#059669"/>
    {/* Scales texture head */}
    <path d="M38 32 Q50 28 62 32 Q50 38 38 32 Z" fill="#34D399"/>
    {/* Jaw */}
    <ellipse cx="50" cy="52" rx="20" ry="10" fill="#047857"/>
    {/* Fire! */}
    <path d="M40 60 Q50 72 60 60 Q50 85 40 60 Z" fill="#FDE047"/>
    <path d="M43 62 Q50 72 57 62 Q50 80 43 62 Z" fill="#EA580C"/>
    {/* Eyes glow */}
    <circle cx="38" cy="32" r="6" fill="#FDE047"/>
    <circle cx="62" cy="32" r="6" fill="#FDE047"/>
    <ellipse cx="38" cy="32" rx="3" ry="4" fill="#0F172A"/>
    <ellipse cx="62" cy="32" rx="3" ry="4" fill="#0F172A"/>
  </g>
);

// Phoenix: Radiant bird made of fire, long elegant tail feathers
const Phoenix = () => (
  <g>
    <ellipse cx="50" cy="97" rx="25" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Long fiery tail streams */}
    <path d="M35 70 Q20 90 10 100" stroke="#FDE047" strokeWidth="6" strokeLinecap="round" fill="none"/>
    <path d="M40 72 Q25 92 15 100" stroke="#F97316" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <path d="M50 75 Q50 90 50 100" stroke="#EA580C" strokeWidth="7" strokeLinecap="round" fill="none"/>
    <path d="M60 72 Q75 92 85 100" stroke="#F97316" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <path d="M65 70 Q80 90 90 100" stroke="#FDE047" strokeWidth="6" strokeLinecap="round" fill="none"/>
    {/* Wings of fire */}
    <path d="M50 50 Q18 25 5 50 Q25 58 50 55 Z" fill="#F97316"/>
    <path d="M50 50 Q82 25 95 50 Q75 58 50 55 Z" fill="#F97316"/>
    <path d="M50 50 Q22 30 8 50 Q26 54 50 52 Z" fill="#FDE047"/>
    <path d="M50 50 Q78 30 92 50 Q74 54 50 52 Z" fill="#FDE047"/>
    {/* Body glowing */}
    <ellipse cx="50" cy="58" rx="16" ry="18" fill="#EA580C"/>
    {/* Crest on head */}
    <path d="M38 30 Q42 10 50 5 Q58 10 62 30" fill="#FDE047"/>
    {/* Head */}
    <circle cx="50" cy="36" r="18" fill="#F97316"/>
    {/* Sharp beak */}
    <polygon points="40,46 60,46 50,65" fill="#FDE047"/>
    {/* Phoenix eyes */}
    <circle cx="40" cy="34" r="5" fill="#FDE047"/>
    <circle cx="60" cy="34" r="5" fill="#FDE047"/>
    <circle cx="40" cy="34" r="2.5" fill="#000"/>
    <circle cx="60" cy="34" r="2.5" fill="#000"/>
  </g>
);

// ─── 🤖 TECH ─────────────────────────────────────────────────────────────────

// Sparkbot: Classic cute floating robot with round viewport eyes and antenna
const Sparkbot = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Antenna */}
    <line x1="50" y1="10" x2="50" y2="28" stroke="#64748B" strokeWidth="4"/>
    <circle cx="50" cy="8" r="6" fill="#38BDF8"/>
    {/* Head/body box */}
    <rect x="18" y="28" width="64" height="50" rx="14" fill="#E2E8F0"/>
    {/* Screen face */}
    <rect x="26" y="35" width="48" height="34" rx="8" fill="#0F172A"/>
    {/* Big round eyes */}
    <circle cx="38" cy="50" r="10" fill="#38BDF8"/>
    <circle cx="62" cy="50" r="10" fill="#38BDF8"/>
    <circle cx="38" cy="50" r="5" fill="#0F172A"/>
    <circle cx="62" cy="50" r="5" fill="#0F172A"/>
    <circle cx="36" cy="48" r="2" fill="white"/>
    <circle cx="60" cy="48" r="2" fill="white"/>
    {/* Smile LED */}
    <path d="M38 63 Q50 70 62 63" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round"/>
    {/* Arms */}
    <rect x="4" y="38" width="14" height="8" rx="4" fill="#94A3B8"/>
    <rect x="82" y="38" width="14" height="8" rx="4" fill="#94A3B8"/>
    {/* Legs */}
    <rect x="28" y="78" width="16" height="18" rx="6" fill="#CBD5E1"/>
    <rect x="56" y="78" width="16" height="18" rx="6" fill="#CBD5E1"/>
  </g>
);

// Gear: Spinning cog drone with a glowing core
const Gear = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Outer gear teeth */}
    <circle cx="50" cy="48" r="42" fill="#475569"/>
    {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
      const rad = a * Math.PI / 180;
      const x = 50 + 42 * Math.sin(rad);
      const y = 48 + 42 * Math.cos(rad);
      return <rect key={a} x={x-5} y={y-8} width="10" height="16" fill="#475569" transform={`rotate(${a} ${x} ${y})`}/>;
    })}
    {/* Inner disk */}
    <circle cx="50" cy="48" r="32" fill="#1E293B"/>
    {/* Glowing ring */}
    <circle cx="50" cy="48" r="24" fill="#334155"/>
    <circle cx="50" cy="48" r="20" fill="#0F172A"/>
    {/* Glowing core */}
    <circle cx="50" cy="48" r="12" fill="#38BDF8" opacity="0.9"/>
    <circle cx="50" cy="48" r="6" fill="#FFFFFF"/>
  </g>
);

// Astro: Cosmonaut with a big round helmet and stars around them
const Astro = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Stars */}
    <circle cx="12" cy="15" r="2" fill="#FDE047"/>
    <circle cx="88" cy="20" r="2.5" fill="#FDE047"/>
    <circle cx="20" cy="40" r="1.5" fill="#FDE047"/>
    {/* Body suit */}
    <ellipse cx="50" cy="78" rx="22" ry="18" fill="#FFFFFF"/>
    {/* Suit details */}
    <rect x="42" y="70" width="16" height="12" rx="4" fill="#38BDF8"/>
    {/* Helmet big round */}
    <circle cx="50" cy="44" r="32" fill="#E2E8F0"/>
    {/* Helmet visor dark */}
    <ellipse cx="50" cy="46" rx="22" ry="20" fill="#0F172A"/>
    {/* Reflection on visor */}
    <ellipse cx="40" cy="36" rx="8" ry="6" fill="rgba(255,255,255,0.15)"/>
    {/* Head inside visor */}
    <circle cx="50" cy="46" r="14" fill="#FCD34D"/>
    <circle cx="44" cy="44" r="3" fill="#1E293B"/>
    <circle cx="56" cy="44" r="3" fill="#1E293B"/>
    <path d="M46 50 Q50 54 54 50" fill="none" stroke="#1E293B" strokeWidth="2"/>
    {/* Flag patch */}
    <rect x="12" y="68" width="14" height="10" rx="2" fill="#EF4444"/>
    {/* Gloves */}
    <circle cx="22" cy="82" r="8" fill="#E2E8F0"/>
    <circle cx="78" cy="82" r="8" fill="#E2E8F0"/>
  </g>
);

// Zap: Lightning bolt humanoid speedster
const Zap = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Speed trail */}
    <path d="M15 55 Q5 45 20 40" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5"/>
    <path d="M10 65 Q0 58 18 55" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3"/>
    {/* Body as lightning bolt */}
    <polygon points="58,5 35,52 52,52 42,98 65,42 48,42" fill="#FDE047"/>
    <polygon points="55,10 38,50 50,50 44,90 62,44 46,44" fill="#FBBF24"/>
    {/* Bolt highlight */}
    <polygon points="56,12 44,45 52,45 48,70 60,48 50,48" fill="#FEF3C7"/>
    {/* Eyes on top */}
    <circle cx="46" cy="28" r="5" fill="#0F172A"/>
    <circle cx="58" cy="22" r="5" fill="#0F172A"/>
    <circle cx="45" cy="27" r="2" fill="white"/>
    <circle cx="57" cy="21" r="2" fill="white"/>
  </g>
);

// Mechatron: Full armored mech suit, imposing and angular
const Mechatron = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Legs */}
    <rect x="24" y="78" width="20" height="20" rx="4" fill="#1E1B4B"/>
    <rect x="56" y="78" width="20" height="20" rx="4" fill="#1E1B4B"/>
    {/* Body */}
    <rect x="18" y="42" width="64" height="40" rx="8" fill="#4F46E5"/>
    {/* Chest core */}
    <ellipse cx="50" cy="60" rx="14" ry="12" fill="#1E1B4B"/>
    <circle cx="50" cy="60" r="8" fill="#10B981" className="pet-pulse"/>
    {/* Shoulder pads */}
    <rect x="5" y="38" width="18" height="22" rx="6" fill="#312E81"/>
    <rect x="77" y="38" width="18" height="22" rx="6" fill="#312E81"/>
    {/* Arms */}
    <rect x="5" y="56" width="18" height="24" rx="4" fill="#1E1B4B"/>
    <rect x="77" y="56" width="18" height="24" rx="4" fill="#1E1B4B"/>
    {/* Head angular */}
    <rect x="24" y="12" width="52" height="34" rx="8" fill="#312E81"/>
    {/* Visor strip */}
    <rect x="30" y="22" width="40" height="12" rx="4" fill="#FDE047" className="pet-pulse"/>
    {/* Antenna pair */}
    <line x1="34" y1="12" x2="30" y2="0" stroke="#94A3B8" strokeWidth="3"/>
    <circle cx="30" cy="0" r="3" fill="#EF4444"/>
    <line x1="66" y1="12" x2="70" y2="0" stroke="#94A3B8" strokeWidth="3"/>
    <circle cx="70" cy="0" r="3" fill="#EF4444"/>
  </g>
);

// Plasma: Levitating energy sphere with orbiting rings
const Plasma = () => (
  <g>
    <ellipse cx="50" cy="97" rx="25" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Orbit ring 1 */}
    <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="#C084FC" strokeWidth="3" transform="rotate(30 50 50)"/>
    {/* Orbit ring 2 */}
    <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="#A855F7" strokeWidth="2" transform="rotate(-30 50 50)"/>
    {/* Outer glow */}
    <circle cx="50" cy="50" r="32" fill="rgba(168,85,247,0.3)"/>
    {/* Core sphere */}
    <circle cx="50" cy="50" r="22" fill="#A855F7"/>
    {/* Inner bright core */}
    <circle cx="50" cy="50" r="12" fill="#E9D5FF"/>
    <circle cx="50" cy="50" r="6" fill="#FFFFFF"/>
    {/* Energy lines */}
    <line x1="50" y1="28" x2="50" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
    <line x1="28" y1="50" x2="72" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
    {/* Orbiting particle */}
    <circle cx="95" cy="50" r="5" fill="#FDE047"/>
  </g>
);

// Zenith: Sleek UFO-like hovering drone with a cockpit
const Zenith = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Landing beam */}
    <path d="M35 80 L15 100 M50 82 L50 100 M65 80 L85 100" stroke="#38BDF8" strokeWidth="3" opacity="0.5"/>
    {/* Saucer bottom */}
    <ellipse cx="50" cy="72" rx="44" ry="12" fill="#0284C7"/>
    {/* Saucer top dome */}
    <ellipse cx="50" cy="68" rx="38" ry="8" fill="#38BDF8"/>
    {/* Top dome */}
    <path d="M28 68 C28 30 72 30 72 68" fill="#E0F2FE"/>
    {/* Cockpit window inside dome */}
    <ellipse cx="50" cy="52" rx="14" ry="10" fill="#0C4A6E"/>
    {/* Pilot silhouette */}
    <circle cx="50" cy="50" r="6" fill="#FCD34D"/>
    <circle cx="46" cy="48" r="2" fill="#1E293B"/>
    <circle cx="54" cy="48" r="2" fill="#1E293B"/>
    {/* Lights around saucer edge */}
    {[0,45,90,135,180,225,270,315].map(a => {
      const rad = a * Math.PI / 180;
      return <circle key={a} cx={50 + 40*Math.cos(rad)} cy={70 + 8*Math.sin(rad)} r="3" fill="#FDE047"/>;
    })}
  </g>
);

// Titan: Massive towering robot, intimidating, industrial
const Titan = () => (
  <g>
    <ellipse cx="50" cy="97" rx="35" ry="6" fill="rgba(0,0,0,0.3)"/>
    {/* Massive legs */}
    <rect x="22" y="75" width="22" height="25" rx="4" fill="#292524"/>
    <rect x="56" y="75" width="22" height="25" rx="4" fill="#292524"/>
    {/* Body heavy */}
    <rect x="14" y="38" width="72" height="42" rx="6" fill="#44403C"/>
    {/* Chest hazard stripes */}
    <rect x="22" y="52" width="56" height="16" rx="3" fill="#1C1917"/>
    <line x1="26" y1="52" x2="36" y2="68" stroke="#FDE047" strokeWidth="4"/>
    <line x1="36" y1="52" x2="46" y2="68" stroke="#FDE047" strokeWidth="4"/>
    <line x1="46" y1="52" x2="56" y2="68" stroke="#FDE047" strokeWidth="4"/>
    <line x1="56" y1="52" x2="66" y2="68" stroke="#FDE047" strokeWidth="4"/>
    {/* Heavy shoulder cannons */}
    <rect x="0" y="28" width="18" height="30" rx="5" fill="#292524"/>
    <rect x="0" y="28" width="18" height="8" rx="3" fill="#EF4444"/>
    <rect x="82" y="28" width="18" height="30" rx="5" fill="#292524"/>
    <rect x="82" y="28" width="18" height="8" rx="3" fill="#EF4444"/>
    {/* Head boxy */}
    <rect x="22" y="6" width="56" height="36" rx="6" fill="#292524"/>
    {/* Red visor */}
    <rect x="28" y="16" width="44" height="16" rx="4" fill="#EF4444"/>
    <rect x="30" y="18" width="40" height="12" rx="3" fill="#FCA5A5"/>
    {/* Exhaust pipes */}
    <rect x="16" y="10" width="8" height="22" rx="4" fill="#1C1917"/>
    <rect x="76" y="10" width="8" height="22" rx="4" fill="#1C1917"/>
  </g>
);

// Glitch: A corrupted digital entity — pixelated, glitching
const Glitch = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Glitching body fragments */}
    <rect x="20" y="20" width="60" height="65" fill="#0F172A"/>
    <rect x="18" y="28" width="62" height="50" fill="#0F172A"/>
    {/* Corruption strips */}
    <rect x="0" y="38" width="20" height="8" fill="#10B981" opacity="0.8"/>
    <rect x="80" y="52" width="22" height="6" fill="#A855F7" opacity="0.8"/>
    <rect x="0" y="60" width="15" height="5" fill="#38BDF8" opacity="0.6"/>
    {/* Pixel eyes — asymmetric and glitchy */}
    <rect x="28" y="35" width="16" height="16" fill="#10B981"/>
    <rect x="56" y="38" width="14" height="12" fill="#EF4444"/>
    {/* Inner pupils */}
    <rect x="32" y="39" width="8" height="8" fill="#ECFDF5"/>
    <rect x="60" y="41" width="6" height="6" fill="#FFF"/>
    {/* Mouth - corrupted barcode */}
    <rect x="28" y="62" width="44" height="4" fill="#38BDF8"/>
    <rect x="32" y="58" width="4" height="12" fill="#38BDF8"/>
    <rect x="42" y="58" width="4" height="12" fill="#38BDF8"/>
    <rect x="52" y="58" width="4" height="12" fill="#38BDF8"/>
    <rect x="62" y="58" width="4" height="12" fill="#38BDF8"/>
    {/* Scan line */}
    <rect x="18" y="50" width="62" height="2" fill="rgba(56,189,248,0.3)"/>
  </g>
);

// Nova: A radiant cosmic star being
const Nova = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Outer nebula glow */}
    <circle cx="50" cy="48" r="46" fill="rgba(56,189,248,0.15)"/>
    {/* Star burst arms */}
    <polygon points="50,2 54,44 50,96 46,44" fill="#FDE047" opacity="0.9"/>
    <polygon points="2,48 44,52 98,48 44,44" fill="#FDE047" opacity="0.9"/>
    <polygon points="14,14 46,46 86,82 54,50" fill="#38BDF8" opacity="0.8"/>
    <polygon points="86,14 54,46 14,82 46,50" fill="#A78BFA" opacity="0.8"/>
    {/* Center being */}
    <circle cx="50" cy="48" r="20" fill="#0F172A"/>
    <circle cx="50" cy="48" r="14" fill="#1E1B4B"/>
    {/* Nova eyes */}
    <circle cx="43" cy="46" r="5" fill="#FDE047"/>
    <circle cx="57" cy="46" r="5" fill="#FDE047"/>
    <circle cx="43" cy="46" r="2.5" fill="#0F172A"/>
    <circle cx="57" cy="46" r="2.5" fill="#0F172A"/>
    {/* Smile */}
    <path d="M44 54 Q50 58 56 54" fill="none" stroke="#FDE047" strokeWidth="2" strokeLinecap="round"/>
  </g>
);

// ─── 📖 HEROES ───────────────────────────────────────────────────────────────

// David: Young boy in tunic, holding a sling stone
const David = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Tunic body */}
    <path d="M28 55 L22 96 L78 96 L72 55 Z" fill="#D97706"/>
    {/* Belt */}
    <rect x="25" y="72" width="50" height="7" rx="3" fill="#92400E"/>
    {/* Arm with sling */}
    <path d="M68 60 Q82 50 90 38" stroke="#FCD34D" strokeWidth="3" fill="none"/>
    <circle cx="90" cy="36" r="6" fill="#94A3B8"/>
    {/* Other arm */}
    <path d="M32 60 Q18 58 16 70" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" fill="none"/>
    {/* Head */}
    <circle cx="50" cy="36" r="22" fill="#FCD34D"/>
    {/* Hair */}
    <path d="M28 36 C28 14 72 14 72 36" fill="#B45309"/>
    {/* Eyes */}
    <circle cx="42" cy="34" r="4" fill="#1E293B"/>
    <circle cx="58" cy="34" r="4" fill="#1E293B"/>
    <circle cx="41" cy="33" r="1.5" fill="white"/>
    <circle cx="57" cy="33" r="1.5" fill="white"/>
    {/* Mouth - determined smile */}
    <path d="M44 42 Q50 47 56 42" fill="none" stroke="#92400E" strokeWidth="2"/>
  </g>
);

// Shadow: Ninja in all dark with red banda and visible bright eyes
const Shadow = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Dark ninja body */}
    <path d="M28 52 L20 96 L80 96 L72 52 Z" fill="#0F172A"/>
    {/* Crossed weapons */}
    <line x1="15" y1="30" x2="65" y2="90" stroke="#475569" strokeWidth="5" strokeLinecap="round"/>
    <line x1="85" y1="30" x2="35" y2="90" stroke="#475569" strokeWidth="5" strokeLinecap="round"/>
    {/* Gi wrap detail */}
    <path d="M28 52 L50 65 L72 52 L50 58 Z" fill="#1E293B"/>
    {/* Head - all dark */}
    <circle cx="50" cy="34" r="22" fill="#0F172A"/>
    {/* Red headband strip across */}
    <rect x="26" y="28" width="48" height="10" rx="5" fill="#DC2626"/>
    {/* Scarf covering lower face */}
    <ellipse cx="50" cy="46" rx="22" ry="10" fill="#0F172A"/>
    {/* Headband knot */}
    <rect x="68" y="24" width="14" height="8" rx="3" fill="#DC2626"/>
    {/* Eyes only visible — bright */}
    <circle cx="40" cy="36" r="5" fill="#FDE047"/>
    <circle cx="60" cy="36" r="5" fill="#FDE047"/>
    <ellipse cx="40" cy="36" rx="3" ry="4" fill="#0F172A"/>
    <ellipse cx="60" cy="36" rx="3" ry="4" fill="#0F172A"/>
    <circle cx="41" cy="35" r="1" fill="rgba(255,255,255,0.6)"/>
    <circle cx="61" cy="35" r="1" fill="rgba(255,255,255,0.6)"/>
  </g>
);

// Samson: Enormous muscular man with incredible long hair
const Samson = () => (
  <g>
    <ellipse cx="50" cy="97" rx="32" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Pillars he's pushing — ruins around him */}
    <rect x="2" y="30" width="18" height="68" rx="3" fill="#CBD5E1"/>
    <rect x="80" y="30" width="18" height="68" rx="3" fill="#CBD5E1"/>
    <rect x="0" y="25" width="22" height="8" rx="2" fill="#94A3B8"/>
    <rect x="78" y="25" width="22" height="8" rx="2" fill="#94A3B8"/>
    {/* Arms pushing out */}
    <path d="M32 58 Q16 52 16 46" stroke="#FCD34D" strokeWidth="14" strokeLinecap="round" fill="none"/>
    <path d="M68 58 Q84 52 84 46" stroke="#FCD34D" strokeWidth="14" strokeLinecap="round" fill="none"/>
    {/* Muscular body */}
    <ellipse cx="50" cy="72" rx="26" ry="24" fill="#D97706"/>
    {/* Chest definition */}
    <path d="M36 62 Q50 70 64 62" fill="none" stroke="#B45309" strokeWidth="3"/>
    {/* Long flowing hair */}
    <path d="M26 30 Q18 60 22 90" fill="#451A03" opacity="1"/>
    <path d="M74 30 Q82 60 78 90" fill="#451A03"/>
    {/* Head */}
    <circle cx="50" cy="32" r="24" fill="#FCD34D"/>
    {/* Hair on top flowing */}
    <path d="M26 32 Q38 8 62 8 Q74 8 74 32 Q62 20 50 22 Q38 20 26 32 Z" fill="#451A03"/>
    {/* Eyes — strong expression */}
    <circle cx="41" cy="30" r="4" fill="#1E293B"/>
    <circle cx="59" cy="30" r="4" fill="#1E293B"/>
    <circle cx="40" cy="29" r="1.5" fill="white"/>
    <circle cx="58" cy="29" r="1.5" fill="white"/>
    {/* Strong brow */}
    <path d="M36 24 Q42 20 48 24" fill="none" stroke="#451A03" strokeWidth="3"/>
    <path d="M52 24 Q58 20 64 24" fill="none" stroke="#451A03" strokeWidth="3"/>
  </g>
);

// Paul: Apostle with a scroll in hand and a ship motif
const Paul = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Robe body */}
    <path d="M26 52 L18 96 L82 96 L74 52 Z" fill="#166534"/>
    {/* Rope belt */}
    <path d="M26 68 Q50 74 74 68" fill="none" stroke="#92400E" strokeWidth="4"/>
    {/* Scroll in right hand */}
    <rect x="68" y="52" width="22" height="36" rx="4" fill="#FEF3C7"/>
    <rect x="66" y="48" width="26" height="8" rx="3" fill="#D97706"/>
    <rect x="66" y="80" width="26" height="8" rx="3" fill="#D97706"/>
    {/* Writing lines on scroll */}
    <line x1="72" y1="60" x2="88" y2="60" stroke="#94A3B8" strokeWidth="2"/>
    <line x1="72" y1="66" x2="88" y2="66" stroke="#94A3B8" strokeWidth="2"/>
    <line x1="72" y1="72" x2="88" y2="72" stroke="#94A3B8" strokeWidth="2"/>
    {/* Head */}
    <circle cx="44" cy="34" r="20" fill="#FCD34D"/>
    {/* Short beard */}
    <path d="M24 36 Q28 55 44 58 Q60 55 64 36" fill="#451A03"/>
    <circle cx="44" cy="34" r="18" fill="#FCD34D"/>
    {/* Bald crown with ring around */}
    <path d="M24 34 Q28 14 44 10 Q60 14 64 34" fill="#D97706"/>
    <circle cx="44" cy="34" r="14" fill="#FCD34D"/>
    {/* Eyes */}
    <circle cx="38" cy="32" r="3.5" fill="#1E293B"/>
    <circle cx="50" cy="32" r="3.5" fill="#1E293B"/>
    <circle cx="37" cy="31" r="1.5" fill="white"/>
    <circle cx="49" cy="31" r="1.5" fill="white"/>
  </g>
);

// Spartan: Full bronze armor, massive plumed helmet, spear and shield
const Spartan = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Spear */}
    <line x1="82" y1="5" x2="82" y2="96" stroke="#78350F" strokeWidth="5"/>
    <polygon points="78,5 82,0 86,5 82,18" fill="#94A3B8"/>
    {/* Shield big round on left arm */}
    <circle cx="18" cy="62" r="24" fill="#B45309"/>
    <circle cx="18" cy="62" r="18" fill="#D97706"/>
    <path d="M8,54 Q18,46 28,54 Q18,70 8,54 Z" fill="#B45309"/>
    <circle cx="18" cy="62" r="6" fill="#92400E"/>
    {/* Armored body */}
    <rect x="28" y="50" width="44" height="46" rx="4" fill="#B45309"/>
    <path d="M36 58 Q50 68 64 58 Q60 76 50 78 Q40 76 36 58 Z" fill="#D97706"/>
    {/* Greaves on legs */}
    <rect x="32" y="82" width="14" height="16" rx="3" fill="#94A3B8"/>
    <rect x="54" y="82" width="14" height="16" rx="3" fill="#94A3B8"/>
    {/* Helmet with big red plume */}
    <rect x="30" y="20" width="40" height="32" rx="8" fill="#94A3B8"/>
    {/* Face opening */}
    <rect x="36" y="30" width="28" height="16" rx="4" fill="#1E293B"/>
    {/* Plume gorgeous */}
    <path d="M40 20 Q50 0 60 20" fill="#DC2626" strokeWidth="2"/>
    <ellipse cx="50" cy="10" rx="12" ry="10" fill="#EF4444"/>
    {/* Eyes in darkness of helmet */}
    <circle cx="43" cy="37" r="3.5" fill="#FDE047"/>
    <circle cx="57" cy="37" r="3.5" fill="#FDE047"/>
  </g>
);

// Moses: Staff raised, waters parting around him dramatically
const Moses = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Parting wave LEFT */}
    <path d="M0 80 Q10 50 22 65 Q10 70 0 96 Z" fill="#38BDF8"/>
    <path d="M0 80 Q12 55 24 68 Q12 72 0 96 Z" fill="#BAE6FD"/>
    {/* Parting wave RIGHT */}
    <path d="M100 80 Q90 50 78 65 Q90 70 100 96 Z" fill="#38BDF8"/>
    <path d="M100 80 Q88 55 76 68 Q88 72 100 96 Z" fill="#BAE6FD"/>
    {/* Dry ground path between waves */}
    <ellipse cx="50" cy="90" rx="24" ry="8" fill="#D97706"/>
    {/* Robe */}
    <path d="M30 52 L25 96 L75 96 L70 52 Z" fill="#B45309"/>
    <path d="M32 52 L50 65 L68 52 L50 60 Z" fill="#FEF3C7"/>
    {/* Staff raised high */}
    <line x1="70" y1="96" x2="78" y2="5" stroke="#78350F" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="79" cy="4" r="5" fill="#FBBF24"/>
    {/* Head */}
    <circle cx="46" cy="34" r="22" fill="#D97706"/>
    {/* Big white beard */}
    <path d="M24 38 Q28 68 46 72 Q64 68 68 38" fill="#F1F5F9"/>
    <circle cx="46" cy="34" r="20" fill="#D97706"/>
    {/* White hair and beard visible */}
    <path d="M26 34 C26 10 66 10 66 34" fill="#E2E8F0"/>
    <circle cx="46" cy="34" r="16" fill="#D97706"/>
    {/* Eyes intense */}
    <circle cx="39" cy="32" r="4" fill="#1E293B"/>
    <circle cx="53" cy="32" r="4" fill="#1E293B"/>
    <circle cx="38" cy="31" r="1.5" fill="white"/>
    <circle cx="52" cy="31" r="1.5" fill="white"/>
  </g>
);

// Abraham: Elderly patriarch, looking up at a star-filled sky
const Abraham = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Stars in the sky he's looking at */}
    <circle cx="12" cy="8" r="3" fill="#FDE047" className="pet-pulse"/>
    <circle cx="30" cy="4" r="2" fill="#FDE047" className="pet-pulse"/>
    <circle cx="55" cy="6" r="2.5" fill="#FDE047" className="pet-pulse"/>
    <circle cx="75" cy="12" r="2" fill="#FDE047" className="pet-pulse"/>
    <circle cx="88" cy="5" r="3" fill="#FDE047" className="pet-pulse"/>
    <circle cx="20" cy="20" r="1.5" fill="#FDE047"/>
    <circle cx="70" cy="18" r="1.5" fill="#FDE047"/>
    {/* Flowing robe */}
    <path d="M26 55 L16 96 L84 96 L74 55 Z" fill="#475569"/>
    {/* Staff */}
    <line x1="22" y1="96" x2="26" y2="40" stroke="#78350F" strokeWidth="6" strokeLinecap="round"/>
    {/* Arm raised pointing to stars */}
    <path d="M64 52 Q78 38 84 22" stroke="#D97706" strokeWidth="10" strokeLinecap="round" fill="none"/>
    <circle cx="84" cy="20" r="6" fill="#D97706"/>
    {/* Head tilted slightly */}
    <circle cx="50" cy="38" r="22" fill="#D97706"/>
    {/* White beard full */}
    <path d="M28 40 Q32 68 50 72 Q68 68 72 40" fill="#F1F5F9"/>
    <circle cx="50" cy="38" r="20" fill="#D97706"/>
    {/* White hair */}
    <path d="M30 38 C30 16 70 16 70 38" fill="#E2E8F0"/>
    <circle cx="50" cy="38" r="16" fill="#D97706"/>
    {/* Wise eyes looking up */}
    <circle cx="42" cy="34" r="4" fill="#1E293B"/>
    <circle cx="58" cy="34" r="4" fill="#1E293B"/>
    <circle cx="41" cy="33" r="1.5" fill="white"/>
    <circle cx="57" cy="33" r="1.5" fill="white"/>
  </g>
);

// Elijah: Prophet surrounded by dramatic fire of chariot ascending to heaven
const Elijah = () => (
  <g>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Chariot of fire - wheels */}
    <circle cx="22" cy="82" r="14" fill="#EF4444"/>
    <circle cx="22" cy="82" r="8" fill="#FDE047"/>
    <circle cx="22" cy="82" r="3" fill="#EF4444"/>
    {[0,45,90,135].map(a => {
      const rad = a*Math.PI/180;
      return <line key={a} x1={22+8*Math.cos(rad)} y1={82+8*Math.sin(rad)} x2={22+14*Math.cos(rad)} y2={82+14*Math.sin(rad)} stroke="#EF4444" strokeWidth="3"/>;
    })}
    <circle cx="78" cy="82" r="14" fill="#EF4444"/>
    <circle cx="78" cy="82" r="8" fill="#FDE047"/>
    <circle cx="78" cy="82" r="3" fill="#EF4444"/>
    {[0,45,90,135].map(a => {
      const rad = a*Math.PI/180;
      return <line key={a} x1={78+8*Math.cos(rad)} y1={82+8*Math.sin(rad)} x2={78+14*Math.cos(rad)} y2={82+14*Math.sin(rad)} stroke="#EF4444" strokeWidth="3"/>;
    })}
    {/* Chariot platform */}
    <rect x="28" y="66" width="44" height="18" rx="4" fill="#D97706"/>
    {/* Fire rising */}
    <path d="M20 66 Q15 45 22 30" stroke="#F97316" strokeWidth="10" strokeLinecap="round" fill="none"/>
    <path d="M80 66 Q85 45 78 30" stroke="#F97316" strokeWidth="10" strokeLinecap="round" fill="none"/>
    <path d="M35 66 Q30 50 38 35" stroke="#FDE047" strokeWidth="6" strokeLinecap="round" fill="none"/>
    <path d="M65 66 Q70 50 62 35" stroke="#FDE047" strokeWidth="6" strokeLinecap="round" fill="none"/>
    {/* Robe on chariot */}
    <path d="M36 48 L34 68 L66 68 L64 48 Z" fill="#B45309"/>
    {/* Head */}
    <circle cx="50" cy="36" r="18" fill="#D97706"/>
    {/* Beard white prophet style */}
    <path d="M32 38 Q36 56 50 60 Q64 56 68 38" fill="#F1F5F9"/>
    <circle cx="50" cy="36" r="16" fill="#D97706"/>
    <path d="M34 36 C34 18 66 18 66 36" fill="#E2E8F0"/>
    <circle cx="50" cy="36" r="13" fill="#D97706"/>
    <circle cx="44" cy="34" r="3.5" fill="#1E293B"/>
    <circle cx="56" cy="34" r="3.5" fill="#1E293B"/>
  </g>
);

// Guardian: Golden divine paladin in resplendent armor
const Guardian = () => (
  <g>
    <ellipse cx="50" cy="97" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Golden aura glow */}
    <circle cx="50" cy="48" r="46" fill="rgba(253,224,71,0.15)"/>
    {/* Legs armored */}
    <rect x="28" y="78" width="18" height="20" rx="4" fill="#FBBF24"/>
    <rect x="54" y="78" width="18" height="20" rx="4" fill="#FBBF24"/>
    {/* Body magnificent */}
    <rect x="20" y="48" width="60" height="34" rx="6" fill="#FCD34D"/>
    {/* Breastplate */}
    <path d="M28 50 Q50 62 72 50 Q68 76 50 80 Q32 76 28 50 Z" fill="#FBBF24"/>
    {/* Cross emblem on chest */}
    <rect x="46" y="56" width="8" height="20" rx="2" fill="#FFFFFF"/>
    <rect x="38" y="62" width="24" height="8" rx="2" fill="#FFFFFF"/>
    {/* Cape wings out */}
    <path d="M20 52 Q2 40 5 22 Q16 44 22 52 Z" fill="#DC2626"/>
    <path d="M80 52 Q98 40 95 22 Q84 44 78 52 Z" fill="#DC2626"/>
    {/* Shoulders pauldrons */}
    <ellipse cx="18" cy="52" rx="12" ry="8" fill="#F59E0B"/>
    <ellipse cx="82" cy="52" rx="12" ry="8" fill="#F59E0B"/>
    {/* Sword raised */}
    <line x1="88" y1="10" x2="80" y2="66" stroke="#E2E8F0" strokeWidth="5"/>
    <rect x="76" y="36" width="18" height="5" rx="2" fill="#FBBF24"/>
    {/* Helmet magnificent */}
    <rect x="28" y="14" width="44" height="36" rx="10" fill="#FCD34D"/>
    {/* Cross visor */}
    <rect x="34" y="26" width="32" height="6" rx="3" fill="#FEF3C7"/>
    <rect x="46" y="16" width="8" height="22" rx="3" fill="#FEF3C7"/>
    {/* Bright eyes */}
    <circle cx="41" cy="29" r="3" fill="#38BDF8"/>
    <circle cx="59" cy="29" r="3" fill="#38BDF8"/>
  </g>
);

// Jesus: The Good Shepherd — gentle, radiant halo, holding a staff and lamb
const Jesus = () => (
  <g>
    {/* Divine radiant halo glow */}
    <circle cx="50" cy="30" r="48" fill="rgba(253,224,71,0.12)"/>
    <ellipse cx="50" cy="97" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* White robe body */}
    <path d="M26 52 L18 96 L82 96 L74 52 Z" fill="#FFFFFF"/>
    {/* Blue sash */}
    <path d="M28 60 Q50 70 72 60 Q70 76 50 78 Q30 76 28 60 Z" fill="#DBEAFE"/>
    {/* Shepherd's staff curved */}
    <path d="M74 96 Q76 60 70 24 Q68 18 64 20 Q60 22 64 26" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none"/>
    {/* Little lamb on left arm */}
    <circle cx="25" cy="62" r="12" fill="#F1F5F9"/>
    <circle cx="18" cy="56" r="7" fill="#F1F5F9"/>
    <circle cx="30" cy="55" r="5" fill="#F1F5F9"/>
    {/* Lamb face */}
    <circle cx="13" cy="54" r="3" fill="#E2E8F0"/>
    <circle cx="12" cy="53" r="1" fill="#1E293B"/>
    {/* Arm cradling lamb */}
    <path d="M32 56 Q28 50 26 58" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" fill="none"/>
    {/* Head with halo ring */}
    <circle cx="50" cy="32" r="26" fill="rgba(253,224,71,0.4)"/>
    <circle cx="50" cy="32" r="22" fill="#FCD34D"/>
    {/* Brown hair middle parted flowing */}
    <path d="M28 32 Q34 8 50 6 Q66 8 72 32 Q62 20 50 22 Q38 20 28 32 Z" fill="#78350F"/>
    <path d="M28 42 Q26 56 28 64" fill="#78350F"/>
    <path d="M72 42 Q74 56 72 64" fill="#78350F"/>
    <circle cx="50" cy="32" r="18" fill="#FCD34D"/>
    {/* Eyes — warm and compassionate */}
    <circle cx="42" cy="30" r="4.5" fill="#451A03"/>
    <circle cx="58" cy="30" r="4.5" fill="#451A03"/>
    <circle cx="40" cy="28" r="1.5" fill="rgba(255,255,255,0.8)"/>
    <circle cx="56" cy="28" r="1.5" fill="rgba(255,255,255,0.8)"/>
    {/* Gentle warm smile */}
    <path d="M44 38 Q50 44 56 38" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Short beard */}
    <path d="M36 40 Q40 52 50 54 Q60 52 64 40" fill="#78350F"/>
    <circle cx="50" cy="38" r="12" fill="#FCD34D"/>
    <circle cx="42" cy="36" r="4.5" fill="#451A03"/>
    <circle cx="58" cy="36" r="4.5" fill="#451A03"/>
    <circle cx="40" cy="34" r="1.5" fill="rgba(255,255,255,0.8)"/>
    <circle cx="56" cy="34" r="1.5" fill="rgba(255,255,255,0.8)"/>
    <path d="M44 42 Q50 47 56 42" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
  </g>
);

// ─── MAP ALL 40 ─────────────────────────────────────────────────────────────
const PET_MAP = {
  pup: Pup, kitty: Kitty, bunny: Bunny, fox: Fox, bear: Bear,
  wolf: Wolf, lion: Lion, eagle: Eagle, panther: Panther, panda: Panda,
  trike: Trike, raptor: Raptor, ptero: Ptero, stego: Stego, ankylo: Ankylo,
  rex: Rex, spino: Spino, griffin: Griffin, dragon: Dragon, phoenix: Phoenix,
  sparkbot: Sparkbot, gear: Gear, astro: Astro, zap: Zap, mechatron: Mechatron,
  plasma: Plasma, zenith: Zenith, titan: Titan, glitch: Glitch, nova: Nova,
  david: David, shadow: Shadow, samson: Samson, paul: Paul, spartan: Spartan,
  moses: Moses, abraham: Abraham, elijah: Elijah, guardian: Guardian, jesus: Jesus,
};

const RARITY_GLOW = {
  common:    null,
  rare:      'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
  epic:      'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
  legendary: 'radial-gradient(circle, rgba(250,204,21,0.45) 0%, transparent 70%)',
};

export default function CharacterDisplay({ characterData, size = 90, animated = true }) {
  const petId = characterData?.petId || null;
  if (!petId) return null;

  const petDef  = PETS.find(p => p.id === petId);
  const PetComp = PET_MAP[petId];
  if (!PetComp) return null;

  const animClass = animated ? (BEHAVIOR_CLASS[petDef?.behavior] || 'pet-bounce') : '';
  const glow = petDef ? RARITY_GLOW[petDef.rarity] : null;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      {glow && animated && (
        <div style={{
          position: 'absolute', inset: '-20%', borderRadius: '50%',
          background: glow, zIndex: 0, pointerEvents: 'none',
          animation: 'aura-pulse 3s ease-in-out infinite',
        }}/>
      )}
      <div className={animClass} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        <svg
          viewBox="0 0 100 100"
          width={size} height={size}
          style={{ display: 'block', overflow: 'visible' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <PetComp/>
        </svg>
      </div>
    </div>
  );
}
