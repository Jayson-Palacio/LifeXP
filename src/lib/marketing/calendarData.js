/**
 * Kaeluma marketing calendar — structured from marketing/*.md
 * Anchor: Day 0 = warm-up start (default 2026-06-01 per launch hub).
 */

export const DEFAULT_ANCHOR_ISO = '2026-06-01';

/** @typedef {'setup'|'warmup'|'soft_launch'|'launch'|'growth'} Phase */
/** @typedef {'P1'|'P2'|'P3'} Priority */
/** @typedef {'tiktok'|'instagram'|'youtube'|'twitter'|'reddit'|'email'|'product_hunt'|'ops'|'blog'|'outreach'} Channel */

/**
 * @type {Array<{
 *   id: string,
 *   dayOffset: number,
 *   phase: Phase,
 *   priority: Priority,
 *   channel: Channel,
 *   kind: string,
 *   title: string,
 *   goal: string,
 *   caption: string,
 *   hooks?: string[],
 *   production?: string[],
 *   checklist: string[],
 *   source: string,
 * }>}
 */
export const MARKETING_ITEMS = [
  // ── Setup (before Day 0) ──────────────────────────────────────────────
  {
    id: 'setup-handles',
    dayOffset: -5,
    phase: 'setup',
    priority: 'P1',
    channel: 'ops',
    kind: 'setup',
    title: 'Register social handles',
    goal: 'Own @kaeluma_app / @kaeluma.app / @KaelumaApp before posting starts.',
    caption: '',
    checklist: [
      'TikTok: @kaeluma_app',
      'Instagram: @kaeluma.app',
      'Twitter/X: @KaelumaApp',
      'YouTube: Kaeluma',
    ],
    source: 'marketing/launch_checklists.md',
  },
  {
    id: 'setup-analytics',
    dayOffset: -5,
    phase: 'setup',
    priority: 'P1',
    channel: 'ops',
    kind: 'setup',
    title: 'Analytics & UTM tracking',
    goal: 'Measure signup funnel before any campaign traffic.',
    caption: '',
    checklist: [
      'Vercel Web Analytics + signup events',
      'UTM capture on /signup → Supabase metadata',
      'Google Search Console + sitemap',
    ],
    source: 'marketing/launch_checklists.md',
  },
  {
    id: 'setup-resend',
    dayOffset: -4,
    phase: 'setup',
    priority: 'P1',
    channel: 'email',
    kind: 'setup',
    title: 'Resend domain + welcome sequence',
    goal: 'Waitlist and new signups get Welcome & Quick Start immediately.',
    caption: '',
    checklist: [
      'Create Resend account',
      'Verify kaeluma.com (DKIM/SPF)',
      'Import waitlist-leads audience',
      'Wire Welcome & Quick Start automation',
    ],
    source: 'marketing/email_campaigns.md',
  },
  {
    id: 'setup-stripe',
    dayOffset: -3,
    phase: 'setup',
    priority: 'P1',
    channel: 'ops',
    kind: 'setup',
    title: 'Stripe donation link + webhook',
    goal: 'Donation path works before launch week socials mention tips.',
    caption: '',
    checklist: [
      'Test donate.stripe.com link',
      'Webhook checkout.session.completed → Vercel',
      'Optional: thank-you email trigger',
    ],
    source: 'marketing/launch_checklists.md',
  },
  {
    id: 'setup-demo-video',
    dayOffset: -2,
    phase: 'setup',
    priority: 'P1',
    channel: 'ops',
    kind: 'setup',
    title: 'Record + edit 60s product demo',
    goal: 'Parent sets mission → kid completes → coin clink → reward shop.',
    caption: '',
    production: [
      'Premiere: jump-cuts, 110% zooms, Outfit Bold captions',
      'Export 16:9 (YT/PH) and 9:16 (Shorts/Reels)',
      'Layer metallic coin-clink SFX on checkmarks',
    ],
    checklist: [
      'Screen-capture full loop',
      'Edit in Premiere Pro (~4h)',
      'Export 16:9 + 9:16 masters',
    ],
    source: 'marketing/launch_checklists.md',
  },
  {
    id: 'setup-aeo',
    dayOffset: -1,
    phase: 'setup',
    priority: 'P2',
    channel: 'ops',
    kind: 'setup',
    title: 'AEO schema + FAQ crawlability',
    goal: 'ChatGPT / Perplexity can cite Kaeluma for free chore-app queries.',
    caption: '',
    checklist: [
      'Verify SoftwareApplication JSON-LD in layout',
      'Landing FAQ matches aeo_playbook Q&A',
      'Request Google index crawl',
    ],
    source: 'marketing/aeo_playbook.md',
  },

  // ── Warm-up shorts (Days 0–9) ─────────────────────────────────────────
  {
    id: 'social-day-1',
    dayOffset: 0,
    phase: 'warmup',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: 'Before vs. After Morning',
    goal: 'Show the shift from nagging to a calm quest loop.',
    caption:
      'I used to say “brush your teeth” eleven times every morning.\n\nThen I turned our routine into a quest board. My 5-year-old gets gold coins the second he checks off a task.\n\nKaeluma is 100% free. No ads. Built by a dad.\n→ kaeluma.com\n\n#parenting #chorechart #adhdparenting #mornings',
    hooks: ['How to end morning nagging forever.', 'He did it before I asked.'],
    production: [
      'Split thumb: angry 7AM vs Level Up smile',
      'B-roll messy room → kid taps Brush Teeth → coin clink',
      'Cross-post Reel + YouTube Short',
    ],
    checklist: ['Script locked', 'Film / screen-cap', 'Edit Premiere', 'Post TikTok', 'Cross-post IG + Shorts'],
    source: 'marketing/social_media_templates.md#day-1',
  },
  {
    id: 'social-day-2',
    dayOffset: 1,
    phase: 'warmup',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: 'The Screen Time Economy',
    goal: 'Introduce earned screen time vs blocking apps.',
    caption:
      'We ended screen-time fights with one rule: earn it.\n\nKids complete missions → spend gold in a parent-controlled reward shop.\n30 min Xbox = 20 coins.\n\nFree at kaeluma.com — no ads, no paywall.\n\n#screentime #parentingtips #familyapps',
    hooks: ['No more screen time fights.', 'Stop Nagging. Start Questing.'],
    production: ['Thumb: EARNED SCREEN TIME', 'Show Reward Shop pricing'],
    checklist: ['Film', 'Edit', 'Post TikTok', 'Cross-post', 'Update top 3 Amiga YT descriptions'],
    source: 'marketing/social_media_templates.md#day-2',
  },
  {
    id: 'social-day-3',
    dayOffset: 2,
    phase: 'warmup',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: 'ADHD Visual Dopamine Loop',
    goal: 'Speak to neurodivergent families — instant feedback vs sticker charts.',
    caption:
      'Sticker charts fail ADHD brains — the reward is too far away.\n\nKaeluma gives instant coins, streaks, and level-ups the second a quest is done.\n\nFree & ad-free → kaeluma.com\n\n#ADHD #executivefunction #visualschedule',
    hooks: ['Why sticker charts fail.', 'Instant Dopamine Loop'],
    production: ['Highlight coin clink + streak flame', 'Comment on 10 parenting videos (no pitch)'],
    checklist: ['Film', 'Edit', 'Post', 'Authentic comments on 10 videos'],
    source: 'marketing/social_media_templates.md#day-3',
  },
  {
    id: 'social-day-4',
    dayOffset: 3,
    phase: 'warmup',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: '5 Chores to Gamify First',
    goal: 'Actionable starter list parents can copy in 60 seconds.',
    caption:
      'Don’t add ten chores on day one. Start with five:\n1) Shoes in cubby\n2) PJs in hamper\n3) Feed the pet\n4) Dishes in sink\n5) Brush teeth AM/PM\n\nSet them up free at kaeluma.com\n\n#chores #kidsroutines #gamification',
    hooks: ['5 Chores to Gamify First'],
    production: ['List overlay with coin icons', 'Draft Product Hunt submission'],
    checklist: ['Film', 'Edit', 'Post', 'Draft Product Hunt title + gallery'],
    source: 'marketing/social_media_templates.md#day-4',
  },
  {
    id: 'social-day-5',
    dayOffset: 4,
    phase: 'warmup',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: 'Founder Story: Why Kaeluma is Free',
    goal: 'Trust + gift-economy positioning.',
    caption:
      'I spent a year building an app to stop yelling at my son. Promise: never a paywall.\n\nUnlimited kids. Unlimited quests. No ads. Supported by voluntary parent gifts.\n\nkaeluma.com\n\n#indiehacker #buildinpublic #dadlife',
    hooks: ['Why I made Kaeluma free.'],
    production: ['Warm founder talking-head', 'Pitch emails to Fatherly / Scary Mommy / Romper'],
    checklist: ['Film', 'Edit', 'Post', 'Send 3 editor pitches'],
    source: 'marketing/social_media_templates.md#day-5',
  },
  {
    id: 'social-day-6',
    dayOffset: 5,
    phase: 'warmup',
    priority: 'P2',
    channel: 'youtube',
    kind: 'short_video',
    title: 'The Amiga Crossover',
    goal: 'Bridge Adventures with Amiga audience to Kaeluma.',
    caption:
      'From the creators of Adventures with Amiga — we gamified our own home.\n\nReal-life chores → quests, coins, level-ups. 100% free.\n→ kaeluma.com',
    hooks: ["Amiga's real-life quests"],
    production: ['Amiga clip + Kaeluma dashboard cut'],
    checklist: ['Edit crossover cut', 'Post Short', 'Pin Kaeluma link on popular Amiga videos'],
    source: 'marketing/social_media_templates.md#day-6',
  },
  {
    id: 'social-day-7',
    dayOffset: 6,
    phase: 'warmup',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: 'What Reward Did Your Kid Choose?',
    goal: 'Community engagement — comment bait.',
    caption:
      'Wholesome rewards kids save for:\n• Choose dessert\n• Extra bedtime reading\n• Dad’s silly dinner dance\n\nWhat’s the first reward your kid would pick?\n\nFree app → kaeluma.com',
    hooks: ['Craziest wholesome rewards'],
    production: ['Comment CTA on screen'],
    checklist: ['Film', 'Edit', 'Post', 'Reply to every comment for 2h'],
    source: 'marketing/social_media_templates.md#day-7',
  },
  {
    id: 'social-day-8',
    dayOffset: 7,
    phase: 'soft_launch',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: 'The Sticker Chart Novelty Crash',
    goal: 'Why paper charts die after a week; RPG novelty loop.',
    caption:
      'Sticker charts work for six days. Then they’re wallpaper.\n\nKaeluma keeps novelty alive with levels, tiers, and unlocks — free & ad-free.\nkaeluma.com',
    hooks: ['Why charts fail'],
    checklist: ['Film', 'Edit', 'Post'],
    source: 'marketing/social_media_templates.md#day-8',
  },
  {
    id: 'social-day-9',
    dayOffset: 8,
    phase: 'soft_launch',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: 'Teaching Kids Budgeting Without Cash',
    goal: 'Opportunity cost without allowance.',
    caption:
      'No cash allowance required.\n\nGold coins → screen time now OR ice cream later. Kids learn opportunity cost.\n\nSet up your family economy free: kaeluma.com',
    hooks: ['Teach money without cash'],
    checklist: ['Film', 'Edit', 'Post'],
    source: 'marketing/social_media_templates.md#day-9',
  },
  {
    id: 'social-day-10',
    dayOffset: 9,
    phase: 'soft_launch',
    priority: 'P1',
    channel: 'tiktok',
    kind: 'short_video',
    title: 'Montessori Routine: The Autonomy Hack',
    goal: 'Kid-owned dashboard removes parent voice from the loop.',
    caption:
      'Stop repeating yourself. Put the quest board at kid eye-level.\n\nThey own the check-offs. You approve once.\n\nkaeluma.com — free, no ads.',
    hooks: ['The autonomy hack'],
    checklist: ['Film', 'Edit', 'Post'],
    source: 'marketing/social_media_templates.md#day-10',
  },

  // ── Community / launch assets ─────────────────────────────────────────
  {
    id: 'reddit-sideproject',
    dayOffset: 0,
    phase: 'warmup',
    priority: 'P1',
    channel: 'reddit',
    kind: 'post',
    title: 'r/SideProject launch thread',
    goal: 'Developer-first story; free & donation-only angle.',
    caption:
      'Title: I built a gamified chore app to stop yelling at my 5-year-old. It’s free and ad-free.\n\n(Full body in marketing/social_media_templates.md — Template A)',
    checklist: ['Post Template A', 'Reply to every comment same day'],
    source: 'marketing/social_media_templates.md#reddit',
  },
  {
    id: 'twitter-launch-thread',
    dayOffset: 16,
    phase: 'launch',
    priority: 'P1',
    channel: 'twitter',
    kind: 'thread',
    title: 'Launch day 10-tweet thread',
    goal: 'Pin the founder story thread at 8:00 AM EST on launch day.',
    caption:
      'I spent years nagging my son… So I built a free app that solved it. Introducing Kaeluma 🧵\n\n(Full 10 tweets in social_media_templates.md)',
    checklist: ['Schedule/post 10 tweets', 'Pin thread', 'Attach banner + screenshots'],
    source: 'marketing/social_media_templates.md#twitter',
  },
  {
    id: 'product-hunt-launch',
    dayOffset: 14,
    phase: 'launch',
    priority: 'P1',
    channel: 'product_hunt',
    kind: 'launch',
    title: 'Product Hunt launch day',
    goal: 'Top 5 PH — gallery, maker comment, hunter aligned.',
    caption:
      'Tagline angle: Every other app blocks screen time. Kaeluma lets kids earn it.\n\nFirst comment: founder story + demo link + “ask me anything”.',
    checklist: [
      'Finalize gallery (5–6 shots)',
      'Maker first comment ready',
      'Notify waitlist via Resend',
      'Stay on comments all day',
    ],
    source: 'marketing/launch_checklists.md',
  },
  {
    id: 'blog-best-free-chore',
    dayOffset: 18,
    phase: 'growth',
    priority: 'P2',
    channel: 'blog',
    kind: 'article',
    title: 'Best Free Chore Apps for Kids in 2026',
    goal: 'SEO: “best free chore app” — position Kaeluma as ad-free #1.',
    caption: '',
    checklist: ['Outline from content_ideas.md', 'Draft', 'Publish', 'Internal link to signup'],
    source: 'marketing/content_ideas.md',
  },
  {
    id: 'blog-adhd-routines',
    dayOffset: 22,
    phase: 'growth',
    priority: 'P2',
    channel: 'blog',
    kind: 'article',
    title: 'ADHD Visual Routines: Dopamine vs Stickers',
    goal: 'SEO: “free adhd routine chart”.',
    caption: '',
    checklist: ['Outline', 'Draft', 'Publish'],
    source: 'marketing/content_ideas.md',
  },
  {
    id: 'outreach-micro-influencers',
    dayOffset: 1,
    phase: 'warmup',
    priority: 'P2',
    channel: 'outreach',
    kind: 'outreach',
    title: 'DM 10 parenting micro-influencers',
    goal: 'Warm authentic DMs — no hard sell.',
    caption:
      'Hey {name} — I built a free, ad-free chore app after morning battles with my 5yo. Would love your honest take if you try it with your kids. kaeluma.com',
    checklist: ['Find 10 accounts', 'Send Day 2 batch (5)', 'Send Day 3 batch (5)', 'Follow up responders'],
    source: 'marketing/launch_strategy.md',
  },
];

export const PHASE_LABELS = {
  setup: 'Setup',
  warmup: 'Warm-up',
  soft_launch: 'Soft launch',
  launch: 'Launch week',
  growth: 'Growth',
};

export const STATUS_OPTIONS = [
  { id: 'planned', label: 'Planned' },
  { id: 'drafting', label: 'Drafting' },
  { id: 'ready', label: 'Ready' },
  { id: 'posted', label: 'Done' },
  { id: 'skipped', label: 'Skipped' },
];

export function addDaysISO(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function itemDateISO(item, anchorISO = DEFAULT_ANCHOR_ISO) {
  return addDaysISO(anchorISO, item.dayOffset);
}

export function enrichCalendar(anchorISO = DEFAULT_ANCHOR_ISO, statusMap = {}) {
  return MARKETING_ITEMS.map((item) => {
    const date = itemDateISO(item, anchorISO);
    const state = statusMap[item.id] || {};
    return {
      ...item,
      date,
      status: state.status || 'planned',
      notes: state.notes || '',
    };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
