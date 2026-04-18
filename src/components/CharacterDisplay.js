'use client';

// ─── CharacterDisplay ─────────────────────────────────────────────────────────
// Renders a layered SVG pixel-chibi character (SD × RuneScape style).
// ViewBox: 0 0 38 54  — all units are "pixels" on the sprite grid.
// Layers bottom→top: aura → pet → base body → face accessory → hat

// ─── COLOR PALETTES ───────────────────────────────────────────────────────────
const C = {                     // shared palette
  black:   '#0a0a0f',
  white:   '#f5f5f0',
  wGrey:   '#d4d4cc',
};

// ─── BASE CHARACTERS ──────────────────────────────────────────────────────────

function CatBody() {
  const O = '#221000'; const F = '#E8935A'; const L = '#F7C08A';
  const D = '#C06B30'; const P = '#FFB3C6'; const W = '#FAFAFA';
  const I = '#5BAD6F'; const N = '#FF8FAB';
  return (
    <g>
      {/* Ears */}
      <rect x="8"  y="2"  width="5" height="6" fill={O}/>
      <rect x="9"  y="3"  width="3" height="4" fill={P}/>
      <rect x="25" y="2"  width="5" height="6" fill={O}/>
      <rect x="26" y="3"  width="3" height="4" fill={P}/>
      {/* Head */}
      <rect x="6"  y="6"  width="26" height="16" fill={O}/>
      <rect x="7"  y="7"  width="24" height="14" fill={F}/>
      <rect x="8"  y="7"  width="10" height="5"  fill={L}/>
      {/* Left eye */}
      <rect x="10" y="11" width="6" height="7" fill={O}/>
      <rect x="11" y="12" width="5" height="5" fill={W}/>
      <rect x="12" y="13" width="3" height="3" fill={I}/>
      <rect x="13" y="14" width="1" height="2" fill={O}/>
      <rect x="12" y="13" width="1" height="1" fill={W}/>
      {/* Right eye */}
      <rect x="22" y="11" width="6" height="7" fill={O}/>
      <rect x="23" y="12" width="5" height="5" fill={W}/>
      <rect x="24" y="13" width="3" height="3" fill={I}/>
      <rect x="25" y="14" width="1" height="2" fill={O}/>
      <rect x="24" y="13" width="1" height="1" fill={W}/>
      {/* Nose & whiskers */}
      <rect x="18" y="18" width="2" height="2" fill={N}/>
      <rect x="10" y="18" width="6" height="1" fill={D}/>
      <rect x="22" y="18" width="6" height="1" fill={D}/>
      {/* Neck */}
      <rect x="16" y="22" width="6" height="3" fill={F}/>
      {/* Body */}
      <rect x="12" y="25" width="14" height="14" fill={O}/>
      <rect x="13" y="26" width="12" height="12" fill={F}/>
      <rect x="15" y="27" width="8"  height="9"  fill={L}/>
      {/* Left arm + hand */}
      <rect x="8"  y="26" width="5" height="10" fill={O}/>
      <rect x="9"  y="27" width="4" height="9"  fill={F}/>
      <rect x="7"  y="35" width="6" height="4"  fill={O}/>
      <rect x="8"  y="36" width="5" height="3"  fill={L}/>
      {/* Right arm + hand */}
      <rect x="25" y="26" width="5" height="10" fill={O}/>
      <rect x="25" y="27" width="4" height="9"  fill={F}/>
      <rect x="25" y="35" width="6" height="4"  fill={O}/>
      <rect x="25" y="36" width="5" height="3"  fill={L}/>
      {/* Left leg + foot */}
      <rect x="13" y="39" width="5" height="10" fill={O}/>
      <rect x="14" y="40" width="4" height="9"  fill={F}/>
      <rect x="11" y="47" width="8" height="5"  fill={O}/>
      <rect x="12" y="48" width="7" height="4"  fill={L}/>
      {/* Right leg + foot */}
      <rect x="20" y="39" width="5" height="10" fill={O}/>
      <rect x="20" y="40" width="4" height="9"  fill={F}/>
      <rect x="19" y="47" width="8" height="5"  fill={O}/>
      <rect x="19" y="48" width="7" height="4"  fill={L}/>
      {/* Tail */}
      <rect x="26" y="35" width="3" height="2" fill={F}/>
      <rect x="27" y="33" width="3" height="3" fill={F}/>
      <rect x="28" y="30" width="3" height="4" fill={F}/>
      <rect x="27" y="28" width="4" height="3" fill={D}/>
      <rect x="25" y="34" width="1" height="8" fill={O}/>
      <rect x="31" y="29" width="1" height="7" fill={O}/>
    </g>
  );
}

function FrogBody() {
  const O = '#0D1F10'; const B = '#5BBB6A'; const D = '#3D8C47';
  const L = '#8EE5A0'; const V = '#C4F7CE'; const Y = '#FFE44D'; const Pu = '#0a0a1a';
  return (
    <g>
      {/* Left bulging eye */}
      <rect x="6"  y="4" width="8" height="8" fill={O}/>
      <rect x="7"  y="5" width="6" height="6" fill={B}/>
      <rect x="8"  y="5" width="5" height="5" fill={Y}/>
      <rect x="9"  y="6" width="3" height="3" fill={Pu}/>
      <rect x="9"  y="6" width="1" height="1" fill="#fff"/>
      {/* Right bulging eye */}
      <rect x="24" y="4" width="8" height="8" fill={O}/>
      <rect x="25" y="5" width="6" height="6" fill={B}/>
      <rect x="25" y="5" width="5" height="5" fill={Y}/>
      <rect x="26" y="6" width="3" height="3" fill={Pu}/>
      <rect x="28" y="6" width="1" height="1" fill="#fff"/>
      {/* Head */}
      <rect x="5"  y="8"  width="28" height="14" fill={O}/>
      <rect x="6"  y="9"  width="26" height="12" fill={B}/>
      <rect x="7"  y="9"  width="12" height="5"  fill={L}/>
      {/* Wide smile */}
      <rect x="8"  y="19" width="22" height="3" fill={O}/>
      <rect x="9"  y="20" width="20" height="2" fill={D}/>
      <rect x="8"  y="18" width="1"  height="2" fill={O}/>
      <rect x="29" y="18" width="1"  height="2" fill={O}/>
      {/* Body */}
      <rect x="10" y="23" width="18" height="15" fill={O}/>
      <rect x="11" y="24" width="16" height="13" fill={B}/>
      <rect x="13" y="25" width="12" height="10" fill={V}/>
      {/* Left arm + webbed hand */}
      <rect x="5"  y="25" width="6" height="9" fill={O}/>
      <rect x="6"  y="26" width="5" height="8" fill={B}/>
      <rect x="3"  y="33" width="8" height="4" fill={O}/>
      <rect x="4"  y="34" width="7" height="3" fill={L}/>
      {/* Right arm + webbed hand */}
      <rect x="27" y="25" width="6" height="9" fill={O}/>
      <rect x="27" y="26" width="5" height="8" fill={B}/>
      <rect x="27" y="33" width="8" height="4" fill={O}/>
      <rect x="27" y="34" width="7" height="3" fill={L}/>
      {/* Legs */}
      <rect x="11" y="38" width="7" height="10" fill={O}/>
      <rect x="12" y="39" width="6" height="9"  fill={B}/>
      <rect x="20" y="38" width="7" height="10" fill={O}/>
      <rect x="20" y="39" width="6" height="9"  fill={B}/>
      {/* Wide webbed feet */}
      <rect x="6"  y="46" width="15" height="6" fill={O}/>
      <rect x="7"  y="47" width="13" height="5" fill={V}/>
      <rect x="17" y="46" width="15" height="6" fill={O}/>
      <rect x="17" y="47" width="13" height="5" fill={V}/>
    </g>
  );
}

function BearBody() {
  const O = '#180900'; const B = '#A0602A'; const D = '#6B3F1A';
  const L = '#C8854A'; const M = '#D4A068'; const N = '#0a0a1a';
  return (
    <g>
      {/* Round ears */}
      <rect x="8"  y="3" width="7" height="6" fill={O}/>
      <rect x="9"  y="4" width="5" height="5" fill={B}/>
      <rect x="10" y="5" width="2" height="2" fill={D}/>
      <rect x="23" y="3" width="7" height="6" fill={O}/>
      <rect x="24" y="4" width="5" height="5" fill={B}/>
      <rect x="25" y="5" width="2" height="2" fill={D}/>
      {/* Head */}
      <rect x="6"  y="6"  width="26" height="16" fill={O}/>
      <rect x="7"  y="7"  width="24" height="14" fill={B}/>
      <rect x="8"  y="7"  width="11" height="6"  fill={L}/>
      {/* Small dark eyes */}
      <rect x="11" y="12" width="4" height="5" fill={O}/>
      <rect x="12" y="13" width="3" height="3" fill={N}/>
      <rect x="12" y="13" width="1" height="1" fill="#fff"/>
      <rect x="23" y="12" width="4" height="5" fill={O}/>
      <rect x="23" y="13" width="3" height="3" fill={N}/>
      <rect x="25" y="13" width="1" height="1" fill="#fff"/>
      {/* Muzzle */}
      <rect x="13" y="16" width="12" height="7" fill={O}/>
      <rect x="14" y="17" width="10" height="5" fill={M}/>
      <rect x="17" y="17" width="4"  height="3" fill={N}/>
      <rect x="18" y="17" width="1"  height="1" fill="#555"/>
      {/* Neck */}
      <rect x="16" y="22" width="6" height="3" fill={B}/>
      {/* Body */}
      <rect x="12" y="25" width="14" height="15" fill={O}/>
      <rect x="13" y="26" width="12" height="13" fill={B}/>
      <rect x="15" y="27" width="8"  height="10" fill={L}/>
      {/* Left arm + paw */}
      <rect x="7"  y="26" width="6" height="12" fill={O}/>
      <rect x="8"  y="27" width="5" height="11" fill={B}/>
      <rect x="6"  y="37" width="8" height="5"  fill={O}/>
      <rect x="7"  y="38" width="7" height="4"  fill={L}/>
      {/* Right arm + paw */}
      <rect x="25" y="26" width="6" height="12" fill={O}/>
      <rect x="25" y="27" width="5" height="11" fill={B}/>
      <rect x="24" y="37" width="8" height="5"  fill={O}/>
      <rect x="24" y="38" width="7" height="4"  fill={L}/>
      {/* Legs */}
      <rect x="13" y="40" width="6" height="10" fill={O}/>
      <rect x="14" y="41" width="5" height="9"  fill={B}/>
      <rect x="19" y="40" width="6" height="10" fill={O}/>
      <rect x="19" y="41" width="5" height="9"  fill={B}/>
      {/* Feet */}
      <rect x="10" y="48" width="10" height="5" fill={O}/>
      <rect x="11" y="49" width="9"  height="4" fill={L}/>
      <rect x="18" y="48" width="10" height="5" fill={O}/>
      <rect x="18" y="49" width="9"  height="4" fill={L}/>
    </g>
  );
}

function PandaBody() {
  const O = '#000000'; const W = '#F0F0EE'; const G = '#D5D5D0'; const Pu = '#0a0a1a';
  return (
    <g>
      {/* Black ears */}
      <rect x="8"  y="3" width="7" height="6" fill={O}/>
      <rect x="23" y="3" width="7" height="6" fill={O}/>
      {/* White head */}
      <rect x="6"  y="6"  width="26" height="16" fill={O}/>
      <rect x="7"  y="7"  width="24" height="14" fill={W}/>
      <rect x="8"  y="7"  width="11" height="5"  fill={G}/>
      {/* Black eye patches */}
      <rect x="10" y="10" width="7" height="8" fill={O}/>
      <rect x="21" y="10" width="7" height="8" fill={O}/>
      {/* Eyes in patch */}
      <rect x="11" y="12" width="4" height="5" fill={W}/>
      <rect x="12" y="13" width="3" height="3" fill={Pu}/>
      <rect x="12" y="13" width="1" height="1" fill="#fff"/>
      <rect x="23" y="12" width="4" height="5" fill={W}/>
      <rect x="24" y="13" width="3" height="3" fill={Pu}/>
      <rect x="26" y="13" width="1" height="1" fill="#fff"/>
      {/* Muzzle */}
      <rect x="14" y="17" width="10" height="6" fill={O}/>
      <rect x="15" y="18" width="8"  height="4" fill={G}/>
      <rect x="17" y="18" width="4"  height="2" fill={O}/>
      {/* Neck */}
      <rect x="16" y="22" width="6" height="3" fill={W}/>
      {/* Body: white center, black sides */}
      <rect x="12" y="25" width="14" height="15" fill={O}/>
      <rect x="13" y="26" width="12" height="13" fill={W}/>
      <rect x="13" y="26" width="4"  height="7"  fill={O}/>
      <rect x="21" y="26" width="4"  height="7"  fill={O}/>
      <rect x="15" y="27" width="8"  height="10" fill={G}/>
      {/* Black arms */}
      <rect x="7"  y="26" width="6" height="12" fill={O}/>
      <rect x="6"  y="37" width="8" height="5"  fill={O}/>
      <rect x="7"  y="38" width="6" height="4"  fill={G}/>
      <rect x="25" y="26" width="6" height="12" fill={O}/>
      <rect x="24" y="37" width="8" height="5"  fill={O}/>
      <rect x="24" y="38" width="6" height="4"  fill={G}/>
      {/* Black legs */}
      <rect x="13" y="40" width="6" height="10" fill={O}/>
      <rect x="14" y="41" width="5" height="9"  fill={O}/>
      <rect x="19" y="40" width="6" height="10" fill={O}/>
      <rect x="19" y="41" width="5" height="9"  fill={O}/>
      {/* White feet */}
      <rect x="10" y="48" width="10" height="5" fill={O}/>
      <rect x="11" y="49" width="9"  height="4" fill={G}/>
      <rect x="18" y="48" width="10" height="5" fill={O}/>
      <rect x="18" y="49" width="9"  height="4" fill={G}/>
    </g>
  );
}

// Fox = cat silhouette in orange/white with sharper ears
function FoxBody() {
  const O = '#1a0500'; const F = '#D4541A'; const L = '#F07D3A';
  const W = '#F5E8D0'; const D = '#A33B0F'; const Pu = '#0a0a1a';
  return (
    <g>
      {/* Pointy ears */}
      <rect x="7"  y="0" width="4" height="8" fill={O}/>
      <rect x="8"  y="1" width="2" height="6" fill={F}/>
      <rect x="26" y="0" width="4" height="8" fill={O}/>
      <rect x="27" y="1" width="2" height="6" fill={F}/>
      {/* Head */}
      <rect x="6"  y="6"  width="26" height="16" fill={O}/>
      <rect x="7"  y="7"  width="24" height="14" fill={F}/>
      <rect x="8"  y="7"  width="10" height="5"  fill={L}/>
      {/* White face mask */}
      <rect x="12" y="13" width="14" height="9" fill={O}/>
      <rect x="13" y="14" width="12" height="7" fill={W}/>
      {/* Eyes */}
      <rect x="10" y="11" width="6" height="7" fill={O}/>
      <rect x="11" y="12" width="5" height="5" fill="#f5f5f0"/>
      <rect x="12" y="13" width="3" height="3" fill="#e0b040"/>
      <rect x="13" y="14" width="1" height="2" fill={Pu}/>
      <rect x="12" y="13" width="1" height="1" fill="#fff"/>
      <rect x="22" y="11" width="6" height="7" fill={O}/>
      <rect x="23" y="12" width="5" height="5" fill="#f5f5f0"/>
      <rect x="24" y="13" width="3" height="3" fill="#e0b040"/>
      <rect x="25" y="14" width="1" height="2" fill={Pu}/>
      <rect x="24" y="13" width="1" height="1" fill="#fff"/>
      {/* Nose */}
      <rect x="18" y="18" width="2" height="2" fill="#0a0a1a"/>
      {/* Neck */}
      <rect x="16" y="22" width="6" height="3" fill={F}/>
      {/* Body */}
      <rect x="12" y="25" width="14" height="14" fill={O}/>
      <rect x="13" y="26" width="12" height="12" fill={F}/>
      <rect x="15" y="27" width="8"  height="9"  fill={W}/>
      {/* Arms */}
      <rect x="8"  y="26" width="5" height="10" fill={O}/>
      <rect x="9"  y="27" width="4" height="9"  fill={F}/>
      <rect x="7"  y="35" width="6" height="4"  fill={O}/>
      <rect x="8"  y="36" width="5" height="3"  fill={L}/>
      <rect x="25" y="26" width="5" height="10" fill={O}/>
      <rect x="25" y="27" width="4" height="9"  fill={F}/>
      <rect x="25" y="35" width="6" height="4"  fill={O}/>
      <rect x="25" y="36" width="5" height="3"  fill={L}/>
      {/* Legs */}
      <rect x="13" y="39" width="5" height="10" fill={O}/>
      <rect x="14" y="40" width="4" height="9"  fill={F}/>
      <rect x="11" y="47" width="8" height="5"  fill={O}/>
      <rect x="12" y="48" width="7" height="4"  fill={L}/>
      <rect x="20" y="39" width="5" height="10" fill={O}/>
      <rect x="20" y="40" width="4" height="9"  fill={F}/>
      <rect x="19" y="47" width="8" height="5"  fill={O}/>
      <rect x="19" y="48" width="7" height="4"  fill={L}/>
      {/* Bushy tail with white tip */}
      <rect x="26" y="34" width="5" height="3" fill={F}/>
      <rect x="27" y="31" width="5" height="4" fill={F}/>
      <rect x="28" y="29" width="4" height="3" fill={D}/>
      <rect x="27" y="27" width="5" height="3" fill={W}/>
      <rect x="25" y="33" width="1" height="9" fill={O}/>
      <rect x="32" y="28" width="1" height="9" fill={O}/>
    </g>
  );
}

// Wolf = bear build, grey + piercing blue eyes
function WolfBody() {
  const O = '#090912'; const B = '#4A5568'; const D = '#2D3748';
  const L = '#718096'; const M = '#A0AEC0'; const N = '#1a1a2e'; const I = '#63B3ED';
  return (
    <g>
      {/* Pointed ears */}
      <rect x="7"  y="1" width="5" height="7" fill={O}/>
      <rect x="8"  y="2" width="3" height="5" fill={B}/>
      <rect x="26" y="1" width="5" height="7" fill={O}/>
      <rect x="27" y="2" width="3" height="5" fill={B}/>
      {/* Head */}
      <rect x="6"  y="6"  width="26" height="16" fill={O}/>
      <rect x="7"  y="7"  width="24" height="14" fill={B}/>
      <rect x="8"  y="7"  width="11" height="6"  fill={L}/>
      {/* Eyes (blue, wolf gaze) */}
      <rect x="11" y="12" width="5" height="6" fill={O}/>
      <rect x="12" y="13" width="4" height="4" fill={I}/>
      <rect x="13" y="14" width="2" height="2" fill={N}/>
      <rect x="12" y="13" width="1" height="1" fill="#cceeff"/>
      <rect x="22" y="12" width="5" height="6" fill={O}/>
      <rect x="23" y="13" width="4" height="4" fill={I}/>
      <rect x="24" y="14" width="2" height="2" fill={N}/>
      <rect x="25" y="13" width="1" height="1" fill="#cceeff"/>
      {/* Muzzle */}
      <rect x="13" y="16" width="12" height="7" fill={O}/>
      <rect x="14" y="17" width="10" height="5" fill={M}/>
      <rect x="17" y="17" width="4"  height="3" fill={N}/>
      {/* Neck */}
      <rect x="16" y="22" width="6" height="3" fill={B}/>
      {/* Body */}
      <rect x="12" y="25" width="14" height="15" fill={O}/>
      <rect x="13" y="26" width="12" height="13" fill={B}/>
      <rect x="15" y="27" width="8"  height="10" fill={L}/>
      {/* Arms */}
      <rect x="7"  y="26" width="6" height="12" fill={O}/><rect x="8"  y="27" width="5" height="11" fill={B}/>
      <rect x="6"  y="37" width="8" height="5"  fill={O}/><rect x="7"  y="38" width="7" height="4"  fill={L}/>
      <rect x="25" y="26" width="6" height="12" fill={O}/><rect x="25" y="27" width="5" height="11" fill={B}/>
      <rect x="24" y="37" width="8" height="5"  fill={O}/><rect x="24" y="38" width="7" height="4"  fill={L}/>
      {/* Legs */}
      <rect x="13" y="40" width="6" height="10" fill={O}/><rect x="14" y="41" width="5" height="9"  fill={B}/>
      <rect x="19" y="40" width="6" height="10" fill={O}/><rect x="19" y="41" width="5" height="9"  fill={B}/>
      {/* Feet */}
      <rect x="10" y="48" width="10" height="5" fill={O}/><rect x="11" y="49" width="9"  height="4" fill={L}/>
      <rect x="18" y="48" width="10" height="5" fill={O}/><rect x="18" y="49" width="9"  height="4" fill={L}/>
    </g>
  );
}

// Lion = bear build, golden mane
function LionBody() {
  const O = '#1a0a00'; const B = '#D4A017'; const D = '#A37A00';
  const L = '#F0C040'; const M = '#E8B830'; const Pu = '#0a0a1a'; const R = '#8B2500';
  return (
    <g>
      {/* Mane (behind head — drawn first) */}
      <rect x="2"  y="5"  width="34" height="22" fill={R}/>
      <rect x="4"  y="4"  width="30" height="24" fill={D}/>
      {/* Round ears (inside mane) */}
      <rect x="10" y="5" width="5" height="4" fill={O}/>
      <rect x="11" y="6" width="3" height="3" fill={B}/>
      <rect x="23" y="5" width="5" height="4" fill={O}/>
      <rect x="24" y="6" width="3" height="3" fill={B}/>
      {/* Head */}
      <rect x="8"  y="7"  width="22" height="16" fill={O}/>
      <rect x="9"  y="8"  width="20" height="14" fill={L}/>
      <rect x="10" y="8"  width="8"  height="5"  fill={M}/>
      {/* Eyes (gold/amber) */}
      <rect x="12" y="13" width="4" height="5" fill={O}/>
      <rect x="13" y="14" width="3" height="3" fill="#E8C040"/>
      <rect x="13" y="14" width="1" height="2" fill={Pu}/>
      <rect x="13" y="14" width="1" height="1" fill="#fff"/>
      <rect x="22" y="13" width="4" height="5" fill={O}/>
      <rect x="22" y="14" width="3" height="3" fill="#E8C040"/>
      <rect x="23" y="14" width="1" height="2" fill={Pu}/>
      <rect x="24" y="14" width="1" height="1" fill="#fff"/>
      {/* Muzzle */}
      <rect x="14" y="17" width="10" height="7" fill={O}/>
      <rect x="15" y="18" width="8"  height="5" fill={M}/>
      <rect x="17" y="18" width="4"  height="3" fill={Pu}/>
      {/* Neck */}
      <rect x="16" y="23" width="6" height="3" fill={L}/>
      {/* Body */}
      <rect x="12" y="26" width="14" height="14" fill={O}/>
      <rect x="13" y="27" width="12" height="12" fill={B}/>
      <rect x="15" y="28" width="8"  height="9"  fill={L}/>
      {/* Arms */}
      <rect x="7"  y="27" width="6" height="11" fill={O}/><rect x="8"  y="28" width="5" height="10" fill={B}/>
      <rect x="6"  y="37" width="8" height="5"  fill={O}/><rect x="7"  y="38" width="7" height="4"  fill={L}/>
      <rect x="25" y="27" width="6" height="11" fill={O}/><rect x="25" y="28" width="5" height="10" fill={B}/>
      <rect x="24" y="37" width="8" height="5"  fill={O}/><rect x="24" y="38" width="7" height="4"  fill={L}/>
      {/* Legs */}
      <rect x="13" y="40" width="6" height="10" fill={O}/><rect x="14" y="41" width="5" height="9"  fill={B}/>
      <rect x="19" y="40" width="6" height="10" fill={O}/><rect x="19" y="41" width="5" height="9"  fill={B}/>
      {/* Feet */}
      <rect x="10" y="48" width="10" height="5" fill={O}/><rect x="11" y="49" width="9"  height="4" fill={L}/>
      <rect x="18" y="48" width="10" height="5" fill={O}/><rect x="18" y="49" width="9"  height="4" fill={L}/>
      {/* Tail with tuft */}
      <rect x="26" y="34" width="3" height="3" fill={B}/>
      <rect x="27" y="31" width="3" height="4" fill={B}/>
      <rect x="28" y="29" width="3" height="3" fill={D}/>
      <rect x="27" y="26" width="5" height="5" fill={R}/>
    </g>
  );
}

// ─── HAT ACCESSORIES ──────────────────────────────────────────────────────────
function TopHat() {
  return (
    <g>
      <rect x="4"  y="7"  width="30" height="4" fill="#0d0d1a"/>
      <rect x="5"  y="8"  width="28" height="3" fill="#1a1a2e"/>
      <rect x="10" y="0"  width="18" height="8" fill="#0d0d1a"/>
      <rect x="11" y="1"  width="16" height="7" fill="#1a1a2e"/>
      <rect x="10" y="6"  width="18" height="2" fill="#8B0000"/>
    </g>
  );
}
function CapHat() {
  return (
    <g>
      <rect x="4"  y="8"  width="22" height="4" fill="#0f172a"/>
      <rect x="5"  y="9"  width="20" height="3" fill="#1D4ED8"/>
      <rect x="8"  y="2"  width="22" height="8" fill="#0f172a"/>
      <rect x="9"  y="3"  width="20" height="7" fill="#3B82F6"/>
      <rect x="17" y="5"  width="4"  height="3" fill="#fff" opacity="0.3"/>
    </g>
  );
}
function CrownHat() {
  const G = '#FBBF24'; const D = '#D97706'; const O = '#78350F';
  return (
    <g>
      <rect x="8"  y="7"  width="22" height="6" fill={O}/>
      <rect x="9"  y="8"  width="20" height="5" fill={G}/>
      <rect x="9"  y="1"  width="5"  height="8" fill={O}/><rect x="10" y="2" width="3" height="7" fill={G}/>
      <rect x="16" y="0"  width="6"  height="8" fill={O}/><rect x="17" y="1" width="4" height="7" fill={G}/>
      <rect x="24" y="1"  width="5"  height="8" fill={O}/><rect x="25" y="2" width="3" height="7" fill={G}/>
      <rect x="11" y="9"  width="3"  height="2" fill="#EF4444"/>
      <rect x="18" y="8"  width="3"  height="3" fill="#3B82F6"/>
      <rect x="25" y="9"  width="3"  height="2" fill="#A855F7"/>
      <rect x="9"  y="11" width="20" height="1" fill={D}/>
    </g>
  );
}
function WizardHat() {
  const P = '#581C87'; const D = '#3B0764'; const L = '#7C3AED'; const Y = '#FBBF24';
  return (
    <g>
      <rect x="2"  y="10" width="34" height="4" fill={D}/>
      <rect x="3"  y="11" width="32" height="3" fill={P}/>
      <rect x="10" y="7"  width="18" height="5" fill={D}/><rect x="11" y="8"  width="16" height="4" fill={P}/>
      <rect x="13" y="4"  width="12" height="5" fill={D}/><rect x="14" y="5"  width="10" height="4" fill={P}/>
      <rect x="15" y="1"  width="8"  height="5" fill={D}/><rect x="16" y="2"  width="6"  height="4" fill={P}/>
      <rect x="17" y="0"  width="4"  height="3" fill={D}/><rect x="18" y="1"  width="2"  height="2" fill={P}/>
      <rect x="14" y="7"  width="2"  height="2" fill={Y}/>
      <rect x="22" y="5"  width="2"  height="2" fill={Y}/>
      <rect x="11" y="12" width="1"  height="1" fill={Y}/>
      <rect x="10" y="10" width="18" height="2" fill={L}/>
    </g>
  );
}
function DiamondCrown() {
  const G = '#E8F4FD'; const D = '#93C5FD'; const GD = '#FBBF24'; const O = '#0f172a';
  return (
    <g>
      <rect x="6"  y="7"  width="26" height="5" fill={O}/><rect x="7" y="8" width="24" height="4" fill={GD}/>
      <rect x="8"  y="2"  width="5"  height="7" fill={O}/><rect x="9"  y="3" width="3" height="6" fill={G}/><rect x="10" y="3" width="1" height="3" fill={D}/>
      <rect x="14" y="0"  width="6"  height="9" fill={O}/><rect x="15" y="1" width="4" height="7" fill={G}/><rect x="16" y="1" width="2" height="4" fill={D}/>
      <rect x="21" y="0"  width="6"  height="9" fill={O}/><rect x="22" y="1" width="4" height="7" fill={G}/><rect x="23" y="1" width="2" height="4" fill={D}/>
      <rect x="25" y="2"  width="5"  height="7" fill={O}/><rect x="26" y="3" width="3" height="6" fill={G}/><rect x="27" y="3" width="1" height="3" fill={D}/>
    </g>
  );
}
function RainbowHat() {
  const colors = ['#FF0000','#FF7F00','#FFFF00','#00CC00','#0000FF','#8B00FF'];
  const seg = 2;
  return (
    <g>
      {colors.map((c, i) => {
        const y = i * seg;
        const w = Math.max(4, 20 - i * 4);
        const x = 19 - w / 2;
        return <rect key={i} x={x} y={y} width={w} height={seg + 1} fill={c}/>;
      })}
      <rect x="5"  y="12" width="28" height="3" fill="#FBBF24"/>
      <rect x="6"  y="13" width="26" height="2" fill="#F59E0B"/>
      <rect x="17" y="0"  width="2"  height="3" fill="#fff"/>
    </g>
  );
}

// ─── FACE ACCESSORIES ─────────────────────────────────────────────────────────
function Shades() {
  return (
    <g>
      <rect x="8"  y="12" width="8" height="6" fill="#0f172a"/>
      <rect x="9"  y="13" width="6" height="4" fill="#1e3a5f"/>
      <rect x="9"  y="13" width="2" height="2" fill="#2563eb" opacity="0.5"/>
      <rect x="16" y="13" width="5" height="2" fill="#0f172a"/>
      <rect x="21" y="12" width="8" height="6" fill="#0f172a"/>
      <rect x="22" y="13" width="6" height="4" fill="#1e3a5f"/>
      <rect x="22" y="13" width="2" height="2" fill="#2563eb" opacity="0.5"/>
      <rect x="5"  y="13" width="3" height="2" fill="#0f172a"/>
      <rect x="30" y="13" width="3" height="2" fill="#0f172a"/>
    </g>
  );
}
function ScubaMask() {
  return (
    <g>
      <rect x="6"  y="10" width="26" height="10" fill="#0f172a"/>
      <rect x="7"  y="11" width="24" height="8"  fill="#0ea5e9"/>
      <rect x="8"  y="11" width="22" height="7"  fill="#bae6fd"/>
      <rect x="9"  y="12" width="5"  height="2"  fill="#e0f2fe" opacity="0.7"/>
      <rect x="5"  y="12" width="2"  height="4"  fill="#475569"/>
      <rect x="31" y="12" width="2"  height="4"  fill="#475569"/>
      <rect x="31" y="8"  width="3"  height="10" fill="#475569"/>
      <rect x="32" y="6"  width="3"  height="3"  fill="#475569"/>
    </g>
  );
}
function StarEyes() {
  const Y = '#FBBF24';
  return (
    <g>
      <rect x="12" y="12" width="3" height="7" fill={Y}/>
      <rect x="10" y="14" width="7" height="3" fill={Y}/>
      <rect x="11" y="13" width="1" height="1" fill={Y}/>
      <rect x="14" y="13" width="1" height="1" fill={Y}/>
      <rect x="11" y="17" width="1" height="1" fill={Y}/>
      <rect x="14" y="17" width="1" height="1" fill={Y}/>
      <rect x="24" y="12" width="3" height="7" fill={Y}/>
      <rect x="22" y="14" width="7" height="3" fill={Y}/>
      <rect x="23" y="13" width="1" height="1" fill={Y}/>
      <rect x="26" y="13" width="1" height="1" fill={Y}/>
      <rect x="23" y="17" width="1" height="1" fill={Y}/>
      <rect x="26" y="17" width="1" height="1" fill={Y}/>
    </g>
  );
}

// ─── AURA SVG (behind character on same SVG) ──────────────────────────────────
function AuraSVG({ type }) {
  const auras = {
    star:      { stroke: '#facc15', fill: '#facc1522' },
    wave:      { stroke: '#38bdf8', fill: '#38bdf822' },
    fire:      { stroke: '#f97316', fill: '#f9731622' },
    lightning: { stroke: '#a855f7', fill: '#a855f722' },
    rainbow:   { stroke: '#fff',    fill: null         },
    max:       { stroke: '#fff',    fill: '#ffffff22'  },
  };
  const cfg = auras[type];
  if (!cfg) return null;
  return (
    <g opacity="0.75">
      <ellipse cx="19" cy="51" rx="14" ry="4"  fill={cfg.fill || '#ffffff11'}/>
      <ellipse cx="19" cy="28" rx="22" ry="24" fill="none" stroke={cfg.stroke} strokeWidth="2" opacity="0.6"/>
      {type === 'rainbow' && (
        <>
          <ellipse cx="19" cy="28" rx="22" ry="24" fill="none" stroke="#ff0000" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.5"/>
          <ellipse cx="19" cy="28" rx="20" ry="22" fill="none" stroke="#00ff88" strokeWidth="1.5" strokeDasharray="8 4" strokeDashoffset="6" opacity="0.5"/>
        </>
      )}
    </g>
  );
}

// ─── PET COMPANIONS ────────────────────────────────────────────────────────────
function ChickPet() {
  return (
    <g transform="translate(32, 30)">
      <rect x="0" y="3" width="7" height="6" fill="#FBBF24"/>
      <rect x="1" y="1" width="5" height="4" fill="#FBBF24"/>
      <rect x="2" y="2" width="2" height="2" fill="#0a0a1a"/>
      <rect x="2" y="2" width="1" height="1" fill="#fff"/>
      <rect x="5" y="3" width="2" height="1" fill="#F59E0B"/>
      <rect x="1" y="8" width="1" height="2" fill="#F59E0B"/>
      <rect x="3" y="8" width="1" height="2" fill="#F59E0B"/>
      <rect x="5" y="8" width="1" height="2" fill="#F59E0B"/>
    </g>
  );
}
function ButterflyPet() {
  return (
    <g transform="translate(30, 12)">
      <rect x="0" y="2" width="5" height="7" fill="#A855F7" opacity="0.85"/>
      <rect x="6" y="2" width="5" height="7" fill="#EC4899" opacity="0.85"/>
      <rect x="1" y="4" width="3" height="3" fill="#C084FC" opacity="0.5"/>
      <rect x="7" y="4" width="3" height="3" fill="#F472B6" opacity="0.5"/>
      <rect x="5" y="1" width="1" height="9" fill="#0a0a1a"/>
      <rect x="4" y="0" width="1" height="2" fill="#0a0a1a"/>
      <rect x="6" y="0" width="1" height="2" fill="#0a0a1a"/>
    </g>
  );
}
function DragonPet() {
  return (
    <g transform="translate(-10, 28)">
      <rect x="1"  y="3"  width="7" height="7" fill="#16A34A"/>
      <rect x="2"  y="1"  width="5" height="4" fill="#22C55E"/>
      <rect x="6"  y="2"  width="3" height="2" fill="#22C55E"/>
      <rect x="3"  y="2"  width="2" height="2" fill="#FBBF24"/>
      <rect x="3"  y="2"  width="1" height="1" fill="#0a0a1a"/>
      <rect x="-2" y="4"  width="4" height="5" fill="#15803D" opacity="0.8"/>
      <rect x="8"  y="2"  width="2" height="1" fill="#F97316"/>
      <rect x="9"  y="3"  width="2" height="1" fill="#FBBF24"/>
      <rect x="1"  y="9"  width="2" height="4" fill="#22C55E"/>
      <rect x="5"  y="9"  width="2" height="4" fill="#22C55E"/>
    </g>
  );
}
function UnicornPet() {
  return (
    <g transform="translate(-11, 18)">
      <rect x="1"  y="5"  width="10" height="8" fill="#F9E8FF"/>
      <rect x="7"  y="1"  width="6"  height="6" fill="#F9E8FF"/>
      <rect x="11" y="0"  width="2"  height="3" fill="#FBBF24"/>
      <rect x="12" y="-1" width="1"  height="2" fill="#FBBF24"/>
      <rect x="8"  y="2"  width="2"  height="2" fill="#0a0a1a"/>
      <rect x="8"  y="2"  width="1"  height="1" fill="#fff"/>
      <rect x="7"  y="1"  width="2"  height="4" fill="#C084FC"/>
      <rect x="8"  y="0"  width="2"  height="3" fill="#F472B6"/>
      <rect x="1"  y="12" width="2"  height="5" fill="#F9E8FF"/>
      <rect x="4"  y="12" width="2"  height="5" fill="#F9E8FF"/>
      <rect x="7"  y="12" width="2"  height="5" fill="#F9E8FF"/>
      <rect x="0"  y="6"  width="2"  height="4" fill="#A855F7"/>
      <rect x="-1" y="7"  width="2"  height="3" fill="#EC4899"/>
    </g>
  );
}

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────
const BASE_MAP  = { cat: CatBody, frog: FrogBody, bear: BearBody, panda: PandaBody, fox: FoxBody, wolf: WolfBody, lion: LionBody };
const HAT_MAP   = { 'top-hat': TopHat, cap: CapHat, crown: CrownHat, wizard: WizardHat, 'diamond-crown': DiamondCrown, 'rainbow-hat': RainbowHat };
const FACE_MAP  = { shades: Shades, scuba: ScubaMask, 'star-eyes': StarEyes };
const PET_MAP   = { chick: ChickPet, butterfly: ButterflyPet, dragon: DragonPet, unicorn: UnicornPet };

// ─── AURA BACKGROUND (CSS behind SVG) ────────────────────────────────────────
function getAuraBg(type) {
  return {
    star:      'radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 70%)',
    wave:      'radial-gradient(circle, rgba(56,189,248,0.35) 0%, transparent 70%)',
    fire:      'radial-gradient(circle, rgba(249,115,22,0.45) 0%, rgba(239,68,68,0.2) 55%, transparent 70%)',
    lightning: 'radial-gradient(circle, rgba(168,85,247,0.45) 0%, transparent 70%)',
    rainbow:   'conic-gradient(from 0deg, rgba(255,0,0,0.2), rgba(255,165,0,0.2), rgba(255,255,0,0.2), rgba(0,255,0,0.2), rgba(0,0,255,0.2), rgba(255,0,255,0.2), rgba(255,0,0,0.2))',
    max:       'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 50%, transparent 70%)',
  }[type] || 'transparent';
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function CharacterDisplay({ characterData, size = 120, animated = true }) {
  const { base = 'cat', hat, face, aura, pet } = characterData || {};

  const BaseComp = BASE_MAP[base] || CatBody;
  const HatComp  = hat  ? HAT_MAP[hat]   : null;
  const FaceComp = face ? FACE_MAP[face]  : null;
  const PetComp  = pet  ? PET_MAP[pet]    : null;

  const w = size;
  const h = Math.round(size * (54 / 38));

  return (
    <div style={{ position: 'relative', width: w, height: h, display: 'inline-block' }}>
      {/* CSS aura glow behind SVG */}
      {aura && (
        <div style={{
          position: 'absolute', inset: '-25%', borderRadius: '50%',
          background: getAuraBg(aura),
          animation: animated ? 'aura-pulse 2.5s ease-in-out infinite' : 'none',
          zIndex: 0, pointerEvents: 'none',
        }}/>
      )}
      <svg
        viewBox="0 0 38 54"
        width={w} height={h}
        style={{ position: 'relative', zIndex: 1, imageRendering: 'pixelated', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        {/* Ground shadow */}
        <ellipse cx="19" cy="52" rx="11" ry="2" fill="rgba(0,0,0,0.25)"/>
        {/* Aura rings (inside SVG) */}
        {aura && <AuraSVG type={aura}/>}
        {/* Pet companion */}
        {PetComp && <PetComp/>}
        {/* Base character */}
        <BaseComp/>
        {/* Face accessory */}
        {FaceComp && <FaceComp/>}
        {/* Hat on top */}
        {HatComp && <HatComp/>}
      </svg>
    </div>
  );
}
