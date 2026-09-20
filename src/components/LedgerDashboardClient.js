'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandLogo from './BrandLogo';
import { addLedgerEntry, deleteLedgerEntry, saveLedgerSettings } from '../app/actions/ledger';
import {
  listEnvelopes,
  makeEnvelopeId,
  money,
  parseAllocations,
  summarizeLedger,
} from '../lib/ledger';
import { localYmd } from '../lib/time';
import { playClick, playPop } from '../lib/sounds';

const QUICK_AMOUNTS = [12, 20, 40, 80, 120];

function envelopeState(settings) {
  const envelopes = listEnvelopes(settings);
  const parsed = parseAllocations(settings?.allocations, envelopes);
  const alloc = {};
  for (const row of envelopes) {
    alloc[row.id] = parsed[row.id] ? String(parsed[row.id]) : '';
  }
  return { envelopes, alloc };
}

function shiftYmd(ymd, days) {
  const [year, month, day] = ymd.split('-').map(Number);
  return localYmd(new Date(year, month - 1, day + days));
}

function ringMoney(value) {
  const amount = Math.round(Number(value) || 0);
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';
  if (abs >= 10000) {
    const k = abs / 1000;
    return `${sign}$${k >= 100 ? Math.round(k) : k.toFixed(k % 1 === 0 ? 0 : 1)}k`;
  }
  return `${sign}$${abs.toLocaleString()}`;
}

function MoneyRing({ value = 0, max = 100, label, caption, color = '#2f6b4f', remain = false }) {
  const safeMax = max > 0 ? max : 1;
  const n = Number(value) || 0;
  const ratio = Math.abs(n) / safeMax;
  const over = n < 0 || (!remain && ratio > 1.02);
  const pct = Math.min(100, Math.round(ratio * 100));
  const stroke = over ? '#e24b4a' : color;
  const display = remain ? ringMoney(Math.abs(n)) : ringMoney(n);
  const hint = remain ? (n < 0 ? 'over' : 'left') : '';

  return (
    <div className="vital-ring" style={{ '--vital-ring-size': '112px' }}>
      <div className="vital-ring-dial">
        <svg viewBox="0 0 100 100" className="vital-ring-svg" aria-hidden="true">
          <circle cx="50" cy="50" r="38" className="vital-ring-track" />
          <circle
            cx="50"
            cy="50"
            r="38"
            className="vital-ring-arc"
            pathLength="100"
            stroke={stroke}
            strokeDasharray={`${pct} 100`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="vital-ring-center">
          <strong>{display}</strong>
          {hint ? <span>{hint}</span> : null}
        </div>
      </div>
      {label ? <p className="vital-ring-label">{label}</p> : null}
      {caption ? <p className="vital-ring-caption">{caption}</p> : null}
    </div>
  );
}

export default function LedgerDashboardClient({
  settings,
  entries = [],
  tableMissing = false,
  firstName = '',
  initialToday,
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState('today');
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('groceries');
  const [kind, setKind] = useState('spend');
  const [note, setNote] = useState('');
  const [loggedOn, setLoggedOn] = useState(initialToday);
  const [income, setIncome] = useState(settings?.monthly_income != null ? String(settings.monthly_income) : '');
  const [goal, setGoal] = useState(settings?.yearly_goal != null ? String(settings.yearly_goal) : '');
  const [alloc, setAlloc] = useState(() => envelopeState(settings).alloc);
  const [envelopes, setEnvelopes] = useState(() => envelopeState(settings).envelopes);
  const [newEnvelope, setNewEnvelope] = useState('');
  const [today, setToday] = useState(initialToday);

  useEffect(() => {
    const now = localYmd();
    setToday(now);
    setLoggedOn((prev) => (prev === initialToday ? now : prev));
  }, [initialToday]);

  useEffect(() => {
    setIncome(settings?.monthly_income != null ? String(settings.monthly_income) : '');
    setGoal(settings?.yearly_goal != null ? String(settings.yearly_goal) : '');
    const next = envelopeState(settings);
    setEnvelopes(next.envelopes);
    setAlloc(next.alloc);
  }, [settings]);

  const summary = useMemo(
    () => summarizeLedger({ settings, entries, today: today || initialToday }),
    [settings, entries, today, initialToday]
  );

  const needsPlan = !tableMissing && !settings;
  const hello = firstName ? `${firstName}, ` : '';
  const yesterday = today ? shiftYmd(today, -1) : '';

  const run = (fn) => {
    setError('');
    startTransition(async () => {
      const result = await fn();
      if (!result?.success) {
        setError(result?.error || 'That did not save.');
        return;
      }
      router.refresh();
    });
  };

  const handlePlan = (event) => {
    event.preventDefault();
    if (playClick) playClick();
    run(() => saveLedgerSettings({
      monthly_income: income,
      yearly_goal: goal,
      allocations: alloc,
      envelopes: envelopes.filter((row) => row.custom).map(({ id, name }) => ({ id, name })),
    }));
  };

  const addEnvelope = (event) => {
    event.preventDefault();
    const name = newEnvelope.trim().slice(0, 32);
    if (!name) return;
    if (envelopes.some((row) => row.name.toLowerCase() === name.toLowerCase())) {
      setError('That envelope already exists.');
      return;
    }
    if (envelopes.filter((row) => row.custom).length >= 20) {
      setError('Twenty custom envelopes is the limit.');
      return;
    }
    const id = makeEnvelopeId(name, new Set(envelopes.map((row) => row.id)));
    setEnvelopes((prev) => [...prev, { id, name, custom: true }]);
    setAlloc((prev) => ({ ...prev, [id]: '' }));
    setNewEnvelope('');
    setError('');
    if (playPop) playPop();
  };

  const removeEnvelope = (id) => {
    if (playClick) playClick();
    setEnvelopes((prev) => prev.filter((row) => row.id !== id));
    setAlloc((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (category === id) setCategory('other');
  };

  const handleLog = (event) => {
    event.preventDefault();
    if (playPop) playPop();
    run(async () => {
      const result = await addLedgerEntry({
        amount,
        kind,
        category,
        note,
        logged_on: loggedOn,
      });
      if (result?.success) {
        setAmount('');
        setNote('');
        setLoggedOn(today);
      }
      return result;
    });
  };

  const liveAllocTotal = envelopes.reduce((total, cat) => total + (Number(alloc[cat.id]) || 0), 0);
  const liveIncome = Number(income) || 0;
  const liveUnallocated = liveIncome - liveAllocTotal;

  const selectedEnvelope = kind === 'spend'
    ? summary.byCategory.find((row) => row.id === category)
      || { allocated: summary.allocations?.[category] || 0, spent: 0, left: summary.allocations?.[category] || 0, over: false }
    : null;

  const heroTitle = !summary.hasPlan
    ? 'Set take-home to see a yearly pace.'
    : summary.expectedYear >= 0
      ? `On pace to keep ${money(summary.expectedYear)} a year.`
      : `On pace to spend ${money(Math.abs(summary.expectedYear))} more than you take in, over a year.`;

  const heroSub = summary.hasPlan
    ? `${summary.bounds.label}: ${money(summary.monthSpend, { cents: true })} out of ${money(summary.monthIn)} in.`
    : 'Log what goes out. Yearly savings is this month’s leftover × 12.';

  return (
    <div className="vital-app ledger-app">
      <header className="vital-top">
        <div className="vital-top-brand">
          <BrandLogo href="/apps" size="sm" tone="ink" />
          <span>Ledger</span>
        </div>
        <Link href="/apps?tab=account" className="vital-text-btn">Account</Link>
        <Link href="/apps" className="vital-text-btn">Apps</Link>
      </header>

      <main className="vital-main">
        {tableMissing && (
          <div className="vital-card vital-warn">
            <strong>One setup step left.</strong>
            <p>Run <code>kaeluma_catchup.sql</code> in the Supabase SQL editor so spending, savings, and envelopes can save.</p>
          </div>
        )}

        {needsPlan ? (
          <form className="vital-hero" onSubmit={handlePlan}>
            <div className="vital-hero-copy">
              <p className="vital-kicker">Household money</p>
              <h1>{hello}what comes in each month?</h1>
              <p>
                Take-home for the household. Ledger subtracts what you spend, then multiplies this month’s leftover by 12 for a yearly pace.
              </p>
              <label htmlFor="onboard-income">Monthly take-home</label>
              <input
                id="onboard-income"
                className="vital-input ledger-money-input"
                inputMode="decimal"
                type="number"
                min="0"
                step="1"
                required
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="7200"
              />
              <label htmlFor="onboard-goal">Yearly savings aim (optional)</label>
              <input
                id="onboard-goal"
                className="vital-input ledger-money-input"
                inputMode="decimal"
                type="number"
                min="0"
                step="1"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="18000"
              />
              {error ? <p className="vital-err">{error}</p> : null}
              <button className="vital-btn" type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Start tracking'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <section className="vital-hero">
              <div className="vital-hero-copy">
                <p className="vital-kicker">{summary.bounds.label}</p>
                <h1>{heroTitle}</h1>
                <p>{heroSub}</p>
                <button type="button" className="vital-hero-link" onClick={() => setTab('plan')}>
                  Edit plan
                </button>
              </div>
              <div className="vital-rings">
                <MoneyRing
                  value={summary.monthSpend}
                  max={summary.hasPlan ? summary.monthIn : Math.max(summary.monthSpend, 1)}
                  label="Spent"
                  caption={summary.bounds.label}
                  color="#0d7377"
                />
                <MoneyRing
                  value={summary.monthSaved}
                  max={summary.hasPlan ? Math.max(summary.monthIn, 1) : Math.max(Math.abs(summary.monthSaved), 1)}
                  label="Saved"
                  caption="this month"
                  color="#2f6b4f"
                />
                <MoneyRing
                  value={summary.expectedYear}
                  max={summary.yearlyGoal || Math.max(Math.abs(summary.expectedYear), 1)}
                  label="Year"
                  caption={summary.yearlyGoal ? `aim ${money(summary.yearlyGoal)}` : 'expected'}
                  color="#c8920a"
                />
              </div>
            </section>

            <div className="vital-tabs" role="tablist">
              {[
                { id: 'today', label: 'Today' },
                { id: 'month', label: 'Month' },
                { id: 'plan', label: 'Plan' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={tab === item.id ? 'is-active' : ''}
                  onClick={() => {
                    if (playClick) playClick();
                    setTab(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {error ? <p className="vital-err">{error}</p> : null}

            {tab === 'today' && (
              <form className="vital-card" onSubmit={handleLog}>
                <div className="vital-card-head">
                  <p className="vital-kicker">Log</p>
                  <div className="vital-meals">
                    {[
                      { id: 'spend', label: 'Spend' },
                      { id: 'income', label: 'Extra in' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={kind === item.id ? 'is-active' : ''}
                        onClick={() => setKind(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label htmlFor="ledger-amount">Amount</label>
                <input
                  id="ledger-amount"
                  className="vital-input ledger-money-input"
                  inputMode="decimal"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />

                <div className="vital-chips">
                  {QUICK_AMOUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="vital-chip"
                      onClick={() => setAmount(String(n))}
                    >
                      {money(n)}
                    </button>
                  ))}
                </div>

                {kind === 'spend' && (
                  <>
                    <p className="vital-kicker" style={{ marginTop: 8 }}>Category</p>
                    <div className="vital-meals">
                      {envelopes.map((row) => (
                        <button
                          key={row.id}
                          type="button"
                          className={category === row.id ? 'is-active' : ''}
                          onClick={() => setCategory(row.id)}
                        >
                          {row.name}
                        </button>
                      ))}
                    </div>
                    {selectedEnvelope?.allocated > 0 ? (
                      <p className={`vital-muted${selectedEnvelope.over ? ' ledger-over' : ''}`}>
                        {selectedEnvelope.over
                          ? `${money(Math.abs(selectedEnvelope.left), { cents: true })} over the ${money(selectedEnvelope.allocated)} ${envelopes.find((row) => row.id === category)?.name || 'envelope'}.`
                          : `${money(selectedEnvelope.left, { cents: true })} left of ${money(selectedEnvelope.allocated)} for ${envelopes.find((row) => row.id === category)?.name || 'this envelope'}.`}
                      </p>
                    ) : null}
                  </>
                )}

                <label htmlFor="ledger-note">Note</label>
                <input
                  id="ledger-note"
                  className="vital-input"
                  maxLength={80}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={kind === 'income' ? 'Bonus, gift, side work' : 'Store or what it was'}
                />

                <div className="vital-meals" style={{ marginTop: 12 }}>
                  {[
                    { id: today, label: 'Today' },
                    { id: yesterday, label: 'Yesterday' },
                  ].map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className={loggedOn === row.id ? 'is-active' : ''}
                      onClick={() => setLoggedOn(row.id)}
                    >
                      {row.label}
                    </button>
                  ))}
                </div>

                <button className="vital-btn" type="submit" disabled={pending || tableMissing}>
                  {pending ? 'Saving…' : kind === 'income' ? 'Add income' : 'Log spend'}
                </button>
              </form>
            )}

            {tab === 'month' && (
              <>
                <div className="vital-card">
                  <div className="vital-card-head">
                    <p className="vital-kicker">{summary.bounds.label}</p>
                    <span>{money(summary.monthSpend, { cents: true })} out</span>
                  </div>
                  {summary.byCategory.length === 0 ? (
                    <p className="vital-muted">
                      {summary.hasAllocations
                        ? 'Nothing spent against this month’s envelopes yet.'
                        : 'Set envelopes on Plan, or log a spend to see the month.'}
                    </p>
                  ) : (
                    <ul className="ledger-bars">
                      {summary.byCategory
                        .sort((a, b) => (b.allocated || b.spent) - (a.allocated || a.spent))
                        .map((row) => {
                          const max = row.allocated || summary.monthSpend || 1;
                          const width = Math.max(6, Math.min(100, (row.spent / max) * 100));
                          return (
                            <li key={row.id} className={row.over ? 'is-over' : ''}>
                              <span>{row.name}</span>
                              <span className="ledger-bar-track">
                                <span className="ledger-bar-fill" style={{ width: `${width}%` }} />
                              </span>
                              <div>
                                <strong>{money(row.spent, { cents: true })}</strong>
                                <em>
                                  {row.allocated
                                    ? (row.over
                                      ? `${money(Math.abs(row.left), { cents: true })} over`
                                      : `${money(row.left, { cents: true })} left of ${money(row.allocated)}`)
                                    : 'no envelope'}
                                </em>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                  {summary.hasPlan ? (
                    <p className="vital-muted" style={{ marginTop: 12 }}>
                      {summary.hasAllocations
                        ? `${money(summary.allocatedTotal)} allocated. ${money(summary.unallocated)} unallocated toward savings.`
                        : 'Add category envelopes on Plan so each bucket has a monthly amount.'}
                    </p>
                  ) : null}
                </div>

                <div className="vital-card">
                  <p className="vital-kicker">This month</p>
                  {summary.monthRows.length === 0 ? (
                    <p className="vital-muted">Log a spend on Today and it shows up here.</p>
                  ) : (
                    <ul className="ledger-list">
                      {summary.monthRows.map((row) => (
                        <li key={row.id}>
                          <div>
                            <strong>
                              {row.kind === 'income' ? '+' : '−'}
                              {money(row.amount, { cents: true })}
                            </strong>
                            <span>
                              {row.kind === 'income' ? 'Extra in' : (envelopes.find((item) => item.id === row.category)?.name || 'Other')}
                              {row.note ? ` · ${row.note}` : ''}
                            </span>
                            <em>{row.logged_on.slice(5)}</em>
                          </div>
                          <button
                            type="button"
                            className="vital-text-btn"
                            onClick={() => {
                              if (playClick) playClick();
                              run(() => deleteLedgerEntry(row.id));
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {tab === 'plan' && (
              <form className="vital-card" onSubmit={handlePlan}>
                <p className="vital-kicker">Plan</p>
                <p className="vital-muted">
                  Split take-home into monthly envelopes. What you leave unallocated is the savings pace for the year.
                </p>
                <label htmlFor="plan-income">Monthly take-home</label>
                <input
                  id="plan-income"
                  className="vital-input ledger-money-input"
                  inputMode="decimal"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
                <label htmlFor="plan-goal">Yearly savings aim</label>
                <input
                  id="plan-goal"
                  className="vital-input ledger-money-input"
                  inputMode="decimal"
                  type="number"
                  min="0"
                  step="1"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Optional"
                />

                <p className="vital-kicker" style={{ marginTop: 20 }}>Monthly envelopes</p>
                <div className="ledger-alloc">
                  {envelopes.map((row) => (
                    <div key={row.id} className={`ledger-alloc-row${row.custom ? ' is-custom' : ''}`}>
                      <label htmlFor={`alloc-${row.id}`}>{row.name}</label>
                      <input
                        id={`alloc-${row.id}`}
                        className="vital-input"
                        inputMode="decimal"
                        type="number"
                        min="0"
                        step="1"
                        value={alloc[row.id] || ''}
                        onChange={(e) => setAlloc((prev) => ({ ...prev, [row.id]: e.target.value }))}
                        placeholder="0"
                      />
                      {row.custom ? (
                        <button type="button" className="vital-text-btn" onClick={() => removeEnvelope(row.id)}>
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="ledger-alloc-add">
                  <input
                    id="new-envelope"
                    className="vital-input"
                    maxLength={32}
                    value={newEnvelope}
                    onChange={(e) => setNewEnvelope(e.target.value)}
                    placeholder="Add an envelope — daycare, dog, subscriptions"
                    aria-label="New envelope name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addEnvelope(e);
                    }}
                  />
                  <button type="button" className="vital-btn vital-btn-quiet" onClick={addEnvelope} disabled={!newEnvelope.trim()}>
                    Add
                  </button>
                </div>
                <p className={`vital-muted${liveIncome > 0 && liveUnallocated < 0 ? ' ledger-over' : ''}`} style={{ marginTop: 12 }}>
                  {liveIncome > 0
                    ? (liveUnallocated < 0
                      ? `${money(liveAllocTotal)} allocated of ${money(liveIncome)}. ${money(Math.abs(liveUnallocated))} over take-home.`
                      : `${money(liveAllocTotal)} allocated of ${money(liveIncome)}. ${money(liveUnallocated)} left for savings.`)
                    : `${money(liveAllocTotal)} allocated. Set take-home to see what’s left for savings.`}
                </p>
                <p className="vital-muted">
                  Kept since you started tracking: {money(summary.ytdSaved)}. Yearly pace: {money(summary.expectedYear)}.
                </p>
                <button className="vital-btn" type="submit" disabled={pending}>
                  {pending ? 'Saving…' : 'Save plan'}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
