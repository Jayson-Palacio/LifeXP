'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import ProductPreview from './ProductPreview';
import AccountSettings, { persistHiddenAppsLocal, readHiddenAppsLocal } from './AccountSettings';
import { KAELUMA_APPS, normalizeHiddenApps, visibleApps } from '../lib/apps';
import { playClick } from '../lib/sounds';
import { logout } from '../app/login/actions';

const WIDE = '(min-width: 768px)';

function readView() {
  if (typeof window === 'undefined') return 'hub';
  return new URLSearchParams(window.location.search).get('tab') === 'account' ? 'account' : 'hub';
}

export default function AppLauncherClient({
  familyName: initialFamilyName,
  hiddenApps: initialHidden = [],
  questsReady,
  vitalReady,
  ledgerReady,
}) {
  const router = useRouter();
  const railRef = useRef(null);
  const [view, setView] = useState('hub');
  const [familyName, setFamilyName] = useState(initialFamilyName);
  const [hiddenApps, setHiddenApps] = useState(normalizeHiddenApps(initialHidden));
  const shown = useMemo(() => visibleApps(hiddenApps), [hiddenApps]);
  const [activeId, setActiveId] = useState(shown[0]?.id || KAELUMA_APPS[0].id);

  useEffect(() => {
    setView(readView());
    const local = readHiddenAppsLocal();
    if (Array.isArray(local) && initialHidden.length === 0) {
      setHiddenApps(normalizeHiddenApps(local));
    } else {
      persistHiddenAppsLocal(normalizeHiddenApps(initialHidden));
    }
  }, [initialHidden]);

  useEffect(() => {
    if (!shown.some((app) => app.id === activeId)) {
      setActiveId(shown[0]?.id || KAELUMA_APPS[0].id);
    }
  }, [shown, activeId]);

  const readyFor = (app) => {
    if (app.id === 'quests') return questsReady;
    if (app.id === 'vital') return vitalReady;
    if (app.id === 'ledger') return ledgerReady;
    if (app.id === 'table') return true;
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
    if (!root || view !== 'hub') return undefined;

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

    if (!window.matchMedia(WIDE).matches && shown[0]) centerCard(shown[0].id, false);
    pick();
    root.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    return () => {
      root.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, [view, shown]);

  const show = (appId) => {
    setActiveId(appId);
    centerCard(appId);
  };

  const go = (next) => {
    setView(next);
    const url = next === 'account' ? '/apps?tab=account' : '/apps';
    window.history.replaceState(null, '', url);
  };

  const active = shown.find((app) => app.id === activeId) || shown[0];

  return (
    <div className="site">
      <SiteNav
        account
        accountOpen={view === 'account'}
        onAccount={() => go(view === 'account' ? 'hub' : 'account')}
        onSignOut={() => logout()}
      />

      {view === 'account' ? (
        <main id="main" className="site-hub site-hub-account">
          <AccountSettings
            familyName={familyName}
            hiddenApps={hiddenApps}
            hasPin={questsReady}
            onFamilyName={setFamilyName}
            onHiddenApps={setHiddenApps}
          />
        </main>
      ) : (
        <main id="main" className={`site-hub site-hub-${active?.id || 'empty'}${shown.length < 3 ? ' is-few' : ''}`}>
          <header className="site-hub-intro">
            <p className="site-kicker">{familyName}</p>
            <h1>{shown.length ? 'Choose an app.' : 'No apps on your home screen.'}</h1>
            <p className="site-hub-lede">
              {shown.length
                ? 'One household. Tools for whoever needs them next.'
                : 'Add an app back from Account whenever you want it.'}
            </p>
            <button type="button" className="site-hub-manage" onClick={() => go('account')}>
              {shown.length ? 'Customize apps' : 'Add apps'}
            </button>
          </header>

          {shown.length > 0 && (
            <div className="site-hub-stage">
              <div
                ref={railRef}
                className={`site-hub-rail${shown.length < 3 ? ' is-few' : ''}`}
                aria-label="Family apps"
              >
                {shown.map((app) => {
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
          )}

          {shown.length > 1 && (
            <div className="site-hub-dock" role="tablist" aria-label="Switch app">
              {shown.map((app) => (
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
          )}

          {active && <p className="site-hub-hint">{active.description}</p>}
          <p className="site-hub-soon">Coming later — sleep, calendars, and the rest of home.</p>
        </main>
      )}
    </div>
  );
}
