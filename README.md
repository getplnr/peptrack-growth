# PepTrack Growth OS

A compliant, founder-led **traction operating system** for PepTrack — direct outreach, creator partnerships, community growth, and affiliate-style distribution. **No paid ads. No spam. Nothing sends without your approval.**

Goals: **first 100 installs · 20 active users · 10 App Store reviews · first paid subscribers.**

Stack: **Next.js 15 (App Router) + Supabase (Postgres + RLS) + Tailwind**, deployable to **Vercel**. Runs out-of-the-box in **demo mode** with generated sample data; point it at Supabase to go live.

---

## 1. What's built (16 modules)

| Module | Where |
|---|---|
| 1 Growth Command Center | `/` — KPIs, prospects by channel, conversion & revenue by source, campaigns, compliance |
| 2 Prospect CRM | `/prospects` — filterable table, priority scores, public contact methods |
| 3 Lead Research + Priority Score | `lib/scoring.ts` (weighted 0-100), `data/prospects-import-template.csv` (CSV import) |
| 4 Outreach Draft Generator | `/templates` — 11 audiences × 9 variants (99 drafts), `data/outreach-templates.json` |
| 5 Review Generation | `/reviews` — eligibility signals + compliant native-prompt dashboard |
| 6 Landing / Creator page copy | `data/landing.md` (paste into the marketing site / a `/partners` route) |
| 7 Campaign Builder | `/campaigns` — 4 loaded campaigns w/ sequences, UTMs, promo codes, KPIs |
| 8 Content Engine | `/content` — 30-day, multi-platform, compliant calendar (34 posts) |
| 9 Attribution | `/attribution` — UTM/link builder + Apple campaign token + clipboard deep-link + events |
| 10 Automation Rules | `tasks` table + auto-generated tasks (rules documented below; cron-ready) |
| 11 Admin Approval Queue | `/approvals` — review → approve → send/post manually |
| 12 Founder Daily Action | `/daily` — today's priorities for a busy founder |
| 13 Compliance Review | `/compliance` — CAN-SPAM/FTC/Apple/platform/privacy risk register, see `COMPLIANCE.md` |
| 14 Implementation | this repo (Next.js + Supabase + Vercel) |
| 15 Database (14 tables + RLS) | `supabase/migrations/0001_schema.sql` |
| 16 Deliverables | this README |

---

## 2. Run locally

```bash
cd ~/code/peptrack-growth
npm install
npm run dev          # http://localhost:3000  — runs in DEMO MODE (sample data), no config needed
```

To go live with Supabase:

```bash
cp .env.example .env        # fill in your Supabase project values
# apply schema + seed:
#   Option A (CLI):  supabase link --project-ref <ref> && supabase db push
#   Option B (SQL):  paste supabase/migrations/0001_schema.sql then 0002_seed.sql into the SQL editor
#   Option C (JSON): npm run seed   (upserts data/*.json via the service_role key)
npm run dev
```

Deploy: push to GitHub → import to Vercel → set the same env vars → deploy.

---

## 3. Environment variables (`.env.example`)

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project (anon key is RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** privileged key; the dashboard reads/writes past RLS. Never expose. |
| `ADMIN_EMAILS` | allowlist for future Supabase Auth gating |
| `NEXT_PUBLIC_APP_STORE_URL` / `NEXT_PUBLIC_SITE_URL` | links + attribution |
| `RESEND_API_KEY` / `RESEND_FROM` | optional — only for **approved** email sends |

The app runs fully without any of these (demo mode).

---

## 4. Database (14 tables + RLS)

`prospects · campaigns · outreach_messages · outreach_sequences · creator_partners · promo_codes · content_calendar · social_posts · app_metrics · review_eligibility · attribution_events · tasks · compliance_flags · campaign_daily_metrics`

RLS is **enabled on every table with no public policy** (deny-by-default). The server uses the `service_role` key for this single-admin tool (same pattern Jordan uses on TALNT). An optional admin-email policy is included (commented) for future client auth.

Migrations: `supabase/migrations/0001_schema.sql` (schema + indexes + RLS), `0002_seed.sql` (campaigns, 99 templates, 34 content items, 51 prospects, compliance flags).

---

## 5. Automation rules (Module 10)

Wire these as Supabase scheduled functions / a cron route (they generate **tasks** and **drafts only** — never auto-send):

1. New prospect → compute priority score (`lib/scoring.ts`).
2. Score ≥ 70 → create a `draft_outreach` task + a `draft` row in `outreach_messages`.
3. Draft created → status `ready` → appears in the Approval Queue.
4. No reply after 3 days → `follow_up` task (follow_up_1).
5. No reply after 7 days → `follow_up` task (follow_up_2).
6. Positive reply → `onboard_partner` task.
7. Partner approved → generate `promo_code` + UTM tracking link.
8. User active (signals met) → check review eligibility.
9. Review eligible → flag for the in-app native prompt.
10. Campaign underperforming → `message_test` task.

---

## 6. Deliverables index (Module 16)

- **First-100 campaign loaded** → `/campaigns` (`first_100_users`).
- **50+ prospect slots / import template** → `data/prospects-import-template.csv` (51 real public targets, contacts blank).
- **30-day content calendar** → `/content` (`data/content-calendar.json`).
- **Outreach templates** → `/templates` (`data/outreach-templates.json`).
- **Compliance-safe creator pitch** → `partnership_proposal` / `affiliate_proposal` variants per audience.
- **Review request flow** → `/reviews` + `COMPLIANCE.md`.
- **Landing/creator copy** → `data/landing.md`.
- **Testing checklist** → `TESTING.md`.
- **Risks & limitations** → `COMPLIANCE.md` + `/compliance`.

See `COMPLIANCE.md` for the full risk register and the non-negotiable guardrails.
