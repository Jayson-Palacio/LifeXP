'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

// ── Floating orb canvas background ──────────────────────────────────────────
function StarField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);

    const ORBS = Array.from({ length: 18 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 60 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      hue: [270, 300, 220, 180, 240][Math.floor(Math.random() * 5)],
      alpha: 0.04 + Math.random() * 0.06,
    }));
    const STARS = Array.from({ length: 120 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 0.5 + Math.random() * 1.5, alpha: 0.2 + Math.random() * 0.6,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      STARS.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
      });
      ORBS.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = w + o.r; if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r; if (o.y > h + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},90%,65%,${o.alpha})`);
        g.addColorStop(1, `hsla(${o.hue},90%,65%,0)`);
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', handleResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}/>;
}

// ── SVG feature icons ────────────────────────────────────────────────────────
const IconMission = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1.5"/>
    <path d="M10 16.5L14 20.5L22 12" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconReward = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="8" y="14" width="16" height="12" rx="3" fill="rgba(250,204,21,0.15)" stroke="#facc15" strokeWidth="1.5"/>
    <path d="M16 14V26" stroke="#facc15" strokeWidth="1.5"/>
    <path d="M8 18H24" stroke="#facc15" strokeWidth="1.5"/>
    <path d="M16 14C16 14 12 14 12 10.5C12 8.5 13.5 7 16 7C18.5 7 20 8.5 20 10.5C20 14 16 14 16 14Z" fill="rgba(250,204,21,0.15)" stroke="#facc15" strokeWidth="1.5"/>
  </svg>
);
const IconLevel = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M6 24L12 16L18 20L26 8" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="26" cy="8" r="3" fill="#22c55e"/>
  </svg>
);
const IconPet = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <ellipse cx="16" cy="19" rx="9" ry="8" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="1.5"/>
    <circle cx="12" cy="16" r="2" fill="#38bdf8"/>
    <circle cx="20" cy="16" r="2" fill="#38bdf8"/>
    <path d="M13 21C14 22.5 18 22.5 19 21" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="10" cy="11" rx="3" ry="4" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(-15 10 11)"/>
    <ellipse cx="22" cy="11" rx="3" ry="4" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(15 22 11)"/>
  </svg>
);

// ── App phone mockup ─────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div style={{ position:'relative', width:240, margin:'0 auto', flexShrink:0 }}>
      {/* Glow behind phone */}
      <div style={{ position:'absolute', inset:'-30%', borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)', zIndex:0 }}/>
      {/* Phone shell */}
      <div style={{
        position:'relative', zIndex:1, background:'#0d0d14', border:'2px solid rgba(255,255,255,0.12)',
        borderRadius:36, padding:'12px 8px 20px', boxShadow:'0 40px 80px rgba(0,0,0,0.6)',
      }}>
        {/* notch */}
        <div style={{ width:70, height:10, background:'#1a1a2e', borderRadius:9999, margin:'0 auto 10px', border:'1px solid rgba(255,255,255,0.07)' }}/>
        {/* screen content */}
        <div style={{ background:'#171723', borderRadius:24, padding:14, minHeight:380 }}>
          {/* top bar */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:'0.55rem', fontWeight:800, color:'#a855f7' }}>KAELUMA</div>
            <div style={{ fontSize:'0.5rem', color:'#94a3b8' }}>⚡ 1,240 XP</div>
          </div>
          {/* player card */}
          <div style={{ background:'linear-gradient(135deg,#2d1b4e,#1a1a38)', borderRadius:14, padding:10, marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#a855f7,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🌟</div>
              <div>
                <div style={{ fontSize:'0.55rem', fontWeight:700, color:'#f8fafc' }}>Alex • Lv. 12</div>
                <div style={{ width:60, height:4, background:'rgba(255,255,255,0.1)', borderRadius:9999, marginTop:3, overflow:'hidden' }}>
                  <div style={{ width:'70%', height:'100%', background:'linear-gradient(90deg,#a855f7,#6366f1)', borderRadius:9999 }}/>
                </div>
              </div>
            </div>
          </div>
          {/* missions */}
          <div style={{ fontSize:'0.5rem', fontWeight:700, color:'#94a3b8', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Today's Missions</div>
          {[
            { label:'Make Your Bed', xp:'+50 XP', done:true, color:'#22c55e' },
            { label:'Read for 20 min', xp:'+80 XP', done:true, color:'#22c55e' },
            { label:'Clean Your Room', xp:'+100 XP', done:false, color:'#a855f7' },
            { label:'Do Homework', xp:'+150 XP', done:false, color:'#f59e0b' },
          ].map((m,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'6px 8px', marginBottom:4, opacity: m.done ? 0.55 : 1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background: m.done ? '#22c55e' : 'rgba(255,255,255,0.1)', border: m.done ? 'none' : `1.5px solid ${m.color}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {m.done && <span style={{ fontSize:'0.35rem', color:'white' }}>✓</span>}
                </div>
                <span style={{ fontSize:'0.48rem', color: m.done ? '#94a3b8' : '#f8fafc', textDecoration: m.done ? 'line-through' : 'none' }}>{m.label}</span>
              </div>
              <span style={{ fontSize:'0.45rem', color:m.color, fontWeight:700 }}>{m.xp}</span>
            </div>
          ))}
          {/* companion */}
          <div style={{ marginTop:10, background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:'1.4rem' }}>🐉</div>
            <div>
              <div style={{ fontSize:'0.48rem', fontWeight:700, color:'#f8fafc' }}>Dragon</div>
              <div style={{ fontSize:'0.42rem', color:'#94a3b8' }}>Companion • Legendary</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── How it works step ────────────────────────────────────────────────────────
function Step({ num, title, desc, color }) {
  return (
    <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
      <div style={{ flexShrink:0, width:44, height:44, borderRadius:'50%', background:`${color}22`, border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'1.1rem', color }}>
        {num}
      </div>
      <div>
        <div style={{ fontWeight:800, fontSize:'1.05rem', color:'#f8fafc', marginBottom:4 }}>{title}</div>
        <div style={{ color:'#94a3b8', fontSize:'0.9rem', lineHeight:1.55 }}>{desc}</div>
      </div>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.07)`,
      borderRadius:20, padding:28, transition:'transform 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=`${accent}55`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
    >
      <div style={{ marginBottom:14 }}>{icon}</div>
      <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#f8fafc', marginBottom:8 }}>{title}</div>
      <div style={{ color:'#94a3b8', fontSize:'0.9rem', lineHeight:1.6 }}>{desc}</div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ minHeight:'100dvh', background:'#0d0d14', fontFamily:'var(--font-main)', color:'#f8fafc', overflowX:'hidden' }}>
      <StarField />

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(20px)', background:'rgba(13,13,20,0.7)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#a855f7,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>☀️</div>
          <span style={{ fontSize:'1.3rem', fontWeight:900, background:'linear-gradient(135deg,#a855f7,#6366f1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Kaeluma</span>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Link href="/login" style={{ color:'#94a3b8', textDecoration:'none', fontWeight:600, fontSize:'0.9rem', padding:'8px 16px', borderRadius:10, transition:'color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}>
            Log in
          </Link>
          <Link href="/signup" style={{ background:'linear-gradient(135deg,#a855f7,#6366f1)', color:'white', textDecoration:'none', fontWeight:700, fontSize:'0.9rem', padding:'10px 22px', borderRadius:12, boxShadow:'0 4px 20px rgba(168,85,247,0.35)', transition:'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(168,85,247,0.5)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(168,85,247,0.35)'; }}>
            Sign up free
          </Link>
        </div>
      </nav>

      <div style={{ position:'relative', zIndex:1 }}>

        {/* ── HERO ── */}
        <section style={{ minHeight:'100dvh', display:'flex', alignItems:'center', padding:'120px 32px 80px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:60, flexWrap:'wrap' }}>

            {/* Left: copy */}
            <div style={{ flex:'1 1 400px', minWidth:0 }}>
              {/* Badge */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(168,85,247,0.12)', border:'1px solid rgba(168,85,247,0.3)', borderRadius:9999, padding:'6px 14px', marginBottom:28, fontSize:'0.8rem', fontWeight:600, color:'#c084fc' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#a855f7', display:'inline-block', animation:'aura-pulse 2s ease-in-out infinite' }}/>
                🎮 &nbsp;Gamified Family Goals
              </div>
              <h1 style={{ fontSize:'clamp(2.8rem,6vw,5rem)', fontWeight:900, lineHeight:1.05, letterSpacing:'-0.04em', marginBottom:20 }}>
                Turn Real Life<br/>
                <span style={{ background:'linear-gradient(135deg,#a855f7 0%,#ec4899 60%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Into a Game.</span>
              </h1>
              <p style={{ fontSize:'1.1rem', color:'#94a3b8', lineHeight:1.7, marginBottom:36, maxWidth:480 }}>
                Assign missions, earn XP, unlock pet companions, and level up as a family. The chore app kids actually <em style={{ color:'#f8fafc', fontStyle:'normal', fontWeight:600 }}>ask</em> to open.
              </p>

              {/* CTAs */}
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
                <Link href="/signup" style={{ background:'linear-gradient(135deg,#a855f7,#6366f1)', color:'white', textDecoration:'none', fontWeight:800, fontSize:'1.05rem', padding:'15px 32px', borderRadius:14, boxShadow:'0 8px 30px rgba(168,85,247,0.4)', letterSpacing:'-0.01em', transition:'transform 0.15s,box-shadow 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.boxShadow='0 12px 40px rgba(168,85,247,0.55)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 8px 30px rgba(168,85,247,0.4)';}}>
                  🚀&nbsp; Start Playing Free
                </Link>
                <Link href="/login" style={{ color:'#94a3b8', textDecoration:'none', fontWeight:700, fontSize:'1.05rem', padding:'15px 28px', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)', transition:'color 0.15s,border-color 0.15s', background:'rgba(255,255,255,0.03)' }}
                  onMouseEnter={e=>{e.currentTarget.style.color='#f8fafc';e.currentTarget.style.borderColor='rgba(255,255,255,0.25)';}}
                  onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
                  Log in →
                </Link>
              </div>

              {/* Social proof */}
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ display:'flex' }}>
                  {['🧒','👦','👧','🧒‍♀️','👦🏽'].map((e,i) => (
                    <div key={i} style={{ width:30, height:30, borderRadius:'50%', background:`hsl(${i*60},70%,40%)`, border:'2px solid #0d0d14', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', marginLeft: i===0?0:-8, zIndex:5-i }}>
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex', gap:2, marginBottom:2 }}>{'⭐⭐⭐⭐⭐'.split('').map((s,i)=><span key={i} style={{ fontSize:'0.75rem' }}>{s}</span>)}</div>
                  <div style={{ fontSize:'0.78rem', color:'#94a3b8' }}><strong style={{ color:'#f8fafc' }}>500+ families</strong> already playing</div>
                </div>
              </div>
            </div>

            {/* Right: phone mockup */}
            <div style={{ flex:'0 0 260px' }}>
              <PhoneMockup/>
            </div>
          </div>
        </section>

        {/* ── FEATURE STRIP ── */}
        <section style={{ padding:'0 32px 100px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:20 }}>
            <FeatureCard accent="#a855f7" icon={<IconMission/>} title="Epic Missions" desc="Daily chores, weekly habits, one-off quests. Every task earns XP and coins, making responsibility feel like an adventure."/>
            <FeatureCard accent="#facc15" icon={<IconReward/>} title="Real Rewards" desc="Kids cash out gold coins at the Parent Shop for screen time, treats, or big prizes. You control the catalog."/>
            <FeatureCard accent="#22c55e" icon={<IconLevel/>} title="RPG Leveling" desc="A built-in XP system keeps kids hooked on doing good. Watch their level bar fill up and unlock new powers."/>
            <FeatureCard accent="#38bdf8" icon={<IconPet/>} title="Pet Companions" desc="Unlock 20 unique animated companions — from Puppies to Legendary Dragons. The rarer the pet, the more bragging rights."/>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding:'0 32px 100px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div style={{ display:'inline-block', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:9999, padding:'5px 14px', fontSize:'0.78rem', fontWeight:700, color:'#22c55e', marginBottom:16 }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, letterSpacing:'-0.03em', marginBottom:12 }}>
              Up and running in <span style={{ background:'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>5 minutes</span>
            </h2>
            <p style={{ color:'#94a3b8', fontSize:'1rem', maxWidth:500, margin:'0 auto' }}>No complicated setup. Just sign up, add your kids, and start assigning missions right away.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:40 }}>
            <Step num="1" color="#a855f7" title="Parent Signs Up" desc="Create your family account in seconds. Add each child with their name and avatar. No credit card required."/>
            <Step num="2" color="#facc15" title="Assign Missions" desc="Choose from preset chore templates or create custom quests. Set XP rewards and coin payouts per task."/>
            <Step num="3" color="#22c55e" title="Kids Level Up" desc="Children complete missions on their own dashboard, earn XP, level up, and unlock pet companions and themes."/>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section style={{ padding:'0 32px 120px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ background:'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))', border:'1px solid rgba(168,85,247,0.2)', borderRadius:28, padding:'60px 40px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            {/* decorative blur blobs */}
            <div style={{ position:'absolute', top:-60, left:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.3), transparent 70%)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)', pointerEvents:'none' }}/>
            <div style={{ position:'relative' }}>
              <div style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:900, letterSpacing:'-0.03em', marginBottom:14 }}>
                Ready to make chores <span style={{ background:'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>actually fun?</span>
              </div>
              <p style={{ color:'#94a3b8', margin:'0 auto 32px', maxWidth:480, fontSize:'1rem', lineHeight:1.6 }}>
                Join 500+ families who turned bedtime battles into XP gains. Free to start, no credit card needed.
              </p>
              <Link href="/signup" style={{ display:'inline-block', background:'linear-gradient(135deg,#a855f7,#6366f1)', color:'white', textDecoration:'none', fontWeight:800, fontSize:'1.1rem', padding:'16px 40px', borderRadius:14, boxShadow:'0 10px 40px rgba(168,85,247,0.45)', transition:'transform 0.15s,box-shadow 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.boxShadow='0 14px 50px rgba(168,85,247,0.6)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 10px 40px rgba(168,85,247,0.45)';}}>
                🎮&nbsp; Start Playing Free
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'32px', textAlign:'center', color:'#475569', fontSize:'0.82rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:22, height:22, borderRadius:7, background:'linear-gradient(135deg,#a855f7,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem' }}>☀️</div>
            <span style={{ fontWeight:800, color:'#94a3b8' }}>Kaeluma</span>
          </div>
          <div>© {new Date().getFullYear()} Kaeluma · Built for families who level up together</div>
        </footer>

      </div>
    </div>
  );
}
