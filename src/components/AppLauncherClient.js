'use client';

import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import ProductPreview from './ProductPreview';
import { KAELUMA_APPS } from '../lib/apps';
import { playClick } from '../lib/sounds';
import { logout } from '../app/login/actions';

export default function AppLauncherClient({ familyName, questsReady }) {
  const router = useRouter();

  const statusFor = (app) => {
    if (app.id === 'quests') return questsReady ? 'Ready' : 'Set up first';
    if (app.id === 'vital') return 'Open';
    return '';
  };

  const openApp = (app) => {
    if (playClick) playClick();
    if (app.id === 'quests' && !questsReady) {
      router.push(app.setupHref);
      return;
    }
    router.push(app.href);
  };

  return (
    <div className="site">
      <SiteNav account onSignOut={() => logout()} />

      <main id="main" className="site-apps-page">
        <p className="site-kicker">{familyName}</p>
        <h1>Choose an app.</h1>
        <p className="site-lede">
          One household. Tools for whoever needs them next.
        </p>

        <div className="site-apps">
          {KAELUMA_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              className="site-app"
              onClick={() => openApp(app)}
            >
              <div className="site-app-copy">
                <p className="site-kicker">{app.name}</p>
                <h2>{app.tagline}.</h2>
                <p>{app.description}</p>
                <span className="site-more">{statusFor(app) === 'Ready' ? 'Open' : statusFor(app)}</span>
              </div>
              <ProductPreview app={app.id} />
            </button>
          ))}

          <div className="site-app site-app-soon" aria-disabled="true">
            <div className="site-app-copy">
              <p className="site-kicker">Coming later</p>
              <h2>More of home.</h2>
              <p>Sleep, money, calendars — the rest of family life, one app at a time.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
