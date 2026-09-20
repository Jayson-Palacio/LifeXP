'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ProductPreview from './ProductPreview';

const APPS = [
  {
    id: 'quests',
    name: 'Quests',
    kicker: 'Routines',
    headline: 'Mornings that run themselves.',
    lede: 'Kids take the routine. Parents approve, set the rewards, and keep adult tools behind a PIN.',
  },
  {
    id: 'vital',
    name: 'Vital',
    kicker: 'Health',
    headline: 'Health, without the noise.',
    lede: 'Meals, movement, and a calm plan for everyone under your roof — kids included, without turning dinner into a diet.',
  },
  {
    id: 'ledger',
    name: 'Ledger',
    kicker: 'Money',
    headline: 'What goes out, what you keep.',
    lede: 'Track monthly spending, then see the yearly savings you are on pace for — this month’s leftover, times 12.',
  },
];

const INTERVAL = 7000;

function slotFor(index, active, total) {
  if (index === active) return 'front';
  if (index === (active - 1 + total) % total) return 'left';
  return 'right';
}

export default function HomeShowcase() {
  const [index, setIndex] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const id = window.location.hash.replace('#', '');
    const found = APPS.findIndex((app) => app.id === id);
    return found >= 0 ? found : 0;
  });
  const [paused, setPaused] = useState(false);
  const active = APPS[index];

  const select = useCallback((next) => {
    setIndex(next);
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace('#', '');
      const found = APPS.findIndex((app) => app.id === id);
      if (found >= 0) setIndex(found);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % APPS.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [paused, index]);

  return (
    <section
      className={`site-showcase site-showcase-${active.id}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <span id="quests" className="site-showcase-anchor" />
      <span id="vital" className="site-showcase-anchor" />
      <span id="ledger" className="site-showcase-anchor" />

      <div className="site-showcase-intro">
        <p className="site-kicker">Kaeluma</p>
        <h1>Live well, together.</h1>
        <p>The apps your household actually uses. One login. Nothing to buy.</p>
        <div className="site-hero-actions">
          <Link href="/signup" className="site-btn">Get started</Link>
          <Link href="/login" className="site-more">Log in</Link>
        </div>
      </div>

      <div className="site-showcase-stage" aria-hidden="true">
        {APPS.map((app, i) => (
          <button
            key={app.id}
            type="button"
            className={`site-showcase-phone is-${slotFor(i, index, APPS.length)}`}
            tabIndex={-1}
            onClick={() => select(i)}
          >
            <ProductPreview app={app.id} />
          </button>
        ))}
      </div>

      <div className="site-showcase-pills" role="tablist" aria-label="Kaeluma apps">
        {APPS.map((app, i) => (
          <button
            key={app.id}
            id={`showcase-${app.id}`}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={i === index ? 'is-active' : ''}
            onClick={() => select(i)}
          >
            <span>{app.name}</span>
            {i === index && !paused ? <i className="site-showcase-tick" /> : null}
          </button>
        ))}
      </div>

      <div className="site-showcase-copy" aria-live="polite">
        <p className="site-kicker">{active.kicker}</p>
        <h2>{active.headline}</h2>
        <p>{active.lede}</p>
      </div>
    </section>
  );
}
