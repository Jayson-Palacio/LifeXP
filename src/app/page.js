'use client'

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SiteSupport from '../components/SiteSupport';
import ProductPreview from '../components/ProductPreview';
import FAQSection from '../components/FAQSection';

export default function LandingPage() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="site">
      <SiteNav onSupport={() => setShowSupport(true)} />

      <main id="main">
        <section className="site-hero">
          <p className="site-kicker">Kaeluma</p>
          <h1>Live well, together.</h1>
          <p>The apps your household actually uses. One login. Nothing to buy.</p>
          <div className="site-hero-actions">
            <Link href="/signup" className="site-btn">Get started</Link>
            <Link href="/login" className="site-more">Log in</Link>
          </div>
        </section>

        <section id="quests" className="site-stage site-stage-quests">
          <div className="site-stage-copy">
            <p className="site-kicker">Quests</p>
            <h2>Mornings that run themselves.</h2>
            <p>
              Kids take the routine. Parents approve, set the rewards, and keep adult tools behind a PIN.
            </p>
            <Link href="/signup" className="site-more">Get started</Link>
          </div>
          <ProductPreview app="quests" />
        </section>

        <section id="vital" className="site-stage site-stage-vital">
          <div className="site-stage-copy">
            <p className="site-kicker">Vital</p>
            <h2>Health, without the noise.</h2>
            <p>
              Meals, weight, and a calm plan for everyone under your roof — kids included, without turning dinner into a diet.
            </p>
            <Link href="/signup" className="site-more">Get started</Link>
          </div>
          <ProductPreview app="vital" />
        </section>

        <section className="site-stage site-stage-soon">
          <div className="site-stage-copy site-stage-copy-center">
            <p className="site-kicker">Coming later</p>
            <h2>More of home.</h2>
            <p>Sleep, money, calendars. Same family account, new apps as we take on more of real life.</p>
          </div>
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
