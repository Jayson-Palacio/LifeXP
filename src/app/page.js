import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>
      {/* Cosmic background animation re-used from home page */}
      <div className="kaeluma-bg" />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '2.5rem' }}>☀</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kaeluma</div>
          </div>
          <div>
            <Link href="/login" className="btn btn-ghost" style={{ marginRight: 'var(--space-md)' }}>Log in</Link>
            <Link href="/signup" className="btn btn-primary">Sign up</Link>
          </div>
        </header>

        <main style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 'var(--space-lg)', letterSpacing: '-0.04em' }}>
            Turn Real Life <br />
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Into a Game.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto var(--space-2xl)', lineHeight: 1.6 }}>
            Kaeluma is the gamified chore manager that kids actually love. 
            Reward good habits, track missions, and let your family level up together in a magical shared universe.
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <Link href="/signup" className="btn btn-primary btn-lg" style={{ fontSize: '1.2rem', padding: '16px 32px', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)' }}>
              Start Playing Now
            </Link>
          </div>
          
          <div style={{ marginTop: '10vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-xl)', textAlign: 'left' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.3s ease' }} 
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
               <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎯</div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Epic Missions</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Assign daily chores, weekly habits, or one-off tasks. Kids earn XP and unlock customized rewards.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.3s ease' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
               <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎁</div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Real Rewards</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Let them cash out their gold coins for screen time, toys, or custom treats from the Parent Shop.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.3s ease' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
               <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>📈</div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Level Up Fast</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>A built-in RPG leveling system ensures your kids stay addicted to being helpful.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
