'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import ProductPreview from './ProductPreview';
import { KAELUMA_APPS } from '../lib/apps';
import { playClick } from '../lib/sounds';
import { logout } from '../app/login/actions';

const WIDE = '(min-width: 768px)';

export default function AppLauncherClient({ familyName, questsReady, vitalReady, ledgerReady }) {
  const router = useRouter();
  const railRef = useRef(null);
  const [activeId, setActiveId] = useState(KAELUMA_APPS[0].id);

  const readyFor = (app) => {
    if (app.id === 'quests') return questsReady;
    if (app.id === 'vital') return vitalReady;
    if (app.id === 'ledger') return ledgerReady;
    return false;
  };

  const openApp = (app) => {
    if (playClick) playClick();
    if (app.id === 'quests' && !questsReady) {
      router.push(app.setupHref);
      return;
    }
    router.push(app.href);
  };

  useEffect(() => {
    KAELUMA_APPS.forEach((app) => {
      router.prefetch(app.href);
      if (app.setupHref) router.prefetch(app.setupHref);
    });
  }, [router]);

  const centerCard = (appId, smooth = true) => {
    const root = railRef.current;
    const card = root?.querySelector(`[data-app="${appId}"]`);
    if (!root || !card) return;
    const left = card.offsetLeft - (root.clientWidth - card.clientWidth) / 2;
    root.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    const root = railRef.current;
    if (!root) return undefined;

    const cards = [...root.querySelectorAll('[data-app]')];
    const pick = () => {
      if (window.matchMedia(WIDE).matches) return;
      const box = root.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best = cards[0];
      let bestDist = Infinity;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = card;
        }
      });
      if (best?.dataset.app) setActiveId(best.dataset.app);
    };

    if (!window.matchMedia(WIDE).matches) centerCard(KAELUMA_APPS[0].id, false);
    pick();
    root.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    return () => {
      root.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, []);

  const show = (appId) => {
    setActiveId(appId);
    centerCard(appId);
  };

  const active = KAELUMA_APPS.find((app) => app.id === activeId) || KAELUMA_APPS[0];

  return (
    <div className="site">
      <SiteNav account onSignOut={() => logout()} />

      <main id="main" className={`site-hub site-hub-${activeId}`}>
        <header className="site-hub-intro">
          <p className="site-kicker">{familyName}</p>
          <h1>Choose an app.</h1>
          <p className="site-hub-lede">One household. Tools for whoever needs them next.</p>
        </header>

        <div className="site-hub-stage">
          <div
            ref={railRef}
            className="site-hub-rail"
            aria-label="Family apps"
          >
            {KAELUMA_APPS.map((app) => {
              const ready = readyFor(app);
              return (
                <button
                  key={app.id}
                  type="button"
                  data-app={app.id}
                  className={`site-hub-card site-hub-card-${app.id}${activeId === app.id ? ' is-active' : ''}`}
                  aria-label={`${ready ? 'Open' : 'Set up'} ${app.name}`}
                  onClick={() => openApp(app)}
                >
                  <div className="site-hub-phone">
                    <ProductPreview app={app.id} />
                  </div>
                  <div className="site-hub-card-copy">
                    <p className="site-kicker">{app.name}</p>
                    <h2>{app.tagline}</h2>
                    <p className="site-hub-desc">{app.description}</p>
                    <span className={`site-hub-chip${ready ? ' is-ready' : ''}`}>
                      {ready ? 'Ready' : 'Set up first'}
                    </span>
                    <span className="site-hub-open">{ready ? 'Open' : 'Set up'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="site-hub-dock" role="tablist" aria-label="Switch app">
          {KAELUMA_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              role="tab"
              aria-selected={activeId === app.id}
              className={activeId === app.id ? 'is-active' : ''}
              onClick={() => show(app.id)}
            >
              {app.name}
            </button>
          ))}
        </div>

        <p className="site-hub-hint">{active.description}</p>
        <p className="site-hub-soon">Coming later — sleep, calendars, and the rest of home.</p>
      </main>
    </div>
  );
}
