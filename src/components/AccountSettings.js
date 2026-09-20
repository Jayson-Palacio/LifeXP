'use client';

import { useState } from 'react';
import { KAELUMA_APPS } from '../lib/apps';
import { showToast } from '../lib/ui';
import { changeParentPin, updateHouseholdSettings } from '../app/actions/auth';
import { submitTicket } from '../app/actions/support';

const STRIPE_DONATION_URL = 'https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00';
const LOCAL_HIDDEN_KEY = 'kaeluma-hidden-apps';

export function persistHiddenAppsLocal(ids) {
  try {
    window.localStorage.setItem(LOCAL_HIDDEN_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readHiddenAppsLocal() {
  try {
    const raw = window.localStorage.getItem(LOCAL_HIDDEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AccountSettings({
  familyName,
  hiddenApps,
  hasPin,
  onFamilyName,
  onHiddenApps,
}) {
  const [name, setName] = useState(familyName || '');
  const [nameState, setNameState] = useState('idle');
  const [ticketType, setTicketType] = useState('bug');
  const [ticketMessage, setTicketMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === familyName) return;
    setNameState('saving');
    const res = await updateHouseholdSettings({ family_name: trimmed });
    if (res.success) {
      onFamilyName(trimmed);
      setNameState('saved');
      showToast('Family name saved');
      window.setTimeout(() => setNameState('idle'), 1600);
    } else {
      setNameState('idle');
      showToast(res.error || 'Could not save name', 'error');
    }
  };

  const setHidden = async (next) => {
    const previous = hiddenApps;
    onHiddenApps(next);
    persistHiddenAppsLocal(next);
    const res = await updateHouseholdSettings({ hidden_apps: next });
    if (!res.success) {
      const missingColumn = /hidden_apps/i.test(res.error || '');
      if (missingColumn) return;
      onHiddenApps(previous);
      persistHiddenAppsLocal(previous);
      showToast(res.error || 'Could not update apps', 'error');
    }
  };

  const hideApp = (id) => setHidden([...new Set([...hiddenApps, id])]);
  const showApp = (id) => setHidden(hiddenApps.filter((item) => item !== id));

  return (
    <div className="site-account">
      <header className="site-account-intro">
        <p className="site-kicker">Account</p>
        <h1>Household.</h1>
        <p>Name, PIN, and which apps show up after you sign in.</p>
      </header>

      <section className="site-account-card">
        <h2>Home screen</h2>
        <p className="site-account-lede">Hidden apps stay in the family — they just leave the picker until you add them back.</p>
        <ul className="site-account-apps">
          {KAELUMA_APPS.map((app) => {
            const hidden = hiddenApps.includes(app.id);
            return (
              <li key={app.id}>
                <div>
                  <strong>{app.name}</strong>
                  <span>{app.tagline} · {app.description}</span>
                </div>
                <button
                  type="button"
                  className="site-text-btn"
                  onClick={() => (hidden ? showApp(app.id) : hideApp(app.id))}
                >
                  {hidden ? 'Add' : 'Hide'}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="site-account-card">
        <h2>Family</h2>
        <div className="input-group">
          <div className="site-label-row">
            <label htmlFor="family-name">Family name</label>
            {nameState === 'saving' && <span>Saving…</span>}
            {nameState === 'saved' && <span>Saved</span>}
          </div>
          <input
            id="family-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
            maxLength={80}
          />
        </div>

        <div className="site-account-pin">
          <div>
            <strong>Parent PIN</strong>
            <p>{hasPin ? 'Used in Quests so kids cannot open parent controls.' : 'Created when you set up Quests.'}</p>
          </div>
          {hasPin && (
            <button type="button" className="site-text-btn" onClick={() => setShowPin(true)}>
              Change PIN
            </button>
          )}
        </div>
      </section>

      <section className="site-account-card">
        <h2>Support</h2>
        <p className="site-account-lede">Report a bug or suggest something for any Kaeluma app.</p>
        <select
          className="input"
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          disabled={sending}
        >
          <option value="bug">Bug</option>
          <option value="feature">Feature idea</option>
        </select>
        <textarea
          className="input"
          value={ticketMessage}
          onChange={(e) => setTicketMessage(e.target.value)}
          placeholder="What happened, or what would help?"
          rows={4}
          disabled={sending}
        />
        <button
          type="button"
          className="site-btn"
          disabled={sending || !ticketMessage.trim()}
          onClick={async () => {
            setSending(true);
            const res = await submitTicket(ticketType, ticketMessage);
            setSending(false);
            if (res.success) {
              showToast(ticketType === 'bug' ? 'Bug sent. Thank you.' : 'Idea sent. Thank you.');
              setTicketMessage('');
              setTicketType('bug');
            } else {
              showToast(res.error || 'Could not send', 'error');
            }
          }}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </section>

      <section className="site-account-card">
        <h2>Support Kaeluma</h2>
        <p className="site-account-lede">A voluntary one-time tip helps cover hosting. The apps stay free.</p>
        <a
          className="site-btn site-btn-sm"
          href={STRIPE_DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tip on Stripe
        </a>
      </section>

      {showPin && (
        <PinModal onClose={() => setShowPin(false)} />
      )}
    </div>
  );
}

function PinModal({ onClose }) {
  const [phase, setPhase] = useState('current');
  const [inputPin, setInputPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');

  const labels = {
    current: 'Current PIN',
    new: 'New PIN',
    confirm: 'Confirm new PIN',
  };

  const handleKey = (val) => {
    if (val === 'del') {
      setInputPin((p) => p.slice(0, -1));
      return;
    }
    if (inputPin.length >= 4) return;
    const next = inputPin + val;
    setInputPin(next);
    if (next.length < 4) return;

    window.setTimeout(async () => {
      if (phase === 'current') {
        setCurrentPin(next);
        setPhase('new');
        setInputPin('');
      } else if (phase === 'new') {
        setNewPin(next);
        setPhase('confirm');
        setInputPin('');
      } else if (next !== newPin) {
        setError('PINs do not match. Try again.');
        setPhase('new');
        setInputPin('');
        setNewPin('');
      } else {
        const res = await changeParentPin(currentPin, next);
        if (res.success) {
          showToast('PIN updated');
          onClose();
        } else {
          setError(res.error || 'Could not change PIN.');
          setPhase('current');
          setInputPin('');
          setCurrentPin('');
          setNewPin('');
        }
      }
    }, 80);
  };

  return (
    <div className="site-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="site-sheet" role="dialog" aria-labelledby="pin-title">
        <button type="button" className="site-sheet-close" onClick={onClose} aria-label="Close">×</button>
        <h2 id="pin-title">Change parent PIN</h2>
        <p>{labels[phase]}</p>
        <div className="site-account-dots" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i < inputPin.length ? 'is-on' : ''} />
          ))}
        </div>
        <div className="pin-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} className="pin-key" type="button" onClick={() => handleKey(String(n))}>{n}</button>
          ))}
          <button className="pin-key pin-key-empty" type="button" />
          <button className="pin-key" type="button" onClick={() => handleKey('0')}>0</button>
          <button className="pin-key pin-key-delete" type="button" onClick={() => handleKey('del')}>←</button>
        </div>
        {error && <p className="site-err">{error}</p>}
      </div>
    </div>
  );
}
