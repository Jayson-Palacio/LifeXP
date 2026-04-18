'use client';
import { PETS, RARITY_COLORS } from '../lib/character';

// ─── BEHAVIORS ──────────────────────────────────────────────────────────────
const BEHAVIOR_CLASS = {
  bounce: 'pet-bounce', sway: 'pet-sway', hop: 'pet-hop', wobble: 'pet-wobble',
  strut: 'pet-strut', waddle: 'pet-waddle', flap: 'pet-float', float: 'pet-float',
  flip: 'pet-flip', stomp: 'pet-stomp', guard: 'pet-guard', pulse: 'pet-pulse',
  howl: 'pet-sway'
};

// ─── ANIMALS (1-12) ─────────────────────────────────────────────────────────
const Pup = () => (
  <g>
    <rect x="25" y="45" width="50" height="45" rx="20" fill="#D97706"/>
    <rect x="15" y="30" width="16" height="35" rx="8" fill="#B45309" transform="rotate(-15 23 47)"/>
    <rect x="69" y="30" width="16" height="35" rx="8" fill="#B45309" transform="rotate(15 77 47)"/>
    <rect x="35" y="60" width="30" height="30" rx="15" fill="#FDE68A"/>
    <circle cx="50" cy="40" r="22" fill="#D97706"/>
    <circle cx="42" cy="35" r="3" fill="#1E293B"/><circle cx="58" cy="35" r="3" fill="#1E293B"/>
    <ellipse cx="50" cy="45" rx="8" ry="5" fill="#1E293B"/>
    <circle cx="35" cy="85" r="6" fill="#451A03"/><circle cx="65" cy="85" r="6" fill="#451A03"/>
  </g>
);
const Kitty = () => (
  <g>
    <path d="M50 90 C30 90 35 60 50 60 C65 60 70 90 50 90" fill="#334155"/>
    <polygon points="35,40 25,20 45,35" fill="#334155"/>
    <polygon points="65,40 75,20 55,35" fill="#334155"/>
    <polygon points="35,38 29,26 41,35" fill="#F472B6"/>
    <polygon points="65,38 71,26 59,35" fill="#F472B6"/>
    <circle cx="50" cy="45" r="20" fill="#334155"/>
    <circle cx="42" cy="42" r="4" fill="#A7F3D0"/><circle cx="58" cy="42" r="4" fill="#A7F3D0"/>
    <ellipse cx="50" cy="50" rx="3" ry="2" fill="#F472B6"/>
    <path d="M40 50 Q30 52 20 48" stroke="#94A3B8" strokeWidth="1" fill="none"/>
    <path d="M60 50 Q70 52 80 48" stroke="#94A3B8" strokeWidth="1" fill="none"/>
    <path d="M60 85 Q85 85 75 60" stroke="#334155" strokeWidth="8" strokeLinecap="round" fill="none"/>
  </g>
);
const Bunny = () => (
  <g>
    <path d="M50 90 C30 90 35 65 50 65 C65 65 70 90 50 90" fill="#E2E8F0"/>
    <rect x="35" y="10" width="10" height="40" rx="5" fill="#E2E8F0"/>
    <rect x="55" y="10" width="10" height="40" rx="5" fill="#E2E8F0"/>
    <rect x="37" y="15" width="6" height="25" rx="3" fill="#F472B6"/>
    <rect x="57" y="15" width="6" height="25" rx="3" fill="#F472B6"/>
    <circle cx="50" cy="55" r="18" fill="#E2E8F0"/>
    <circle cx="43" cy="52" r="3" fill="#0F172A"/><circle cx="57" cy="52" r="3" fill="#0F172A"/>
    <circle cx="50" cy="58" r="2" fill="#F472B6"/>
    <ellipse cx="70" cy="80" rx="8" ry="8" fill="#E2E8F0"/>
  </g>
);
const Fox = () => (
  <g>
    <path d="M50 90 C30 90 35 65 50 65 C65 65 70 90 50 90" fill="#EA580C"/>
    <path d="M45 90 C45 75 55 75 55 90" fill="#FEF3C7"/>
    <polygon points="25,25 45,45 65,25" fill="#EA580C"/>
    <polygon points="25,25 45,45 25,45" fill="#FEF3C7"/>
    <polygon points="65,25 45,45 65,45" fill="#FEF3C7"/>
    <polygon points="35,35 25,15 45,30" fill="#EA580C"/>
    <polygon points="65,35 75,15 55,30" fill="#EA580C"/>
    <circle cx="50" cy="45" r="4" fill="#1E293B"/>
    <path d="M60 85 Q90 70 70 40 Q62 50 60 70" fill="#EA580C"/>
    <path d="M70 40 Q62 50 60 70 Q75 60 70 40" fill="#FEF3C7"/>
  </g>
);
const Bear = () => (
  <g>
    <rect x="20" y="40" width="60" height="50" rx="20" fill="#78350F"/>
    <circle cx="30" cy="30" r="12" fill="#78350F"/><circle cx="70" cy="30" r="12" fill="#78350F"/>
    <circle cx="30" cy="30" r="6" fill="#D97706"/><circle cx="70" cy="30" r="6" fill="#D97706"/>
    <circle cx="50" cy="45" r="25" fill="#78350F"/>
    <circle cx="50" cy="55" r="12" fill="#D97706"/>
    <circle cx="40" cy="40" r="3" fill="#000"/><circle cx="60" cy="40" r="3" fill="#000"/>
    <ellipse cx="50" cy="52" rx="5" ry="3" fill="#000"/>
    <rect x="30" y="80" width="15" height="10" rx="5" fill="#451A03"/><rect x="55" y="80" width="15" height="10" rx="5" fill="#451A03"/>
  </g>
);
const Elephant = () => (
  <g>
    <rect x="25" y="45" width="50" height="45" rx="15" fill="#94A3B8"/>
    <path d="M25 45 Q5 45 15 70" fill="#64748B"/><path d="M75 45 Q95 45 85 70" fill="#64748B"/>
    <circle cx="50" cy="45" r="22" fill="#94A3B8"/>
    <circle cx="40" cy="40" r="2" fill="#0F172A"/><circle cx="60" cy="40" r="2" fill="#0F172A"/>
    <path d="M50 45 Q50 85 45 80 Q55 75 55 55" fill="#94A3B8"/>
    <rect x="30" y="80" width="12" height="10" rx="4" fill="#475569"/><rect x="58" y="80" width="12" height="10" rx="4" fill="#475569"/>
  </g>
);
const Wolf = () => (
  <g>
    <path d="M50 90 C25 90 35 60 50 60 C65 60 75 90 50 90" fill="#475569"/>
    <path d="M40 90 L50 70 L60 90 Z" fill="#E2E8F0"/>
    <polygon points="20,20 50,55 80,20 65,10 35,10" fill="#475569"/>
    <polygon points="35,40 65,40 50,55" fill="#E2E8F0"/>
    <circle cx="50" cy="52" r="4" fill="#0F172A"/>
    <polygon points="30,10 20,0 25,20" fill="#475569"/><polygon points="70,10 80,0 75,20" fill="#475569"/>
    <rect x="35" y="32" width="10" height="4" fill="#38BDF8" transform="rotate(10 35 32)"/><rect x="55" y="32" width="10" height="4" fill="#38BDF8" transform="rotate(-10 65 32)"/>
    <path d="M70 70 Q95 60 85 40 Q75 55 70 70" fill="#475569"/>
    <rect x="35" y="85" width="10" height="5" rx="2" fill="#0F172A"/><rect x="55" y="85" width="10" height="5" rx="2" fill="#0F172A"/>
  </g>
);
const Lion = () => (
  <g>
    <rect x="30" y="50" width="40" height="40" rx="10" fill="#F59E0B"/>
    <circle cx="50" cy="40" r="30" fill="#B45309"/>
    <path d="M20 40 Q15 25 30 15 Q50 5 70 15 Q85 25 80 40 Q85 55 75 65 Q50 75 25 65 Q15 55 20 40" fill="#92400E"/>
    <circle cx="50" cy="40" r="18" fill="#F59E0B"/>
    <ellipse cx="50" cy="48" rx="8" ry="6" fill="#FEF3C7"/>
    <circle cx="43" cy="38" r="3" fill="#000"/><circle cx="57" cy="38" r="3" fill="#000"/>
    <ellipse cx="50" cy="45" rx="4" ry="2" fill="#000"/>
    <path d="M70 75 Q90 85 85 65" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none"/>
    <circle cx="85" cy="65" r="4" fill="#92400E"/>
  </g>
);
const Eagle = () => (
  <g>
    <path d="M50 80 C30 80 40 50 50 50 C60 50 70 80 50 80" fill="#451A03"/>
    <path d="M40 60 Q10 40 5 65 Z" fill="#451A03"/><path d="M60 60 Q90 40 95 65 Z" fill="#451A03"/>
    <circle cx="50" cy="40" r="15" fill="#FFFFFF"/>
    <path d="M40 55 L50 40 L60 55 Z" fill="#FFFFFF"/>
    <polygon points="45,45 65,45 55,60" fill="#FBBF24"/>
    <circle cx="45" cy="38" r="2" fill="#000"/><circle cx="55" cy="38" r="2" fill="#000"/>
    <rect x="42" y="80" width="4" height="6" fill="#FBBF24"/><rect x="54" y="80" width="4" height="6" fill="#FBBF24"/>
  </g>
);
const Dolphin = () => (
  <g>
    <path d="M20 70 C10 40 40 20 70 30 C90 40 85 60 70 70 C50 80 30 80 20 70" fill="#38BDF8"/>
    <path d="M30 65 C40 55 60 55 70 65 C50 70 40 70 30 65" fill="#E0F2FE"/>
    <polygon points="60,30 45,15 50,35" fill="#0284C7"/>
    <polygon points="35,60 15,70 30,55" fill="#0284C7"/>
    <polygon points="80,50 95,45 85,60" fill="#38BDF8"/>
    <circle cx="65" cy="45" r="3" fill="#0F172A"/>
    <path d="M70 55 Q75 58 80 55" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </g>
);
const Panther = () => (
  <g>
    <path d="M50 90 C30 90 35 60 50 60 C65 60 70 90 50 90" fill="#0F172A"/>
    <circle cx="50" cy="45" r="20" fill="#0F172A"/>
    <polygon points="35,40 25,20 45,35" fill="#0F172A"/><polygon points="65,40 75,20 55,35" fill="#0F172A"/>
    <circle cx="42" cy="42" r="4" fill="#FDE047"/><circle cx="58" cy="42" r="4" fill="#FDE047"/>
    <ellipse cx="50" cy="50" rx="3" ry="2" fill="#334155"/>
    <path d="M60 85 Q85 85 75 60" stroke="#0F172A" strokeWidth="8" strokeLinecap="round" fill="none"/>
  </g>
);
const Panda = () => (
  <g>
    <rect x="25" y="45" width="50" height="45" rx="20" fill="#FFFFFF"/>
    <circle cx="30" cy="65" r="10" fill="#000"/><circle cx="70" cy="65" r="10" fill="#000"/>
    <rect x="35" y="85" width="10" height="5" rx="2" fill="#000"/><rect x="55" y="85" width="10" height="5" rx="2" fill="#000"/>
    <circle cx="50" cy="40" r="24" fill="#FFFFFF"/>
    <circle cx="30" cy="25" r="8" fill="#000"/><circle cx="70" cy="25" r="8" fill="#000"/>
    <ellipse cx="40" cy="40" rx="8" ry="6" fill="#000" transform="rotate(-20 40 40)"/><ellipse cx="60" cy="40" rx="8" ry="6" fill="#000" transform="rotate(20 60 40)"/>
    <circle cx="40" cy="40" r="2" fill="#FFF"/><circle cx="60" cy="40" r="2" fill="#FFF"/>
    <ellipse cx="50" cy="50" rx="4" ry="3" fill="#000"/>
  </g>
);

// ─── DINOSAURS (13-24) ──────────────────────────────────────────────────────
const Trike = () => (
  <g>
    <rect x="25" y="45" width="50" height="40" rx="10" fill="#FCD34D"/>
    <path d="M20 25 Q50 0 80 25 Q50 40 20 25" fill="#D97706"/>
    <circle cx="50" cy="40" r="18" fill="#FCD34D"/>
    <polygon points="35,15 30,5 40,25" fill="#FEF3C7"/><polygon points="65,15 70,5 60,25" fill="#FEF3C7"/>
    <polygon points="50,25 47,15 53,15" fill="#FEF3C7"/>
    <circle cx="42" cy="35" r="3" fill="#000"/><circle cx="58" cy="35" r="3" fill="#000"/>
    <rect x="30" y="85" width="10" height="5" rx="2" fill="#B45309"/><rect x="60" y="85" width="10" height="5" rx="2" fill="#B45309"/>
    <path d="M25 65 Q10 70 15 85" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" fill="none"/>
  </g>
);
const Ptero = () => (
  <g>
    <path d="M50 35 L50 80 L60 80 Z" fill="#818CF8"/>
    <path d="M50 40 Q20 40 10 20 Q30 50 50 55" fill="#6366F1"/>
    <path d="M50 40 Q80 40 90 20 Q70 50 50 55" fill="#6366F1"/>
    <polygon points="30,20 70,20 50,40" fill="#818CF8"/>
    <polygon points="50,5 45,25 55,25" fill="#4F46E5"/>
    <polygon points="50,50 45,35 55,35" fill="#FDE047"/>
    <circle cx="45" cy="25" r="2" fill="#000"/><circle cx="55" cy="25" r="2" fill="#000"/>
    <rect x="46" y="80" width="3" height="5" fill="#FDE047"/><rect x="51" y="80" width="3" height="5" fill="#FDE047"/>
  </g>
);
const Raptor = () => (
  <g>
    <rect x="30" y="30" width="30" height="50" rx="10" fill="#14B8A6"/>
    <path d="M60 50 Q90 40 85 25 Q70 30 60 40" fill="#14B8A6"/>
    <path d="M30 60 L10 60 L20 70" fill="#14B8A6"/>
    <rect x="40" y="15" width="30" height="20" rx="5" fill="#14B8A6"/>
    <circle cx="60" cy="22" r="3" fill="#000"/>
    <rect x="30" y="80" width="10" height="5" rx="2" fill="#0F766E"/><rect x="50" y="80" width="10" height="5" rx="2" fill="#0F766E"/>
    <path d="M60 81 Q65 75 70 85" stroke="#0F766E" strokeWidth="3" fill="none"/>
  </g>
);
const Stego = () => (
  <g>
    <path d="M20 70 C20 40 80 40 80 70 Z" fill="#65A30D"/>
    <circle cx="85" cy="65" r="8" fill="#65A30D"/>
    <circle cx="85" cy="63" r="2" fill="#000"/>
    <polygon points="30,48 40,20 50,45" fill="#F59E0B"/>
    <polygon points="50,45 60,25 70,48" fill="#F59E0B"/>
    <path d="M20 70 Q10 65 5 75" stroke="#65A30D" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <rect x="30" y="70" width="10" height="10" fill="#3F6212"/><rect x="60" y="70" width="10" height="10" fill="#3F6212"/>
  </g>
);
const Bronto = () => (
  <g>
    <rect x="20" y="60" width="40" height="20" rx="10" fill="#8B5CF6"/>
    <path d="M50 80 C80 80 90 40 85 20 C75 20 75 60 50 60" fill="#8B5CF6"/>
    <circle cx="80" cy="20" r="8" fill="#8B5CF6"/>
    <circle cx="83" cy="18" r="2" fill="#000"/>
    <path d="M20 70 Q10 75 5 80" stroke="#8B5CF6" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <rect x="25" y="80" width="8" height="10" fill="#5B21B6"/><rect x="45" y="80" width="8" height="10" fill="#5B21B6"/>
  </g>
);
const Ankylo = () => (
  <g>
    <path d="M15 75 C15 45 75 45 75 75 Z" fill="#D97706"/>
    <path d="M20 60 Q30 50 40 60" stroke="#B45309" strokeWidth="3" fill="none"/>
    <path d="M45 55 Q55 45 65 55" stroke="#B45309" strokeWidth="3" fill="none"/>
    <circle cx="80" cy="70" r="7" fill="#D97706"/>
    <circle cx="82" cy="68" r="2" fill="#000"/>
    <path d="M15 70 Q5 70 5 60" stroke="#D97706" strokeWidth="6" fill="none"/>
    <circle cx="5" cy="60" r="5" fill="#B45309"/>
    <rect x="25" y="75" width="8" height="8" fill="#92400E"/><rect x="55" y="75" width="8" height="8" fill="#92400E"/>
  </g>
);
const Rex = () => (
  <g>
    <rect x="30" y="40" width="30" height="40" rx="10" fill="#10B981"/>
    <rect x="40" y="45" width="20" height="30" rx="5" fill="#6EE7B7"/>
    <rect x="30" y="15" width="35" height="25" rx="5" fill="#10B981"/>
    <rect x="45" y="30" width="20" height="10" fill="#059669"/>
    <circle cx="50" cy="22" r="3" fill="#000"/>
    <rect x="60" y="50" width="10" height="5" rx="2" fill="#10B981"/><rect x="60" y="60" width="8" height="5" rx="2" fill="#10B981"/>
    <path d="M30 75 L10 65 L25 55" fill="#10B981"/>
    <rect x="35" y="80" width="10" height="6" rx="2" fill="#047857"/><rect x="50" y="80" width="10" height="6" rx="2" fill="#047857"/>
  </g>
);
const Spino = () => (
  <g>
    <path d="M25 70 C25 50 75 50 75 70 Z" fill="#E11D48"/>
    <path d="M30 52 C45 20 60 20 70 52 Z" fill="#BE123C"/>
    <path d="M40 52 L50 25 L60 52" stroke="#F43F5E" strokeWidth="2" fill="none"/>
    <circle cx="80" cy="65" r="7" fill="#E11D48"/>
    <circle cx="82" cy="63" r="2" fill="#000"/>
    <path d="M25 65 Q10 65 5 75" stroke="#E11D48" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <rect x="35" y="70" width="8" height="10" fill="#9F1239"/><rect x="60" y="70" width="8" height="10" fill="#9F1239"/>
  </g>
);
const Plesio = () => (
  <g>
    <path d="M20 70 C40 85 70 85 80 65 C90 75 70 95 30 90 Z" fill="#0284C7"/>
    <path d="M30 65 C40 30 60 20 75 35 C65 25 50 40 40 65 Z" fill="#0284C7"/>
    <circle cx="75" cy="35" r="6" fill="#0284C7"/>
    <circle cx="77" cy="33" r="2" fill="#000"/>
    <path d="M30 75 Q15 85 5 70" fill="#0369A1"/>
    <path d="M50 75 Q60 85 75 75" fill="#0369A1"/>
  </g>
);
const Griffin = () => (
  <g>
    <path d="M40 80 C20 80 30 50 40 50 C50 50 60 80 40 80" fill="#F59E0B"/>
    <path d="M40 60 Q10 40 5 65 Z" fill="#E11D48"/><path d="M60 60 Q90 40 95 65 Z" fill="#E11D48"/>
    <circle cx="50" cy="40" r="15" fill="#FFFFFF"/>
    <polygon points="45,45 65,45 55,60" fill="#FBBF24"/>
    <circle cx="45" cy="38" r="2" fill="#000"/><circle cx="55" cy="38" r="2" fill="#000"/>
    <path d="M60 80 Q80 85 70 65" stroke="#F59E0B" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <circle cx="70" cy="65" r="4" fill="#92400E"/>
  </g>
);
const Dragon = () => (
  <g>
    <path d="M30 80 C20 50 60 50 70 80" fill="#10B981"/>
    <path d="M35 60 Q20 30 5 45" fill="#10B981"/><path d="M65 60 Q80 30 95 45" fill="#10B981"/>
    <circle cx="50" cy="35" r="15" fill="#10B981"/>
    <polygon points="35,35 25,15 45,25" fill="#047857"/><polygon points="65,35 75,15 55,25" fill="#047857"/>
    <circle cx="45" cy="33" r="2" fill="#000"/><circle cx="55" cy="33" r="2" fill="#000"/>
    <polygon points="45,42 55,42 50,55" fill="#FDE047"/>
    <path d="M50 55 Q50 75 50 85" stroke="#FDE047" strokeWidth="3" fill="none"/>
    <path d="M30 80 L10 90 L20 70" fill="#10B981"/>
  </g>
);
const Phoenix = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#EA580C"/>
    <path d="M40 65 Q10 30 5 70 Z" fill="#F97316"/><path d="M60 65 Q90 30 95 70 Z" fill="#F97316"/>
    <path d="M50 90 Q30 100 50 110 Q70 100 50 90" fill="#FDE047"/>
    <circle cx="50" cy="40" r="15" fill="#FDE047"/>
    <polygon points="45,40 65,40 55,55" fill="#EA580C"/>
    <circle cx="45" cy="35" r="2" fill="#000"/><circle cx="55" cy="35" r="2" fill="#000"/>
    <path d="M50 25 Q40 5 50 -5 Q60 5 50 25" fill="#F97316"/>
  </g>
);

// ─── ROBOTS / TECH (25-36) ──────────────────────────────────────────────────
const Sparkbot = () => (
  <g>
    <rect x="48" y="10" width="4" height="15" fill="#94A3B8"/>
    <circle cx="50" cy="8" r="4" fill="#38BDF8"/>
    <rect x="30" y="25" width="40" height="30" rx="5" fill="#E2E8F0"/>
    <rect x="35" y="30" width="30" height="20" rx="3" fill="#1E293B"/>
    <rect x="38" y="38" width="24" height="4" rx="2" fill="#38BDF8"/>
    <rect x="40" y="60" width="20" height="20" rx="3" fill="#94A3B8"/>
    <rect x="45" y="65" width="10" height="5" fill="#38BDF8"/>
    <rect x="20" y="65" width="10" height="5" rx="2" fill="#94A3B8"/><rect x="70" y="65" width="10" height="5" rx="2" fill="#94A3B8"/>
    <path d="M45 80 L55 80 L50 95 Z" fill="#38BDF8"/>
  </g>
);
const Gear = () => (
  <g transform="translate(50,50)">
    <g className="pet-spin">
      <circle cx="0" cy="0" r="25" fill="#64748B"/>
      {[0,45,90,135,180,225,270,315].map(a => (
        <rect key={a} x="-6" y="-35" width="12" height="10" fill="#64748B" transform={`rotate(${a} 0 0)`}/>
      ))}
      <circle cx="0" cy="0" r="15" fill="#0F172A"/>
      <circle cx="0" cy="0" r="8" fill="#38BDF8"/>
    </g>
  </g>
);
const Astro = () => (
  <g>
    <rect x="30" y="50" width="40" height="40" rx="10" fill="#FFFFFF"/>
    <circle cx="50" cy="35" r="25" fill="#F1F5F9"/>
    <rect x="35" y="25" width="30" height="20" rx="10" fill="#1E293B"/>
    <circle cx="45" cy="35" r="2" fill="#FFF"/><circle cx="55" cy="35" r="2" fill="#FFF"/>
    <rect x="40" y="60" width="20" height="15" rx="4" fill="#38BDF8"/>
    <circle cx="50" cy="67" r="4" fill="#FFFFFF"/>
    <rect x="30" y="90" width="15" height="10" rx="5" fill="#94A3B8"/><rect x="55" y="90" width="15" height="10" rx="5" fill="#94A3B8"/>
  </g>
);
const Sonar = () => (
  <g>
    <path d="M20 30 Q50 0 80 30" stroke="#94A3B8" strokeWidth="6" fill="none"/>
    <circle cx="50" cy="30" r="6" fill="#38BDF8" className="pet-pulse"/>
    <rect x="45" y="30" width="10" height="30" fill="#64748B"/>
    <rect x="30" y="60" width="40" height="30" rx="5" fill="#E2E8F0"/>
    <circle cx="40" cy="75" r="5" fill="#EF4444"/><circle cx="60" cy="75" r="5" fill="#10B981"/>
  </g>
);
const Zap = () => (
  <g>
    <polygon points="50,10 30,50 55,45 45,90 70,40 45,45" fill="#FDE047"/>
    <circle cx="45" cy="40" r="3" fill="#000"/><circle cx="55" cy="40" r="3" fill="#000"/>
    <rect x="35" y="70" width="30" height="8" rx="4" fill="#0F172A"/>
  </g>
);
const Plasma = () => (
  <g>
    <circle cx="50" cy="50" r="35" fill="rgba(168,85,247,0.4)" className="pet-pulse"/>
    <circle cx="50" cy="50" r="25" fill="#A855F7"/>
    <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
    <path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
  </g>
);
const Mechatron = () => (
  <g>
    <rect x="25" y="40" width="50" height="40" rx="5" fill="#4F46E5"/>
    <rect x="35" y="45" width="30" height="30" fill="#1E1B4B"/>
    <circle cx="50" cy="60" r="8" fill="#FDE047"/>
    <rect x="35" y="15" width="30" height="25" rx="4" fill="#1E1B4B"/>
    <polygon points="50,20 35,10 45,25" fill="#FDE047"/><polygon points="50,20 65,10 55,25" fill="#FDE047"/>
    <rect x="40" y="25" width="20" height="5" fill="#10B981"/>
    <rect x="15" y="40" width="10" height="25" rx="3" fill="#1E1B4B"/><rect x="75" y="40" width="10" height="25" rx="3" fill="#1E1B4B"/>
    <rect x="30" y="80" width="15" height="15" rx="2" fill="#1E1B4B"/><rect x="55" y="80" width="15" height="15" rx="2" fill="#1E1B4B"/>
  </g>
);
const Cyborg = () => (
  <g>
    <path d="M50 90 C30 90 35 50 50 50 C65 50 70 90 50 90" fill="#1E293B"/>
    <circle cx="50" cy="35" r="20" fill="#FCD34D"/>
    <path d="M50 15 A20 20 0 0 1 70 35 L70 55 L50 55 Z" fill="#94A3B8"/>
    <circle cx="42" cy="35" r="3" fill="#000"/>
    <circle cx="60" cy="35" r="4" fill="#EF4444"/>
    <rect x="35" y="70" width="30" height="10" rx="2" fill="#94A3B8"/>
  </g>
);
const Zenith = () => (
  <g>
    <ellipse cx="50" cy="60" rx="45" ry="15" fill="#0F172A"/>
    <ellipse cx="50" cy="55" rx="40" ry="10" fill="#38BDF8"/>
    <path d="M30 55 C30 20 70 20 70 55 Z" fill="#E2E8F0"/>
    <circle cx="50" cy="40" r="5" fill="#EF4444"/>
    <path d="M50 75 L45 90 L55 90 Z" fill="#38BDF8"/>
  </g>
);
const Titan = () => (
  <g>
    <rect x="20" y="30" width="60" height="50" rx="5" fill="#713F12"/>
    <rect x="30" y="40" width="40" height="30" fill="#451A03"/>
    <rect x="40" y="10" width="20" height="20" rx="2" fill="#713F12"/>
    <rect x="42" y="15" width="16" height="5" fill="#FDE047"/>
    <rect x="10" y="30" width="15" height="40" rx="2" fill="#451A03"/><rect x="75" y="30" width="15" height="40" rx="2" fill="#451A03"/>
    <rect x="25" y="80" width="20" height="20" rx="2" fill="#451A03"/><rect x="55" y="80" width="20" height="20" rx="2" fill="#451A03"/>
  </g>
);
const Glitch = () => (
  <g>
    <rect x="20" y="20" width="60" height="60" fill="#0F172A"/>
    <rect x="30" y="30" width="10" height="10" fill="#10B981"/><rect x="60" y="30" width="10" height="10" fill="#10B981"/>
    <rect x="45" y="50" width="10" height="10" fill="#38BDF8"/>
    <rect x="30" y="65" width="40" height="5" fill="#F43F5E"/>
    <rect x="25" y="45" width="10" height="10" fill="#A855F7"/>
  </g>
);
const Nova = () => (
  <g>
    <circle cx="50" cy="50" r="40" fill="url(#novaGlow)" />
    <defs>
      <radialGradient id="novaGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF" />
        <stop offset="50%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#1E1B4B" />
      </radialGradient>
    </defs>
    <path d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="10" fill="#FDE047"/>
  </g>
);

// ─── EPIC WARRIORS (37-48) ──────────────────────────────────────────────────
const Squire = () => (
  <g>
    <path d="M50 90 C35 90 40 50 50 50 C60 50 65 90 50 90" fill="#94A3B8"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <rect x="35" y="25" width="30" height="25" rx="5" fill="#475569"/>
    <rect x="35" y="32" width="30" height="5" fill="#1E293B"/>
    <rect x="48" y="25" width="4" height="15" fill="#1E293B"/>
    <rect x="25" y="55" width="5" height="30" fill="#94A3B8"/>
    <polygon points="20,55 35,55 27,45" fill="#E2E8F0"/>
  </g>
);
const Scout = () => (
  <g>
    <path d="M50 90 C30 90 35 50 50 50 C65 50 70 90 50 90" fill="#166534"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M30 35 Q50 15 70 35 Z" fill="#14532D"/>
    <path d="M30 35 L40 35 L30 45 Z" fill="#FBBF24"/>
    <circle cx="43" cy="38" r="2" fill="#000"/><circle cx="57" cy="38" r="2" fill="#000"/>
    <rect x="65" y="50" width="4" height="40" fill="#78350F"/>
  </g>
);
const Shadow = () => (
  <g>
    <ellipse cx="50" cy="70" rx="20" ry="20" fill="#0F172A"/>
    <circle cx="50" cy="35" r="20" fill="#0F172A"/>
    <rect x="35" y="30" width="30" height="8" rx="4" fill="#FCD34D"/>
    <circle cx="43" cy="34" r="2" fill="#000"/><circle cx="57" cy="34" r="2" fill="#000"/>
    <rect x="30" y="27" width="40" height="4" fill="#DC2626"/>
    <path d="M70 30 Q85 25 90 40" stroke="#DC2626" strokeWidth="4" fill="none"/>
    <line x1="20" y1="30" x2="40" y2="80" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
  </g>
);
const Ranger = () => (
  <g>
    <path d="M50 90 C30 90 35 50 50 50 C65 50 70 90 50 90" fill="#065F46"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M30 30 C30 0 70 0 70 30" fill="#064E3B"/>
    <circle cx="43" cy="38" r="2" fill="#000"/><circle cx="57" cy="38" r="2" fill="#000"/>
    <path d="M20 50 Q10 70 20 90" stroke="#D97706" strokeWidth="4" fill="none"/>
    <line x1="20" y1="50" x2="20" y2="90" stroke="#FFF" strokeWidth="1"/>
  </g>
);
const Paladin = () => (
  <g>
    <rect x="30" y="50" width="40" height="40" rx="5" fill="#E2E8F0"/>
    <rect x="40" y="60" width="20" height="20" fill="#FBBF24"/>
    <rect x="35" y="15" width="30" height="30" rx="5" fill="#E2E8F0"/>
    <rect x="35" y="25" width="30" height="5" fill="#334155"/>
    <rect x="48" y="15" width="4" height="20" fill="#334155"/>
    <polygon points="15,45 35,45 35,65 25,80 15,65" fill="#FBBF24"/>
    <rect x="75" y="30" width="5" height="50" fill="#94A3B8"/>
    <rect x="70" y="75" width="15" height="5" fill="#334155"/>
  </g>
);
const Samurai = () => (
  <g>
    <path d="M50 90 C30 90 35 50 50 50 C65 50 70 90 50 90" fill="#7F1D1D"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M25 35 Q50 -10 75 35 L60 30 L40 30 Z" fill="#450A0A"/>
    <circle cx="43" cy="38" r="2" fill="#000"/><circle cx="57" cy="38" r="2" fill="#000"/>
    <line x1="80" y1="30" x2="30" y2="80" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="50" cy="70" r="10" fill="#DC2626"/>
  </g>
);
const Valkyrie = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#94A3B8"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <rect x="35" y="15" width="30" height="20" rx="5" fill="#D97706"/>
    <path d="M35 25 C15 15 10 5 10 5 C15 25 25 30 35 30 Z" fill="#F1F5F9"/>
    <path d="M65 25 C85 15 90 5 90 5 C85 25 75 30 65 30 Z" fill="#F1F5F9"/>
    <circle cx="43" cy="38" r="2" fill="#000"/><circle cx="57" cy="38" r="2" fill="#000"/>
    <line x1="20" y1="40" x2="20" y2="90" stroke="#E2E8F0" strokeWidth="4"/>
  </g>
);
const Berserker = () => (
  <g>
    <rect x="30" y="50" width="40" height="40" rx="10" fill="#78350F"/>
    <circle cx="50" cy="30" r="20" fill="#FCD34D"/>
    <rect x="30" y="10" width="40" height="15" rx="5" fill="#1E293B"/>
    <polygon points="35,10 40,0 45,10" fill="#E2E8F0"/><polygon points="65,10 60,0 55,10" fill="#E2E8F0"/>
    <circle cx="43" cy="32" r="3" fill="#DC2626"/><circle cx="57" cy="32" r="3" fill="#DC2626"/>
    <path d="M5 60 L15 50 L15 80 Z" fill="#94A3B8"/><rect x="13" y="50" width="4" height="40" fill="#78350F"/>
    <path d="M95 60 L85 50 L85 80 Z" fill="#94A3B8"/><rect x="83" y="50" width="4" height="40" fill="#78350F"/>
  </g>
);
const Mage = () => (
  <g>
    <path d="M50 90 L20 90 L40 40 L60 40 L80 90 Z" fill="#4C1D95"/>
    <circle cx="50" cy="35" r="15" fill="#FCD34D"/>
    <polygon points="25,35 50,0 75,35 50,25" fill="#5B21B6"/>
    <circle cx="45" cy="38" r="2" fill="#000"/><circle cx="55" cy="38" r="2" fill="#000"/>
    <rect x="80" y="30" width="4" height="60" fill="#92400E"/>
    <circle cx="82" cy="30" r="6" fill="#38BDF8" className="pet-pulse"/>
  </g>
);
const Spartan = () => (
  <g>
    <path d="M50 90 C35 90 40 50 50 50 C60 50 65 90 50 90" fill="#94A3B8"/>
    <rect x="35" y="15" width="30" height="30" rx="5" fill="#B45309"/>
    <rect x="35" y="25" width="30" height="8" fill="#1E293B"/>
    <path d="M50 15 Q50 -5 70 5 Q50 5 35 15" fill="#DC2626"/>
    <circle cx="25" cy="65" r="20" fill="#B45309"/>
    <circle cx="25" cy="65" r="10" fill="#DC2626"/>
    <rect x="75" y="20" width="4" height="70" fill="#52525B"/>
    <polygon points="70,20 84,20 77,5" fill="#94A3B8"/>
  </g>
);
const Guardian = () => (
  <g>
    <rect x="25" y="40" width="50" height="50" rx="10" fill="#FBBF24"/>
    <rect x="35" y="50" width="30" height="30" fill="#D97706"/>
    <rect x="30" y="10" width="40" height="30" rx="8" fill="#FBBF24"/>
    <rect x="45" y="20" width="10" height="20" fill="#FEF3C7"/>
    <rect x="30" y="25" width="40" height="5" fill="#FEF3C7"/>
    <circle cx="50" cy="65" r="8" fill="#FEF3C7"/>
    <path d="M10 50 L20 40 L20 80 Z" fill="#FDE047"/>
    <path d="M90 50 L80 40 L80 80 Z" fill="#FDE047"/>
  </g>
);
const Sentinel = () => (
  <g>
    <path d="M50 90 C30 90 40 40 50 40 C60 40 70 90 50 90" fill="#1E293B"/>
    <path d="M50 0 L60 20 L50 35 L40 20 Z" fill="#38BDF8"/>
    <circle cx="50" cy="40" r="12" fill="#E2E8F0"/>
    <rect x="20" y="45" width="6" height="50" fill="#38BDF8" className="pet-pulse"/>
    <polygon points="15,45 31,45 23,30" fill="#E2E8F0"/>
  </g>
);

// ─── BIBLE HEROES (49-60) ───────────────────────────────────────────────────
const David = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#D97706"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M30 35 C30 10 70 10 70 35" fill="#78350F"/>
    <circle cx="43" cy="38" r="2" fill="#000"/><circle cx="57" cy="38" r="2" fill="#000"/>
    <path d="M70 70 Q85 85 95 65" stroke="#78350F" strokeWidth="3" fill="none"/>
    <circle cx="95" cy="65" r="4" fill="#94A3B8"/>
  </g>
);
const Joseph = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#EF4444"/>
    <path d="M40 70 L50 50 L60 70 Z" fill="#F59E0B"/>
    <path d="M45 90 L50 70 L55 90 Z" fill="#3B82F6"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M32 35 C32 15 68 15 68 35" fill="#451A03"/>
    <circle cx="43" cy="38" r="2" fill="#000"/><circle cx="57" cy="38" r="2" fill="#000"/>
  </g>
);
const Esther = () => (
  <g>
    <path d="M50 90 L30 90 L40 50 L60 50 L70 90 Z" fill="#A855F7"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <polygon points="35,17 42,25 50,10 58,25 65,17 60,30 40,30" fill="#FBBF24"/>
    <circle cx="43" cy="38" r="2" fill="#000"/><circle cx="57" cy="38" r="2" fill="#000"/>
    <circle cx="50" cy="10" r="3" fill="#38BDF8"/>
  </g>
);
const Daniel = () => (
  <g>
    <path d="M40 90 C25 90 30 60 40 60 C50 60 55 90 40 90" fill="#0284C7"/>
    <circle cx="40" cy="45" r="15" fill="#FCD34D"/>
    <circle cx="35" cy="45" r="2" fill="#000"/><circle cx="45" cy="45" r="2" fill="#000"/>
    <circle cx="75" cy="70" r="20" fill="#F59E0B"/>
    <circle cx="75" cy="70" r="12" fill="#B45309"/>
    <circle cx="70" cy="68" r="2" fill="#000"/><circle cx="80" cy="68" r="2" fill="#000"/>
  </g>
);
const Noah = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#8B5CF6"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M35 40 Q50 60 65 40" fill="#E2E8F0"/>
    <circle cx="43" cy="35" r="2" fill="#000"/><circle cx="57" cy="35" r="2" fill="#000"/>
    <path d="M10 70 Q50 100 90 70 L80 60 Q50 85 20 60 Z" fill="#78350F"/>
  </g>
);
const Samson = () => (
  <g>
    <rect x="35" y="50" width="30" height="40" rx="5" fill="#FCD34D"/>
    <path d="M35 60 Q20 50 10 60" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" fill="none"/>
    <path d="M65 60 Q80 50 90 60" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" fill="none"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M30 35 Q50 15 70 35 Q60 55 50 65 Q40 55 30 35 Z" fill="#451A03"/>
    <rect x="5" y="20" width="10" height="70" fill="#CBD5E1"/><rect x="85" y="20" width="10" height="70" fill="#CBD5E1"/>
  </g>
);
const Paul = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#166534"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M35 45 Q50 65 65 45" fill="#451A03"/>
    <circle cx="43" cy="35" r="2" fill="#000"/><circle cx="57" cy="35" r="2" fill="#000"/>
    <rect x="75" y="50" width="10" height="30" fill="#FEF3C7"/>
    <circle cx="20" cy="65" r="12" fill="#D97706"/>
    <circle cx="20" cy="65" r="8" fill="#FEF3C7"/>
  </g>
);
const Moses = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#B45309"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M30 40 Q50 70 70 40" fill="#E2E8F0"/>
    <circle cx="43" cy="33" r="2" fill="#000"/><circle cx="57" cy="33" r="2" fill="#000"/>
    <rect x="25" y="20" width="4" height="70" fill="#78350F"/>
    <path d="M5 90 Q15 60 25 90" fill="#38BDF8" opacity="0.8"/>
    <path d="M95 90 Q85 60 75 90" fill="#38BDF8" opacity="0.8"/>
  </g>
);
const Abraham = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#475569"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M30 40 Q50 75 70 40" fill="#F1F5F9"/>
    <circle cx="43" cy="33" r="2" fill="#000"/><circle cx="57" cy="33" r="2" fill="#000"/>
    <circle cx="20" cy="20" r="3" fill="#FDE047" className="pet-pulse"/>
    <circle cx="80" cy="30" r="2" fill="#FDE047" className="pet-pulse"/>
    <circle cx="70" cy="15" r="4" fill="#FDE047" className="pet-pulse"/>
  </g>
);
const Joshua = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#991B1B"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M35 40 Q50 60 65 40" fill="#451A03"/>
    <circle cx="43" cy="35" r="2" fill="#000"/><circle cx="57" cy="35" r="2" fill="#000"/>
    <path d="M70 60 Q95 40 85 20 Q80 15 75 25" fill="#FCD34D"/>
  </g>
);
const Elijah = () => (
  <g>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#B45309"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M35 40 Q50 60 65 40" fill="#E2E8F0"/>
    <circle cx="43" cy="35" r="2" fill="#000"/><circle cx="57" cy="35" r="2" fill="#000"/>
    <path d="M10 80 Q50 30 90 80" stroke="#EA580C" strokeWidth="8" fill="none" className="pet-pulse"/>
    <path d="M20 90 Q50 50 80 90" stroke="#FDE047" strokeWidth="4" fill="none" className="pet-pulse"/>
  </g>
);
const Jesus = () => (
  <g>
    <circle cx="50" cy="50" r="45" fill="rgba(253,224,71,0.2)" className="pet-pulse"/>
    <circle cx="50" cy="50" r="35" fill="rgba(253,224,71,0.4)" className="pet-pulse"/>
    <path d="M50 90 C30 90 40 50 50 50 C60 50 70 90 50 90" fill="#FFFFFF"/>
    <path d="M45 50 L55 50 L50 90 Z" fill="#EF4444"/>
    <circle cx="50" cy="35" r="18" fill="#FCD34D"/>
    <path d="M30 35 Q50 60 70 35" fill="#78350F"/>
    <path d="M32 35 C32 15 68 15 68 35" fill="#451A03"/>
    <circle cx="43" cy="38" r="2" fill="#000"/><circle cx="57" cy="38" r="2" fill="#000"/>
    <path d="M25 40 Q15 60 20 85" stroke="#92400E" strokeWidth="4" fill="none"/>
    <path d="M25 40 Q35 30 45 40" stroke="#92400E" strokeWidth="4" fill="none"/>
  </g>
);

// ─── MAP ALL 60 PETS ────────────────────────────────────────────────────────
const PET_MAP = {
  pup: Pup, kitty: Kitty, bunny: Bunny, fox: Fox, bear: Bear,
  elephant: Elephant, wolf: Wolf, lion: Lion, eagle: Eagle, dolphin: Dolphin,
  panther: Panther, panda: Panda,
  trike: Trike, ptero: Ptero, raptor: Raptor, stego: Stego, bronto: Bronto,
  ankylo: Ankylo, rex: Rex, spino: Spino, plesio: Plesio, griffin: Griffin,
  dragon: Dragon, phoenix: Phoenix,
  sparkbot: Sparkbot, gear: Gear, astro: Astro, sonar: Sonar, zap: Zap,
  plasma: Plasma, mechatron: Mechatron, cyborg: Cyborg, zenith: Zenith,
  titan: Titan, glitch: Glitch, nova: Nova,
  squire: Squire, scout: Scout, shadow: Shadow, ranger: Ranger, paladin: Paladin,
  samurai: Samurai, valkyrie: Valkyrie, berserker: Berserker, mage: Mage,
  spartan: Spartan, guardian: Guardian, sentinel: Sentinel,
  david: David, joseph: Joseph, esther: Esther, daniel: Daniel, noah: Noah,
  samson: Samson, paul: Paul, moses: Moses, abraham: Abraham, joshua: Joshua,
  elijah: Elijah, jesus: Jesus
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
          <ellipse cx="50" cy="95" rx="25" ry="5" fill="rgba(0,0,0,0.15)"/>
          <PetComp/>
        </svg>
      </div>
    </div>
  );
}
