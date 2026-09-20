export const SPEND_CATEGORIES = [
  { id: 'housing', name: 'Housing' },
  { id: 'groceries', name: 'Groceries' },
  { id: 'transport', name: 'Transport' },
  { id: 'kids', name: 'Kids' },
  { id: 'eating_out', name: 'Eating out' },
  { id: 'utilities', name: 'Utilities' },
  { id: 'health', name: 'Health' },
  { id: 'fun', name: 'Fun' },
  { id: 'other', name: 'Other' },
];

const BUILTIN_IDS = new Set(SPEND_CATEGORIES.map((row) => row.id));

export function makeEnvelopeId(name, taken) {
  const base = `c_${String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 24) || 'envelope'}`;
  let id = base;
  let n = 2;
  while (taken.has(id)) {
    id = `${base}_${n}`;
    n += 1;
  }
  return id;
}

export function normalizeEnvelopes(raw) {
  if (!Array.isArray(raw)) return [];
  const taken = new Set(BUILTIN_IDS);
  const out = [];
  for (const row of raw) {
    const name = String(row?.name || '').trim().slice(0, 32);
    if (!name) continue;
    let id = String(row?.id || '').trim().slice(0, 40);
    if (!/^[a-z0-9_]{1,40}$/.test(id) || taken.has(id)) {
      id = makeEnvelopeId(name, taken);
    }
    taken.add(id);
    out.push({ id, name, custom: true });
    if (out.length >= 20) break;
  }
  return out;
}

export function listEnvelopes(settings) {
  const custom = normalizeEnvelopes(settings?.envelopes);
  const known = new Set([...BUILTIN_IDS, ...custom.map((row) => row.id)]);
  const alloc = settings?.allocations && typeof settings.allocations === 'object' && !Array.isArray(settings.allocations)
    ? settings.allocations
    : {};
  const orphans = Object.keys(alloc)
    .filter((id) => id !== 'pay' && !known.has(id) && Number(alloc[id]) > 0)
    .map((id) => ({
      id,
      name: id.replace(/^c_/, '').replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()) || 'Envelope',
      custom: true,
    }));
  return [
    ...SPEND_CATEGORIES.map((row) => ({ ...row, custom: false })),
    ...custom,
    ...orphans,
  ];
}

export function categoryName(id, settings) {
  return listEnvelopes(settings).find((row) => row.id === id)?.name || 'Other';
}

export function money(value, { cents = false } = {}) {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents ? 2 : 0,
    minimumFractionDigits: cents ? 2 : 0,
  }).format(safe);
}

export function monthBounds(ymd) {
  const [year, month] = String(ymd).split('-').map(Number);
  const last = new Date(year, month, 0).getDate();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    year,
    month,
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(last)}`,
    daysInMonth: last,
    label: new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' }),
  };
}

export function yearStart(ymd) {
  return `${String(ymd).slice(0, 4)}-01-01`;
}

function sumKind(rows, kind) {
  return rows
    .filter((row) => row.kind === kind)
    .reduce((total, row) => total + (Number(row.amount) || 0), 0);
}

export function parseAllocations(raw, envelopes = SPEND_CATEGORIES) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const out = {};
  for (const cat of envelopes) {
    const amount = Number(source[cat.id]);
    out[cat.id] = Number.isFinite(amount) && amount > 0 ? amount : 0;
  }
  return out;
}

function trackingStart(settings, today) {
  const created = settings?.created_at ? String(settings.created_at).slice(0, 10) : today;
  const createdBounds = monthBounds(created);
  const todayBounds = monthBounds(today);
  if (createdBounds.year < todayBounds.year) {
    return { start: yearStart(today), monthsElapsed: todayBounds.month };
  }
  if (createdBounds.year > todayBounds.year) {
    return { start: todayBounds.start, monthsElapsed: 1 };
  }
  return {
    start: createdBounds.start,
    monthsElapsed: Math.max(1, todayBounds.month - createdBounds.month + 1),
  };
}

/**
 * Expected yearly savings is this month's leftover × 12.
 * YTD only counts months since the household started tracking, so empty
 * months before Ledger existed are not treated as money already kept.
 */
export function summarizeLedger({ settings, entries = [], today }) {
  const monthlyIncome = Number(settings?.monthly_income) || 0;
  const yearlyGoal = settings?.yearly_goal == null || settings?.yearly_goal === ''
    ? null
    : Number(settings.yearly_goal);
  const bounds = monthBounds(today);
  const tracking = trackingStart(settings, today);

  const monthRows = entries.filter(
    (row) => row.logged_on >= bounds.start && row.logged_on <= bounds.end
  );
  const yearRows = entries.filter(
    (row) => row.logged_on >= tracking.start && row.logged_on <= bounds.end
  );

  const monthSpend = sumKind(monthRows, 'spend');
  const monthExtraIn = sumKind(monthRows, 'income');
  const monthIn = monthlyIncome + monthExtraIn;
  const monthSaved = monthIn - monthSpend;

  const ytdSpend = sumKind(yearRows, 'spend');
  const ytdExtraIn = sumKind(yearRows, 'income');
  const ytdIn = monthlyIncome * tracking.monthsElapsed + ytdExtraIn;
  const ytdSaved = ytdIn - ytdSpend;
  const expectedYear = monthSaved * 12;

  const envelopes = listEnvelopes(settings);
  const allocations = parseAllocations(settings?.allocations, envelopes);
  const allocatedTotal = envelopes.reduce((total, cat) => total + (allocations[cat.id] || 0), 0);
  const unallocated = monthlyIncome - allocatedTotal;

  const byCategory = envelopes.map((cat) => {
    const spent = monthRows
      .filter((row) => row.kind === 'spend' && row.category === cat.id)
      .reduce((total, row) => total + (Number(row.amount) || 0), 0);
    const allocated = allocations[cat.id] || 0;
    return {
      ...cat,
      spent,
      allocated,
      left: allocated - spent,
      over: allocated > 0 && spent > allocated + 0.009,
    };
  }).filter((row) => row.spent > 0 || row.allocated > 0);

  return {
    monthlyIncome,
    yearlyGoal: Number.isFinite(yearlyGoal) ? yearlyGoal : null,
    bounds,
    monthSpend,
    monthExtraIn,
    monthIn,
    monthSaved,
    ytdSpend,
    ytdSaved,
    expectedYear,
    remainingMonths: Math.max(0, 12 - bounds.month),
    hasPlan: monthlyIncome > 0,
    allocations,
    allocatedTotal,
    unallocated,
    hasAllocations: allocatedTotal > 0,
    envelopes,
    byCategory,
    monthRows: [...monthRows].sort((a, b) => {
      if (a.logged_on === b.logged_on) return String(b.created_at).localeCompare(String(a.created_at));
      return a.logged_on < b.logged_on ? 1 : -1;
    }),
  };
}
