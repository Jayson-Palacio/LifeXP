'use client'

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SiteSupport from '../components/SiteSupport';
import HomeShowcase from '../components/HomeShowcase';
import FAQSection from '../components/FAQSection';

export default function LandingPage() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="site">
      <SiteNav onSupport={() => setShowSupport(true)} />

      <main id="main">
        <HomeShowcase />

        <section className="site-soon">
          <p className="site-kicker">Coming later</p>
          <h2>Sleep, calendars, and the rest of home.</h2>
          <p>Same family account. New apps as we take on more of real life.</p>
        </section>

        <section className="site-points">
          <div className="site-point">
            <h3>One account</h3>
            <p>Sign up once. Everyone in the household uses the same login, then picks the app they need.</p>
          </div>
          <div className="site-point">
            <h3>Built to stay out of the way</h3>
            <p>No ads, no subscriptions, no loot shops. The software does the job and then gets quiet.</p>
          </div>
          <div className="site-point">
            <h3>Made by a parent</h3>
            <p>It started with a five-year-old and the morning rush. It is growing into the rest of family life.</p>
          </div>
        </section>

        <FAQSection />

        <section className="site-close">
          <h2>Start with your household.</h2>
          <p>Free. Takes a couple of minutes.</p>
          <Link href="/signup" className="site-btn">Get started</Link>
        </section>
      </main>

      <SiteFooter />

      {showSupport && (
        <div
          className="site-overlay"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setShowSupport(false);
          }}
        >
          <SiteSupport
            onClose={() => setShowSupport(false)}
            onSuccess={() => setShowSupport(false)}
          />
        </div>
      )}
    </div>
  );
}
