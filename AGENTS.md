<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Kaeluma project notes for coding agents

- Product: **Kaeluma** — family apps (Quests, Vital, Ledger) on Next.js App Router + Supabase.
- Source lives under `src/` (`app/`, `components/`, `lib/`). Mutations go through server actions + narrowly scoped Postgres RPCs; do not widen RLS.
- Brand: calm parent guide, not a taskmaster. Quests may use game language; hub/adult surfaces should not. Free, no ads, no subscriptions.
- Privacy: child data stays in Supabase. Prefer deterministic in-app agents (`src/lib/guildGuide.js`, `src/lib/vitalCoach.js`) over sending household data to third-party LLMs.
- Before UI or routing changes, read the matching guide under `node_modules/next/dist/docs/`.
