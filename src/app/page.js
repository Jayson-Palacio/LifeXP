'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RocketShip from '../components/RocketShip';
import InteractiveHeroMockup from '../components/InteractiveHeroMockup';
import FAQSection from '../components/FAQSection';
import ContactForm from '../components/ContactForm';

export default function LandingPage() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden', paddingBottom: 'var(--space-2xl)' }}>
      {/* Cosmic background animation re-used from home page */}
      <div className="kaeluma-bg" />
      <RocketShip />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
        
        {/* Navigation */}
        <header style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '2.5rem' }}>☀</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kaeluma</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setShowContactModal(true)} 
              className="btn btn-ghost" 
              style={{ 
                fontSize: '0.95rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>💬</span> Support
            </button>
            <Link href="/login" className="btn btn-ghost">Log in</Link>
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

          {/* Hero Mockup (Child Dashboard Simulator) */}
          <InteractiveHeroMockup />

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

          {/* Why We Created Kaeluma */}
          <div style={{ 
            maxWidth: 800, 
            margin: '0 auto 10vh', 
            textAlign: 'center', 
            padding: '40px 32px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>💙</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 16, color: '#fff' }}>Why We Created Kaeluma</h3>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'var(--text-muted)', 
              lineHeight: 1.6, 
              maxWidth: 680, 
              margin: '0 auto' 
            }}>
              Kaeluma was born out of a simple need: we wanted an easy and fun way for our 5-year-old to understand his morning to-do list. By turning routines into a game, we went from reminding him 5+ times to do basic things like brush his teeth and make his bed, to watching him look forward to completing his missions and collecting rewards. We built Kaeluma to bring that same morning magic to your family.
            </p>
          </div>

          {/* Interactive FAQ Section */}
          <FAQSection />

          {/* Final CTA */}
          <div style={{ padding: '60px 20px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', marginBottom: '10vh' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 24 }}>Ready to Level Up?</h2>
            <Link href="/signup" className="btn btn-primary btn-lg" style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
              Create Your Family Account Free
            </Link>
          </div>

          {/* Landing Page Footer */}
          <footer style={{ 
            marginTop: '10vh', 
            borderTop: '1px solid rgba(255,255,255,0.06)', 
            paddingTop: 24, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap', 
            gap: 16, 
            color: 'var(--text-dim)', 
            fontSize: '0.85rem' 
          }}>
            <div>© {new Date().getFullYear()} Kaeluma. Made with ❤️ for families.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <a 
                href="https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-support-link"
              >
                <span>💝</span> Support Kaeluma
              </a>
            </div>
          </footer>

        </main>
      </div>

      {/* Contact Modal Overlay */}
      {showContactModal && (
        <div 
          className="modal-overlay" 
          onPointerDown={(e) => { if (e.target === e.currentTarget) setShowContactModal(false); }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 13, 22, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: 500, 
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              position: 'relative',
              animation: 'scaleIn 0.3s var(--ease-bounce)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowContactModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'color 0.2s',
                zIndex: 10
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-bright)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ✕
            </button>

            <ContactForm isModal={true} onSuccess={() => setTimeout(() => setShowContactModal(false), 2000)} />
          </div>
        </div>
      )}
    </div>
  )
}
