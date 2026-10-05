# Star Wars Celebration Events 2027

An unofficial companion for Star Wars Celebration Los Angeles 2027 at [swc.events](https://swc.events). Browse and search the panel schedule, view every stage side by side, save events to your own schedule (no account), get conflict warnings, and export to your calendar.

## Stack

- Next.js 16 (App Router, Turbopack, Cache Components, React Compiler, typed routes)
- React 19, TypeScript 5.9
- Tailwind CSS 4 with shadcn/ui (Radix base) and lucide icons
- nuqs for URL state, Fuse.js for search, zod for feed validation, `@date-fns/tz` for show-time parsing, `ics` for calendar export
- Vitest for the data pipeline, pnpm for packages
- Vercel Analytics and Speed Insights

## Getting started

```bash
pnpm install
```

```bash
pnpm dev
```

With no live 2027 feed, `pnpm dev` falls back to generated sample data so every page has something to render. Append `?now=2027-04-02T11:20:00-07:00` to any URL in development to preview the "during the show" states (live badges, now line, up next).

Other scripts: `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format`.

## Environment

| Variable | Purpose |
| --- | --- |
| `SCHEDULE_ENDPOINT` | Official schedule JSON (`{ schedules: [...] }`). Server-only. Falls back to the legacy `NEXT_PUBLIC_SCHEDULE_ENDPOINT`, which is safe because rows outside the show year are dropped. |
| `VENDOR_ENDPOINT` | Official exhibitor JSON (`{ space_orders: [...] }`). Server-only. No legacy fallback: vendor rows have no dates, and the old URL still serves the 2023 London list. |
| `SCHEDULE_SOURCE` | Optional. `sample` forces sample data, `live` disables the dev fallback. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (`SWC Events 2027`). Public. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (`sb_publishable_...`). Public; row level security guards the data. Without these two, account features hide and favorites stay device-only. |
| `CRON_SECRET` | Optional. When set, the keep-alive cron requires it as a bearer token. |

## Accounts and sync

Setup steps for going live are in [runbook-accounts.md](docs/runbook-accounts.md).

Saved events and vendor bookmarks are local-first ([synced-set.ts](lib/sync/synced-set.ts)): every change lands in `localStorage` immediately (works offline on show-floor wifi) and is queued. When signed in, the queue is pushed to Supabase and the account copy is pulled back on sign-in, focus, reconnect, and every two minutes. The first sign-in on a device merges whatever was saved there into the account; an explicit sign-out clears the device.

- Sign-in: Google, Discord, or a 6-digit emailed code (codes instead of links, because links open in the mail app's browser and can't sign in a home-screen web app).
- Schema and row level security: [supabase/migrations](supabase/migrations). Profiles are private by default; a public profile needs a handle and is served at `/u/[handle]`.
- Auth settings (redirect URLs, email template, Resend SMTP, OAuth providers): [configure-auth.sh](supabase/configure-auth.sh), applied with the Supabase Management API.
- Keep-alive: a daily Vercel cron ([vercel.ts](vercel.ts)) pings the database so the free-tier project never pauses.

## How data flows

1. [source.ts](lib/schedule/source.ts) fetches the feeds inside `'use cache'` functions (schedule refreshes every 5 minutes, vendors every 15). A failed fetch is cached for seconds, not minutes.
2. [normalize.ts](lib/schedule/normalize.ts) validates rows with zod, decodes HTML entities, parses wall-clock times in the show's time zone (independent of the server's zone), filters to the show year, dedupes, sorts, and derives stages and days. Malformed rows are skipped, not fatal.
3. Server pages pass a trimmed [summary](lib/schedule/summary.ts) of each event to client components; full descriptions stay on the event page.
4. Favorites and vendor bookmarks live in `localStorage` ([use-favorites.ts](hooks/use-favorites.ts)) and sync across tabs.
5. Calendar exports are route handlers: `/event/[id]/calendar.ics` and `/my-schedule/calendar.ics?ids=...` (also usable as a `webcal://` subscription that tracks schedule changes).

All times display in the show's time zone, so the app matches the signs in the building regardless of the phone's setting.

## Rolling to the next Celebration

1. Update [celebration.ts](lib/celebration.ts): name, city, location, time zone, dates, countdown target, and `storagePrefix` (so old favorites don't collide).
2. Point `SCHEDULE_ENDPOINT` and `VENDOR_ENDPOINT` at the new feeds.
3. Add show-specific extras (exhibit hall hours and similar) to [custom-events.ts](lib/schedule/custom-events.ts).
4. Swap the artwork: `public/swc-*-logo-lg.png`, `public/bg*.png`, `app/countdown/countdown.png`, `app/opengraph-image.png`.
5. Run `pnpm test` and check `/schedule` with `SCHEDULE_SOURCE=live`.

## Legacy code

`_old/` holds the 2023 pages-router app (Supabase magic-link auth, synced favorites, user-created events, reminders, stats). It is excluded from linting and type-checking and kept only for reference.
