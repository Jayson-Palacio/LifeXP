'use client';
import Link from 'next/link';

// ── SVG feature icons ────────────────────────────────────────────────────────
const IconMission = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.8"/>
    <circle cx="12" cy="12" r="4" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="2"/>
    <path d="M12 2L12 6M12 18L12 22M22 12L18 12M6 12L2 12M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4"/>
  </svg>
);
const IconReward = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M20 12V22H4V12" stroke="#facc15" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M22 7H2V12H22V7Z" fill="rgba(250,204,21,0.1)" stroke="#facc15" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 22V7" stroke="#facc15" strokeWidth="2"/>
    <path d="M12 7H7.5C6.11929 7 5 5.88071 5 4.5C5 3.11929 6.11929 2 7.5 2C8.88071 2 12 7 12 7Z" stroke="#facc15" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 7H16.5C17.8807 7 19 5.88071 19 4.5C19 3.11929 17.8807 2 16.5 2C15.1193 2 12 7 12 7Z" stroke="#facc15" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);
const IconLevel = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M4 20L10 14L15 17L21 6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 6H21V11" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="21" cy="6" r="2" fill="rgba(34,197,94,0.3)"/>
    <circle cx="15" cy="17" r="2" fill="rgba(34,197,94,0.3)"/>
    <circle cx="10" cy="14" r="2" fill="rgba(34,197,94,0.3)"/>
    <circle cx="4" cy="20" r="2" fill="rgba(34,197,94,0.3)"/>
  </svg>
);
const IconPet = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="14" rx="7" ry="6" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" strokeWidth="2"/>
    <path d="M7 10C7 7 9 3 12 3C15 3 17 7 17 10" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 10C5 10 3 12 3 15C3 18 6 18 6 18" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 10C19 10 21 12 21 15C21 18 18 18 18 18" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="13" r="1.5" fill="#38bdf8"/>
    <circle cx="15" cy="13" r="1.5" fill="#38bdf8"/>
    <path d="M10 16.5C10.5 17.5 13.5 17.5 14 16.5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ── App phone mockup ─────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div style={{ position:'relative', width:260, margin:'0 auto', flexShrink:0 }}>
      {/* Phone shell */}
      <div style={{
        position:'relative', zIndex:1, background:'#0d0d14', border:'4px solid #1e1e2d',
        borderRadius:40, padding:'12px', boxShadow:'0 25px 60px rgba(0,0,0,0.5)',
      }}>
        {/* screen content */}
        <div style={{ background:'#171723', borderRadius:28, minHeight:500, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* top bar */}
          <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.05))', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.2rem'}}>☀️</span>
                <span style={{ fontSize:'0.7rem', fontWeight:800, color:'#f8fafc', letterSpacing: 1 }}>KAELUMA</span>
              </div>
              <div style={{ fontSize:'0.6rem', color:'#facc15', fontWeight: 700, background: 'rgba(250,204,21,0.1)', padding: '4px 8px', borderRadius: 12 }}>⚡ 1.2k XP</div>
            </div>
            
            {/* player card */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#38bdf8,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', border: '2px solid rgba(255,255,255,0.1)' }}>👦🏽</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#f8fafc', marginBottom: 4 }}>Alex</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>Lv. 12</span>
                  <div style={{ flex: 1, height:4, background:'rgba(255,255,255,0.1)', borderRadius:9999, overflow:'hidden' }}>
                    <div style={{ width:'70%', height:'100%', background:'linear-gradient(90deg,#a855f7,#6366f1)', borderRadius:9999 }}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '20px', flex: 1 }}>
            {/* missions */}
            <div style={{ fontSize:'0.6rem', fontWeight:700, color:'#94a3b8', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.05em' }}>Daily Quests</div>
            {[
              { label:'Make Your Bed', xp:'+50', done:true, color:'#22c55e', icon: '🛏️' },
              { label:'Read for 20 min', xp:'+80', done:true, color:'#22c55e', icon: '📚' },
              { label:'Clean Your Room', xp:'+100', done:false, color:'#a855f7', icon: '🧹' },
              { label:'Do Homework', xp:'+150', done:false, color:'#f59e0b', icon: '✏️' },
            ].map((m,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius:12, padding:'10px 12px', marginBottom:8, opacity: m.done ? 0.6 : 1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize: '0.8rem', opacity: m.done ? 0.5 : 1 }}>{m.icon}</span>
                  <span style={{ fontSize:'0.65rem', fontWeight: m.done ? 500 : 600, color: m.done ? '#94a3b8' : '#f8fafc', textDecoration: m.done ? 'line-through' : 'none' }}>{m.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize:'0.6rem', color:m.done ? '#94a3b8' : m.color, fontWeight:700 }}>{m.xp}</span>
                  <div style={{ width:14, height:14, borderRadius:'50%', background: m.done ? '#22c55e' : 'transparent', border: m.done ? 'none' : '1.5px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {m.done && <span style={{ fontSize:'0.45rem', color:'white' }}>✓</span>}
                  </div>
                </div>
              </div>
            ))}
            
            {/* companion */}
            <div style={{ marginTop:16, background:'linear-gradient(135deg, rgba(250,204,21,0.05), transparent)', border: '1px solid rgba(250,204,21,0.15)', borderRadius:14, padding:'12px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:'1.8rem', filter: 'drop-shadow(0 0 10px rgba(250,204,21,0.2))' }}>🐉</div>
              <div>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#f8fafc', marginBottom: 2 }}>Dragon</div>
                <div style={{ fontSize:'0.55rem', color:'#facc15', fontWeight: 600 }}>Legendary Companion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── How it works step ────────────────────────────────────────────────────────
function Step({ num, title, desc }) {
  return (
    <div style={{ display:'flex', flexDirection: 'column', gap:12, flex: 1, minWidth: 250 }}>
      <div style={{ width:40, height:40, borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.1rem', color: '#f8fafc', marginBottom: 8 }}>
        {num}
      </div>
      <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#f8fafc' }}>{title}</div>
      <div style={{ color:'#94a3b8', fontSize:'0.9rem', lineHeight:1.6 }}>{desc}</div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ minHeight:'100dvh', background:'transparent', fontFamily:'var(--font-main)', color:'#f8fafc', overflowX:'hidden', position: 'relative' }}>
      {/* Background from original LifeXP */}
      <div className="kaeluma-bg" />

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'20px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'1.4rem' }}>☀️</span>
          <span style={{ fontSize:'1.2rem', fontWeight:800, color: '#f8fafc', letterSpacing: '0.5px' }}>Kaeluma</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Link href="/login" style={{ color:'#f8fafc', textDecoration:'none', fontWeight:600, fontSize:'0.9rem', padding:'10px 20px', borderRadius:8, transition:'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            Log in
          </Link>
          <Link href="/signup" style={{ background:'#f8fafc', color:'#0d0d14', textDecoration:'none', fontWeight:700, fontSize:'0.9rem', padding:'10px 24px', borderRadius:8, transition:'transform 0.15s, opacity 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.opacity='0.9'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.opacity='1'; }}>
            Sign up
          </Link>
        </div>
      </nav>

      <div style={{ position:'relative', zIndex:1 }}>

        {/* ── HERO ── */}
        <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'140px 48px 80px', maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:80, flexWrap:'wrap', width: '100%' }}>

            {/* Left: copy */}
            <div style={{ flex:'1 1 500px', minWidth:0 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9999, padding:'6px 16px', marginBottom:32, fontSize:'0.8rem', fontWeight:600, color:'#e2e8f0' }}>
                ⭐ The gamified chore manager for modern families
              </div>
              <h1 style={{ fontSize:'clamp(3rem, 6vw, 4.5rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:24, color: '#ffffff' }}>
                Turn real life<br/>into a game.
              </h1>
              <p style={{ fontSize:'1.15rem', color:'#94a3b8', lineHeight:1.6, marginBottom:48, maxWidth:500 }}>
                Reward good habits, track missions, and let your family level up together in a magical shared universe. Chores don't have to be a battle.
              </p>

              {/* CTAs */}
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:48 }}>
                <Link href="/signup" style={{ background:'#f8fafc', color:'#0d0d14', textDecoration:'none', fontWeight:700, fontSize:'1.05rem', padding:'16px 36px', borderRadius:12, transition:'transform 0.15s, opacity 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                  Start Playing Free
                </Link>
                <Link href="#features" style={{ color:'#f8fafc', textDecoration:'none', fontWeight:600, fontSize:'1.05rem', padding:'16px 32px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', transition:'background 0.15s', background:'rgba(255,255,255,0.02)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
                  See how it works
                </Link>
              </div>

              {/* Social proof */}
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ display:'flex' }}>
                  {['🧒','👦','👧','🧒‍♀️','👦🏽'].map((e,i) => (
                    <div key={i} style={{ width:32, height:32, borderRadius:'50%', background:`hsl(${i*60},40%,25%)`, border:'2px solid var(--bg-deep)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', marginLeft: i===0?0:-10, zIndex:5-i }}>
                      {e}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:'0.85rem', color:'#94a3b8' }}>
                  <strong style={{ color:'#f8fafc', fontWeight: 600 }}>500+ families</strong> already playing
                </div>
              </div>
            </div>

            {/* Right: phone mockup */}
            <div style={{ flex:'0 0 auto', display: 'flex', justifyContent: 'center' }}>
              <PhoneMockup/>
            </div>
          </div>
        </section>

        {/* ── LOGOS / TRUST ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '40px 0', background: 'rgba(0,0,0,0.2)' }}>
           <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Tested and loved by parents at</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap', opacity: 0.5 }}>
                 {/* Placeholder logos */}
                 <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Stripe</div>
                 <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Netflix</div>
                 <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Spotify</div>
                 <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Airbnb</div>
              </div>
           </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding:'120px 48px', maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'left', marginBottom:60, maxWidth: 600 }}>
            <h2 style={{ fontSize:'clamp(2rem, 4vw, 3rem)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:20, color: '#f8fafc' }}>
              Everything you need to build good habits.
            </h2>
            <p style={{ color:'#94a3b8', fontSize:'1.1rem', lineHeight: 1.6 }}>We took the mechanics that make video games addicting and applied them to household chores, homework, and routines.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:32 }}>
            <div style={{ padding: 32, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ marginBottom: 24 }}><IconMission/></div>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Epic Missions</h3>
               <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>Assign daily chores, weekly habits, or one-off tasks. Kids earn XP and unlock customized rewards upon completion.</p>
            </div>
            <div style={{ padding: 32, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ marginBottom: 24 }}><IconReward/></div>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Real Rewards</h3>
               <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>Let them cash out their gold coins for screen time, toys, or custom treats from the Parent Shop.</p>
            </div>
            <div style={{ padding: 32, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ marginBottom: 24 }}><IconLevel/></div>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Level Up Fast</h3>
               <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>A built-in RPG leveling system ensures your kids stay addicted to being helpful and developing discipline.</p>
            </div>
            <div style={{ padding: 32, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ marginBottom: 24 }}><IconPet/></div>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Unlock Companions</h3>
               <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>Kids unlock 20 unique animated pet companions as they level up, from basic puppies to legendary dragons.</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding:'60px 48px 140px', maxWidth:1200, margin:'0 auto' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: '80px 60px' }}>
             <h2 style={{ fontSize:'clamp(1.8rem, 3vw, 2.5rem)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:48, color: '#f8fafc', textAlign: 'center' }}>
                Setup in 3 simple steps
             </h2>
             <div style={{ display:'flex', flexWrap: 'wrap', gap:40, justifyContent: 'space-between' }}>
               <Step num="1" title="Parent Signs Up" desc="Create your family account in seconds. Add each child with their name and custom avatar."/>
               <Step num="2" title="Assign Missions" desc="Choose from preset chore templates or create custom quests. Set XP rewards and payouts."/>
               <Step num="3" title="Kids Level Up" desc="Children complete missions on their dashboard, earn XP, level up, and unlock companions."/>
             </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section style={{ padding:'0 48px 120px', maxWidth:1000, margin:'0 auto', textAlign: 'center' }}>
           <h2 style={{ fontSize:'clamp(2.5rem, 5vw, 4rem)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:24, color: '#f8fafc' }}>
              Ready to restore peace?
           </h2>
           <p style={{ fontSize: '1.15rem', color: '#94a3b8', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
              Join the families who have gamified their households. It's completely free to start playing today.
           </p>
           <Link href="/signup" style={{ display:'inline-block', background:'#f8fafc', color:'#0d0d14', textDecoration:'none', fontWeight:700, fontSize:'1.1rem', padding:'18px 48px', borderRadius:14, transition:'transform 0.15s' }}
             onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
             onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
             Get Started Free
           </Link>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'48px', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
             <div style={{ display:'flex', alignItems:'center', gap:10 }}>
               <span style={{ fontSize:'1.2rem' }}>☀️</span>
               <span style={{ fontWeight:800, color:'#f8fafc', fontSize: '1.1rem' }}>Kaeluma</span>
             </div>
             <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                © {new Date().getFullYear()} Kaeluma. All rights reserved.
             </div>
          </div>
        </footer>

      </div>
    </div>
  );
}