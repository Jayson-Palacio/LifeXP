/** Catalog of Kaeluma family apps. Add new products here — the launcher reads this list. */
export const KAELUMA_APPS = [
  {
    id: 'quests',
    name: 'Quests',
    tagline: 'Chores, XP, and the loot shop',
    description: 'Kids turn missions into gold and levels. Parents stay in control with PIN-protected approvals.',
    href: '/dashboard',
    setupHref: '/setup',
    icon: '🎯',
    accent: '#a855f7',
    available: true,
  },
  {
    id: 'vital',
    name: 'Vital',
    tagline: 'Nutrition, calories, and goals',
    description: 'Set a weight-loss target, hit daily calories and macros, and log meals without a paywall.',
    href: '/vital',
    icon: '💪',
    accent: '#06b6d4',
    available: true,
  },
];
