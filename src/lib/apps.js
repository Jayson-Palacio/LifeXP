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
    description: 'Meals, weight, and a calm plan for everyone under your roof.',
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
];
