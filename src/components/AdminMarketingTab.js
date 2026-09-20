'use client';

import { useState } from 'react';
import {
  DEFAULT_ANCHOR_ISO,
  PHASE_LABELS,
  STATUS_OPTIONS,
  enrichCalendar,
} from '../lib/marketing/calendarData';
import { marketingCoachNote, weekBuckets } from '../lib/marketing/marketingAgent';
import { useMarketingCalendarState } from '../lib/marketing/calendarStore';

const CHANNEL_LABEL = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'X / Twitter',
  reddit: 'Reddit',
  email: 'Email',
  product_hunt: 'Product Hunt',
  ops: 'Ops',
  blog: 'Blog',
  outreach: 'Outreach',
};

export default function AdminMarketingTab() {
  const { anchorISO, statusMap, setAnchorISO, patchItem } = useMarketingCalendarState();
  const [filter, setFilter] = useState('all');
  const [focusId, setFocusId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [todayISO] = useState(() => new Date().toISOString().slice(0, 10));

  const items = enrichCalendar(anchorISO, statusMap);
  const coach = marketingCoachNote({
    anchorISO,
    statusMap,
    now: new Date(`${todayISO}T12:00:00`),
  });
  const week = weekBuckets(items, todayISO);
  const focused = items.find((i) => i.id === (focusId || coach.focusId)) || items[0];

  const visible = items.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'open') return i.status !== 'posted' && i.status !== 'skipped';
    if (filter === 'today') return i.date === todayISO;
    if (filter === 'overdue') {
      return i.date < todayISO && i.status !== 'posted' && i.status !== 'skipped';
    }
    return i.phase === filter;
  });

  const copyCaption = async () => {
    if (!focused?.caption) return;
    try {
      await navigator.clipboard.writeText(focused.caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section
        style={{
          padding: '18px 20px',
          borderRadius: 16,
          border: '1px solid rgba(47, 111, 85, 0.28)',
          background:
            'linear-gradient(145deg, rgba(47,111,85,0.12) 0%, rgba(255,255,255,0.92) 65%)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2f6f55' }}>
          {coach.kicker}
        </div>
        <h2 style={{ margin: '6px 0 8px', fontSize: '1.45rem', letterSpacing: '-0.03em' }}>{coach.title}</h2>
        <p style={{ margin: 0, color: '#57534e', lineHeight: 1.45, maxWidth: 720 }}>{coach.body}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, alignItems: 'center' }}>
          {coach.focusId && (
            <button
              type="button"
              onClick={() => setFocusId(coach.focusId)}
              style={primaryBtn}
            >
              {coach.actionLabel || 'Open item'}
            </button>
          )}
          <StatChip label="Open" value={coach.stats.open} />
          <StatChip label="Done" value={coach.stats.done} />
          <StatChip label="Overdue" value={coach.stats.overdue} />
          <StatChip label="Today" value={coach.stats.today} />
        </div>
        {coach.checklist?.length > 0 && (
          <ul style={{ margin: '14px 0 0', paddingLeft: 18, color: '#44403c', fontSize: 14 }}>
            {coach.checklist.map((c) => (
              <li key={c} style={{ marginBottom: 4 }}>{c}</li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#78716c' }}>
          Warm-up Day 0 (anchor)
          <input
            type="date"
            value={anchorISO}
            onChange={(e) => setAnchorISO(e.target.value || DEFAULT_ANCHOR_ISO)}
            style={inputStyle}
          />
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            ['all', 'All'],
            ['open', 'Open'],
            ['today', 'Today'],
            ['overdue', 'Overdue'],
            ['setup', 'Setup'],
            ['warmup', 'Warm-up'],
            ['launch', 'Launch'],
            ['growth', 'Growth'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              style={{
                ...chipBtn,
                background: filter === id ? '#2f6f55' : '#f5f5f4',
                color: filter === id ? '#fff' : '#44403c',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section>
        <h3 style={sectionTitle}>This week</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 8,
          }}
        >
          {week.days.map((day) => (
            <div
              key={day.date}
              style={{
                borderRadius: 12,
                border: day.isToday ? '2px solid #2f6f55' : '1px solid #e7e5e4',
                background: day.isToday ? 'rgba(47,111,85,0.06)' : '#fff',
                padding: 10,
                minHeight: 110,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: '#78716c', marginBottom: 6 }}>{day.label}</div>
              {day.items.length === 0 && (
                <div style={{ fontSize: 12, color: '#a8a29e' }}>—</div>
              )}
              {day.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setFocusId(it.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: focusId === it.id ? 'rgba(47,111,85,0.12)' : 'transparent',
                    borderRadius: 8,
                    padding: '4px 6px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 650,
                    color: '#1c1917',
                    marginBottom: 4,
                  }}
                >
                  <span style={{ opacity: 0.7 }}>{CHANNEL_LABEL[it.channel] || it.channel}</span>
                  <br />
                  {it.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
          gap: 16,
          alignItems: 'start',
        }}
        className="marketing-agent-split"
      >
        <section>
          <h3 style={sectionTitle}>Calendar ({visible.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFocusId(item.id)}
                style={{
                  textAlign: 'left',
                  border: focused?.id === item.id ? '1.5px solid #2f6f55' : '1px solid #e7e5e4',
                  background: '#fff',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  font: 'inherit',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, color: '#78716c', fontWeight: 700 }}>
                    {item.date} · {PHASE_LABELS[item.phase]} · {CHANNEL_LABEL[item.channel]} · {item.priority}
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div style={{ fontWeight: 750, marginTop: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#57534e', marginTop: 2 }}>{item.goal}</div>
              </button>
            ))}
          </div>
        </section>

        {focused && (
          <section
            style={{
              position: 'sticky',
              top: 12,
              border: '1px solid #e7e5e4',
              borderRadius: 16,
              padding: 16,
              background: '#fff',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {CHANNEL_LABEL[focused.channel]} · {focused.kind}
            </div>
            <h3 style={{ margin: '6px 0 8px', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>{focused.title}</h3>
            <p style={{ margin: '0 0 12px', color: '#57534e', lineHeight: 1.45 }}>{focused.goal}</p>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#78716c', marginBottom: 10 }}>
              Status
              <select
                value={focused.status}
                onChange={(e) => patchItem(focused.id, { status: e.target.value })}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: '#78716c', marginBottom: 12 }}>
              Notes
              <textarea
                value={focused.notes}
                onChange={(e) => patchItem(focused.id, { notes: e.target.value })}
                rows={3}
                placeholder="Links, edit notes, who filmed…"
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </label>

            {focused.checklist?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Checklist</div>
                <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, color: '#44403c' }}>
                  {focused.checklist.map((c) => (
                    <li key={c} style={{ marginBottom: 4 }}>{c}</li>
                  ))}
                </ul>
              </>
            )}

            {focused.production?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Production</div>
                <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, color: '#44403c' }}>
                  {focused.production.map((c) => (
                    <li key={c} style={{ marginBottom: 4 }}>{c}</li>
                  ))}
                </ul>
              </>
            )}

            {focused.caption ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>Caption / copy</div>
                  <button type="button" onClick={copyCaption} style={chipBtn}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 12,
                    lineHeight: 1.45,
                    background: '#fafaf9',
                    border: '1px solid #e7e5e4',
                    borderRadius: 10,
                    padding: 12,
                    maxHeight: 220,
                    overflow: 'auto',
                  }}
                >
                  {focused.caption}
                </pre>
              </>
            ) : null}

            <div style={{ marginTop: 12, fontSize: 11, color: '#a8a29e' }}>
              Source: {focused.source}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .marketing-agent-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
        background: '#f5f5f4',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 700,
        color: '#44403c',
      }}
    >
      <span style={{ color: '#78716c', fontWeight: 600 }}>{label}</span>
      {value}
    </span>
  );
}

function StatusPill({ status }) {
  const colors = {
    planned: { bg: '#f5f5f4', fg: '#57534e' },
    drafting: { bg: '#fff7ed', fg: '#c2410c' },
    ready: { bg: '#eff6ff', fg: '#1d4ed8' },
    posted: { bg: '#ecfdf5', fg: '#047857' },
    skipped: { bg: '#fafaf9', fg: '#a8a29e' },
  };
  const c = colors[status] || colors.planned;
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>
      {STATUS_OPTIONS.find((s) => s.id === status)?.label || status}
    </span>
  );
}

const primaryBtn = {
  background: '#2f6f55',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '8px 14px',
  fontWeight: 750,
  fontSize: 13,
  cursor: 'pointer',
};

const chipBtn = {
  border: '1px solid #e7e5e4',
  borderRadius: 999,
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  background: '#fff',
  color: '#44403c',
};

const inputStyle = {
  border: '1px solid #e7e5e4',
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 14,
  background: '#fff',
  color: '#1c1917',
};

const sectionTitle = {
  margin: '0 0 10px',
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#78716c',
};
