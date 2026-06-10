# Supabase setup — PepTrack Growth OS

The live Supabase project is **already created and fully seeded**. Only one secret
(the `service_role` key) needs to be pasted into Vercel to flip the dashboard from
demo mode to live.

## Project

| | |
|---|---|
| Name | `peptrack-growth` |
| Project ref | `wragikbxqysarhjacstp` |
| API URL | `https://wragikbxqysarhjacstp.supabase.co` |
| Org | PLNR (`lwmfkbvxiowmzelhuote`) · region us-east-2 |
| Plan cost | +$10/mo (additional project on the paid org) |

## Already applied

- **Schema** — `supabase/migrations/0001_schema.sql` (14 tables, indexes, RLS enabled, deny-by-default).
- **Seed** — `0002_seed.sql` content loaded and verified:
  4 campaigns · 4 promo codes · 99 outreach templates · 34 content posts · 51 public prospects · 8 compliance flags.
- **Vercel env (production)** — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.

## The one remaining step (go live)

The dashboard reads server-side with the **`service_role`** key so it can read/write
past RLS (this is an internal, password-gated admin tool — same pattern as TALNT).
That key is a secret and isn't stored in this repo.

1. **Supabase** → project `peptrack-growth` → **Settings → API** → copy the **`service_role`** secret (NOT the anon key).
2. **Vercel** → `peptrack-growth` project → **Settings → Environment Variables** → add for **Production**:
   ```
   SUPABASE_SERVICE_ROLE_KEY = <paste the service_role secret>
   ```
3. **Redeploy**: Vercel → Deployments → ⋯ → **Redeploy** (or run `vercel --prod --scope team_lU0rIrk31cGFr1oNsrKWCBvT` from this folder).

When it redeploys, the "Demo mode" banner disappears, every page reads live from
Supabase, and the daily automation cron (`/api/cron`) can write drafts/tasks.

## Verify it's live

- Open https://peptrack-growth.vercel.app (Basic Auth — user `peptrack`, password = the Vercel `DASHBOARD_PASSWORD` env value).
- The amber "Demo mode" banner should be **gone**.
- `/prospects` should show the 51 seeded rows; editing a row in Supabase should reflect on refresh.

## Other env vars (already set in Vercel)

| Var | Purpose |
|---|---|
| `DASHBOARD_USER` / `DASHBOARD_PASSWORD` | Basic-Auth gate (rotate the password here anytime) |
| `CRON_SECRET` | protects `/api/cron` (Vercel Cron sends it automatically) |
| `NEXT_PUBLIC_APP_STORE_URL` / `NEXT_PUBLIC_SITE_URL` | links + attribution |
| `RESEND_API_KEY` / `RESEND_FROM` | optional — only for approved email sends |

## Re-seeding / local dev

- Re-apply or update seed content anytime with `npm run seed` (needs `NEXT_PUBLIC_SUPABASE_URL`
  + `SUPABASE_SERVICE_ROLE_KEY` in a local `.env`) — it upserts from `data/*.json`.
- Locally, the app runs in **demo mode with zero config** (`npm install && npm run dev`).

## Security notes

- RLS is enabled on all tables with **no public policy** — anon/public requests get nothing;
  the server uses `service_role`. The `service_role` key must never be exposed to the client
  or committed (it's not `NEXT_PUBLIC_*`).
- The dashboard itself is gated by the Basic-Auth middleware (`DASHBOARD_PASSWORD`).
