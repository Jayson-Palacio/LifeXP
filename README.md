# Kaeluma

**Kaeluma** is software for the whole family. After login you pick an app:

- **Quests** — kids' routines, with parent approvals and rewards
- **Vital** — nutrition, calories, macros, and weight goals

Built with **Next.js 16** (App Router) + **React 19** + **Supabase** (auth, Postgres, RLS). No backend of its own — mutations go through narrowly-scoped Postgres functions (Quests) or row-level-secured tables (Vital).

---

## Quick start

```bash
npm install
# create .env.local (see below)
npm run dev
```

Then open <http://localhost:3000>. On Windows you can also double-click `Start Kaeluma.bat`.

---

## Environment variables (`.env.local`)

Copy the block below into `.env.local` and fill in the values from your Supabase project.

| Variable | Where to get it | Required? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Settings → API → Project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API → `anon` key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API → `service_role` key | ✅ Yes (server-only; admin client + parent session) |
| `ADMIN_EMAILS` | Your email(s), comma-separated | ✅ Yes (gates the `/admin` portal) |
| `PARENT_SESSION_SECRET` | Any long random string | ⚠️ Recommended (falls back to `SUPABASE_SERVICE_ROLE_KEY`) |
| `NEXT_PUBLIC_SITE_URL` | Your production domain (used for metadata/OG tags) | Optional |

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAILS=you@example.com
PARENT_SESSION_SECRET=generate-a-long-random-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and is **server-only** — it must never be exposed to the browser or placed in a `NEXT_PUBLIC_*` variable.

---

## Database setup

Run the SQL files **in this order** in the Supabase SQL editor.

### Fresh project

1. `supabase_migration.sql` — adds the `user_id` column to every table and creates per-user RLS policies.
2. `supabase_security_migration.sql` — switches RLS to **read-only** for the browser and adds the `kaeluma_*` security-definer functions the app calls for all mutations (submit/undo mission, redeem/review, adjust coins, appearance).
3. `create_support_tickets.sql` — optional, adds the `support_tickets` table + RLS.
4. `vital_schema.sql` — nutrition & fitness tables for the Vital app (profiles, goals, food logs, weigh-ins).

> ⚠️ **Do not run `supabase_schema.sql` for a fresh project.** It is the legacy kiosk schema (no `user_id`, and its original RLS granted `anon` full access). It is kept only to neutralize that open access on existing kiosk installs. The multi-tenant schema above is the source of truth.

### Existing project (already migrated)

Run only the file that applies to your change. Most day-to-day DDL lives in the smaller one-off scripts:

| File | Purpose |
| --- | --- |
| `add_profiles.sql` / `add_profiles_trigger.sql` | `profiles` table + auto-create-on-signup trigger |
| `add_email_lookup.sql` | `get_user_id_by_email()` helper |
| `add_created_at_to_children.sql` | `children.created_at` |
| `update_children_age_group.sql` | `children.age_group` |
| `cleanup_family_sharing.sql` | Removes legacy family-sharing columns/policies |
| `create_support_tickets.sql` | Support tickets table + RLS |
| `vital_schema.sql` | Vital nutrition app tables + RLS |

---

## Architecture notes

- **Quests game mutations are Postgres functions** (`kaeluma_submit_mission`, `kaeluma_redeem_reward`, `kaeluma_review_completion`, …) marked `security definer`. The browser only *reads* directly; every write goes through a function that re-checks `auth.uid()`. This is what makes the read-only RLS in `supabase_security_migration.sql` safe.
- **Vital** (nutrition) uses owner-scoped RLS on `vital_*` tables. Server Actions write with the signed-in user's session — not the service role.
- **Supabase clients** live in `src/utils/supabase/`:
  - `client.js` — browser client (anon key), re-exported via `src/lib/supabase.js` for components.
  - `server.js` — server component / Server Actions client (reads cookies).
  - `admin.js` — `service_role` client, server-only.
  - `middleware.js` — session refresh used by `src/proxy.js`.
- **Parent PIN** is hashed before storage (`src/utils/pin.js`) and parent access is gated by a signed, HttpOnly session cookie (`src/lib/parent-session.js`) valid for 12 hours.
- **Admin portal** (`/admin`) is gated in `src/app/admin/layout.js` against `ADMIN_EMAILS`. The `/demo-screenshots` page (App Store screenshot capture) is blocked automatically in production by `src/proxy.js`.

---

## Scripts

```bash
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # run ESLint
```

---

## Deployment

Deploy to [Vercel](https://vercel.com/new). Set all variables from the table above in the project's environment settings (mark `SUPABASE_SERVICE_ROLE_KEY` and `PARENT_SESSION_SECRET` as server-only / non-exposed).

Next.js deployment docs: <https://nextjs.org/docs/app/building-your-application/deploying>
