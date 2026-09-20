/** Catalog of Kaeluma family apps. Add new products here — the launcher reads this list. */
export const KAELUMA_APPS = [
  {
    id: 'quests',
    name: 'Quests',
    tagline: 'Routines',
    description: 'Chores and habits, with parent approvals and rewards you control.',
    href: '/dashboard',
    setupHref: '/setup',
    accent: '#1d1d1f',
    available: true,
  },
  {
    id: 'vital',
    name: 'Vital',
    tagline: 'Health',
    description: 'Meals, movement, and a calm plan for everyone under your roof.',
    href: '/vital',
    accent: '#1d1d1f',
    available: true,
  },
  {
    id: 'ledger',
    name: 'Ledger',
    tagline: 'Money',
    description: 'Monthly spending, and the yearly savings you are on pace for.',
    href: '/ledger',
    accent: '#1d1d1f',
    available: true,
  },
  {
    id: 'table',
    name: 'Table',
    tagline: 'Meals',
    description: 'Plan the week, then shop from one list.',
    href: '/table',
    accent: '#1d1d1f',
    available: true,
  },
];

export const APP_IDS = KAELUMA_APPS.map((app) => app.id);

export function normalizeHiddenApps(raw) {
  const allowed = new Set(APP_IDS);
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id) => allowed.has(id)))];
}

export function visibleApps(hidden) {
  const hide = new Set(normalizeHiddenApps(hidden));
  return KAELUMA_APPS.filter((app) => !hide.has(app.id));
}
