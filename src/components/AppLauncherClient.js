'use client';

import { useRouter } from 'next/navigation';
import BrandLogo from './BrandLogo';
import RocketShip from './RocketShip';
import { KAELUMA_APPS } from '../lib/apps';
import { playClick } from '../lib/sounds';
import { logout } from '../app/login/actions';

export default function AppLauncherClient({ familyName, questsReady, vitalReady }) {
  const router = useRouter();

  const statusFor = (app) => {
    if (app.id === 'quests') return questsReady ? 'Ready' : 'Needs setup';
    if (app.id === 'vital') return vitalReady ? 'Ready' : 'Set your first goal';
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
    <div className="role-select-page">
      <div className="kaeluma-bg" />
      <RocketShip />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 880, margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <BrandLogo href="/apps" size="md" />
          <button
            className="btn btn-ghost"
            style={{ color: 'var(--red)', fontSize: '0.85rem' }}
            onClick={() => logout()}
          >
            Sign out
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>
          {familyName}&apos;s hub
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 10px' }}>
          What are we working on?
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.6, marginBottom: 36 }}>
          Kaeluma is a fleet of apps for the whole family. Pick one to jump in — more are on the way.
        </p>

        <div className="app-pick-grid">
          {KAELUMA_APPS.map((app) => (
            <button
              key={app.id}
              className="app-pick-card"
              onClick={() => openApp(app)}
              style={{ '--app-accent': app.accent }}
            >
              <div className="app-pick-icon">{app.icon}</div>
              <div className="app-pick-name">{app.name}</div>
              <div className="app-pick-tag">{app.tagline}</div>
              <p className="app-pick-copy">{app.description}</p>
              <span className="app-pick-status">{statusFor(app)}</span>
            </button>
          ))}

          <div className="app-pick-card app-pick-soon" aria-disabled="true">
            <div className="app-pick-icon">✨</div>
            <div className="app-pick-name">Coming soon</div>
            <div className="app-pick-tag">More family apps</div>
            <p className="app-pick-copy">
              Sleep, money, calendars, and the rest of real life — built the Kaeluma way, one app at a time.
            </p>
            <span className="app-pick-status">On the roadmap</span>
          </div>
        </div>
      </div>
    </div>
  );
}
