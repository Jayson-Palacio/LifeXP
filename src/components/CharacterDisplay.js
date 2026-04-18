'use client';
import { PETS } from '../lib/character';

const BEHAVIOR_CLASS = {
  bounce:'pet-bounce',sway:'pet-sway',hop:'pet-hop',wobble:'pet-wobble',
  strut:'pet-sway',waddle:'pet-wobble',flap:'pet-float',float:'pet-float',
  flip:'pet-flip',stomp:'pet-bounce',guard:'pet-pulse',pulse:'pet-pulse',howl:'pet-sway'
};

// ─── SHARED HELPERS ──────────────────────────────────────────────────────────
// Shiny eye pair — the #1 trick to make characters feel alive
const Eye = ({ cx, cy, r=7, iris="#1E293B", irisR }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="white"/>
    <circle cx={cx} cy={cy} r={irisR||r*0.65} fill={iris}/>
    <circle cx={cx+r*0.25} cy={cy-r*0.3} r={r*0.22} fill="rgba(255,255,255,0.9)"/>
    <circle cx={cx-r*0.15} cy={cy-r*0.1} r={r*0.1} fill="rgba(255,255,255,0.5)"/>
  </g>
);

// ─── 🐾 ANIMALS ─────────────────────────────────────────────────────────────

const Pup = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pup-head" cx="40%" cy="35%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#B45309"/></radialGradient>
      <radialGradient id="pup-snout" cx="40%" cy="30%"><stop offset="0%" stopColor="#FEF3C7"/><stop offset="100%" stopColor="#FDE68A"/></radialGradient>
      <radialGradient id="pup-ear" cx="40%" cy="30%"><stop offset="0%" stopColor="#D97706"/><stop offset="100%" stopColor="#92400E"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Floppy ears with gradient */}
    <ellipse cx="20" cy="54" rx="15" ry="24" fill="url(#pup-ear)" transform="rotate(12 20 54)"/>
    <ellipse cx="80" cy="54" rx="15" ry="24" fill="url(#pup-ear)" transform="rotate(-12 80 54)"/>
    {/* Body */}
    <ellipse cx="50" cy="82" rx="22" ry="16" fill="url(#pup-head)"/>
    {/* Head */}
    <circle cx="50" cy="46" r="33" fill="url(#pup-head)"/>
    {/* Inner ear detail */}
    <ellipse cx="20" cy="54" rx="7" ry="16" fill="#FBBF24" opacity="0.5" transform="rotate(12 20 54)"/>
    <ellipse cx="80" cy="54" rx="7" ry="16" fill="#FBBF24" opacity="0.5" transform="rotate(-12 80 54)"/>
    {/* Snout */}
    <ellipse cx="50" cy="58" rx="17" ry="14" fill="url(#pup-snout)"/>
    {/* Nose — wet and shiny */}
    <ellipse cx="50" cy="52" rx="8" ry="6" fill="#0F172A"/>
    <ellipse cx="47" cy="50" rx="3" ry="2" fill="rgba(255,255,255,0.45)"/>
    {/* Eyes */}
    <Eye cx={36} cy={40} r={8} iris="#1E293B"/>
    <Eye cx={64} cy={40} r={8} iris="#1E293B"/>
    {/* Smile + tongue */}
    <path d="M41 64 Q50 73 59 64" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
    <ellipse cx="50" cy="70" rx="6" ry="5" fill="#EF4444"/>
    <path d="M44 70 Q50 68 56 70" fill="none" stroke="#DC2626" strokeWidth="1.5"/>
    {/* Head highlight */}
    <ellipse cx="40" cy="32" rx="10" ry="7" fill="rgba(255,255,255,0.18)" transform="rotate(-20 40 32)"/>
  </svg>
);

const Kitty = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="kt-head" cx="40%" cy="35%"><stop offset="0%" stopColor="#475569"/><stop offset="100%" stopColor="#1E293B"/></radialGradient>
      <radialGradient id="kt-eye" cx="30%" cy="30%"><stop offset="0%" stopColor="#6EE7B7"/><stop offset="100%" stopColor="#059669"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Tail */}
    <path d="M72 88 Q96 78 92 52 Q90 40 80 44" fill="none" stroke="#334155" strokeWidth="9" strokeLinecap="round"/>
    <path d="M72 88 Q94 78 90 54 Q88 44 80 46" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round"/>
    {/* Body */}
    <ellipse cx="46" cy="82" rx="22" ry="16" fill="url(#kt-head)"/>
    <ellipse cx="46" cy="84" rx="12" ry="8" fill="#334155"/>
    {/* Ears */}
    <polygon points="22,30 14,6 42,26" fill="#334155"/>
    <polygon points="25,28 18,10 38,24" fill="#FDA4AF"/>
    <polygon points="78,30 86,6 58,26" fill="#334155"/>
    <polygon points="75,28 82,10 62,24" fill="#FDA4AF"/>
    {/* Head */}
    <circle cx="50" cy="50" r="34" fill="url(#kt-head)"/>
    {/* Eyes — big green cat eyes */}
    <ellipse cx="36" cy="46" rx="10" ry="13" fill="url(#kt-eye)"/>
    <ellipse cx="64" cy="46" rx="10" ry="13" fill="url(#kt-eye)"/>
    <ellipse cx="36" cy="46" rx="5" ry="10" fill="#0F172A"/>
    <ellipse cx="64" cy="46" rx="5" ry="10" fill="#0F172A"/>
    <ellipse cx="33" cy="42" rx="2.5" ry="4" fill="rgba(255,255,255,0.8)"/>
    <ellipse cx="61" cy="42" rx="2.5" ry="4" fill="rgba(255,255,255,0.8)"/>
    {/* Nose */}
    <path d="M47 58 L50 54 L53 58 Z" fill="#F472B6"/>
    {/* Whiskers */}
    {[55,60,65].map(y=><line key={y} x1="8" y1={y} x2="36" y2={58+(y-60)*0.4} stroke="#94A3B8" strokeWidth="1.5" opacity="0.7"/>)}
    {[55,60,65].map(y=><line key={y} x1="92" y1={y} x2="64" y2={58+(y-60)*0.4} stroke="#94A3B8" strokeWidth="1.5" opacity="0.7"/>)}
    <ellipse cx="38" cy="36" rx="8" ry="5" fill="rgba(255,255,255,0.12)" transform="rotate(-15 38 36)"/>
  </svg>
);

const Bunny = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bn-body" cx="40%" cy="30%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="100%" stopColor="#CBD5E1"/></radialGradient>
      <linearGradient id="bn-ear" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E2E8F0"/><stop offset="100%" stopColor="#F1F5F9"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Fluffy tail */}
    <circle cx="74" cy="84" r="9" fill="url(#bn-body)"/>
    <circle cx="74" cy="83" r="6" fill="white"/>
    {/* Body */}
    <ellipse cx="47" cy="80" rx="23" ry="19" fill="url(#bn-body)"/>
    {/* Tall ears */}
    <ellipse cx="33" cy="18" rx="11" ry="30" fill="url(#bn-ear)"/>
    <ellipse cx="33" cy="18" rx="6" ry="26" fill="#FDA4AF"/>
    <ellipse cx="67" cy="18" rx="11" ry="30" fill="url(#bn-ear)"/>
    <ellipse cx="67" cy="18" rx="6" ry="26" fill="#FDA4AF"/>
    {/* Ear highlight */}
    <ellipse cx="30" cy="12" rx="2" ry="8" fill="rgba(255,255,255,0.4)"/>
    <ellipse cx="64" cy="12" rx="2" ry="8" fill="rgba(255,255,255,0.4)"/>
    {/* Head */}
    <circle cx="50" cy="55" r="30" fill="url(#bn-body)"/>
    {/* Cheeks rosy */}
    <circle cx="30" cy="60" r="8" fill="#FDA4AF" opacity="0.4"/>
    <circle cx="70" cy="60" r="8" fill="#FDA4AF" opacity="0.4"/>
    {/* Eyes */}
    <Eye cx={38} cy={50} r={8} iris="#EC4899" irisR={5}/>
    <Eye cx={62} cy={50} r={8} iris="#EC4899" irisR={5}/>
    {/* Nose */}
    <path d="M46 60 L50 56 L54 60 Z" fill="#F472B6"/>
    <ellipse cx="50" cy="62" rx="5" ry="4" fill="#F472B6"/>
    {/* Mouth */}
    <path d="M44 65 Q50 70 56 65" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="36" cy="40" rx="10" ry="6" fill="rgba(255,255,255,0.3)" transform="rotate(-20 36 40)"/>
  </svg>
);

const Fox = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="fx-body" cx="35%" cy="30%"><stop offset="0%" stopColor="#F97316"/><stop offset="100%" stopColor="#B45309"/></radialGradient>
      <radialGradient id="fx-tail" cx="30%" cy="20%"><stop offset="0%" stopColor="#EA580C"/><stop offset="100%" stopColor="#7C2D12"/></radialGradient>
    </defs>
    <ellipse cx="46" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Big fluffy tail */}
    <path d="M64 80 Q96 60 92 90 Q78 100 60 90 Z" fill="url(#fx-tail)"/>
    <path d="M66 82 Q92 65 88 88 Q76 96 64 88 Z" fill="#FEF3C7"/>
    {/* Body */}
    <ellipse cx="44" cy="80" rx="22" ry="18" fill="url(#fx-body)"/>
    <ellipse cx="44" cy="83" rx="13" ry="10" fill="#FEF3C7"/>
    {/* Sharp pointed ears */}
    <polygon points="26,30 16,4 42,22" fill="url(#fx-body)"/>
    <polygon points="29,27 22,9 38,20" fill="#FDA4AF"/>
    <polygon points="72,30 82,4 58,22" fill="url(#fx-body)"/>
    <polygon points="69,27 78,9 62,20" fill="#FDA4AF"/>
    {/* Head */}
    <circle cx="48" cy="44" r="30" fill="url(#fx-body)"/>
    {/* White face mask */}
    <path d="M30 52 Q48 74 66 52 Q58 65 48 67 Q38 65 30 52 Z" fill="#FEF3C7"/>
    {/* Snout */}
    <ellipse cx="48" cy="56" rx="12" ry="9" fill="#FEF3C7"/>
    {/* Nose wet */}
    <ellipse cx="48" cy="51" rx="7" ry="5" fill="#1E293B"/>
    <ellipse cx="45" cy="49" rx="2.5" ry="1.8" fill="rgba(255,255,255,0.5)"/>
    {/* Eyes amber */}
    <Eye cx={35} cy={38} r={8} iris="#B45309"/>
    <Eye cx={61} cy={38} r={8} iris="#B45309"/>
    <ellipse cx="36" cy="30" rx="9" ry="6" fill="rgba(255,255,255,0.18)" transform="rotate(-20 36 30)"/>
  </svg>
);

const Bear = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="br-fur" cx="35%" cy="30%"><stop offset="0%" stopColor="#A16207"/><stop offset="100%" stopColor="#78350F"/></radialGradient>
      <radialGradient id="br-snout" cx="40%" cy="30%"><stop offset="0%" stopColor="#D97706"/><stop offset="100%" stopColor="#B45309"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="30" ry="5" fill="rgba(0,0,0,0.3)"/>
    <ellipse cx="50" cy="83" rx="28" ry="20" fill="url(#br-fur)"/>
    {/* Round ears */}
    <circle cx="22" cy="26" r="16" fill="url(#br-fur)"/>
    <circle cx="78" cy="26" r="16" fill="url(#br-fur)"/>
    <circle cx="22" cy="26" r="10" fill="url(#br-snout)"/>
    <circle cx="78" cy="26" r="10" fill="url(#br-snout)"/>
    {/* Head */}
    <circle cx="50" cy="48" r="35" fill="url(#br-fur)"/>
    {/* Snout big */}
    <ellipse cx="50" cy="62" rx="20" ry="15" fill="url(#br-snout)"/>
    {/* Nose detailed */}
    <path d="M41 56 Q50 52 59 56 Q55 64 50 66 Q45 64 41 56 Z" fill="#1E293B"/>
    <ellipse cx="46" cy="55" rx="4" ry="2.5" fill="rgba(255,255,255,0.4)"/>
    {/* Mouth */}
    <path d="M44 68 Q50 74 56 68" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="50" y1="68" x2="50" y2="72" stroke="#92400E" strokeWidth="2"/>
    {/* Eyes */}
    <Eye cx={34} cy={42} r={9} iris="#1E293B"/>
    <Eye cx={66} cy={42} r={9} iris="#1E293B"/>
    <ellipse cx="36" cy="32" rx="12" ry="7" fill="rgba(255,255,255,0.18)" transform="rotate(-15 36 32)"/>
  </svg>
);

const Wolf = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="wf-fur" cx="35%" cy="30%"><stop offset="0%" stopColor="#64748B"/><stop offset="100%" stopColor="#1E293B"/></radialGradient>
      <linearGradient id="wf-muzzle" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#CBD5E1"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.3)"/>
    {/* Tail arc up */}
    <path d="M70 80 Q94 62 86 38 Q84 30 76 34" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round"/>
    <path d="M70 80 Q92 64 84 40 Q82 33 76 37" fill="none" stroke="#475569" strokeWidth="7" strokeLinecap="round"/>
    <ellipse cx="76" cy="35" rx="8" ry="8" fill="#94A3B8"/>
    {/* Body */}
    <ellipse cx="46" cy="80" rx="22" ry="17" fill="url(#wf-fur)"/>
    {/* Pointed ears */}
    <polygon points="22,28 12,2 44,18" fill="url(#wf-fur)"/>
    <polygon points="26,25 18,8 38,18" fill="#64748B"/>
    <polygon points="78,28 88,2 56,18" fill="url(#wf-fur)"/>
    <polygon points="74,25 82,8 62,18" fill="#64748B"/>
    {/* Head */}
    <circle cx="50" cy="46" r="32" fill="url(#wf-fur)"/>
    {/* Muzzle angular */}
    <path d="M32 52 Q50 74 68 52 Q62 62 50 64 Q38 62 32 52 Z" fill="url(#wf-muzzle)"/>
    {/* Nose */}
    <ellipse cx="50" cy="54" rx="7" ry="5" fill="#0F172A"/>
    <ellipse cx="47" cy="52" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.5)"/>
    {/* Eyes — icy electric blue */}
    <Eye cx={36} cy={40} r={9} iris="#0EA5E9"/>
    <Eye cx={64} cy={40} r={9} iris="#0EA5E9"/>
    <ellipse cx="38" cy="30" rx="10" ry="6" fill="rgba(255,255,255,0.15)" transform="rotate(-20 38 30)"/>
  </svg>
);

const Lion = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ln-mane" cx="50%" cy="50%"><stop offset="0%" stopColor="#B45309"/><stop offset="100%" stopColor="#451A03"/></radialGradient>
      <radialGradient id="ln-face" cx="38%" cy="32%"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#D97706"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.3)"/>
    {/* Mane */}
    <circle cx="50" cy="50" r="45" fill="url(#ln-mane)"/>
    {/* Mane texture — layered petals */}
    {[0,36,72,108,144,180,216,252,288,324].map(a=>{
      const r=a*Math.PI/180;
      return <ellipse key={a} cx={50+38*Math.sin(r)} cy={50+38*Math.cos(r)} rx="10" ry="16" fill="#92400E" opacity="0.6" transform={`rotate(${a} ${50+38*Math.sin(r)} ${50+38*Math.cos(r)})`}/>;
    })}
    {/* Body */}
    <ellipse cx="50" cy="82" rx="20" ry="14" fill="url(#ln-face)"/>
    {/* Face */}
    <circle cx="50" cy="48" r="30" fill="url(#ln-face)"/>
    {/* Cheek tufts */}
    <ellipse cx="20" cy="58" rx="9" ry="11" fill="#D97706" opacity="0.6"/>
    <ellipse cx="80" cy="58" rx="9" ry="11" fill="#D97706" opacity="0.6"/>
    {/* Muzzle wide */}
    <ellipse cx="50" cy="60" rx="18" ry="13" fill="#FEF3C7"/>
    {/* Wide flat nose */}
    <path d="M40 54 Q50 49 60 54 Q58 62 50 64 Q42 62 40 54 Z" fill="#1E293B"/>
    <ellipse cx="45" cy="52" rx="4" ry="2" fill="rgba(255,255,255,0.4)"/>
    {/* Mouth */}
    <line x1="50" y1="64" x2="50" y2="68" stroke="#92400E" strokeWidth="2"/>
    <path d="M42 68 Q50 74 58 68" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Eyes golden */}
    <Eye cx={36} cy={43} r={9} iris="#CA8A04"/>
    <Eye cx={64} cy={43} r={9} iris="#CA8A04"/>
    <ellipse cx="38" cy="32" rx="12" ry="7" fill="rgba(255,255,255,0.2)" transform="rotate(-15 38 32)"/>
  </svg>
);

const Eagle = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="eg-wing" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#78350F"/><stop offset="100%" stopColor="#292524"/></linearGradient>
      <radialGradient id="eg-head" cx="40%" cy="35%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="100%" stopColor="#E2E8F0"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Wings spread dramatic */}
    <path d="M50 56 Q22 38 3 60 Q8 44 16 38 Q30 32 50 46 Z" fill="url(#eg-wing)"/>
    <path d="M50 56 Q78 38 97 60 Q92 44 84 38 Q70 32 50 46 Z" fill="url(#eg-wing)"/>
    {/* Wing feather tips */}
    {[12,24,36].map((x,i)=><path key={i} d={`M${x} ${62-i*3} Q${x-4} ${74-i} ${x+2} ${76-i}`} fill="#1C1917" opacity="0.7"/>)}
    {[88,76,64].map((x,i)=><path key={i} d={`M${x} ${62-i*3} Q${x+4} ${74-i} ${x-2} ${76-i}`} fill="#1C1917" opacity="0.7"/>)}
    {/* Body */}
    <ellipse cx="50" cy="72" rx="18" ry="22" fill="url(#eg-wing)"/>
    {/* White chest */}
    <ellipse cx="50" cy="75" rx="10" ry="14" fill="#E2E8F0"/>
    {/* Head white */}
    <circle cx="50" cy="40" r="26" fill="url(#eg-head)"/>
    {/* Hooked beak — signature eagle feature */}
    <path d="M38 52 Q64 52 56 64 Q50 72 44 64 Q38 56 38 52 Z" fill="#F59E0B"/>
    <path d="M40 52 Q62 52 55 64 Q50 70 46 65 Q40 58 40 52 Z" fill="#D97706"/>
    <ellipse cx="44" cy="66" rx="2" ry="3" fill="#B45309"/>
    {/* Eyes fierce yellow */}
    <Eye cx={36} cy={38} r={9} iris="#CA8A04"/>
    <Eye cx={64} cy={38} r={9} iris="#CA8A04"/>
    {/* Brow ridge angry */}
    <path d="M27 30 Q36 26 43 31" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round"/>
    <path d="M57 31 Q64 26 73 30" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="38" cy="30" rx="10" ry="6" fill="rgba(255,255,255,0.3)" transform="rotate(-15 38 30)"/>
  </svg>
);

const Panther = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pt-body" cx="35%" cy="30%"><stop offset="0%" stopColor="#1E293B"/><stop offset="100%" stopColor="#020617"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.4)"/>
    {/* Tail sleek */}
    <path d="M67 82 Q90 68 88 44 Q87 36 80 40" fill="none" stroke="#0F172A" strokeWidth="11" strokeLinecap="round"/>
    <path d="M67 82 Q88 70 86 46 Q85 38 80 43" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="80" cy="41" r="7" fill="#1E293B"/>
    {/* Body */}
    <ellipse cx="44" cy="80" rx="22" ry="17" fill="url(#pt-body)"/>
    {/* Sleek pointed ears */}
    <polygon points="23,26 14,2 42,18" fill="url(#pt-body)"/>
    <polygon points="26,24 20,8 36,18" fill="#1E293B"/>
    <polygon points="77,26 86,2 58,18" fill="url(#pt-body)"/>
    <polygon points="74,24 80,8 64,18" fill="#1E293B"/>
    {/* Head */}
    <circle cx="50" cy="46" r="32" fill="url(#pt-body)"/>
    {/* Faint rosette spots */}
    <circle cx="34" cy="38" r="5" fill="rgba(30,41,59,0.0)" stroke="#334155" strokeWidth="1.5"/>
    <circle cx="66" cy="38" r="4" fill="rgba(30,41,59,0.0)" stroke="#334155" strokeWidth="1.5"/>
    <circle cx="50" cy="30" r="4" fill="rgba(30,41,59,0.0)" stroke="#334155" strokeWidth="1"/>
    {/* Glowing yellow-green eyes */}
    <circle cx="35" cy="44" r="11" fill="#FDE047"/>
    <circle cx="65" cy="44" r="11" fill="#FDE047"/>
    <ellipse cx="35" cy="44" rx="5" ry="8" fill="#0F172A"/>
    <ellipse cx="65" cy="44" rx="5" ry="8" fill="#0F172A"/>
    <ellipse cx="32" cy="40" rx="2" ry="4" fill="rgba(255,255,255,0.6)"/>
    <ellipse cx="62" cy="40" rx="2" ry="4" fill="rgba(255,255,255,0.6)"/>
    {/* Subtle nose */}
    <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#1E293B"/>
    <ellipse cx="48" cy="57" rx="2" ry="1.2" fill="rgba(255,255,255,0.3)"/>
    {/* Head sheen */}
    <ellipse cx="36" cy="32" rx="12" ry="7" fill="rgba(100,116,139,0.15)" transform="rotate(-20 36 32)"/>
  </svg>
);

const Panda = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pd-head" cx="40%" cy="35%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="100%" stopColor="#E2E8F0"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="30" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Body */}
    <ellipse cx="50" cy="82" rx="27" ry="19" fill="url(#pd-head)"/>
    {/* Black belly patch */}
    <ellipse cx="50" cy="85" rx="16" ry="12" fill="#0F172A"/>
    {/* Black ears */}
    <circle cx="22" cy="24" r="17" fill="#0F172A"/>
    <circle cx="78" cy="24" r="17" fill="#0F172A"/>
    <circle cx="22" cy="24" r="10" fill="#1E293B"/>
    <circle cx="78" cy="24" r="10" fill="#1E293B"/>
    {/* Head white */}
    <circle cx="50" cy="50" r="34" fill="url(#pd-head)"/>
    {/* Iconic black eye patches */}
    <ellipse cx="32" cy="43" rx="14" ry="12" fill="#0F172A" transform="rotate(-20 32 43)"/>
    <ellipse cx="68" cy="43" rx="14" ry="12" fill="#0F172A" transform="rotate(20 68 43)"/>
    {/* Eyes inside patches */}
    <Eye cx={33} cy={44} r={8} iris="#1E293B"/>
    <Eye cx={67} cy={44} r={8} iris="#1E293B"/>
    {/* Chubby snout */}
    <ellipse cx="50" cy="62" rx="14" ry="11" fill="#F1F5F9"/>
    <ellipse cx="50" cy="57" rx="6" ry="4.5" fill="#0F172A"/>
    <ellipse cx="47" cy="56" rx="2" ry="1.5" fill="rgba(255,255,255,0.4)"/>
    {/* Mouth happy */}
    <path d="M44 65 Q50 71 56 65" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Cheeks blush */}
    <circle cx="24" cy="60" r="7" fill="#FDA4AF" opacity="0.35"/>
    <circle cx="76" cy="60" r="7" fill="#FDA4AF" opacity="0.35"/>
    <ellipse cx="38" cy="36" rx="10" ry="6" fill="rgba(255,255,255,0.4)" transform="rotate(-15 38 36)"/>
  </svg>
);

// ─── DINOS ──────────────────────────────────────────────────────────────────

const Trike = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="tk-head" cx="40%" cy="35%"><stop offset="0%" stopColor="#FCD34D"/><stop offset="100%" stopColor="#D97706"/></radialGradient>
      <radialGradient id="tk-frill" cx="50%" cy="40%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#92400E"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="30" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Bony frill — most iconic feature */}
    <path d="M8 32 Q50 0 92 32 Q72 52 50 50 Q28 52 8 32 Z" fill="url(#tk-frill)"/>
    {/* Frill scallop detail */}
    {[15,28,42,58,72,85].map((x,i)=><ellipse key={i} cx={x} cy={20+Math.abs(i-2.5)*4} rx="6" ry="8" fill="#B45309" opacity="0.3"/>)}
    {/* Frill highlight */}
    <path d="M20 34 Q50 8 80 34 Q60 44 50 44 Q40 44 20 34 Z" fill="#FBBF24" opacity="0.25"/>
    {/* Three horns — THE feature */}
    <path d="M50 14 L46 38 L54 38 Z" fill="ivory"/>
    <path d="M50 16 L47 36 L53 36 Z" fill="white" opacity="0.6"/>
    <path d="M28 28 L22 54 L34 52 Z" fill="ivory"/>
    <path d="M72 28 L78 54 L66 52 Z" fill="ivory"/>
    {/* Horn shadows for depth */}
    <path d="M30 30 L24 52 L30 50 Z" fill="rgba(0,0,0,0.15)"/>
    <path d="M70 30 L76 52 L70 50 Z" fill="rgba(0,0,0,0.15)"/>
    {/* Head */}
    <ellipse cx="50" cy="66" rx="34" ry="26" fill="url(#tk-head)"/>
    {/* Beak */}
    <ellipse cx="50" cy="76" rx="14" ry="10" fill="#D97706"/>
    {/* Nostrils */}
    <circle cx="44" cy="74" r="3.5" fill="#B45309"/>
    <circle cx="56" cy="74" r="3.5" fill="#B45309"/>
    <circle cx="43" cy="73" r="1.5" fill="rgba(0,0,0,0.3)"/>
    <circle cx="55" cy="73" r="1.5" fill="rgba(0,0,0,0.3)"/>
    {/* Eyes */}
    <Eye cx={30} cy={58} r={9} iris="#1E293B"/>
    <Eye cx={70} cy={58} r={9} iris="#1E293B"/>
    <ellipse cx="36" cy="48" rx="14" ry="8" fill="rgba(255,255,255,0.2)" transform="rotate(-10 36 48)"/>
  </svg>
);

const Raptor = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rp-body" cx="35%" cy="30%"><stop offset="0%" stopColor="#2DD4BF"/><stop offset="100%" stopColor="#0F766E"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Counterbalance tail */}
    <path d="M26 72 Q4 60 6 34 Q8 24 16 28" fill="none" stroke="#0F766E" strokeWidth="14" strokeLinecap="round"/>
    <path d="M26 72 Q6 62 8 36 Q10 26 16 30" fill="none" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round"/>
    {/* Body lean forward */}
    <ellipse cx="50" cy="70" rx="24" ry="30" fill="url(#rp-body)" transform="rotate(-15 50 70)"/>
    {/* Belly lighter */}
    <ellipse cx="52" cy="72" rx="12" ry="20" fill="#5EEAD4" opacity="0.6" transform="rotate(-15 52 72)"/>
    {/* Scale pattern */}
    <path d="M36 60 Q50 56 64 60 Q50 68 36 60 Z" fill="#0D9488" opacity="0.4"/>
    {/* Tiny arms */}
    <path d="M35 56 Q18 50 16 62" stroke="#0F766E" strokeWidth="8" strokeLinecap="round" fill="none"/>
    <path d="M16 62 L12 68 M16 62 L20 68" stroke="#0F766E" strokeWidth="4" strokeLinecap="round"/>
    {/* Neck + head at forward angle */}
    <ellipse cx="68" cy="38" rx="22" ry="28" fill="url(#rp-body)" transform="rotate(25 68 38)"/>
    {/* Snout long */}
    <ellipse cx="82" cy="28" rx="20" ry="10" fill="url(#rp-body)" transform="rotate(20 82 28)"/>
    {/* Teeth */}
    <path d="M68 24 L72 17 L76 24 L80 17 L84 24 L88 18" fill="none" stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Eye — slit pupil */}
    <circle cx="74" cy="30" r="7" fill="#FDE047"/>
    <ellipse cx="74" cy="30" rx="3" ry="5.5" fill="#0F172A"/>
    <ellipse cx="72" cy="28" rx="1.5" ry="2.5" fill="rgba(255,255,255,0.7)"/>
    {/* Leg with killing claw */}
    <path d="M52 88 Q56 100 48 100" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" fill="none"/>
    <path d="M52 88 L44 96" stroke="#0F766E" strokeWidth="6" strokeLinecap="round"/>
    <path d="M44 96 L38 106" stroke="#0F766E" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

const Ptero = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pr-wing" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#3730A3"/></linearGradient>
      <radialGradient id="pr-mem" cx="50%" cy="0%"><stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#4F46E5"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="22" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Wings — large membrane with finger bones */}
    <path d="M50 52 Q16 24 2 52 Q18 68 50 60 Z" fill="url(#pr-wing)"/>
    <path d="M50 52 Q84 24 98 52 Q82 68 50 60 Z" fill="url(#pr-wing)"/>
    {/* Wing membrane highlights */}
    <path d="M50 52 Q20 30 7 52 Q20 62 50 57 Z" fill="url(#pr-mem)" opacity="0.5"/>
    <path d="M50 52 Q80 30 93 52 Q80 62 50 57 Z" fill="url(#pr-mem)" opacity="0.5"/>
    {/* Finger bones — wing structure lines */}
    <line x1="50" y1="52" x2="8" y2="36" stroke="#3730A3" strokeWidth="2.5" opacity="0.6"/>
    <line x1="50" y1="52" x2="14" y2="24" stroke="#3730A3" strokeWidth="2" opacity="0.5"/>
    <line x1="50" y1="52" x2="92" y2="36" stroke="#3730A3" strokeWidth="2.5" opacity="0.6"/>
    <line x1="50" y1="52" x2="86" y2="24" stroke="#3730A3" strokeWidth="2" opacity="0.5"/>
    {/* Body */}
    <ellipse cx="50" cy="60" rx="12" ry="20" fill="#4F46E5"/>
    {/* Head crest spike */}
    <polygon points="50,18 42,38 58,38" fill="#C7D2FE"/>
    <polygon points="50,20 44,36 56,36" fill="#E0E7FF" opacity="0.7"/>
    {/* Head */}
    <ellipse cx="50" cy="44" rx="16" ry="19" fill="#6366F1"/>
    {/* Long dramatic beak */}
    <polygon points="28,50 72,50 50,88" fill="#FDE047"/>
    <polygon points="32,50 68,50 50,80" fill="#FBBF24"/>
    {/* Edge of beak */}
    <path d="M32 50 L50 76 L68 50" fill="none" stroke="#CA8A04" strokeWidth="1.5"/>
    <Eye cx={38} cy={41} r={6} iris="#1E293B"/>
    <Eye cx={62} cy={41} r={6} iris="#1E293B"/>
    <ellipse cx="42" cy="31" rx="8" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-15 42 31)"/>
  </svg>
);

const Stego = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sg-body" cx="40%" cy="35%"><stop offset="0%" stopColor="#65A30D"/><stop offset="100%" stopColor="#365314"/></radialGradient>
      <linearGradient id="sg-plate" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FB923C"/><stop offset="100%" stopColor="#C2410C"/></linearGradient>
    </defs>
    <ellipse cx="48" cy="96" rx="34" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Spiked tail */}
    <path d="M80 78 Q96 68 98 54 Q96 46 90 52" fill="none" stroke="url(#sg-body)" strokeWidth="12" strokeLinecap="round"/>
    <polygon points="90,50 100,44 98,56" fill="ivory"/>
    <polygon points="94,44 102,38 102,50" fill="ivory"/>
    {/* Body low and wide */}
    <ellipse cx="48" cy="76" rx="40" ry="22" fill="url(#sg-body)"/>
    {/* Belly lighter */}
    <ellipse cx="48" cy="80" rx="28" ry="14" fill="#86EFAC" opacity="0.3"/>
    {/* Scale pattern on back */}
    {[22,36,50,64,78].map((x,i)=><ellipse key={i} cx={x} cy={68-Math.abs(i-2)*3} rx="8" ry="5" fill="#3F6212" opacity="0.5"/>)}
    {/* Dorsal plates — dramatic bone plates */}
    <path d="M22 68 Q24 44 30 36" fill="none" stroke="url(#sg-plate)" strokeWidth="14" strokeLinecap="round"/>
    <path d="M24 68 Q26 46 32 38" fill="none" stroke="#FED7AA" strokeWidth="5" strokeLinecap="round" opacity="0.4"/>
    <path d="M36 66 Q40 40 46 30" fill="none" stroke="url(#sg-plate)" strokeWidth="16" strokeLinecap="round"/>
    <path d="M38 66 Q42 42 48 32" fill="none" stroke="#FED7AA" strokeWidth="6" strokeLinecap="round" opacity="0.4"/>
    <path d="M52 66 Q56 42 62 34" fill="none" stroke="url(#sg-plate)" strokeWidth="14" strokeLinecap="round"/>
    <path d="M66 68 Q68 48 72 42" fill="none" stroke="url(#sg-plate)" strokeWidth="11" strokeLinecap="round"/>
    {/* Head tiny relative to body */}
    <ellipse cx="16" cy="72" rx="18" ry="13" fill="url(#sg-body)"/>
    <ellipse cx="8" cy="72" rx="10" ry="7" fill="#4D7C0F"/>
    <Eye cx={12} cy={69} r={5} iris="#1E293B"/>
    {/* Legs */}
    <rect x="24" y="88" width="12" height="10" rx="4" fill="#3F6212"/>
    <rect x="50" y="88" width="12" height="10" rx="4" fill="#3F6212"/>
    <rect x="68" y="88" width="12" height="10" rx="4" fill="#3F6212"/>
  </svg>
);

const Ankylo = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ak-shell" cx="40%" cy="30%"><stop offset="0%" stopColor="#D97706"/><stop offset="100%" stopColor="#78350F"/></radialGradient>
    </defs>
    <ellipse cx="48" cy="96" rx="36" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Club tail */}
    <path d="M80 76 Q96 66 98 52" fill="none" stroke="#92400E" strokeWidth="12" strokeLinecap="round"/>
    <circle cx="98" cy="50" r="13" fill="#78350F"/>
    <circle cx="98" cy="50" r="9" fill="#92400E"/>
    {/* Spikes on tail */}
    <polygon points="94,42 100,34 102,44" fill="ivory" opacity="0.9"/>
    {/* Main body — walking tank */}
    <ellipse cx="46" cy="72" rx="42" ry="24" fill="url(#ak-shell)"/>
    {/* Armor dome texture */}
    {[[24,62],[38,58],[52,56],[66,58],[78,62],[30,72],[44,70],[58,70],[72,72]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r={8-i*0.3} fill="#B45309" opacity="0.5"/>
    ))}
    {/* Spine rows of spikes */}
    {[22,34,46,58,70].map((x,i)=><polygon key={i} points={`${x},${58-Math.abs(i-2)*4} ${x-4},${48-Math.abs(i-2)*4} ${x+4},${48-Math.abs(i-2)*4}`} fill="#FEF3C7"/>) }
    {/* Shell highlight */}
    <ellipse cx="40" cy="62" rx="20" ry="12" fill="rgba(254,243,199,0.2)" transform="rotate(-10 40 62)"/>
    {/* Small head */}
    <ellipse cx="12" cy="72" rx="16" ry="12" fill="url(#ak-shell)"/>
    <Eye cx={6} cy={70} r={5} iris="#1E293B"/>
    {/* Beak */}
    <path d="M2 72 Q-2 78 4 80 Q10 78 10 72 Z" fill="#D97706"/>
    {/* Legs */}
    <rect x="20" y="88" width="14" height="10" rx="5" fill="#92400E"/>
    <rect x="48" y="88" width="14" height="10" rx="5" fill="#92400E"/>
    <rect x="66" y="88" width="14" height="10" rx="5" fill="#92400E"/>
  </svg>
);

const Rex = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rx-body" cx="35%" cy="30%"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#065F46"/></radialGradient>
      <linearGradient id="rx-jaw" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#059669"/><stop offset="100%" stopColor="#047857"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Tail balance */}
    <path d="M68 80 Q90 70 88 44" fill="none" stroke="#065F46" strokeWidth="14" strokeLinecap="round"/>
    <path d="M68 80 Q89 71 87 46" fill="none" stroke="#10B981" strokeWidth="8" strokeLinecap="round"/>
    {/* Body */}
    <ellipse cx="48" cy="74" rx="24" ry="20" fill="url(#rx-body)"/>
    {/* ICONIC TINY ARMS */}
    <path d="M34 58 Q18 55 16 66 Q18 70 22 68" stroke="#047857" strokeWidth="10" strokeLinecap="round" fill="none"/>
    <path d="M22 68 L16 73 M22 68 L24 74" stroke="#047857" strokeWidth="4" strokeLinecap="round"/>
    {/* Massive head */}
    <ellipse cx="50" cy="40" rx="34" ry="28" fill="url(#rx-body)"/>
    {/* Upper jaw */}
    <rect x="24" y="52" width="52" height="14" rx="5" fill="#059669"/>
    {/* Massive lower jaw */}
    <rect x="22" y="63" width="56" height="22" rx="10" fill="url(#rx-jaw)"/>
    {/* Teeth rows — sharply defined */}
    <polygon points="28,63 32,54 36,63" fill="#F0FDF4"/>
    <polygon points="38,63 42,54 46,63" fill="#F0FDF4"/>
    <polygon points="50,63 54,50 58,63" fill="#F0FDF4"/>
    <polygon points="62,63 66,52 70,63" fill="#F0FDF4"/>
    {/* Lower teeth */}
    <polygon points="30,85 34,76 38,85" fill="#D1FAE5" opacity="0.8"/>
    <polygon points="44,85 48,74 52,85" fill="#D1FAE5" opacity="0.8"/>
    <polygon points="58,85 62,76 66,85" fill="#D1FAE5" opacity="0.8"/>
    {/* Tiny malevolent eyes */}
    <Eye cx={34} cy={34} r={10} iris="#FDE047"/>
    <Eye cx={66} cy={34} r={10} iris="#FDE047"/>
    {/* Brow ridge */}
    <path d="M24 26 Q34 22 42 28" fill="#047857" opacity="0.8"/>
    <path d="M76 26 Q66 22 58 28" fill="#047857" opacity="0.8"/>
    {/* Scale pattern on back */}
    <ellipse cx="36" cy="22" rx="14" ry="8" fill="rgba(255,255,255,0.15)" transform="rotate(-10 36 22)"/>
  </svg>
);

const Spino = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sp-body" cx="35%" cy="30%"><stop offset="0%" stopColor="#FB7185"/><stop offset="100%" stopColor="#9F1239"/></radialGradient>
      <linearGradient id="sp-sail" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F43F5E"/><stop offset="50%" stopColor="#FB7185"/><stop offset="100%" stopColor="#E11D48"/></linearGradient>
    </defs>
    <ellipse cx="46" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Tail */}
    <path d="M72 80 Q92 72 96 50" fill="none" stroke="url(#sp-body)" strokeWidth="14" strokeLinecap="round"/>
    {/* Body */}
    <ellipse cx="46" cy="74" rx="32" ry="20" fill="url(#sp-body)"/>
    {/* THE SAIL — most iconic feature, dramatic */}
    <path d="M28 66 Q24 20 50 6 Q76 20 74 66" fill="url(#sp-sail)"/>
    <path d="M32 66 Q28 25 50 12 Q72 25 70 66" fill="#FE9CAD" opacity="0.4"/>
    {/* Sail spine bones */}
    <line x1="38" y1="66" x2="44" y2="14" stroke="#BE123C" strokeWidth="2.5" opacity="0.6"/>
    <line x1="50" y1="66" x2="52" y2="8" stroke="#BE123C" strokeWidth="2.5" opacity="0.6"/>
    <line x1="62" y1="66" x2="58" y2="14" stroke="#BE123C" strokeWidth="2.5" opacity="0.6"/>
    {/* Head side-facing */}
    <ellipse cx="22" cy="62" rx="24" ry="17" fill="url(#sp-body)"/>
    {/* Long crocodilian snout */}
    <ellipse cx="7" cy="67" rx="15" ry="8" fill="#BE123C"/>
    {/* Teeth crocodile */}
    <polygon points="2,64 6,57 10,64" fill="ivory"/>
    <polygon points="12,64 16,57 20,64" fill="ivory"/>
    {/* Lower teeth */}
    <polygon points="5,72 8,79 12,72" fill="ivory" opacity="0.7"/>
    {/* Eye reptile */}
    <circle cx="18" cy="58" r="6" fill="#FDE047"/>
    <ellipse cx="18" cy="58" rx="2.5" ry="5" fill="#0F172A"/>
    <ellipse cx="16" cy="56" rx="1.2" ry="2.5" fill="rgba(255,255,255,0.7)"/>
    {/* Legs */}
    <rect x="36" y="86" width="12" height="10" rx="4" fill="#9F1239"/>
    <rect x="56" y="86" width="12" height="10" rx="4" fill="#9F1239"/>
  </svg>
);

const Griffin = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gf-lion" cx="35%" cy="30%"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#B45309"/></radialGradient>
      <linearGradient id="gf-wing" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#DC2626"/><stop offset="100%" stopColor="#7F1D1D"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="30" ry="5" fill="rgba(0,0,0,0.3)"/>
    {/* Lion hindquarters */}
    <ellipse cx="64" cy="78" rx="28" ry="18" fill="url(#gf-lion)"/>
    {/* Lion tail with tuft */}
    <path d="M90 74 Q100 58 96 40" fill="none" stroke="#D97706" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="95" cy="37" r="10" fill="#92400E"/>
    {/* Dramatic eagle wings */}
    <path d="M46 50 Q16 26 2 54 Q16 68 46 60 Z" fill="url(#gf-wing)"/>
    <path d="M46 50 Q76 26 90 54 Q76 64 46 58 Z" fill="url(#gf-wing)"/>
    {/* Wing feathers */}
    <path d="M46 50 Q22 34 8 54 Q20 60 46 55 Z" fill="#EF4444" opacity="0.5"/>
    <path d="M46 50 Q70 34 88 54 Q76 58 46 55 Z" fill="#EF4444" opacity="0.5"/>
    {/* Eagle head + white */}
    <circle cx="36" cy="36" r="26" fill="#FFFFFF"/>
    {/* Golden eagle eye ring */}
    <circle cx="30" cy="34" r="10" fill="#FCD34D"/>
    <Eye cx={30} cy={34} r={6} iris="#1E293B"/>
    {/* Powerful hooked beak */}
    <path d="M18 42 L54 42 Q46 60 36 64 Q28 60 18 42 Z" fill="#F59E0B"/>
    <path d="M22 42 L50 42 Q44 58 36 62 Q30 58 22 42 Z" fill="#D97706"/>
    {/* Wing highlight */}
    <ellipse cx="22" cy="48" rx="12" ry="6" fill="rgba(255,255,255,0.15)" transform="rotate(-25 22 48)"/>
  </svg>
);

const Dragon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="drg-body" cx="35%" cy="30%"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#052E16"/></radialGradient>
      <linearGradient id="drg-wing" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#065F46"/><stop offset="100%" stopColor="#022C22"/></linearGradient>
      <radialGradient id="drg-fire" cx="50%" cy="0%"><stop offset="0%" stopColor="#FDE047"/><stop offset="50%" stopColor="#EA580C"/><stop offset="100%" stopColor="#7C2D12"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.3)"/>
    {/* Tail barbed */}
    <path d="M70 80 Q90 68 88 44 Q86 34 80 38" fill="none" stroke="#065F46" strokeWidth="12" strokeLinecap="round"/>
    <polygon points="80,38 90,30 84,44" fill="#34D399"/>
    {/* Wings leathery */}
    <path d="M38 44 Q10 18 3 46 Q18 60 40 54 Z" fill="url(#drg-wing)"/>
    <path d="M62 44 Q90 18 97 46 Q82 60 60 54 Z" fill="url(#drg-wing)"/>
    <path d="M40 44 Q14 24 8 46 Q20 56 42 51 Z" fill="#10B981" opacity="0.3"/>
    <path d="M60 44 Q86 24 92 46 Q80 54 58 51 Z" fill="#10B981" opacity="0.3"/>
    {/* Body */}
    <ellipse cx="50" cy="74" rx="22" ry="20" fill="url(#drg-body)"/>
    {/* Scale texture */}
    {[[42,68],[54,66],[46,78],[58,76]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="7" ry="5" fill="#047857" opacity="0.6"/>)}
    {/* Horns impressive */}
    <path d="M32 16 Q26 0 30 -2 Q36 2 36 18 Z" fill="#052E16"/>
    <path d="M68 16 Q74 0 70 -2 Q64 2 64 18 Z" fill="#052E16"/>
    {/* Head */}
    <ellipse cx="50" cy="36" rx="30" ry="26" fill="url(#drg-body)"/>
    {/* Scale ridges on head */}
    <path d="M30 28 Q50 22 70 28" fill="#10B981" opacity="0.4"/>
    {/* Jaw with fire */}
    <ellipse cx="50" cy="50" rx="22" ry="12" fill="#047857"/>
    <ellipse cx="50" cy="56" rx="18" ry="10" fill="#065F46"/>
    {/* Fire breath! */}
    <path d="M38 60 Q50 78 62 60 Q54 92 50 98 Q46 92 38 60 Z" fill="url(#drg-fire)"/>
    <path d="M42 62 Q50 76 58 62 Q52 86 50 90 Q48 86 42 62 Z" fill="#FDE047" opacity="0.8"/>
    {/* Fang */}
    <polygon points="42,60 46,52 50,60" fill="ivory"/>
    {/* Eyes slit glow */}
    <circle cx="36" cy="30" r="8" fill="#FDE047"/>
    <ellipse cx="36" cy="30" rx="3.5" ry="6" fill="#0F172A"/>
    <circle cx="64" cy="30" r="8" fill="#FDE047"/>
    <ellipse cx="64" cy="30" rx="3.5" ry="6" fill="#0F172A"/>
    <ellipse cx="34" cy="27" rx="1.5" ry="3" fill="rgba(255,255,255,0.6)"/>
    <ellipse cx="62" cy="27" rx="1.5" ry="3" fill="rgba(255,255,255,0.6)"/>
  </svg>
);

const Phoenix = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ph-body" cx="40%" cy="35%"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#EA580C"/></radialGradient>
      <linearGradient id="ph-tail" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#7C2D12" stopOpacity="0"/></linearGradient>
      <radialGradient id="ph-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(251,191,36,0.5)"/><stop offset="100%" stopColor="rgba(234,88,12,0)"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="24" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Rebirth glow aura */}
    <circle cx="50" cy="48" r="46" fill="url(#ph-glow)"/>
    {/* Tail fire streams */}
    <path d="M30 74 Q18 92 10 104" stroke="url(#ph-tail)" strokeWidth="8" strokeLinecap="round" fill="none"/>
    <path d="M36 76 Q26 94 20 106" stroke="url(#ph-tail)" strokeWidth="6" strokeLinecap="round" fill="none"/>
    <path d="M50 78 Q50 96 50 108" stroke="url(#ph-tail)" strokeWidth="9" strokeLinecap="round" fill="none"/>
    <path d="M64 76 Q74 94 80 106" stroke="url(#ph-tail)" strokeWidth="6" strokeLinecap="round" fill="none"/>
    <path d="M70 74 Q82 92 90 104" stroke="url(#ph-tail)" strokeWidth="8" strokeLinecap="round" fill="none"/>
    {/* Grand wings */}
    <path d="M50 54 Q16 26 2 54 Q20 72 50 62 Z" fill="#EA580C"/>
    <path d="M50 54 Q84 26 98 54 Q80 72 50 62 Z" fill="#EA580C"/>
    <path d="M50 54 Q20 34 8 54 Q24 66 50 58 Z" fill="#FDE047" opacity="0.6"/>
    <path d="M50 54 Q80 34 92 54 Q76 66 50 58 Z" fill="#FDE047" opacity="0.6"/>
    {/* Crest tall & fiery */}
    <path d="M38 28 Q40 8 50 2 Q60 8 62 28" fill="#FDE047"/>
    <path d="M42 28 Q44 12 50 6 Q56 12 58 28" fill="#FEF3C7" opacity="0.6"/>
    {/* Body */}
    <ellipse cx="50" cy="58" rx="18" ry="20" fill="url(#ph-body)"/>
    {/* Head */}
    <circle cx="50" cy="38" r="20" fill="url(#ph-body)"/>
    {/* Golden beak */}
    <polygon points="34,47 66,47 50,72" fill="#FCD34D"/>
    <polygon points="38,47 62,47 50,66" fill="#FBBF24"/>
    {/* Eye — blazing */}
    <Eye cx={38} cy={36} r={7} iris="#DC2626"/>
    <Eye cx={62} cy={36} r={7} iris="#DC2626"/>
    <ellipse cx="40" cy="26" rx="10" ry="6" fill="rgba(255,255,255,0.25)" transform="rotate(-20 40 26)"/>
  </svg>
);

// ─── TECH ────────────────────────────────────────────────────────────────────

const Sparkbot = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sb-body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient>
      <radialGradient id="sb-screen" cx="50%" cy="50%"><stop offset="0%" stopColor="#0F172A"/><stop offset="100%" stopColor="#020617"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Legs */}
    <rect x="28" y="80" width="16" height="18" rx="6" fill="#CBD5E1"/>
    <rect x="56" y="80" width="16" height="18" rx="6" fill="#CBD5E1"/>
    {/* Feet */}
    <rect x="24" y="92" width="22" height="8" rx="5" fill="#94A3B8"/>
    <rect x="54" y="92" width="22" height="8" rx="5" fill="#94A3B8"/>
    {/* Body box */}
    <rect x="18" y="52" width="64" height="32" rx="10" fill="url(#sb-body)"/>
    {/* Body panel */}
    <rect x="26" y="58" width="48" height="20" rx="5" fill="#E2E8F0"/>
    {/* Arms */}
    <rect x="3" y="58" width="18" height="8" rx="5" fill="#94A3B8"/>
    <rect x="79" y="58" width="18" height="8" rx="5" fill="#94A3B8"/>
    {/* Hands */}
    <circle cx="5" cy="62" r="6" fill="#64748B"/>
    <circle cx="95" cy="62" r="6" fill="#64748B"/>
    {/* Antenna */}
    <line x1="50" y1="15" x2="50" y2="32" stroke="#64748B" strokeWidth="4"/>
    <circle cx="50" cy="12" r="7" fill="#38BDF8"/>
    <circle cx="50" cy="12" r="4" fill="#BAE6FD"/>
    <circle cx="48" cy="10" r="1.5" fill="rgba(255,255,255,0.8)"/>
    {/* Head box */}
    <rect x="16" y="20" width="68" height="38" rx="12" fill="url(#sb-body)"/>
    {/* Face screen */}
    <rect x="24" y="26" width="52" height="26" rx="8" fill="url(#sb-screen)"/>
    {/* Big round LED eyes */}
    <circle cx="37" cy="38" r="9" fill="#38BDF8"/>
    <circle cx="63" cy="38" r="9" fill="#38BDF8"/>
    <circle cx="37" cy="38" r="5" fill="#0EA5E9"/>
    <circle cx="63" cy="38" r="5" fill="#0EA5E9"/>
    <circle cx="35" cy="36" r="2.5" fill="rgba(255,255,255,0.85)"/>
    <circle cx="61" cy="36" r="2.5" fill="rgba(255,255,255,0.85)"/>
    {/* LED smile */}
    <path d="M34 47 Q50 56 66 47" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round"/>
    {/* Metal highlight */}
    <ellipse cx="36" cy="24" rx="14" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-5 36 24)"/>
  </svg>
);

const Gear = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gr-outer" cx="40%" cy="35%"><stop offset="0%" stopColor="#64748B"/><stop offset="100%" stopColor="#1E293B"/></radialGradient>
      <radialGradient id="gr-core" cx="40%" cy="35%"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#0284C7"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Outer gear */}
    <circle cx="50" cy="48" r="44" fill="url(#gr-outer)"/>
    {/* Gear teeth */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>{
      const rad=a*Math.PI/180;
      const x=50+42*Math.sin(rad), y=48+42*Math.cos(rad);
      return <rect key={a} x={x-7} y={y-9} width="14" height="18" rx="3" fill="#475569" transform={`rotate(${a} ${x} ${y})`}/>;
    })}
    {/* Metal ring */}
    <circle cx="50" cy="48" r="34" fill="#0F172A"/>
    <circle cx="50" cy="48" r="30" fill="#1E293B"/>
    {/* Inner machinery details */}
    {[0,60,120,180,240,300].map(a=>{
      const rad=a*Math.PI/180;
      return <line key={a} x1={50} y1={48} x2={50+24*Math.sin(rad)} y2={48+24*Math.cos(rad)} stroke="#334155" strokeWidth="3"/>;
    })}
    <circle cx="50" cy="48" r="18" fill="#334155"/>
    {/* Core glow */}
    <circle cx="50" cy="48" r="13" fill="url(#gr-core)"/>
    <circle cx="50" cy="48" r="7" fill="#7DD3FC"/>
    <circle cx="50" cy="48" r="4" fill="white" opacity="0.9"/>
    <circle cx="47" cy="45" r="1.5" fill="rgba(255,255,255,1)"/>
    {/* Ray shine on gear face */}
    <ellipse cx="36" cy="32" rx="10" ry="6" fill="rgba(255,255,255,0.12)" transform="rotate(-30 36 32)"/>
  </svg>
);

const Astro = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="as-suit" cx="40%" cy="30%"><stop offset="0%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></radialGradient>
      <radialGradient id="as-visor" cx="40%" cy="30%"><stop offset="0%" stopColor="#1E3A5F"/><stop offset="100%" stopColor="#0C1F3A"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.25)"/>
    {/* Stars */}
    {[[10,12,3],[82,8,4],[92,25,2],[5,35,2.5],[88,45,2]].map(([x,y,r])=><circle key={x} cx={x} cy={y} r={r} fill="#FDE047" opacity="0.9"/>)}
    {/* Body suit */}
    <ellipse cx="50" cy="78" rx="24" ry="20" fill="url(#as-suit)"/>
    {/* Life support backpack */}
    <rect x="60" y="72" width="16" height="22" rx="5" fill="#CBD5E1"/>
    <circle cx="68" cy="76" r="5" fill="#38BDF8"/>
    {/* Control panel on chest */}
    <rect x="38" y="72" width="22" height="16" rx="4" fill="#64748B"/>
    <circle cx="44" cy="76" r="3" fill="#EF4444"/>
    <circle cx="52" cy="76" r="3" fill="#10B981"/>
    <rect x="41" y="82" width="16" height="3" rx="2" fill="#38BDF8"/>
    {/* Gloves */}
    <circle cx="20" cy="80" r="9" fill="#CBD5E1"/>
    <circle cx="80" cy="80" r="9" fill="#CBD5E1"/>
    <circle cx="19" cy="78" r="5" fill="#E2E8F0"/>
    <circle cx="79" cy="78" r="5" fill="#E2E8F0"/>
    {/* Boots */}
    <ellipse cx="36" cy="94" rx="12" ry="6" fill="#64748B"/>
    <ellipse cx="64" cy="94" rx="12" ry="6" fill="#64748B"/>
    {/* Helmet dome large */}
    <circle cx="50" cy="44" r="34" fill="url(#as-suit)"/>
    <circle cx="50" cy="44" r="29" fill="url(#as-suit)"/>
    {/* Gold trim ring */}
    <circle cx="50" cy="44" r="34" fill="none" stroke="#FBBF24" strokeWidth="3"/>
    {/* Visor large */}
    <ellipse cx="50" cy="46" rx="24" ry="22" fill="url(#as-visor)"/>
    {/* Stars reflected in visor */}
    <circle cx="42" cy="38" r="1.5" fill="rgba(255,255,255,0.4)"/>
    <circle cx="62" cy="42" r="1" fill="rgba(255,255,255,0.4)"/>
    {/* Visor shine */}
    <ellipse cx="36" cy="34" rx="10" ry="7" fill="rgba(255,255,255,0.15)" transform="rotate(-20 36 34)"/>
    {/* Face inside helmet */}
    <circle cx="50" cy="46" r="14" fill="#FCD34D"/>
    <Eye cx={44} cy={44} r={5} iris="#1E293B"/>
    <Eye cx={56} cy={44} r={5} iris="#1E293B"/>
    <path d="M45 51 Q50 56 55 51" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Zap = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="zp-bolt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FEF08A"/><stop offset="100%" stopColor="#CA8A04"/></linearGradient>
      <radialGradient id="zp-glow" cx="50%" cy="30%"><stop offset="0%" stopColor="rgba(250,204,21,0.6)"/><stop offset="100%" stopColor="rgba(234,179,8,0)"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="22" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Speed lines */}
    <path d="M5 48 Q20 44 35 52" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
    <path d="M2 60 Q18 56 32 62" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35"/>
    <path d="M8 72 Q22 68 36 74" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.25"/>
    {/* Glow halo */}
    <ellipse cx="55" cy="48" rx="36" ry="44" fill="url(#zp-glow)"/>
    {/* Main lightning bolt — sharp zigzag */}
    <polygon points="65,4 32,52 54,50 35,98 79,42 55,44" fill="url(#zp-bolt)"/>
    {/* Highlight edge */}
    <polygon points="63,8 34,50 52,48 38,90 74,46 52,46" fill="#FEF9C3" opacity="0.6"/>
    {/* Inner bright core streak */}
    <polygon points="62,14 40,48 54,46 44,82 70,48 52,46" fill="rgba(255,255,255,0.5)"/>
    {/* Face inside bolt */}
    <circle cx="54" cy="30" r="12" fill="#FCD34D"/>
    <Eye cx={49} cy={29} r={4.5} iris="#1E293B"/>
    <Eye cx={59} cy={27} r={4.5} iris="#1E293B"/>
    <path d="M48 35 Q54 40 60 36" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Mechatron = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mch-body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#1E1B4B"/></linearGradient>
      <linearGradient id="mch-armor" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4338CA"/><stop offset="100%" stopColor="#1E1B4B"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="32" ry="5" fill="rgba(0,0,0,0.35)"/>
    {/* Legs heavy */}
    <rect x="24" y="76" width="20" height="22" rx="5" fill="#1E1B4B"/>
    <rect x="56" y="76" width="20" height="22" rx="5" fill="#1E1B4B"/>
    {/* Boot rockets */}
    <ellipse cx="34" cy="98" rx="12" ry="4" fill="#3730A3"/>
    <ellipse cx="66" cy="98" rx="12" ry="4" fill="#3730A3"/>
    {/* Body */}
    <rect x="16" y="44" width="68" height="36" rx="8" fill="url(#mch-body)"/>
    {/* Chest reactor core */}
    <ellipse cx="50" cy="62" rx="16" ry="14" fill="#1E1B4B"/>
    <circle cx="50" cy="62" r="10" fill="#0EA5E9" opacity="0.9"/>
    <circle cx="50" cy="62" r="6" fill="#7DD3FC"/>
    <circle cx="50" cy="62" r="3" fill="white"/>
    {/* Ribs / armor grooves */}
    <line x1="20" y1="54" x2="34" y2="54" stroke="#4338CA" strokeWidth="3"/>
    <line x1="66" y1="54" x2="80" y2="54" stroke="#4338CA" strokeWidth="3"/>
    <line x1="20" y1="62" x2="32" y2="62" stroke="#4338CA" strokeWidth="2"/>
    <line x1="68" y1="62" x2="80" y2="62" stroke="#4338CA" strokeWidth="2"/>
    {/* Shoulder cannons */}
    <rect x="0" y="36" width="20" height="28" rx="6" fill="url(#mch-armor)"/>
    <ellipse cx="10" cy="38" rx="8" ry="5" fill="#EF4444" opacity="0.9"/>
    <rect x="80" y="36" width="20" height="28" rx="6" fill="url(#mch-armor)"/>
    <ellipse cx="90" cy="38" rx="8" ry="5" fill="#EF4444" opacity="0.9"/>
    {/* Arms */}
    <rect x="0" y="60" width="20" height="20" rx="5" fill="#1E1B4B"/>
    <rect x="80" y="60" width="20" height="20" rx="5" fill="#1E1B4B"/>
    {/* Head angular */}
    <rect x="22" y="12" width="56" height="36" rx="8" fill="url(#mch-armor)"/>
    {/* Head panel detail */}
    <rect x="28" y="18" width="44" height="24" rx="6" fill="#1E1B4B"/>
    {/* Eye visor strip — scanning */}
    <rect x="30" y="24" width="40" height="10" rx="4" fill="#FDE047"/>
    <rect x="32" y="26" width="36" height="6" rx="3" fill="#FBBF24" opacity="0.6"/>
    {/* Side vents */}
    <rect x="22" y="22" width="6" height="16" rx="3" fill="#312E81"/>
    <rect x="72" y="22" width="6" height="16" rx="3" fill="#312E81"/>
    {/* Antenna */}
    <line x1="36" y1="12" x2="34" y2="2" stroke="#94A3B8" strokeWidth="3"/>
    <circle cx="34" cy="1" r="3.5" fill="#EF4444"/>
    <line x1="64" y1="12" x2="66" y2="2" stroke="#94A3B8" strokeWidth="3"/>
    <circle cx="66" cy="1" r="3.5" fill="#EF4444"/>
    <ellipse cx="36" cy="16" rx="12" ry="4" fill="rgba(255,255,255,0.1)"/>
  </svg>
);

const Plasma = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pl-core" cx="35%" cy="30%"><stop offset="0%" stopColor="#E879F9"/><stop offset="100%" stopColor="#6B21A8"/></radialGradient>
      <radialGradient id="pl-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(192,132,252,0.5)"/><stop offset="100%" stopColor="rgba(109,40,217,0)"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="24" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Outer energy glow */}
    <circle cx="50" cy="48" r="47" fill="url(#pl-glow)"/>
    {/* Orbit rings */}
    <ellipse cx="50" cy="48" rx="44" ry="14" fill="none" stroke="#C084FC" strokeWidth="3" transform="rotate(35 50 48)"/>
    <ellipse cx="50" cy="48" rx="44" ry="14" fill="none" stroke="#A855F7" strokeWidth="2.5" transform="rotate(-35 50 48)"/>
    <ellipse cx="50" cy="48" rx="44" ry="12" fill="none" stroke="#7C3AED" strokeWidth="2" transform="rotate(80 50 48)"/>
    {/* Orbiting particles */}
    <circle cx="94" cy="48" r="5" fill="#FDE047"/>
    <circle cx="6" cy="48" r="4" fill="#38BDF8"/>
    <circle cx="50" cy="4" r="4" fill="#F0ABFC"/>
    {/* Sphere body */}
    <circle cx="50" cy="48" r="26" fill="url(#pl-core)"/>
    {/* Sphere depth shading */}
    <ellipse cx="44" cy="40" rx="14" ry="10" fill="rgba(255,255,255,0.2)" transform="rotate(-20 44 40)"/>
    {/* Inner bright core */}
    <circle cx="50" cy="48" r="14" fill="#F0ABFC"/>
    <circle cx="50" cy="48" r="8" fill="#FAE8FF"/>
    <circle cx="50" cy="48" r="4" fill="white" opacity="0.95"/>
    <circle cx="47" cy="45" r="2" fill="rgba(255,255,255,1)"/>
    {/* Energy lines */}
    <path d="M50 22 L50 74 M26 48 L74 48" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
  </svg>
);

const Zenith = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="zn-saucer" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#7DD3FC"/><stop offset="100%" stopColor="#0369A1"/></linearGradient>
      <radialGradient id="zn-dome" cx="40%" cy="30%"><stop offset="0%" stopColor="#E0F2FE"/><stop offset="100%" stopColor="#BAE6FD"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Tractor beam */}
    <path d="M34 82 L18 100 M50 84 L50 100 M66 82 L82 100" stroke="#38BDF8" strokeWidth="2" opacity="0.45"/>
    {/* Saucer bottom shadow edge */}
    <ellipse cx="50" cy="72" rx="46" ry="13" fill="#075985"/>
    {/* Saucer body */}
    <ellipse cx="50" cy="70" rx="44" ry="11" fill="url(#zn-saucer)"/>
    {/* Underside lights ring */}
    {[0,45,90,135,180,225,270,315].map(a=>{
      const rad=a*Math.PI/180;
      return <circle key={a} cx={50+38*Math.sin(rad)} cy={70+8*Math.cos(rad)*0.25} r={3} fill="#FDE047"/>;
    })}
    {/* Top dome */}
    <path d="M22 70 C22 24 78 24 78 70 Z" fill="url(#zn-dome)"/>
    <ellipse cx="50" cy="42" rx="26" ry="5" fill="rgba(255,255,255,0.2)"/>
    {/* Cockpit window */}
    <ellipse cx="50" cy="52" rx="16" ry="12" fill="#0C4A6E"/>
    <ellipse cx="50" cy="52" rx="12" ry="9" fill="#075985"/>
    {/* Pilot inside */}
    <circle cx="50" cy="51" r="7" fill="#FCD34D"/>
    <Eye cx={47} cy={50} r={3} iris="#1E293B"/>
    <Eye cx={53} cy={50} r={3} iris="#1E293B"/>
    <path d="M46 55 Q50 58 54 55" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
    {/* Dome highlight */}
    <ellipse cx="38" cy="36" rx="10" ry="7" fill="rgba(255,255,255,0.35)" transform="rotate(-20 38 36)"/>
  </svg>
);

const Titan = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tn-armor" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#57534E"/><stop offset="100%" stopColor="#1C1917"/></linearGradient>
      <linearGradient id="tn-dark" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#292524"/><stop offset="100%" stopColor="#0C0A09"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="97" rx="34" ry="5" fill="rgba(0,0,0,0.45)"/>
    {/* Massive boots */}
    <rect x="18" y="82" width="24" height="16" rx="5" fill="#1C1917"/>
    <rect x="58" y="82" width="24" height="16" rx="5" fill="#1C1917"/>
    <rect x="14" y="92" width="32" height="7" rx="4" fill="#0C0A09"/>
    <rect x="54" y="92" width="32" height="7" rx="4" fill="#0C0A09"/>
    {/* Legs */}
    <rect x="22" y="66" width="20" height="22" rx="5" fill="url(#tn-dark)"/>
    <rect x="58" y="66" width="20" height="22" rx="5" fill="url(#tn-dark)"/>
    {/* Body industrial */}
    <rect x="12" y="36" width="76" height="36" rx="6" fill="url(#tn-armor)"/>
    {/* Hazard chest stripes */}
    <rect x="20" y="50" width="60" height="14" rx="4" fill="#1C1917"/>
    {[24,34,44,54,64,74].map(x=><line key={x} x1={x} y1={50} x2={x+8} y2={64} stroke="#FDE047" strokeWidth="4" opacity="0.8"/>)}
    {/* Shoulder armor massive */}
    <rect x="0" y="24" width="18" height="38" rx="6" fill="url(#tn-dark)"/>
    <rect x="82" y="24" width="18" height="38" rx="6" fill="url(#tn-dark)"/>
    {/* Cannons */}
    <rect x="0" y="24" width="18" height="8" rx="4" fill="#EF4444" opacity="0.9"/>
    <rect x="82" y="24" width="18" height="8" rx="4" fill="#EF4444" opacity="0.9"/>
    {/* Arms */}
    <rect x="0" y="58" width="18" height="20" rx="5" fill="#292524"/>
    <rect x="82" y="58" width="18" height="20" rx="5" fill="#292524"/>
    {/* Fists */}
    <rect x="0" y="74" width="18" height="12" rx="5" fill="#1C1917"/>
    <rect x="82" y="74" width="18" height="12" rx="5" fill="#1C1917"/>
    {/* Head boxy industrial */}
    <rect x="20" y="6" width="60" height="34" rx="6" fill="url(#tn-armor)"/>
    {/* Red scanning visor */}
    <rect x="26" y="16" width="48" height="16" rx="5" fill="#EF4444"/>
    <rect x="28" y="18" width="44" height="12" rx="4" fill="#FCA5A5"/>
    <rect x="30" y="20" width="40" height="8" rx="3" fill="#FECACA"/>
    {/* Vent slits */}
    <rect x="22" y="10" width="8" height="22" rx="3" fill="#1C1917"/>
    <rect x="70" y="10" width="8" height="22" rx="3" fill="#1C1917"/>
    {/* Head highlight */}
    <ellipse cx="34" cy="10" rx="12" ry="4" fill="rgba(255,255,255,0.08)"/>
  </svg>
);

const Glitch = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* The glitched body — corrupted digital entity */}
    <rect x="18" y="15" width="64" height="72" fill="#0F172A"/>
    {/* Corruption tears — different screens underneath */}
    <rect x="0" y="32" width="24" height="10" fill="#10B981" opacity="0.85"/>
    <rect x="76" y="50" width="26" height="8" fill="#A855F7" opacity="0.85"/>
    <rect x="0" y="56" width="18" height="7" fill="#38BDF8" opacity="0.7"/>
    <rect x="82" y="36" width="20" height="6" fill="#FDE047" opacity="0.6"/>
    {/* Internal corrupted display */}
    <rect x="24" y="22" width="52" height="58" fill="#1E293B"/>
    {/* Pixel art asymmetric face */}
    <rect x="28" y="32" width="18" height="18" fill="#10B981"/>
    <rect x="30" y="34" width="14" height="14" fill="#064E3B"/>
    <rect x="32" y="36" width="10" height="10" fill="#34D399"/>
    <rect x="34" y="38" width="6" height="6" fill="white"/>
    <rect x="54" y="35" width="16" height="14" fill="#EF4444"/>
    <rect x="56" y="37" width="12" height="10" fill="#7F1D1D"/>
    <rect x="58" y="39" width="8" height="6" fill="#FECACA"/>
    <rect x="60" y="41" width="4" height="4" fill="white"/>
    {/* Glitch offset second eye */}
    <rect x="60" y="28" width="6" height="5" fill="#EF4444" opacity="0.6"/>
    {/* Scan line across face */}
    <rect x="22" y="52" width="56" height="3" fill="rgba(56,189,248,0.4)"/>
    {/* Mouth barcode */}
    <rect x="28" y="60" width="44" height="5" fill="#38BDF8"/>
    <rect x="32" y="56" width="4" height="13" fill="#0F172A"/>
    <rect x="42" y="56" width="4" height="13" fill="#0F172A"/>
    <rect x="52" y="56" width="4" height="13" fill="#0F172A"/>
    <rect x="62" y="56" width="4" height="13" fill="#0F172A"/>
    {/* Data packet sparks */}
    <circle cx="10" cy="40" r="3" fill="#10B981"/>
    <circle cx="90" cy="54" r="4" fill="#A855F7"/>
    <circle cx="88" cy="44" r="2" fill="#FDE047"/>
  </svg>
);

const Nova = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="nv-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(56,189,248,0.5)"/><stop offset="50%" stopColor="rgba(109,40,217,0.2)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/></radialGradient>
      <radialGradient id="nv-center" cx="40%" cy="35%"><stop offset="0%" stopColor="#1E1B4B"/><stop offset="100%" stopColor="#0F172A"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="26" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Nebula glow */}
    <circle cx="50" cy="48" r="48" fill="url(#nv-glow)"/>
    {/* Eight-point starburst */}
    <polygon points="50,2 56,44 50,96 44,44" fill="#FDE047" opacity="0.92"/>
    <polygon points="2,48 44,54 98,48 44,42" fill="#FDE047" opacity="0.92"/>
    <polygon points="16,16 46,46 84,82 54,52" fill="#38BDF8" opacity="0.85"/>
    <polygon points="84,16 54,46 16,82 46,52" fill="#C084FC" opacity="0.85"/>
    {/* Inner star clean */}
    <polygon points="50,12 54,44 50,90 46,44" fill="#FBBF24" opacity="0.7"/>
    <polygon points="12,48 44,52 88,48 44,44" fill="#FBBF24" opacity="0.7"/>
    {/* Central cosmic being */}
    <circle cx="50" cy="48" r="22" fill="url(#nv-center)"/>
    <circle cx="50" cy="48" r="17" fill="#1E1B4B"/>
    {/* Constellation face */}
    <circle cx="43" cy="45" r="5.5" fill="#FDE047"/>
    <circle cx="57" cy="45" r="5.5" fill="#FDE047"/>
    <ellipse cx="43" cy="45" rx="3" ry="4" fill="#0F172A"/>
    <ellipse cx="57" cy="45" rx="3" ry="4" fill="#0F172A"/>
    <ellipse cx="41" cy="43" rx="1.2" ry="2" fill="rgba(255,255,255,0.8)"/>
    <ellipse cx="55" cy="43" rx="1.2" ry="2" fill="rgba(255,255,255,0.8)"/>
    <path d="M44 53 Q50 58 56 53" fill="none" stroke="#FDE047" strokeWidth="2" strokeLinecap="round"/>
    {/* Tiny orbiting stars */}
    <circle cx="50" cy="26" r="3" fill="#F0ABFC"/>
    <circle cx="72" cy="48" r="3" fill="#67E8F9"/>
    <circle cx="28" cy="48" r="3" fill="#A5F3FC"/>
  </svg>
);

// ─── HEROES ──────────────────────────────────────────────────────────────────

const David = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="dv-skin" cx="40%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="100%" stopColor="#D97706"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Tunic body */}
    <path d="M26 56 L20 96 L80 96 L74 56 Z" fill="#92400E"/>
    <path d="M32 56 L50 72 L68 56 L50 64 Z" fill="#B45309"/>
    {/* Belt */}
    <rect x="24" y="72" width="52" height="7" rx="3" fill="#451A03"/>
    <rect x="44" y="72" width="12" height="7" fill="#78350F"/>
    {/* Sling arm raised — the defining feature */}
    <path d="M68 58 Q82 44 90 28" stroke="#D97706" strokeWidth="10" strokeLinecap="round" fill="none"/>
    <path d="M70 58 Q84 44 92 28" stroke="#FCD34D" strokeWidth="6" strokeLinecap="round" fill="none"/>
    {/* Sling pouch with stone */}
    <circle cx="92" cy="26" r="7" fill="#78350F"/>
    <circle cx="92" cy="26" r="4" fill="#94A3B8"/>
    {/* Other arm natural */}
    <path d="M32 58 Q18 56 14 68" stroke="#D97706" strokeWidth="9" strokeLinecap="round" fill="none"/>
    {/* Head */}
    <circle cx="50" cy="36" r="24" fill="url(#dv-skin)"/>
    {/* Brown curly hair */}
    <path d="M26 36 C26 14 74 14 74 36 Q68 24 50 24 Q32 24 26 36 Z" fill="#78350F"/>
    {/* Curls detail */}
    <circle cx="30" cy="30" r="5" fill="#92400E" opacity="0.5"/>
    <circle cx="70" cy="30" r="5" fill="#92400E" opacity="0.5"/>
    <Eye cx={40} cy={36} r={6} iris="#1E293B"/>
    <Eye cx={60} cy={36} r={6} iris="#1E293B"/>
    {/* Determined look brows */}
    <path d="M35 28 Q40 26 45 28" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M55 28 Q60 26 65 28" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M42 44 Q50 50 58 44" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="36" cy="26" rx="10" ry="6" fill="rgba(255,255,255,0.18)" transform="rotate(-15 36 26)"/>
  </svg>
);

const Shadow = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sh-gi" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1E293B"/><stop offset="100%" stopColor="#020617"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.35)"/>
    {/* Sword behind body */}
    <line x1="14" y1="24" x2="72" y2="88" stroke="#475569" strokeWidth="5" strokeLinecap="round"/>
    <polygon points="12,22 22,20 16,28" fill="#CBD5E1"/>
    <rect x="28" y="42" width="14" height="6" rx="2" fill="#78350F" transform="rotate(45 28 42)"/>
    {/* Dark body gi */}
    <path d="M28 54 L20 96 L80 96 L72 54 Z" fill="url(#sh-gi)"/>
    {/* Gi front wrap */}
    <path d="M30 54 L50 70 L70 54 L50 62 Z" fill="#0F172A"/>
    {/* Second sword on back */}
    <line x1="86" y1="24" x2="28" y2="88" stroke="#64748B" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
    {/* Head */}
    <circle cx="50" cy="36" r="26" fill="url(#sh-gi)"/>
    {/* Red headband — the only color pop */}
    <rect x="22" y="28" width="56" height="11" rx="5" fill="#DC2626"/>
    <rect x="24" y="30" width="52" height="7" rx="4" fill="#EF4444" opacity="0.5"/>
    {/* Headband knot/tail */}
    <rect x="68" y="26" width="18" height="8" rx="3" fill="#DC2626"/>
    {/* Mask covering lower face */}
    <ellipse cx="50" cy="50" rx="26" ry="11" fill="url(#sh-gi)"/>
    {/* Mask edge fold */}
    <path d="M24 50 Q50 60 76 50" fill="none" stroke="#1E293B" strokeWidth="2"/>
    {/* Eyes only — bright and fierce */}
    <circle cx="37" cy="38" r="8" fill="#FDE047"/>
    <circle cx="63" cy="38" r="8" fill="#FDE047"/>
    <ellipse cx="37" cy="38" rx="4" ry="6" fill="#0F172A"/>
    <ellipse cx="63" cy="38" rx="4" ry="6" fill="#0F172A"/>
    <ellipse cx="35" cy="35" rx="1.5" ry="2.5" fill="rgba(255,255,255,0.8)"/>
    <ellipse cx="61" cy="35" rx="1.5" ry="2.5" fill="rgba(255,255,255,0.8)"/>
    <ellipse cx="38" cy="28" rx="10" ry="5" fill="rgba(255,255,255,0.1)" transform="rotate(-10 38 28)"/>
  </svg>
);

const Samson = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sm-skin" cx="35%" cy="30%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#B45309"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="32" ry="5" fill="rgba(0,0,0,0.3)"/>
    {/* Stone pillars he's pushing */}
    <rect x="0" y="22" width="20" height="76" rx="3" fill="#CBD5E1"/>
    <rect x="0" y="22" width="20" height="6" rx="2" fill="#94A3B8"/>
    <rect x="80" y="22" width="20" height="76" rx="3" fill="#CBD5E1"/>
    <rect x="80" y="22" width="20" height="6" rx="2" fill="#94A3B8"/>
    {/* Crack in pillars */}
    <path d="M8 45 Q14 52 6 60 Q10 68 12 74" fill="none" stroke="#94A3B8" strokeWidth="2" opacity="0.7"/>
    <path d="M88 45 Q82 52 90 60 Q86 68 84 74" fill="none" stroke="#94A3B8" strokeWidth="2" opacity="0.7"/>
    {/* Powerful body */}
    <ellipse cx="50" cy="75" rx="28" ry="22" fill="url(#sm-skin)"/>
    {/* Muscle definition on body */}
    <path d="M36 65 Q50 74 64 65" fill="none" stroke="#B45309" strokeWidth="3" opacity="0.7"/>
    <path d="M36 75 Q50 82 64 75" fill="none" stroke="#B45309" strokeWidth="2" opacity="0.5"/>
    {/* Arms PUSHING pillars outward */}
    <path d="M32 60 Q18 54 18 44" stroke="url(#sm-skin)" strokeWidth="17" strokeLinecap="round" fill="none"/>
    <path d="M68 60 Q82 54 82 44" stroke="url(#sm-skin)" strokeWidth="17" strokeLinecap="round" fill="none"/>
    {/* Hands on pillars */}
    <circle cx="18" cy="43" r="10" fill="#D97706"/>
    <circle cx="82" cy="43" r="10" fill="#D97706"/>
    {/* Head */}
    <circle cx="50" cy="32" r="26" fill="url(#sm-skin)"/>
    {/* Long flowing hair — his power */}
    <path d="M24 32 Q18 58 20 90" fill="#451A03" opacity="1"/>
    <path d="M76 32 Q82 58 80 90" fill="#451A03"/>
    <path d="M26 32 C26 8 74 8 74 32 Q66 18 50 20 Q34 18 26 32 Z" fill="#451A03"/>
    <circle cx="50" cy="34" r="22" fill="url(#sm-skin)"/>
    <Eye cx={41} cy={30} r={6} iris="#1E293B"/>
    <Eye cx={59} cy={30} r={6} iris="#1E293B"/>
    {/* Strong jaw brow */}
    <path d="M35 24 Q40 20 46 24" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
    <path d="M54 24 Q60 20 65 24" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
    <path d="M42 38 Q50 45 58 38" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="36" cy="22" rx="10" ry="6" fill="rgba(255,255,255,0.2)" transform="rotate(-15 36 22)"/>
  </svg>
);

const Paul = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pl2-skin" cx="40%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="100%" stopColor="#B45309"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Scroll unrolled — defining feature */}
    <rect x="66" y="44" width="26" height="46" rx="4" fill="#FEF3C7"/>
    <rect x="63" y="40" width="32" height="9" rx="4" fill="#D97706"/>
    <rect x="63" y="81" width="32" height="9" rx="4" fill="#D97706"/>
    {/* Writing on scroll */}
    <line x1="70" y1="54" x2="88" y2="54" stroke="#92400E" strokeWidth="2"/>
    <line x1="70" y1="60" x2="88" y2="60" stroke="#92400E" strokeWidth="2"/>
    <line x1="70" y1="66" x2="84" y2="66" stroke="#92400E" strokeWidth="2"/>
    <line x1="70" y1="72" x2="88" y2="72" stroke="#92400E" strokeWidth="2"/>
    {/* Cross motif on scroll */}
    <rect x="74" y="56" width="4" height="16" rx="1" fill="#B45309" opacity="0.5"/>
    <rect x="70" y="61" width="12" height="4" rx="1" fill="#B45309" opacity="0.5"/>
    {/* Robe body */}
    <path d="M28 52 L20 96 L80 96 L72 52 Z" fill="#166534"/>
    <path d="M30 52 L50 68 L70 52 L50 60 Z" fill="#15803D"/>
    {/* Arm holding scroll */}
    <path d="M66 56 Q72 52 72 44" stroke="#D97706" strokeWidth="9" strokeLinecap="round" fill="none"/>
    {/* Other arm */}
    <path d="M34 56 Q20 52 16 64" stroke="#D97706" strokeWidth="9" strokeLinecap="round" fill="none"/>
    {/* Head — notable bald with beard */}
    <circle cx="44" cy="34" r="22" fill="url(#pl2-skin)"/>
    {/* Beard significant */}
    <path d="M22 38 Q26 64 44 68 Q62 64 66 38" fill="#451A03"/>
    <circle cx="44" cy="34" r="20" fill="url(#pl2-skin)"/>
    {/* Bald top with ring of hair */}
    <path d="M24 32 C24 18 64 18 64 32" fill="#78350F"/>
    <circle cx="44" cy="34" r="16" fill="url(#pl2-skin)"/>
    <Eye cx={37} cy={32} r={5.5} iris="#1E293B"/>
    <Eye cx={51} cy={32} r={5.5} iris="#1E293B"/>
    <path d="M38 40 Q44 46 50 40" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="34" cy="22" rx="10" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-15 34 22)"/>
  </svg>
);

const Spartan = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sp2-bronze" cx="35%" cy="25%"><stop offset="0%" stopColor="#D97706"/><stop offset="100%" stopColor="#78350F"/></radialGradient>
      <radialGradient id="sp2-shield" cx="35%" cy="30%"><stop offset="0%" stopColor="#EAB308"/><stop offset="100%" stopColor="#713F12"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="30" ry="5" fill="rgba(0,0,0,0.3)"/>
    {/* Spear tall */}
    <line x1="84" y1="2" x2="80" y2="96" stroke="#78350F" strokeWidth="5"/>
    <polygon points="78,2 84,2 84,18 81,24 78,18" fill="#CBD5E1"/>
    <path d="M80 2 Q84 8 82 18" fill="rgba(255,255,255,0.2)"/>
    {/* Round shield on arm — classic Spartan feature */}
    <circle cx="18" cy="60" r="28" fill="url(#sp2-shield)"/>
    <circle cx="18" cy="60" r="24" fill="#CA8A04"/>
    <circle cx="18" cy="60" r="20" fill="#B45309"/>
    {/* Lambda on shield */}
    <path d="M8 50 L18 70 L28 50" fill="none" stroke="#FEF3C7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="60" r="6" fill="#92400E"/>
    {/* Armored body */}
    <rect x="30" y="52" width="50" height="46" rx="5" fill="url(#sp2-bronze)"/>
    {/* Leather strips pteryges at waist */}
    {[32,40,48,56,64,72].map(x=><rect key={x} x={x} y={82} width={7} height={16} rx={3} fill="#92400E" opacity={0.8}/>)}
    {/* Chest muscle armor detail */}
    <path d="M38 60 Q55 68 72 60 Q68 76 55 78 Q42 76 38 60 Z" fill="#CA8A04" opacity="0.4"/>
    {/* Greaves */}
    <rect x="36" y="88" width="15" height="10" rx="3" fill="#94A3B8"/>
    <rect x="60" y="88" width="15" height="10" rx="3" fill="#94A3B8"/>
    {/* Magnificent Corinthian helmet */}
    <rect x="32" y="16" width="46" height="38" rx="8" fill="url(#sp2-bronze)"/>
    {/* Cheek guards */}
    <path d="M32 30 Q28 46 32 54" fill="#B45309"/>
    <path d="M78 30 Q82 46 78 54" fill="#B45309"/>
    {/* T-slot face opening */}
    <rect x="38" y="30" width="32" height="12" rx="3" fill="#1C1917"/>
    <rect x="47" y="20" width="14" height="22" rx="3" fill="#1C1917"/>
    {/* Eyes in darkness */}
    <circle cx="43" cy={36} r={4} fill="#FDE047" opacity="0.9"/>
    <circle cx={65} cy={36} r={4} fill="#FDE047" opacity="0.9"/>
    {/* Epic red plume horsehair crest */}
    <path d="M42 16 Q55 0 68 16" fill="#DC2626"/>
    <path d="M38 18 Q55 -4 72 18" fill="#EF4444" opacity="0.6"/>
    <ellipse cx="55" cy="8" rx="16" ry="10" fill="#EF4444" opacity="0.8"/>
    <ellipse cx="55" cy="6" rx="10" ry="6" fill="#DC2626"/>
    <ellipse cx="44" cy="14" rx="10" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(-10 44 14)"/>
  </svg>
);

const Moses = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ms-skin" cx="40%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="100%" stopColor="#D97706"/></radialGradient>
      <linearGradient id="ms-wave" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#0369A1"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Parting sea LEFT — dramatic wall of water */}
    <path d="M0 50 Q6 26 14 38 Q8 44 2 58 Q0 68 0 100 Z" fill="url(#ms-wave)"/>
    <path d="M0 50 Q7 30 15 40 Q10 46 4 58 Q2 66 0 90 Z" fill="#7DD3FC" opacity="0.5"/>
    {/* Sea wall ripples */}
    <path d="M4 46 Q8 40 12 46" fill="none" stroke="#BAE6FD" strokeWidth="2" opacity="0.7"/>
    <path d="M2 62 Q6 56 10 62" fill="none" stroke="#BAE6FD" strokeWidth="2" opacity="0.7"/>
    {/* Parting sea RIGHT */}
    <path d="M100 50 Q94 26 86 38 Q92 44 98 58 Q100 68 100 100 Z" fill="url(#ms-wave)"/>
    <path d="M100 50 Q93 30 85 40 Q90 46 96 58 Q98 66 100 90 Z" fill="#7DD3FC" opacity="0.5"/>
    <path d="M96 46 Q92 40 88 46" fill="none" stroke="#BAE6FD" strokeWidth="2" opacity="0.7"/>
    <path d="M98 62 Q94 56 90 62" fill="none" stroke="#BAE6FD" strokeWidth="2" opacity="0.7"/>
    {/* Dry ground between the walls */}
    <ellipse cx="50" cy="93" rx="30" ry="8" fill="#D97706"/>
    <ellipse cx="50" cy="93" rx="24" ry="5" fill="#F59E0B" opacity="0.6"/>
    {/* Robe billowing */}
    <path d="M26 52 L18 96 L82 96 L74 52 Z" fill="#B45309"/>
    <path d="M30 52 L50 68 L70 52 L50 62 Z" fill="#FEF3C7"/>
    {/* Staff raised high — commanding the sea */}
    <line x1="74" y1="96" x2="82" y2="4" stroke="#78350F" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="83" cy="3" r="6" fill="#CA8A04"/>
    <circle cx="83" cy="3" r="3" fill="#FDE047"/>
    {/* Arm raised with staff */}
    <path d="M68 54 Q76 40 78 20" stroke="#D97706" strokeWidth="9" strokeLinecap="round" fill="none"/>
    {/* Head elevated, looking determined */}
    <circle cx="46" cy="34" r="24" fill="url(#ms-skin)"/>
    {/* Full white beard of elder prophet */}
    <path d="M22 38 Q24 66 46 70 Q68 66 70 38" fill="#F1F5F9"/>
    <circle cx="46" cy="34" r="22" fill="url(#ms-skin)"/>
    {/* White flowing hair */}
    <path d="M24 34 C24 10 68 10 68 34" fill="#E2E8F0"/>
    <circle cx="46" cy="34" r="18" fill="url(#ms-skin)"/>
    {/* Beard front */}
    <path d="M30 44 Q34 58 46 62 Q58 58 62 44" fill="#F1F5F9" opacity="0.6"/>
    <Eye cx={39} cy={32} r={5.5} iris="#1E293B"/>
    <Eye cx={53} cy={32} r={5.5} iris="#1E293B"/>
    <path d="M40 40 Q46 45 52 40" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="34" cy="22" rx="10" ry="5" fill="rgba(255,255,255,0.22)" transform="rotate(-15 34 22)"/>
  </svg>
);

const Abraham = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ab-skin" cx="40%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="100%" stopColor="#D97706"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Stars in the night sky — the promise "as many as the stars" */}
    {[[8,10,4],[22,5,3],[40,3,3.5],[60,6,3],[76,3,3],[90,8,4],[95,22,2.5],[15,24,2],[85,34,2.5],[55,1,2]].map(([x,y,r])=>
      <circle key={x} cx={x} cy={y} r={r} fill="#FDE047" opacity="0.9"/>
    )}
    {/* Glittering arcs — Milky Way */}
    <path d="M5 20 Q30 10 55 18 Q80 26 95 18" fill="none" stroke="rgba(253,224,71,0.3)" strokeWidth="6"/>
    {/* Robe ancient flowing */}
    <path d="M28 55 L18 96 L82 96 L72 55 Z" fill="#475569"/>
    <path d="M30 55 L50 72 L70 55 L50 64 Z" fill="#64748B"/>
    {/* Walking staff */}
    <line x1="20" y1="96" x2="24" y2="38" stroke="#78350F" strokeWidth="6" strokeLinecap="round"/>
    {/* Arm reaching up to the stars — hand of faith */}
    <path d="M66 54 Q80 38 86 20" stroke="#D97706" strokeWidth="10" strokeLinecap="round" fill="none"/>
    <circle cx="86" cy="18" r="9" fill="#D97706"/>
    {/* Fingers outstretched toward stars */}
    <line x1="86" y1="18" x2="82" y2="8" stroke="#B45309" strokeWidth="3" strokeLinecap="round"/>
    <line x1="86" y1="18" x2="90" y2="9" stroke="#B45309" strokeWidth="3" strokeLinecap="round"/>
    <line x1="86" y1="18" x2="94" y2="14" stroke="#B45309" strokeWidth="3" strokeLinecap="round"/>
    {/* Head of the patriarch */}
    <circle cx="50" cy="34" r="24" fill="url(#ab-skin)"/>
    {/* Distinguished full white beard */}
    <path d="M26 38 Q28 68 50 72 Q72 68 74 38" fill="#F1F5F9"/>
    <circle cx="50" cy="34" r="22" fill="url(#ab-skin)"/>
    {/* White thick hair flowing back */}
    <path d="M28 34 C28 10 72 10 72 34" fill="#E2E8F0"/>
    <circle cx="50" cy="34" r="18" fill="url(#ab-skin)"/>
    {/* Beard front visible */}
    <path d="M34 44 Q38 60 50 64 Q62 60 66 44" fill="#F1F5F9" opacity="0.6"/>
    <Eye cx={41} cy={32} r={5.5} iris="#1E293B"/>
    <Eye cx={59} cy={32} r={5.5} iris="#1E293B"/>
    {/* Wise, calm upward gaze */}
    <ellipse cx="41" cy="30" rx="3.5" ry="4" fill="#1E293B"/>
    <ellipse cx="59" cy="30" rx="3.5" ry="4" fill="#1E293B"/>
    <ellipse cx="39" cy="28" rx="1.2" ry="2" fill="rgba(255,255,255,0.8)"/>
    <ellipse cx="57" cy="28" rx="1.2" ry="2" fill="rgba(255,255,255,0.8)"/>
    <ellipse cx="36" cy="22" rx="10" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-15 36 22)"/>
  </svg>
);

const Elijah = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="el-skin" cx="40%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="100%" stopColor="#D97706"/></radialGradient>
      <radialGradient id="el-fire" cx="50%" cy="0%"><stop offset="0%" stopColor="#FDE047"/><stop offset="60%" stopColor="#EA580C"/><stop offset="100%" stopColor="#7C2D12" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    {/* Fiery chariot platform */}
    <rect x="20" y="68" width="60" height="16" rx="5" fill="#D97706"/>
    <path d="M24 68 Q50 62 76 68" fill="#FBBF24" opacity="0.5"/>
    {/* Fire wheels on axle */}
    <circle cx="22" cy="84" r="16" fill="#EF4444"/>
    <circle cx="22" cy="84" r="12" fill="#F97316"/>
    <circle cx="22" cy="84" r="8" fill="#FDE047"/>
    <circle cx="22" cy="84" r="4" fill="#FEF3C7"/>
    {[0,45,90,135].map(a=>{const r=a*Math.PI/180; return <line key={a} x1={22+8*Math.sin(r)} y1={84+8*Math.cos(r)} x2={22+16*Math.sin(r)} y2={84+16*Math.cos(r)} stroke="#DC2626" strokeWidth="3"/>;} )}
    <circle cx="78" cy="84" r="16" fill="#EF4444"/>
    <circle cx="78" cy="84" r="12" fill="#F97316"/>
    <circle cx="78" cy="84" r="8" fill="#FDE047"/>
    <circle cx="78" cy="84" r="4" fill="#FEF3C7"/>
    {[0,45,90,135].map(a=>{const r=a*Math.PI/180; return <line key={a} x1={78+8*Math.sin(r)} y1={84+8*Math.cos(r)} x2={78+16*Math.sin(r)} y2={84+16*Math.cos(r)} stroke="#DC2626" strokeWidth="3"/>;} )}
    {/* Fire rising from chariot */}
    <path d="M20 66 Q16 48 22 30" stroke="url(#el-fire)" strokeWidth="14" strokeLinecap="round" fill="none"/>
    <path d="M80 66 Q84 48 78 30" stroke="url(#el-fire)" strokeWidth="14" strokeLinecap="round" fill="none"/>
    <path d="M35 66 Q30 50 36 36" stroke="#FDE047" strokeWidth="8" strokeLinecap="round" fill="none"/>
    <path d="M65 66 Q70 50 64 36" stroke="#FDE047" strokeWidth="8" strokeLinecap="round" fill="none"/>
    {/* Orb of fire inside for extra drama */}
    <circle cx="50" cy="52" r="6" fill="#FDE047" opacity="0.7"/>
    {/* Robe on chariot */}
    <path d="M34 50 L30 68 L70 68 L66 50 Z" fill="#B45309"/>
    <path d="M36 50 L50 62 L64 50 L50 58 Z" fill="#FEF3C7"/>
    {/* Head — elder prophet */}
    <circle cx="50" cy="36" r="22" fill="url(#el-skin)"/>
    <path d="M28 40 Q30 62 50 66 Q70 62 72 40" fill="#F1F5F9"/>
    <circle cx="50" cy="36" r="20" fill="url(#el-skin)"/>
    <path d="M30 36 C30 16 70 16 70 36" fill="#E2E8F0"/>
    <circle cx="50" cy="36" r="16" fill="url(#el-skin)"/>
    <Eye cx={42} cy={34} r={5.5} iris="#1E293B"/>
    <Eye cx={58} cy={34} r={5.5} iris="#1E293B"/>
    <path d="M43 42 Q50 47 57 42" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="38" cy="24" rx="10" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-15 38 24)"/>
  </svg>
);

const Guardian = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gu-gold" cx="35%" cy="25%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#92400E"/></radialGradient>
      <radialGradient id="gu-face" cx="40%" cy="35%"><stop offset="0%" stopColor="#FEF3C7"/><stop offset="100%" stopColor="#D97706"/></radialGradient>
      <linearGradient id="gu-cape" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#DC2626"/><stop offset="100%" stopColor="#7F1D1D"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="30" ry="5" fill="rgba(0,0,0,0.3)"/>
    {/* Divine aura */}
    <circle cx="50" cy="44" r="48" fill="rgba(253,224,71,0.08)"/>
    {/* Cape billowing */}
    <path d="M22 52 Q4 40 6 20 Q16 46 24 52 Z" fill="url(#gu-cape)"/>
    <path d="M78 52 Q96 40 94 20 Q84 46 76 52 Z" fill="url(#gu-cape)"/>
    {/* Legs armored */}
    <rect x="28" y="78" width="18" height="20" rx="5" fill="url(#gu-gold)"/>
    <rect x="54" y="78" width="18" height="20" rx="5" fill="url(#gu-gold)"/>
    {/* Body magnificent golden plate */}
    <rect x="18" y="48" width="64" height="34" rx="7" fill="url(#gu-gold)"/>
    {/* Breastplate engravings */}
    <path d="M26 52 Q50 64 74 52 Q70 78 50 82 Q30 78 26 52 Z" fill="#FBBF24" opacity="0.4"/>
    {/* Cross of light on chest */}
    <rect x="46" y="54" width="8" height="22" rx="3" fill="white" opacity="0.9"/>
    <rect x="36" y="62" width="28" height="8" rx="3" fill="white" opacity="0.9"/>
    {/* Light rays from cross */}
    <path d="M50 54 L44 46 M50 54 L56 46" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
    {/* Shoulder pauldrons ornate */}
    <ellipse cx="16" cy="52" rx="14" ry="10" fill="url(#gu-gold)"/>
    <ellipse cx="16" cy="50" rx="10" ry="6" fill="#FDE047" opacity="0.5"/>
    <ellipse cx="84" cy="52" rx="14" ry="10" fill="url(#gu-gold)"/>
    <ellipse cx="84" cy="50" rx="10" ry="6" fill="#FDE047" opacity="0.5"/>
    {/* Sword — long and gleaming */}
    <line x1="88" y1="8" x2="82" y2="68" stroke="#E2E8F0" strokeWidth="5"/>
    <line x1="89" y1="8" x2="83" y2="50" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
    <rect x="76" y="34" width="20" height="6" rx="3" fill="url(#gu-gold)"/>
    <polygon points="88,8 92,8 90,2" fill="#F1F5F9"/>
    {/* Magnificent Corinthian helmet with plume */}
    <rect x="26" y="14" width="48" height="36" rx="10" fill="url(#gu-gold)"/>
    {/* Face opening */}
    <rect x="31" y="24" width="38" height="18" rx="6" fill="#1C1917"/>
    <rect x="44" y="14" width="12" height="24" rx="5" fill="#1C1917"/>
    {/* Eyes blazing blue in shadow */}
    <circle cx={39} cy={33} r={5} fill="#38BDF8"/>
    <circle cx={61} cy={33} r={5} fill="#38BDF8"/>
    <circle cx={39} cy={33} r={2.5} fill="white" opacity="0.9"/>
    <circle cx={61} cy={33} r={2.5} fill="white" opacity="0.9"/>
    {/* Red plume */}
    <path d="M38 14 Q50 -2 62 14" fill="#DC2626"/>
    <ellipse cx="50" cy="6" rx="14" ry="9" fill="#EF4444"/>
    <ellipse cx="50" cy="4" rx="8" ry="5" fill="#DC2626"/>
    <ellipse cx="36" cy="16" rx="12" ry="4" fill="rgba(255,255,255,0.2)"/>
  </svg>
);

const Jesus = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="js-skin" cx="40%" cy="35%"><stop offset="0%" stopColor="#FDDBA8"/><stop offset="100%" stopColor="#C8925A"/></radialGradient>
      <radialGradient id="js-robe" cx="40%" cy="20%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="100%" stopColor="#E2E8F0"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
    <path d="M26 54 L16 96 L84 96 L74 54 Z" fill="url(#js-robe)"/>
    <path d="M26 54 L22 96 L50 96 L50 60 Z" fill="#BFDBFE"/>
    <path d="M30 64 Q50 74 70 64 Q66 80 50 82 Q34 80 30 64 Z" fill="#FEE2E2" opacity="0.7"/>
    <path d="M76 96 Q78 68 72 30 Q70 22 64 22 Q58 22 58 30 Q58 36 64 34" stroke="#78350F" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <ellipse cx="20" cy="64" rx="13" ry="9" fill="#F8FAFC"/>
    <circle cx="14" cy="57" r="8" fill="#FFFFFF"/>
    <circle cx="24" cy="57" r="6" fill="#F1F5F9"/>
    <ellipse cx="12" cy="51" rx="3" ry="5" fill="#E2E8F0" transform="rotate(-20 12 51)"/>
    <circle cx="10" cy="56" r="2.5" fill="#1E293B"/>
    <circle cx="9.5" cy="55.5" r="0.8" fill="white"/>
    <path d="M34 58 Q26 52 22 60" stroke="#C8925A" strokeWidth="8" strokeLinecap="round" fill="none"/>
    <circle cx="50" cy="28" r="30" fill="none" stroke="#FDE047" strokeWidth="5" opacity="0.7"/>
    <circle cx="50" cy="28" r="26" fill="none" stroke="#FBBF24" strokeWidth="2" opacity="0.3"/>
    <circle cx="50" cy="30" r="24" fill="url(#js-skin)"/>
    <path d="M26 30 C26 8 74 8 74 30 Q64 16 50 18 Q36 16 26 30 Z" fill="#78350F"/>
    <path d="M26 36 Q22 52 24 66" stroke="#78350F" strokeWidth="7" strokeLinecap="round" fill="none"/>
    <path d="M74 36 Q78 52 76 66" stroke="#78350F" strokeWidth="7" strokeLinecap="round" fill="none"/>
    <circle cx="50" cy="30" r="20" fill="url(#js-skin)"/>
    <path d="M30 36 Q32 56 50 60 Q68 56 70 36" fill="#78350F"/>
    <circle cx="50" cy="36" r="17" fill="url(#js-skin)"/>
    <Eye cx={42} cy={28} r={6} iris="#451A03"/>
    <Eye cx={58} cy={28} r={6} iris="#451A03"/>
    <path d="M43 38 Q50 44 57 38" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M36 21 Q42 18 47 21" fill="none" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M53 21 Q58 18 64 21" fill="none" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <ellipse cx="44" cy="20" rx="10" ry="5" fill="rgba(255,255,255,0.22)" transform="rotate(-10 44 20)"/>
  </svg>
);
// MAP ALL 40 ──────────────────────────────────────────────────────────────
const PET_MAP = {
  pup:Pup, kitty:Kitty, bunny:Bunny, fox:Fox, bear:Bear,
  wolf:Wolf, lion:Lion, eagle:Eagle, panther:Panther, panda:Panda,
  trike:Trike, raptor:Raptor, ptero:Ptero, stego:Stego, ankylo:Ankylo,
  rex:Rex, spino:Spino, griffin:Griffin, dragon:Dragon, phoenix:Phoenix,
  sparkbot:Sparkbot, gear:Gear, astro:Astro, zap:Zap, mechatron:Mechatron,
  plasma:Plasma, zenith:Zenith, titan:Titan, glitch:Glitch, nova:Nova,
  david:David, shadow:Shadow, samson:Samson, paul:Paul, spartan:Spartan,
  moses:Moses, abraham:Abraham, elijah:Elijah, guardian:Guardian, jesus:Jesus,
};

const RARITY_GLOW = {
  common: null,
  rare:   'radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)',
  epic:   'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
  legendary: 'radial-gradient(circle, rgba(250,204,21,0.5) 0%, transparent 70%)',
};

export default function CharacterDisplay({ characterData, size = 90, animated = true }) {
  const petId  = characterData?.petId || null;
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
