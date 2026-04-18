'use client';
import { PETS, RARITY_COLORS } from '../lib/character';

// ─── BEHAVIORS (Animations) ─────────────────────────────────────────────────
const BEHAVIOR_CLASS = {
  bounce: 'pet-bounce', sway: 'pet-sway', hop: 'pet-hop', wobble: 'pet-wobble',
  strut: 'pet-sway', waddle: 'pet-wobble', flap: 'pet-float', float: 'pet-float',
  flip: 'pet-flip', stomp: 'pet-bounce', guard: 'pet-pulse', pulse: 'pet-pulse',
  howl: 'pet-sway'
};

// ─── REUSABLE BASE SHAPES FOR HIGH-QUALITY UNIFORMITY ───────────────────────
const BaseChibi = ({ headColor="#FCD34D", bodyColor="#3B82F6", accessory, face, hair, helmet }) => (
  <g>
    {/* Body */}
    <path d="M30 90 Q50 60 70 90 Z" fill={bodyColor} />
    {accessory}
    {/* Head Outline / Shadow for depth */}
    <circle cx="50" cy="40" r="26" fill="rgba(0,0,0,0.1)" transform="translate(0,3)"/>
    <circle cx="50" cy="40" r="26" fill={headColor} />
    {hair}
    {helmet}
    {face || (
      <g>
        <circle cx="40" cy="42" r="4" fill="#0F172A" />
        <circle cx="60" cy="42" r="4" fill="#0F172A" />
        <path d="M46 50 Q50 54 54 50" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round"/>
      </g>
    )}
  </g>
);

const BaseAnimal = ({ mainColor, secondary, ears, face, accessory }) => (
  <g>
    <path d="M30 95 Q50 60 70 95 Z" fill={mainColor} />
    <ellipse cx="50" cy="85" rx="15" ry="10" fill={secondary} />
    {ears}
    <circle cx="50" cy="45" r="28" fill="rgba(0,0,0,0.1)" transform="translate(0,3)"/>
    <circle cx="50" cy="45" r="28" fill={mainColor} />
    <circle cx="50" cy="50" r="14" fill={secondary} />
    {face}
    {accessory}
  </g>
);

const BaseDino = ({ main, sub, spikes, face }) => (
  <g>
    {spikes}
    <path d="M20 95 Q50 40 80 95 Z" fill={main} />
    <path d="M35 95 Q50 60 65 95 Z" fill={sub} />
    <circle cx="50" cy="45" r="25" fill="rgba(0,0,0,0.1)" transform="translate(0,3)"/>
    <rect x="25" y="20" width="50" height="45" rx="15" fill={main} />
    {face}
  </g>
);

// ─── 🐾 ANIMALS (1-12) ───────────────────────────────────────────────────────
const Pup = () => (
  <BaseAnimal mainColor="#D97706" secondary="#FEF3C7"
    ears={<><path d="M25 45 Q10 70 20 80 Z" fill="#B45309"/><path d="M75 45 Q90 70 80 80 Z" fill="#B45309"/></>}
    face={<><circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/><ellipse cx="50" cy="48" rx="6" ry="4" fill="#000"/><path d="M48 55 Q50 62 52 55 Z" fill="#EF4444"/></>} />
);
const Kitty = () => (
  <BaseAnimal mainColor="#334155" secondary="#F1F5F9"
    ears={<><polygon points="25,30 20,5 40,25" fill="#334155"/><polygon points="28,28 23,10 37,23" fill="#F472B6"/><polygon points="75,30 80,5 60,25" fill="#334155"/><polygon points="72,28 77,10 63,23" fill="#F472B6"/></>}
    face={<><circle cx="40" cy="45" r="5" fill="#A7F3D0"/><circle cx="60" cy="45" r="5" fill="#A7F3D0"/><ellipse cx="50" cy="52" rx="3" ry="2" fill="#F472B6"/><path d="M30 50 Q20 52 10 48 M70 50 Q80 52 90 48" stroke="#94A3B8" strokeWidth="2" fill="none"/></>} />
);
const Bunny = () => (
  <BaseAnimal mainColor="#E2E8F0" secondary="#FFFFFF"
    ears={<><rect x="35" y="0" width="10" height="40" rx="5" fill="#E2E8F0"/><rect x="37" y="5" width="6" height="30" rx="3" fill="#F472B6"/><rect x="55" y="0" width="10" height="40" rx="5" fill="#E2E8F0"/><rect x="57" y="5" width="6" height="30" rx="3" fill="#F472B6"/></>}
    face={<><circle cx="40" cy="42" r="4" fill="#000"/><circle cx="60" cy="42" r="4" fill="#000"/><circle cx="50" cy="48" r="3" fill="#F472B6"/></>} />
);
const Fox = () => (
  <BaseAnimal mainColor="#EA580C" secondary="#FEF3C7"
    ears={<><polygon points="25,30 15,5 40,20" fill="#EA580C"/><polygon points="25,25 20,8 35,18" fill="#FEF3C7"/><polygon points="75,30 85,5 60,20" fill="#EA580C"/><polygon points="75,25 80,8 65,18" fill="#FEF3C7"/></>}
    face={<><path d="M25 45 L50 70 L75 45 Z" fill="#FEF3C7"/><circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/><circle cx="50" cy="65" r="4" fill="#000"/></>} />
);
const Bear = () => (
  <BaseAnimal mainColor="#78350F" secondary="#D97706"
    ears={<><circle cx="25" cy="25" r="12" fill="#78350F"/><circle cx="75" cy="25" r="12" fill="#78350F"/><circle cx="25" cy="25" r="6" fill="#D97706"/><circle cx="75" cy="25" r="6" fill="#D97706"/></>}
    face={<><circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/><ellipse cx="50" cy="50" rx="6" ry="4" fill="#000"/></>} />
);
const Elephant = () => (
  <BaseAnimal mainColor="#94A3B8" secondary="#CBD5E1"
    ears={<><path d="M25 40 Q-10 20 5 70 Z" fill="#64748B"/><path d="M75 40 Q110 20 95 70 Z" fill="#64748B"/></>}
    face={<><circle cx="35" cy="40" r="3" fill="#000"/><circle cx="65" cy="40" r="3" fill="#000"/><path d="M50 50 Q45 80 55 90" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" fill="none"/></>} />
);
const Wolf = () => (
  <BaseAnimal mainColor="#475569" secondary="#E2E8F0"
    ears={<><polygon points="25,25 15,0 45,15" fill="#475569"/><polygon points="75,25 85,0 55,15" fill="#475569"/></>}
    face={<><path d="M25 45 L50 65 L75 45 Z" fill="#E2E8F0"/><circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/><circle cx="50" cy="60" r="4" fill="#000"/></>} />
);
const Lion = () => (
  <BaseAnimal mainColor="#F59E0B" secondary="#FEF3C7"
    accessory={<circle cx="50" cy="45" r="35" fill="#B45309" transform="translate(0,0) scale(1.1) translate(-5,-4)"/>}
    ears={null}
    face={<><circle cx="50" cy="45" r="28" fill="#F59E0B"/><circle cx="50" cy="52" r="12" fill="#FEF3C7"/><circle cx="40" cy="42" r="4" fill="#000"/><circle cx="60" cy="42" r="4" fill="#000"/><ellipse cx="50" cy="50" rx="5" ry="3" fill="#000"/></>} />
);
const Eagle = () => (
  <BaseAnimal mainColor="#FFFFFF" secondary="#FBBF24"
    ears={<><path d="M25 90 Q10 60 5 40 Z" fill="#451A03"/><path d="M75 90 Q90 60 95 40 Z" fill="#451A03"/></>}
    face={<><path d="M25 45 Q50 10 75 45 Z" fill="#FFFFFF"/><polygon points="40,45 60,45 50,70" fill="#F59E0B"/><circle cx="35" cy="40" r="4" fill="#000"/><circle cx="65" cy="40" r="4" fill="#000"/></>} />
);
const Dolphin = () => (
  <BaseAnimal mainColor="#38BDF8" secondary="#E0F2FE"
    ears={<><polygon points="50,15 40,0 60,5" fill="#0284C7"/></>}
    face={<><path d="M20 50 Q50 70 80 50" fill="#E0F2FE"/><circle cx="35" cy="40" r="4" fill="#000"/><circle cx="65" cy="40" r="4" fill="#000"/></>} />
);
const Panther = () => (
  <BaseAnimal mainColor="#0F172A" secondary="#1E293B"
    ears={<><polygon points="25,30 20,10 40,25" fill="#0F172A"/><polygon points="75,30 80,10 60,25" fill="#0F172A"/></>}
    face={<><circle cx="40" cy="45" r="5" fill="#FDE047"/><circle cx="60" cy="45" r="5" fill="#FDE047"/><ellipse cx="50" cy="52" rx="3" ry="2" fill="#334155"/></>} />
);
const Panda = () => (
  <BaseAnimal mainColor="#FFFFFF" secondary="#F8FAFC"
    ears={<><circle cx="25" cy="25" r="12" fill="#000"/><circle cx="75" cy="25" r="12" fill="#000"/></>}
    face={<><ellipse cx="35" cy="45" rx="12" ry="10" fill="#000" transform="rotate(-15 35 45)"/><ellipse cx="65" cy="45" rx="12" ry="10" fill="#000" transform="rotate(15 65 45)"/><circle cx="35" cy="45" r="3" fill="#FFF"/><circle cx="65" cy="45" r="3" fill="#FFF"/><ellipse cx="50" cy="55" rx="5" ry="3" fill="#000"/></>} />
);

// ─── 🦖 DINOSAURS (13-24) ───────────────────────────────────────────────────
const Trike = () => (
  <BaseDino main="#FCD34D" sub="#FEF3C7"
    spikes={<><path d="M20 20 Q50 -10 80 20 Z" fill="#D97706"/></>}
    face={<><polygon points="35,15 30,0 42,20" fill="#FFF"/><polygon points="65,15 70,0 58,20" fill="#FFF"/><polygon points="53,25 50,12 47,25" fill="#FFF"/><circle cx="40" cy="40" r="4" fill="#000"/><circle cx="60" cy="40" r="4" fill="#000"/><path d="M40 50 Q50 60 60 50" fill="none" stroke="#D97706" strokeWidth="3"/></>} />
);
const Ptero = () => (
  <BaseDino main="#818CF8" sub="#E0E7FF"
    spikes={<><polygon points="50,40 20,0 60,30" fill="#6366F1"/><path d="M20 50 L0 50 L30 70 Z" fill="#6366F1"/><path d="M80 50 L100 50 L70 70 Z" fill="#6366F1"/></>}
    face={<><polygon points="30,45 70,45 50,80" fill="#FDE047"/><circle cx="40" cy="40" r="3" fill="#000"/><circle cx="60" cy="40" r="3" fill="#000"/></>} />
);
const Raptor = () => (
  <BaseDino main="#14B8A6" sub="#CCFBF1"
    spikes={<><polygon points="80,50 100,50 80,70" fill="#0F766E"/></>}
    face={<><circle cx="40" cy="35" r="4" fill="#000"/><circle cx="60" cy="35" r="4" fill="#000"/><rect x="25" y="45" width="50" height="15" rx="5" fill="#14B8A6"/><path d="M30 50 Q50 60 70 50" fill="none" stroke="#0F766E" strokeWidth="2"/></>} />
);
const Stego = () => (
  <BaseDino main="#65A30D" sub="#ECFCCB"
    spikes={<><polygon points="20,40 30,10 40,35" fill="#F59E0B"/><polygon points="45,30 55,0 65,30" fill="#F59E0B"/><polygon points="70,35 80,10 90,40" fill="#F59E0B"/></>}
    face={<><circle cx="35" cy="40" r="3" fill="#000"/><circle cx="65" cy="40" r="3" fill="#000"/><ellipse cx="50" cy="45" rx="5" ry="3" fill="#3F6212"/></>} />
);
const Bronto = () => (
  <BaseDino main="#8B5CF6" sub="#EDE9FE"
    spikes={<><path d="M30 40 Q50 -20 70 40" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="2"/></>}
    face={<><circle cx="40" cy="35" r="3" fill="#000"/><circle cx="60" cy="35" r="3" fill="#000"/><ellipse cx="50" cy="42" rx="10" ry="8" fill="#C4B5FD"/></>} />
);
const Ankylo = () => (
  <BaseDino main="#D97706" sub="#FEF3C7"
    spikes={<><circle cx="30" cy="20" r="8" fill="#B45309"/><circle cx="50" cy="15" r="8" fill="#B45309"/><circle cx="70" cy="20" r="8" fill="#B45309"/></>}
    face={<><circle cx="35" cy="40" r="4" fill="#000"/><circle cx="65" cy="40" r="4" fill="#000"/><rect x="40" y="45" width="20" height="5" rx="2" fill="#92400E"/></>} />
);
const Rex = () => (
  <BaseDino main="#10B981" sub="#D1FAE5"
    spikes={<><rect x="45" y="0" width="10" height="20" rx="2" fill="#047857"/></>}
    face={<><circle cx="35" cy="35" r="5" fill="#000"/><circle cx="65" cy="35" r="5" fill="#000"/><rect x="25" y="45" width="50" height="20" rx="5" fill="#059669"/><polygon points="30,45 35,50 40,45" fill="#FFF"/><polygon points="60,45 65,50 70,45" fill="#FFF"/></>} />
);
const Spino = () => (
  <BaseDino main="#E11D48" sub="#FFE4E6"
    spikes={<><path d="M20 40 C40 -10 60 -10 80 40 Z" fill="#BE123C"/></>}
    face={<><circle cx="35" cy="35" r="4" fill="#000"/><circle cx="65" cy="35" r="4" fill="#000"/><rect x="25" y="45" width="50" height="15" rx="7" fill="#E11D48"/></>} />
);
const Plesio = () => (
  <BaseDino main="#0EA5E9" sub="#E0F2FE"
    spikes={<><path d="M10 60 Q-10 70 10 90 Z" fill="#0284C7"/><path d="M90 60 Q110 70 90 90 Z" fill="#0284C7"/></>}
    face={<><circle cx="35" cy="35" r="4" fill="#000"/><circle cx="65" cy="35" r="4" fill="#000"/><ellipse cx="50" cy="45" rx="8" ry="5" fill="#BAE6FD"/></>} />
);
const Griffin = () => (
  <BaseDino main="#F59E0B" sub="#FFFBEB"
    spikes={<><path d="M20 50 Q0 30 15 20 Z" fill="#E11D48"/><path d="M80 50 Q100 30 85 20 Z" fill="#E11D48"/></>}
    face={<><polygon points="35,40 65,40 50,65" fill="#FBBF24"/><circle cx="35" cy="35" r="4" fill="#000"/><circle cx="65" cy="35" r="4" fill="#000"/></>} />
);
const Dragon = () => (
  <BaseDino main="#10B981" sub="#D1FAE5"
    spikes={<><polygon points="30,25 20,0 40,15" fill="#047857"/><polygon points="70,25 80,0 60,15" fill="#047857"/><path d="M10 60 L-10 40 L20 40 Z" fill="#047857"/><path d="M90 60 L110 40 L80 40 Z" fill="#047857"/></>}
    face={<><circle cx="35" cy="35" r="4" fill="#000"/><circle cx="65" cy="35" r="4" fill="#000"/><rect x="35" y="50" width="30" height="15" rx="5" fill="#FDE047"/><path d="M45 55 Q50 65 55 55" fill="none" stroke="#D97706" strokeWidth="2"/></>} />
);
const Phoenix = () => (
  <BaseDino main="#EA580C" sub="#FFEDD5"
    spikes={<><path d="M50 25 Q30 -10 50 -20 Q70 -10 50 25 Z" fill="#FDE047"/><path d="M20 50 Q-10 20 10 10 Z" fill="#F97316"/><path d="M80 50 Q110 20 90 10 Z" fill="#F97316"/></>}
    face={<><circle cx="35" cy="35" r="4" fill="#000"/><circle cx="65" cy="35" r="4" fill="#000"/><polygon points="40,40 60,40 50,60" fill="#FDE047"/></>} />
);

// ─── 🤖 ROBOTS / TECH (25-36) ───────────────────────────────────────────────
const BaseRobot = ({ main, screen, glow, details }) => (
  <g>
    <rect x="25" y="70" width="50" height="30" rx="5" fill={main} />
    <rect x="15" y="15" width="70" height="60" rx="15" fill={main} />
    <rect x="25" y="25" width="50" height="35" rx="5" fill={screen} />
    {details}
    {glow && <circle cx="50" cy="42" r="12" fill={glow} className="pet-pulse"/>}
  </g>
);

const Sparkbot = () => (
  <BaseRobot main="#94A3B8" screen="#0F172A" glow="#38BDF8"
    details={<><rect x="45" y="0" width="10" height="15" fill="#64748B"/><circle cx="50" cy="0" r="5" fill="#38BDF8"/><circle cx="35" cy="42" r="5" fill="#38BDF8"/><circle cx="65" cy="42" r="5" fill="#38BDF8"/></>} />
);
const Gear = () => (
  <g className="pet-spin">
    <circle cx="50" cy="50" r="40" fill="#64748B"/>
    {[0,45,90,135,180,225,270,315].map(a => <rect key={a} x="42" y="-5" width="16" height="20" fill="#64748B" transform={`rotate(${a} 50 50)`}/>)}
    <circle cx="50" cy="50" r="25" fill="#0F172A"/>
    <circle cx="50" cy="50" r="10" fill="#38BDF8" className="pet-pulse"/>
  </g>
);
const Astro = () => (
  <BaseRobot main="#FFFFFF" screen="#1E293B"
    details={<><circle cx="35" cy="42" r="4" fill="#FFF"/><circle cx="65" cy="42" r="4" fill="#FFF"/><path d="M40 50 Q50 60 60 50" fill="none" stroke="#FFF" strokeWidth="2"/><rect x="40" y="75" width="20" height="10" rx="2" fill="#38BDF8"/></>} />
);
const Sonar = () => (
  <BaseRobot main="#64748B" screen="#0F172A"
    details={<><ellipse cx="50" cy="15" rx="30" ry="10" fill="#94A3B8"/><path d="M30 40 L70 40" stroke="#10B981" strokeWidth="4" className="pet-pulse"/></>} />
);
const Zap = () => (
  <BaseRobot main="#FDE047" screen="#000000" glow="#EF4444"
    details={<><polygon points="50,25 35,45 65,45" fill="#EF4444"/><polygon points="15,40 -5,20 15,30" fill="#FDE047"/><polygon points="85,40 105,20 85,30" fill="#FDE047"/></>} />
);
const Plasma = () => (
  <g>
    <circle cx="50" cy="50" r="45" fill="rgba(168,85,247,0.3)" className="pet-pulse"/>
    <circle cx="50" cy="50" r="35" fill="#A855F7"/>
    <circle cx="50" cy="50" r="15" fill="#FFFFFF"/>
    <path d="M50 15 L50 35 M50 65 L50 85 M15 50 L35 50 M65 50 L85 50" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round"/>
  </g>
);
const Mechatron = () => (
  <BaseRobot main="#4F46E5" screen="#1E1B4B"
    details={<><rect x="35" y="35" width="10" height="10" fill="#FDE047"/><rect x="55" y="35" width="10" height="10" fill="#FDE047"/><rect x="30" y="75" width="40" height="10" fill="#FDE047"/></>} />
);
const Cyborg = () => (
  <BaseRobot main="#E2E8F0" screen="#FFFFFF"
    details={<><path d="M50 15 L50 75 L85 75 L85 15 Z" fill="#94A3B8"/><circle cx="35" cy="42" r="5" fill="#000"/><circle cx="65" cy="42" r="5" fill="#EF4444"/><rect x="60" y="0" width="10" height="15" fill="#94A3B8"/></>} />
);
const Zenith = () => (
  <BaseRobot main="#38BDF8" screen="#0F172A"
    details={<><ellipse cx="50" cy="80" rx="40" ry="10" fill="#0F172A"/><circle cx="50" cy="42" r="15" fill="#38BDF8"/><circle cx="50" cy="42" r="5" fill="#FFF"/></>} />
);
const Titan = () => (
  <BaseRobot main="#713F12" screen="#451A03"
    details={<><rect x="30" y="35" width="40" height="15" fill="#FDE047"/><rect x="10" y="20" width="15" height="40" rx="5" fill="#713F12"/><rect x="75" y="20" width="15" height="40" rx="5" fill="#713F12"/></>} />
);
const Glitch = () => (
  <g>
    <rect x="20" y="20" width="60" height="60" fill="#0F172A"/>
    <rect x="25" y="25" width="50" height="50" fill="#1E293B"/>
    <rect x="30" y="35" width="15" height="15" fill="#10B981" className="pet-pulse"/>
    <rect x="55" y="35" width="15" height="15" fill="#EF4444" className="pet-pulse"/>
    <rect x="30" y="60" width="40" height="5" fill="#38BDF8"/>
  </g>
);
const Nova = () => (
  <g>
    <circle cx="50" cy="50" r="45" fill="rgba(56,189,248,0.4)" className="pet-pulse"/>
    <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="15" fill="#FDE047"/>
  </g>
);

// ─── ⚔️ EPIC WARRIORS (37-48) ────────────────────────────────────────────────
const Squire = () => (
  <BaseChibi bodyColor="#94A3B8" headColor="#FCD34D"
    helmet={<path d="M20 50 C20 10 80 10 80 50 Z" fill="#64748B"/>}
    accessory={<rect x="15" y="60" width="10" height="40" fill="#E2E8F0"/>} />
);
const Scout = () => (
  <BaseChibi bodyColor="#166534" headColor="#FCD34D"
    helmet={<path d="M20 40 L50 10 L80 40 Z" fill="#14532D"/>}
    accessory={<path d="M15 50 Q0 70 15 90" stroke="#78350F" strokeWidth="4" fill="none"/>} />
);
const Shadow = () => (
  <BaseChibi bodyColor="#0F172A" headColor="#0F172A"
    face={<rect x="30" y="35" width="40" height="12" rx="5" fill="#FCD34D"/>}
    accessory={<line x1="10" y1="90" x2="90" y2="10" stroke="#475569" strokeWidth="4"/>} />
);
const Ranger = () => (
  <BaseChibi bodyColor="#065F46" headColor="#FCD34D"
    helmet={<path d="M25 35 Q50 0 75 35 Z" fill="#064E3B"/>}
    accessory={<circle cx="20" cy="60" r="15" fill="none" stroke="#D97706" strokeWidth="4"/>} />
);
const Paladin = () => (
  <BaseChibi bodyColor="#E2E8F0" headColor="#E2E8F0"
    helmet={<rect x="45" y="20" width="10" height="30" fill="#334155"/>}
    accessory={<polygon points="10,50 30,50 30,80 20,95 10,80" fill="#FBBF24"/>} />
);
const Samurai = () => (
  <BaseChibi bodyColor="#7F1D1D" headColor="#FCD34D"
    helmet={<path d="M15 35 Q50 -20 85 35 L65 30 L35 30 Z" fill="#450A0A"/>}
    accessory={<line x1="10" y1="70" x2="90" y2="70" stroke="#E2E8F0" strokeWidth="6"/>} />
);
const Valkyrie = () => (
  <BaseChibi bodyColor="#94A3B8" headColor="#FCD34D"
    helmet={<g><path d="M25 35 C25 10 75 10 75 35 Z" fill="#FDE047"/><path d="M25 25 Q0 0 10 25 Z" fill="#FFF"/><path d="M75 25 Q100 0 90 25 Z" fill="#FFF"/></g>} />
);
const Berserker = () => (
  <BaseChibi bodyColor="#78350F" headColor="#FCD34D"
    helmet={<g><path d="M25 30 C25 0 75 0 75 30 Z" fill="#1E293B"/><polygon points="35,15 40,0 45,15" fill="#E2E8F0"/><polygon points="65,15 60,0 55,15" fill="#E2E8F0"/></g>}
    face={<g><circle cx="40" cy="42" r="4" fill="#DC2626"/><circle cx="60" cy="42" r="4" fill="#DC2626"/></g>} />
);
const Mage = () => (
  <BaseChibi bodyColor="#4C1D95" headColor="#FCD34D"
    helmet={<polygon points="20,35 50,0 80,35" fill="#5B21B6"/>}
    accessory={<g><rect x="85" y="40" width="4" height="60" fill="#78350F"/><circle cx="87" cy="35" r="10" fill="#38BDF8" className="pet-pulse"/></g>} />
);
const Spartan = () => (
  <BaseChibi bodyColor="#94A3B8" headColor="#94A3B8"
    helmet={<g><rect x="30" y="15" width="40" height="35" rx="5" fill="#B45309"/><rect x="45" y="30" width="10" height="20" fill="#FCD34D"/><path d="M50 15 Q50 -10 80 5 Q50 5 30 15" fill="#DC2626"/></g>}
    accessory={<circle cx="20" cy="70" r="25" fill="#B45309"/>} />
);
const Guardian = () => (
  <BaseChibi bodyColor="#FBBF24" headColor="#FBBF24"
    helmet={<rect x="35" y="15" width="30" height="35" rx="5" fill="#FCD34D"/>}
    face={<rect x="45" y="30" width="10" height="15" fill="#FFF"/>} />
);
const Sentinel = () => (
  <BaseChibi bodyColor="#1E293B" headColor="#1E293B"
    helmet={<polygon points="50,10 70,35 30,35" fill="#38BDF8"/>}
    accessory={<rect x="85" y="20" width="6" height="70" fill="#38BDF8" className="pet-pulse"/>} />
);

// ─── 📖 BIBLE HEROES (49-60) ────────────────────────────────────────────────
const David = () => (
  <BaseChibi bodyColor="#D97706" headColor="#FCD34D"
    hair={<path d="M25 40 C25 10 75 10 75 40" fill="#78350F"/>}
    accessory={<path d="M70 80 Q85 95 95 70" stroke="#78350F" strokeWidth="4" fill="none"/>} />
);
const Joseph = () => (
  <BaseChibi bodyColor="#EF4444" headColor="#FCD34D"
    hair={<path d="M30 40 C30 20 70 20 70 40" fill="#451A03"/>}
    accessory={<g><path d="M30 65 L50 90 L70 65 Z" fill="#F59E0B"/><path d="M40 90 L50 65 L60 90 Z" fill="#3B82F6"/></g>} />
);
const Esther = () => (
  <BaseChibi bodyColor="#A855F7" headColor="#FCD34D"
    hair={<path d="M25 40 C25 20 75 20 75 50" fill="#000"/>}
    helmet={<polygon points="30,20 40,30 50,10 60,30 70,20 65,35 35,35" fill="#FBBF24"/>} />
);
const Daniel = () => (
  <BaseChibi bodyColor="#0284C7" headColor="#FCD34D"
    hair={<path d="M30 40 C30 20 70 20 70 40" fill="#000"/>}
    accessory={<g><circle cx="85" cy="75" r="25" fill="#F59E0B"/><circle cx="85" cy="75" r="15" fill="#B45309"/></g>} />
);
const Noah = () => (
  <BaseChibi bodyColor="#8B5CF6" headColor="#FCD34D"
    hair={<path d="M25 50 Q50 80 75 50" fill="#E2E8F0"/>}
    accessory={<path d="M10 80 Q50 110 90 80 L80 70 Q50 95 20 70 Z" fill="#78350F"/>} />
);
const Samson = () => (
  <BaseChibi bodyColor="#FCD34D" headColor="#FCD34D"
    hair={<path d="M20 40 Q50 -10 80 40 Q65 60 50 65 Q35 60 20 40 Z" fill="#451A03"/>}
    accessory={<g><rect x="5" y="30" width="15" height="70" fill="#CBD5E1"/><rect x="80" y="30" width="15" height="70" fill="#CBD5E1"/></g>} />
);
const Paul = () => (
  <BaseChibi bodyColor="#166534" headColor="#FCD34D"
    hair={<path d="M35 50 Q50 70 65 50" fill="#451A03"/>}
    accessory={<rect x="75" y="60" width="15" height="40" fill="#FEF3C7"/>} />
);
const Moses = () => (
  <BaseChibi bodyColor="#B45309" headColor="#FCD34D"
    hair={<path d="M20 45 Q50 85 80 45" fill="#E2E8F0"/>}
    accessory={<g><rect x="15" y="20" width="6" height="80" fill="#78350F"/><path d="M-10 90 Q15 50 25 95" fill="#38BDF8" opacity="0.8"/><path d="M110 90 Q85 50 75 95" fill="#38BDF8" opacity="0.8"/></g>} />
);
const Abraham = () => (
  <BaseChibi bodyColor="#475569" headColor="#FCD34D"
    hair={<path d="M25 45 Q50 80 75 45" fill="#F1F5F9"/>}
    accessory={<g><circle cx="15" cy="20" r="4" fill="#FDE047" className="pet-pulse"/><circle cx="85" cy="30" r="3" fill="#FDE047" className="pet-pulse"/></g>} />
);
const Joshua = () => (
  <BaseChibi bodyColor="#991B1B" headColor="#FCD34D"
    hair={<path d="M30 40 C30 20 70 20 70 40" fill="#000"/>}
    accessory={<path d="M70 65 Q105 40 90 15 Q80 10 75 25" fill="#FCD34D"/>} />
);
const Elijah = () => (
  <BaseChibi bodyColor="#B45309" headColor="#FCD34D"
    hair={<path d="M25 45 Q50 75 75 45" fill="#E2E8F0"/>}
    accessory={<g><path d="M5 80 Q50 20 95 80" stroke="#EA580C" strokeWidth="12" fill="none" className="pet-pulse"/><path d="M15 90 Q50 40 85 90" stroke="#FDE047" strokeWidth="6" fill="none" className="pet-pulse"/></g>} />
);
const Jesus = () => (
  <BaseChibi bodyColor="#FFFFFF" headColor="#FCD34D"
    hair={<path d="M25 40 Q50 90 75 40" fill="#78350F"/>}
    accessory={<g><circle cx="50" cy="50" r="48" fill="none" stroke="rgba(253,224,71,0.5)" strokeWidth="4" className="pet-pulse"/><path d="M40 60 L60 60 L50 95 Z" fill="#EF4444"/><ellipse cx="50" cy="65" rx="8" ry="6" fill="#FCD34D"/></g>} />
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
          {/* Universal Shadow */}
          <ellipse cx="50" cy="98" rx="30" ry="6" fill="rgba(0,0,0,0.25)"/>
          <PetComp/>
        </svg>
      </div>
    </div>
  );
}
