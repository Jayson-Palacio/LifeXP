import {
  DEFAULT_ANCHOR_ISO,
  enrichCalendar,
  PHASE_LABELS,
} from './calendarData';

const DONE = new Set(['posted', 'skipped']);

function todayISO(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function daysBetween(aISO, bISO) {
  const a = new Date(`${aISO}T12:00:00`);
  const b = new Date(`${bISO}T12:00:00`);
  return Math.round((b - a) / 86400000);
}

/**
 * Marketing Agent — deterministic coach for Kaeluma launch content + calendar.
 * Priority: incomplete setup → overdue → today → draft next → healthy week.
 */
export function marketingCoachNote({
  anchorISO = DEFAULT_ANCHOR_ISO,
  statusMap = {},
  now = new Date(),
} = {}) {
  const today = todayISO(now);
  const items = enrichCalendar(anchorISO, statusMap);
  const open = items.filter((i) => !DONE.has(i.status));
  const doneCount = items.length - open.length;

  const setupOpen = open.filter((i) => i.phase === 'setup').sort((a, b) => a.dayOffset - b.dayOffset);
  const overdue = open.filter((i) => i.date < today).sort((a, b) => a.date.localeCompare(b.date));
  const dueToday = open.filter((i) => i.date === today);
  const upcoming = open
    .filter((i) => i.date > today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const drafting = open.filter((i) => i.status === 'drafting' || i.status === 'ready');

  if (setupOpen.length > 0) {
    const next = setupOpen[0];
    const pastWarmup = today > addSafe(anchorISO, 0);
    return {
      kicker: 'Marketing Agent',
      title: `Finish setup: ${next.title}`,
      body: pastWarmup
        ? `${setupOpen.length} setup item${setupOpen.length === 1 ? '' : 's'} still open — close these even if posts already started. ${next.goal}`
        : `${setupOpen.length} setup item${setupOpen.length === 1 ? '' : 's'} still open before warm-up posts. ${next.goal}`,
      kind: 'setup',
      focusId: next.id,
      actionLabel: 'Open setup item',
      checklist: next.checklist,
      stats: summarize(items, today),
    };
  }

  if (overdue.length > 0) {
    const next = overdue[0];
    const lag = daysBetween(next.date, today);
    return {
      kicker: 'Marketing Agent',
      title: `Catch up: ${next.title}`,
      body: `${overdue.length} item${overdue.length === 1 ? '' : 's'} past due (${lag} day${lag === 1 ? '' : 's'} late on the oldest). Mark Done, Skip, or ship it today — the calendar only works if status is honest.`,
      kind: 'overdue',
      focusId: next.id,
      actionLabel: 'Jump to overdue',
      checklist: next.checklist,
      stats: summarize(items, today),
    };
  }

  if (dueToday.length > 0) {
    const next = dueToday.find((i) => i.priority === 'P1') || dueToday[0];
    return {
      kicker: 'Marketing Agent',
      title: `Today: ${next.title}`,
      body: `${dueToday.length} on the board for ${today}. ${next.goal}${next.caption ? ' Caption is ready to copy below.' : ''}`,
      kind: 'today',
      focusId: next.id,
      actionLabel: 'Open today’s item',
      checklist: next.checklist,
      caption: next.caption || '',
      stats: summarize(items, today),
    };
  }

  if (drafting.length > 0) {
    const next = drafting[0];
    return {
      kicker: 'Marketing Agent',
      title: `Keep drafting: ${next.title}`,
      body: `Nothing due today. ${drafting.length} item${drafting.length === 1 ? '' : 's'} still in Drafting/Ready — finish production before the date hits.`,
      kind: 'drafting',
      focusId: next.id,
      actionLabel: 'Continue draft',
      checklist: next.checklist,
      stats: summarize(items, today),
    };
  }

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const ahead = daysBetween(today, next.date);
    return {
      kicker: 'Marketing Agent',
      title: `Next up (${ahead}d): ${next.title}`,
      body: `Calendar is clear through today. Prefill production for ${PHASE_LABELS[next.phase] || next.phase} — ${next.goal}`,
      kind: 'upcoming',
      focusId: next.id,
      actionLabel: 'Prep next item',
      checklist: next.checklist,
      caption: next.caption || '',
      stats: summarize(items, today),
    };
  }

  return {
    kicker: 'Marketing Agent',
    title: 'Launch calendar is clear.',
    body: `All ${items.length} tracked items are Done or Skipped (${doneCount} closed). Pull fresh ideas from content_ideas.md or extend the calendar for the next 30 days.`,
    kind: 'healthy',
    focusId: null,
    actionLabel: null,
    checklist: [],
    stats: summarize(items, today),
  };
}

function addSafe(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function summarize(items, today) {
  const open = items.filter((i) => !DONE.has(i.status));
  return {
    total: items.length,
    open: open.length,
    done: items.length - open.length,
    overdue: open.filter((i) => i.date < today).length,
    today: open.filter((i) => i.date === today).length,
    setupOpen: open.filter((i) => i.phase === 'setup').length,
  };
}

/** Week grid helper for the admin UI */
export function weekBuckets(items, today = todayISO()) {
  const start = new Date(`${today}T12:00:00`);
  const day = start.getDay(); // 0 Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  const weekStart = start.toISOString().slice(0, 10);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(`${weekStart}T12:00:00`);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: iso,
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      isToday: iso === today,
      items: items.filter((it) => it.date === iso),
    });
  }
  return { weekStart, days };
}
