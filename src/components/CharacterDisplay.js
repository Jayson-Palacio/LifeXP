'use client';
import { PETS, RARITY_COLORS } from '../lib/character';

// ─── BEHAVIORS ──────────────────────────────────────────────────────────────
const BEHAVIOR_CLASS = {
  bounce: 'pet-bounce', sway: 'pet-sway', hop: 'pet-hop', wobble: 'pet-wobble',
  strut: 'pet-sway', waddle: 'pet-wobble', flap: 'pet-float', float: 'pet-float',
  flip: 'pet-flip', stomp: 'pet-bounce', guard: 'pet-pulse', pulse: 'pet-pulse',
  howl: 'pet-sway'
};

// ─── ANIMALS (10) ───────────────────────────────────────────────────────────
const Pup = () => (
  <g>
    <path d="M25 45 Q10 70 20 80 Z" fill="#92400E"/>
    <path d="M75 45 Q90 70 80 80 Z" fill="#92400E"/>
    <circle cx="50" cy="50" r="30" fill="#D97706"/>
    <ellipse cx="50" cy="60" rx="15" ry="12" fill="#FEF3C7"/>
    <ellipse cx="40" cy="45" rx="4" ry="5" fill="#000"/>
    <ellipse cx="60" cy="45" rx="4" ry="5" fill="#000"/>
    <ellipse cx="50" cy="55" rx="6" ry="4" fill="#000"/>
    <path d="M47 62 Q50 72 53 62 Z" fill="#EF4444"/>
    <path d="M50 20 Q60 30 50 40 Z" fill="#FEF3C7"/>
  </g>
);
const Kitty = () => (
  <g>
    <polygon points="20,15 25,40 45,30" fill="#1E293B"/>
    <polygon points="23,20 28,35 38,28" fill="#F472B6"/>
    <polygon points="80,15 75,40 55,30" fill="#1E293B"/>
    <polygon points="77,20 72,35 62,28" fill="#F472B6"/>
    <circle cx="50" cy="55" r="32" fill="#334155"/>
    <ellipse cx="38" cy="50" rx="6" ry="8" fill="#A7F3D0"/>
    <ellipse cx="62" cy="50" rx="6" ry="8" fill="#A7F3D0"/>
    <circle cx="38" cy="50" r="2" fill="#000"/><circle cx="62" cy="50" r="2" fill="#000"/>
    <circle cx="50" cy="60" r="3" fill="#F472B6"/>
    <path d="M30 60 Q15 65 5 55 M70 60 Q85 65 95 55" stroke="#94A3B8" strokeWidth="2" fill="none"/>
  </g>
);
const Bunny = () => (
  <g>
    <path d="M35 10 Q20 -10 30 40 Z" fill="#E2E8F0"/>
    <path d="M34 15 Q28 0 32 35 Z" fill="#F472B6"/>
    <path d="M65 10 Q80 -10 70 40 Z" fill="#E2E8F0"/>
    <path d="M66 15 Q72 0 68 35 Z" fill="#F472B6"/>
    <ellipse cx="50" cy="65" rx="35" ry="30" fill="#FFFFFF"/>
    <circle cx="40" cy="55" r="4" fill="#000"/><circle cx="60" cy="55" r="4" fill="#000"/>
    <circle cx="50" cy="62" r="3" fill="#F472B6"/>
    <path d="M45 68 Q50 72 55 68" stroke="#000" strokeWidth="2" fill="none"/>
  </g>
);
const Fox = () => (
  <g>
    <polygon points="10,20 40,40 25,60" fill="#C2410C"/>
    <polygon points="15,25 35,40 22,50" fill="#FEF3C7"/>
    <polygon points="90,20 60,40 75,60" fill="#C2410C"/>
    <polygon points="85,25 65,40 78,50" fill="#FEF3C7"/>
    <path d="M20 50 Q50 90 80 50 Z" fill="#EA580C"/>
    <path d="M35 50 Q50 70 65 50 Z" fill="#FEF3C7"/>
    <circle cx="40" cy="50" r="4" fill="#000"/><circle cx="60" cy="50" r="4" fill="#000"/>
    <circle cx="50" cy="72" r="4" fill="#000"/>
  </g>
);
const Bear = () => (
  <g>
    <circle cx="25" cy="35" r="14" fill="#78350F"/>
    <circle cx="25" cy="35" r="6" fill="#D97706"/>
    <circle cx="75" cy="35" r="14" fill="#78350F"/>
    <circle cx="75" cy="35" r="6" fill="#D97706"/>
    <circle cx="50" cy="60" r="35" fill="#92400E"/>
    <ellipse cx="50" cy="70" rx="15" ry="12" fill="#D97706"/>
    <circle cx="40" cy="55" r="4" fill="#000"/><circle cx="60" cy="55" r="4" fill="#000"/>
    <ellipse cx="50" cy="65" rx="6" ry="4" fill="#000"/>
  </g>
);
const Wolf = () => (
  <g>
    <polygon points="20,20 45,45 25,65" fill="#334155"/>
    <polygon points="80,20 55,45 75,65" fill="#334155"/>
    <path d="M20 50 L50 85 L80 50 Z" fill="#475569"/>
    <path d="M35 50 L50 65 L65 50 Z" fill="#E2E8F0"/>
    <path d="M40 85 L50 95 L60 85 Z" fill="#0F172A"/>
    <circle cx="40" cy="55" r="3" fill="#000"/><circle cx="60" cy="55" r="3" fill="#000"/>
    <rect x="35" y="47" width="12" height="3" fill="#38BDF8" transform="rotate(15 35 47)"/>
    <rect x="55" y="47" width="12" height="3" fill="#38BDF8" transform="rotate(-15 65 47)"/>
  </g>
);
const Lion = () => (
  <g>
    <path d="M10 50 Q20 20 50 10 Q80 20 90 50 Q80 80 50 90 Q20 80 10 50 Z" fill="#B45309"/>
    <circle cx="50" cy="50" r="32" fill="#F59E0B"/>
    <ellipse cx="50" cy="60" rx="15" ry="10" fill="#FEF3C7"/>
    <circle cx="40" cy="48" r="4" fill="#000"/><circle cx="60" cy="48" r="4" fill="#000"/>
    <ellipse cx="50" cy="56" rx="5" ry="3" fill="#000"/>
  </g>
);
const Eagle = () => (
  <g>
    <path d="M15 50 Q5 20 85 50 Z" fill="#451A03"/>
    <path d="M85 50 Q95 20 15 50 Z" fill="#451A03"/>
    <circle cx="50" cy="45" r="25" fill="#FFFFFF"/>
    <polygon points="40,50 60,50 50,75" fill="#F59E0B"/>
    <circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/>
    <path d="M40 30 Q50 10 60 30 Z" fill="#FFFFFF"/>
  </g>
);
const Panther = () => (
  <g>
    <polygon points="20,20 45,45 25,65" fill="#0F172A"/>
    <polygon points="80,20 55,45 75,65" fill="#0F172A"/>
    <circle cx="50" cy="60" r="32" fill="#0F172A"/>
    <ellipse cx="40" cy="55" rx="6" ry="8" fill="#FDE047"/>
    <ellipse cx="60" cy="55" rx="6" ry="8" fill="#FDE047"/>
    <circle cx="40" cy="55" r="2" fill="#000"/><circle cx="60" cy="55" r="2" fill="#000"/>
    <ellipse cx="50" cy="65" rx="3" ry="2" fill="#334155"/>
  </g>
);
const Panda = () => (
  <g>
    <circle cx="25" cy="30" r="14" fill="#0F172A"/>
    <circle cx="75" cy="30" r="14" fill="#0F172A"/>
    <circle cx="50" cy="60" r="35" fill="#FFFFFF"/>
    <ellipse cx="38" cy="55" rx="10" ry="12" fill="#0F172A" transform="rotate(-20 38 55)"/>
    <ellipse cx="62" cy="55" rx="10" ry="12" fill="#0F172A" transform="rotate(20 62 55)"/>
    <circle cx="38" cy="55" r="3" fill="#FFF"/><circle cx="62" cy="55" r="3" fill="#FFF"/>
    <ellipse cx="50" cy="65" rx="5" ry="3" fill="#000"/>
  </g>
);

// ─── DINOS & MYTHIC (10) ────────────────────────────────────────────────────
const Trike = () => (
  <g>
    <path d="M10 30 Q50 0 90 30 Q50 50 10 30" fill="#D97706"/>
    <circle cx="50" cy="55" r="30" fill="#FCD34D"/>
    <polygon points="35,20 30,0 45,35" fill="#FFF"/><polygon points="65,20 70,0 55,35" fill="#FFF"/>
    <polygon points="50,40 45,20 55,20" fill="#FFF"/>
    <circle cx="38" cy="48" r="4" fill="#000"/><circle cx="62" cy="48" r="4" fill="#000"/>
    <path d="M40 65 Q50 75 60 65" fill="none" stroke="#D97706" strokeWidth="4"/>
  </g>
);
const Raptor = () => (
  <g>
    <rect x="25" y="40" width="50" height="25" rx="10" fill="#0F766E"/>
    <ellipse cx="60" cy="40" rx="30" ry="20" fill="#14B8A6"/>
    <circle cx="70" cy="35" r="4" fill="#000"/>
    <path d="M80 40 L95 40 L85 50 Z" fill="#14B8A6"/>
    <rect x="40" y="25" width="40" height="6" fill="#CCFBF1"/>
  </g>
);
const Ptero = () => (
  <g>
    <polygon points="50,60 10,20 50,40" fill="#6366F1"/>
    <polygon points="50,60 90,20 50,40" fill="#6366F1"/>
    <path d="M40 45 L50 10 L60 45 Z" fill="#818CF8"/>
    <polygon points="30,40 70,40 50,85" fill="#FDE047"/>
    <circle cx="45" cy="40" r="3" fill="#000"/><circle cx="55" cy="40" r="3" fill="#000"/>
  </g>
);
const Stego = () => (
  <g>
    <polygon points="25,40 40,5 50,40" fill="#F59E0B"/>
    <polygon points="50,40 65,0 75,40" fill="#F59E0B"/>
    <polygon points="75,45 85,15 95,45" fill="#F59E0B"/>
    <ellipse cx="50" cy="65" rx="40" ry="25" fill="#65A30D"/>
    <ellipse cx="30" cy="60" rx="12" ry="10" fill="#65A30D"/>
    <circle cx="25" cy="58" r="3" fill="#000"/>
    <ellipse cx="75" cy="65" rx="15" ry="5" fill="#65A30D"/>
  </g>
);
const Ankylo = () => (
  <g>
    <circle cx="20" cy="35" r="10" fill="#92400E"/>
    <circle cx="50" cy="25" r="12" fill="#92400E"/>
    <circle cx="80" cy="35" r="10" fill="#92400E"/>
    <path d="M10 70 C10 30 90 30 90 70 Z" fill="#D97706"/>
    <ellipse cx="30" cy="65" rx="15" ry="10" fill="#D97706"/>
    <circle cx="25" cy="63" r="3" fill="#000"/>
    <circle cx="85" cy="65" r="12" fill="#D97706"/>
  </g>
);
const Rex = () => (
  <g>
    <rect x="25" y="25" width="50" height="60" rx="15" fill="#10B981"/>
    <path d="M25 45 L50 45 L75 45" stroke="#047857" strokeWidth="6"/>
    <rect x="50" y="50" width="35" height="25" rx="10" fill="#10B981"/>
    <circle cx="70" cy="60" r="4" fill="#000"/>
    <polygon points="60,65 65,75 70,65" fill="#FFF"/><polygon points="70,65 75,75 80,65" fill="#FFF"/>
  </g>
);
const Spino = () => (
  <g>
    <path d="M30 65 C45 10 65 10 80 65 Z" fill="#BE123C"/>
    <ellipse cx="50" cy="70" rx="40" ry="20" fill="#E11D48"/>
    <ellipse cx="30" cy="65" rx="15" ry="10" fill="#E11D48"/>
    <circle cx="25" cy="63" r="3" fill="#000"/>
  </g>
);
const Griffin = () => (
  <g>
    <path d="M20 70 C0 40 80 40 80 70 Z" fill="#E11D48"/>
    <path d="M80 70 C100 40 20 40 20 70 Z" fill="#E11D48"/>
    <circle cx="50" cy="50" r="30" fill="#FFFFFF"/>
    <polygon points="40,55 60,55 50,85" fill="#F59E0B"/>
    <circle cx="40" cy="48" r="4" fill="#000"/><circle cx="60" cy="48" r="4" fill="#000"/>
    <path d="M40 35 Q50 15 60 35 Z" fill="#FFFFFF"/>
  </g>
);
const Dragon = () => (
  <g>
    <polygon points="40,30 20,5 50,20" fill="#047857"/><polygon points="60,30 80,5 50,20" fill="#047857"/>
    <circle cx="50" cy="45" r="28" fill="#10B981"/>
    <circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/>
    <rect x="35" y="55" width="30" height="20" rx="8" fill="#FDE047"/>
    <path d="M45 65 Q50 75 55 65" fill="none" stroke="#D97706" strokeWidth="3"/>
    <path d="M10 70 L25 50 L35 60 Z" fill="#10B981"/><path d="M90 70 L75 50 L65 60 Z" fill="#10B981"/>
  </g>
);
const Phoenix = () => (
  <g>
    <path d="M50 30 Q10 -20 50 -30 Q90 -20 50 30 Z" fill="#FDE047"/>
    <path d="M40 70 Q10 20 5 80 Z" fill="#F97316"/><path d="M60 70 Q90 20 95 80 Z" fill="#F97316"/>
    <circle cx="50" cy="55" r="25" fill="#FDE047"/>
    <polygon points="40,55 60,55 50,80" fill="#EA580C"/>
    <circle cx="42" cy="50" r="4" fill="#000"/><circle cx="58" cy="50" r="4" fill="#000"/>
  </g>
);

// ─── TECH & SCI-FI (10) ─────────────────────────────────────────────────────
const Sparkbot = () => (
  <g>
    <rect x="45" y="5" width="10" height="20" fill="#64748B"/>
    <circle cx="50" cy="5" r="6" fill="#38BDF8"/>
    <rect x="20" y="25" width="60" height="50" rx="10" fill="#E2E8F0"/>
    <rect x="30" y="35" width="40" height="25" rx="5" fill="#0F172A"/>
    <circle cx="40" cy="47" r="6" fill="#38BDF8"/><circle cx="60" cy="47" r="6" fill="#38BDF8"/>
    <path d="M40 85 L60 85 L50 98 Z" fill="#38BDF8"/>
  </g>
);
const Gear = () => (
  <g className="pet-spin" transform="translate(50,50)">
    <circle cx="0" cy="0" r="40" fill="#64748B"/>
    {[0,60,120,180,240,300].map(a => <rect key={a} x="-10" y="-55" width="20" height="20" fill="#64748B" transform={`rotate(${a} 0 0)`}/>)}
    <circle cx="0" cy="0" r="25" fill="#0F172A"/>
    <circle cx="0" cy="0" r="10" fill="#38BDF8" className="pet-pulse"/>
  </g>
);
const Astro = () => (
  <g>
    <circle cx="50" cy="45" r="35" fill="#FFFFFF"/>
    <rect x="25" y="30" width="50" height="25" rx="12" fill="#1E293B"/>
    <circle cx="40" cy="42" r="3" fill="#FFF"/><circle cx="60" cy="42" r="3" fill="#FFF"/>
    <rect x="35" y="80" width="30" height="15" rx="5" fill="#38BDF8"/>
    <circle cx="50" cy="10" r="5" fill="#EF4444"/>
  </g>
);
const Zap = () => (
  <g>
    <polygon points="50,10 20,50 55,45 45,95 80,40 45,45" fill="#FDE047"/>
    <circle cx="45" cy="45" r="4" fill="#000"/><circle cx="55" cy="45" r="4" fill="#000"/>
    <rect x="30" y="85" width="40" height="10" rx="5" fill="#0F172A"/>
  </g>
);
const Mechatron = () => (
  <g>
    <rect x="15" y="25" width="70" height="50" rx="10" fill="#4F46E5"/>
    <rect x="25" y="35" width="50" height="20" fill="#1E1B4B"/>
    <rect x="35" y="42" width="30" height="6" fill="#10B981"/>
    <rect x="10" y="40" width="15" height="40" rx="4" fill="#1E1B4B"/><rect x="75" y="40" width="15" height="40" rx="4" fill="#1E1B4B"/>
    <circle cx="50" cy="85" r="10" fill="#FDE047"/>
  </g>
);
const Plasma = () => (
  <g>
    <circle cx="50" cy="50" r="45" fill="rgba(168,85,247,0.3)" className="pet-pulse"/>
    <circle cx="50" cy="50" r="30" fill="#A855F7"/>
    <circle cx="50" cy="50" r="15" fill="#FFFFFF"/>
    <path d="M50 0 L50 20 M50 80 L50 100 M0 50 L20 50 M80 50 L100 50" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round"/>
  </g>
);
const Zenith = () => (
  <g>
    <ellipse cx="50" cy="70" rx="45" ry="15" fill="#0F172A"/>
    <ellipse cx="50" cy="65" rx="40" ry="10" fill="#38BDF8"/>
    <path d="M25 65 C25 10 75 10 75 65 Z" fill="#E2E8F0"/>
    <circle cx="50" cy="40" r="10" fill="#EF4444"/>
    <path d="M50 85 L40 98 L60 98 Z" fill="#38BDF8"/>
  </g>
);
const Titan = () => (
  <g>
    <rect x="15" y="20" width="70" height="60" rx="5" fill="#713F12"/>
    <rect x="25" y="30" width="50" height="20" fill="#451A03"/>
    <rect x="35" y="10" width="30" height="30" rx="4" fill="#713F12"/>
    <rect x="40" y="15" width="20" height="8" fill="#FDE047"/>
    <rect x="5" y="35" width="20" height="50" rx="5" fill="#451A03"/><rect x="75" y="35" width="20" height="50" rx="5" fill="#451A03"/>
  </g>
);
const Glitch = () => (
  <g>
    <rect x="15" y="15" width="70" height="70" fill="#0F172A"/>
    <rect x="25" y="30" width="15" height="15" fill="#10B981" className="pet-pulse"/>
    <rect x="60" y="30" width="15" height="15" fill="#EF4444" className="pet-pulse"/>
    <rect x="30" y="65" width="40" height="6" fill="#38BDF8"/>
    <rect x="20" y="55" width="10" height="10" fill="#A855F7"/>
  </g>
);
const Nova = () => (
  <g>
    <circle cx="50" cy="50" r="45" fill="rgba(56,189,248,0.4)" className="pet-pulse"/>
    <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="15" fill="#FDE047"/>
  </g>
);

// ─── HEROES & LEGENDS (10) ──────────────────────────────────────────────────
const David = () => (
  <g>
    <circle cx="50" cy="40" r="30" fill="#FCD34D"/>
    <path d="M20 40 C20 0 80 0 80 40" fill="#78350F"/>
    <circle cx="40" cy="45" r="4" fill="#000"/><circle cx="60" cy="45" r="4" fill="#000"/>
    <path d="M80 80 Q95 95 100 70" stroke="#78350F" strokeWidth="6" fill="none"/>
    <circle cx="100" cy="70" r="6" fill="#94A3B8"/>
    <path d="M30 95 Q50 60 70 95 Z" fill="#D97706"/>
  </g>
);
const Shadow = () => (
  <g>
    <circle cx="50" cy="45" r="30" fill="#0F172A"/>
    <rect x="25" y="35" width="50" height="15" rx="5" fill="#FCD34D"/>
    <circle cx="40" cy="42" r="4" fill="#000"/><circle cx="60" cy="42" r="4" fill="#000"/>
    <line x1="10" y1="90" x2="90" y2="10" stroke="#475569" strokeWidth="6"/>
  </g>
);
const Samson = () => (
  <g>
    <circle cx="50" cy="40" r="30" fill="#FCD34D"/>
    <path d="M15 40 Q50 -20 85 40 Q75 70 50 75 Q25 70 15 40 Z" fill="#451A03"/>
    <circle cx="40" cy="45" r="4" fill="#000"/><circle cx="60" cy="45" r="4" fill="#000"/>
    <rect x="0" y="20" width="20" height="80" fill="#CBD5E1"/><rect x="80" y="20" width="20" height="80" fill="#CBD5E1"/>
  </g>
);
const Paul = () => (
  <g>
    <circle cx="50" cy="40" r="30" fill="#FCD34D"/>
    <path d="M25 55 Q50 85 75 55" fill="#451A03"/>
    <circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/>
    <rect x="75" y="50" width="15" height="40" fill="#FEF3C7"/>
    <path d="M30 95 Q50 60 70 95 Z" fill="#166534"/>
  </g>
);
const Spartan = () => (
  <g>
    <rect x="25" y="10" width="50" height="50" rx="10" fill="#B45309"/>
    <rect x="42" y="30" width="16" height="30" fill="#FCD34D"/>
    <path d="M50 10 Q50 -15 90 5 Q50 5 25 10" fill="#DC2626"/>
    <circle cx="20" cy="70" r="25" fill="#B45309"/>
    <rect x="85" y="20" width="6" height="80" fill="#52525B"/>
  </g>
);
const Moses = () => (
  <g>
    <circle cx="50" cy="40" r="30" fill="#FCD34D"/>
    <path d="M15 50 Q50 95 85 50" fill="#E2E8F0"/>
    <circle cx="40" cy="35" r="4" fill="#000"/><circle cx="60" cy="35" r="4" fill="#000"/>
    <rect x="15" y="10" width="6" height="90" fill="#78350F"/>
    <path d="M-10 95 Q15 40 25 100" fill="#38BDF8" opacity="0.8"/>
    <path d="M110 95 Q85 40 75 100" fill="#38BDF8" opacity="0.8"/>
  </g>
);
const Abraham = () => (
  <g>
    <circle cx="50" cy="40" r="30" fill="#FCD34D"/>
    <path d="M20 50 Q50 95 80 50" fill="#F1F5F9"/>
    <circle cx="40" cy="35" r="4" fill="#000"/><circle cx="60" cy="35" r="4" fill="#000"/>
    <circle cx="15" cy="20" r="6" fill="#FDE047" className="pet-pulse"/>
    <circle cx="85" cy="30" r="5" fill="#FDE047" className="pet-pulse"/>
    <path d="M30 95 Q50 60 70 95 Z" fill="#475569"/>
  </g>
);
const Elijah = () => (
  <g>
    <circle cx="50" cy="40" r="30" fill="#FCD34D"/>
    <path d="M25 50 Q50 85 75 50" fill="#E2E8F0"/>
    <circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/>
    <path d="M0 80 Q50 10 100 80" stroke="#EA580C" strokeWidth="15" fill="none" className="pet-pulse"/>
    <path d="M15 90 Q50 40 85 90" stroke="#FDE047" strokeWidth="8" fill="none" className="pet-pulse"/>
  </g>
);
const Guardian = () => (
  <g>
    <rect x="25" y="10" width="50" height="50" rx="10" fill="#FCD34D"/>
    <rect x="40" y="30" width="20" height="20" fill="#FFF"/>
    <path d="M10 50 L20 40 L20 90 Z" fill="#FDE047"/>
    <path d="M90 50 L80 40 L80 90 Z" fill="#FDE047"/>
    <path d="M30 95 Q50 60 70 95 Z" fill="#FBBF24"/>
  </g>
);
const Jesus = () => (
  <g>
    <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(253,224,71,0.5)" strokeWidth="4" className="pet-pulse"/>
    <circle cx="50" cy="40" r="30" fill="#FCD34D"/>
    <path d="M25 40 Q50 90 75 40" fill="#78350F"/>
    <path d="M20 40 C20 10 80 10 80 40" fill="#451A03"/>
    <circle cx="40" cy="45" r="4" fill="#000"/><circle cx="60" cy="45" r="4" fill="#000"/>
    <path d="M20 40 Q10 70 15 95" stroke="#92400E" strokeWidth="6" fill="none"/>
    <path d="M30 95 Q50 60 70 95 Z" fill="#FFFFFF"/>
  </g>
);

// ─── MAP ALL 40 PETS ────────────────────────────────────────────────────────
const PET_MAP = {
  pup: Pup, kitty: Kitty, bunny: Bunny, fox: Fox, bear: Bear,
  wolf: Wolf, lion: Lion, eagle: Eagle, panther: Panther, panda: Panda,
  trike: Trike, raptor: Raptor, ptero: Ptero, stego: Stego, ankylo: Ankylo,
  rex: Rex, spino: Spino, griffin: Griffin, dragon: Dragon, phoenix: Phoenix,
  sparkbot: Sparkbot, gear: Gear, astro: Astro, zap: Zap, mechatron: Mechatron,
  plasma: Plasma, zenith: Zenith, titan: Titan, glitch: Glitch, nova: Nova,
  david: David, shadow: Shadow, samson: Samson, paul: Paul, spartan: Spartan,
  moses: Moses, abraham: Abraham, elijah: Elijah, guardian: Guardian, jesus: Jesus
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
  const h = Math.round(size * (100 / 100)); // Maintain 1:1 viewbox
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
          viewBox="0 0 100 100"
          width={w} height={h}
          style={{ display: 'block', overflow: 'visible' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Universal Shadow */}
          <ellipse cx="50" cy="98" rx="35" ry="8" fill="rgba(0,0,0,0.25)"/>
          <PetComp/>
        </svg>
      </div>
    </div>
  );
}
