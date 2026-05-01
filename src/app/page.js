import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden', paddingBottom: 'var(--space-2xl)' }}>
      {/* Cosmic background animation re-used from home page */}
      <div className="kaeluma-bg" />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
        
        {/* Navigation */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '2.5rem' }}>☀</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kaeluma</div>
          </div>
          <div>
            <Link href="/login" className="btn btn-ghost" style={{ marginRight: 'var(--space-md)' }}>Log in</Link>
            <Link href="/signup" className="btn btn-primary">Sign up</Link>
          </div>
        </header>

        {/* Hero Section */}
        <main style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 'var(--space-lg)', letterSpacing: '-0.04em' }}>
            Turn Real Life <br />
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Into a Game.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto var(--space-2xl)', lineHeight: 1.6 }}>
            Kaeluma is the gamified chore manager that kids actually love. 
            Reward good habits, track missions, and let your family level up together in a magical shared universe.
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginBottom: '10vh' }}>
            <Link href="/signup" className="btn btn-primary btn-lg" style={{ fontSize: '1.2rem', padding: '16px 32px', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)' }}>
              Start Playing Now
            </Link>
          </div>

          {/* Hero Mockup (Child Dashboard) */}
          <div style={{ 
            maxWidth: 500, 
            margin: '0 auto 15vh', 
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '24px', 
            padding: '24px', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
            transform: 'perspective(1000px) rotateX(2deg)',
            animation: 'float 6s ease-in-out infinite'
          }}>
            {/* Mockup Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🦁</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>Leo</div>
                  <div style={{ fontSize: '0.9rem', color: '#a855f7', fontWeight: 700 }}>Lv 5 Space Cadet</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                <span style={{ fontSize: '1.2rem' }}>🪙</span>
                <span style={{ fontWeight: 800, color: '#fcd34d' }}>150</span>
              </div>
            </div>

            {/* Mockup XP Bar */}
            <div style={{ background: 'rgba(0,0,0,0.3)', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 32 }}>
              <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', borderRadius: 6 }}></div>
            </div>

            {/* Mockup Missions */}
            <div style={{ textAlign: 'left', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: 12 }}>Today's Missions</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Mission 1 */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛏️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: '#fff' }}>Make Bed</div>
                    <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 700 }}>+15 XP</div>
                  </div>
                </div>
                <div style={{ background: '#22c55e', color: '#fff', padding: '8px 16px', borderRadius: 12, fontWeight: 800, fontSize: '0.9rem' }}>Done!</div>
              </div>

              {/* Mission 2 */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📖</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: '#fff' }}>Read 20 Mins</div>
                    <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 700 }}>+25 XP</div>
                  </div>
                </div>
                <div style={{ border: '2px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 14px', borderRadius: 12, fontWeight: 800, fontSize: '0.9rem' }}>Go</div>
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes float {
              0% { transform: perspective(1000px) rotateX(2deg) translateY(0px); }
              50% { transform: perspective(1000px) rotateX(2deg) translateY(-15px); }
              100% { transform: perspective(1000px) rotateX(2deg) translateY(0px); }
            }
          `}} />

          {/* Three Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-xl)', textAlign: 'left', marginBottom: '15vh' }}>
            <div className="landing-feature">
               <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎯</div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Epic Missions</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Assign daily chores, weekly habits, or one-off tasks. Kids earn XP and unlock customized rewards.</p>
            </div>
            <div className="landing-feature">
               <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎁</div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Real Rewards</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Let them cash out their gold coins for screen time, toys, or custom treats from the Parent Shop.</p>
            </div>
            <div className="landing-feature">
               <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>📈</div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Level Up Fast</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>A built-in RPG leveling system ensures your kids stay addicted to being helpful.</p>
            </div>
          </div>

          {/* How It Works Timeline */}
          <div style={{ marginBottom: '15vh' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 'var(--space-2xl)' }}>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)', position: 'relative' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', marginBottom: -10, textAlign: 'left' }}>1</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, textAlign: 'left', color: '#fff' }}>Assign</h3>
                <p style={{ color: 'var(--text-muted)', textAlign: 'left', lineHeight: 1.5 }}>Parents set up chores, routines, and custom rewards in seconds using our Inspiration Library.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', marginBottom: -10, textAlign: 'left' }}>2</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, textAlign: 'left', color: '#fff' }}>Play</h3>
                <p style={{ color: 'var(--text-muted)', textAlign: 'left', lineHeight: 1.5 }}>Kids log in to their magical dashboard, check off their missions, and watch their XP bar grow.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', marginBottom: -10, textAlign: 'left' }}>3</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, textAlign: 'left', color: '#fff' }}>Redeem</h3>
                <p style={{ color: 'var(--text-muted)', textAlign: 'left', lineHeight: 1.5 }}>Kids spend their hard-earned Gold Coins in the Reward Shop for real-life treats.</p>
              </div>
            </div>
          </div>

          {/* Dual Value Proposition */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-2xl)', marginBottom: '15vh', textAlign: 'left' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent)', padding: 40, borderRadius: 32, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 16 }}>For Parents</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}><span style={{ color: '#6366f1' }}>✓</span> No more nagging to get chores done</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}><span style={{ color: '#6366f1' }}>✓</span> Track behavior and habit building</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}><span style={{ color: '#6366f1' }}>✓</span> Manage screen time allowances easily</li>
              </ul>
            </div>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), transparent)', padding: 40, borderRadius: 32, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>🎮</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 16 }}>For Kids</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}><span style={{ color: '#a855f7' }}>✓</span> Colorful, fun, interactive UI</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}><span style={{ color: '#a855f7' }}>✓</span> Level up and unlock cool themes</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}><span style={{ color: '#a855f7' }}>✓</span> Learn responsibility through gamification</li>
              </ul>
            </div>
          </div>

          {/* Testimonial */}
          <div style={{ maxWidth: 800, margin: '0 auto 10vh', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: -20 }}>"</div>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 24 }}>
              Kaeluma completely transformed our mornings. My kids actually race to see who can finish their routine and earn their XP first. It feels like magic.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4b5563' }}></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800 }}>Sarah J.</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mom of 2</div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div style={{ padding: '60px 20px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 24 }}>Ready to Level Up?</h2>
            <Link href="/signup" className="btn btn-primary btn-lg" style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
              Create Your Family Account Free
            </Link>
          </div>

        </main>
      </div>
    </div>
  )
}
