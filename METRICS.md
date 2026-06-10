# Live metrics — App Store Connect + RevenueCat importer

The daily cron (`/api/cron`, 13:00 UTC) pulls real numbers into `app_metrics` so the
Command Center shows live installs / active users / subscribers / revenue instead of
zeros. It's **credential-gated**: any source whose env vars are blank is skipped
cleanly, so nothing breaks before you add keys.

## What each source provides

| `app_metrics` column | Source | Notes |
|---|---|---|
| `installs` | App Store Connect — Summary Sales report | per-day, reliable; ~1–2 day lag |
| `reviews` | App Store Connect — customerReviews | total written reviews |
| `paid_subscribers` | RevenueCat — `active_subscriptions` | current snapshot |
| `active_users` | RevenueCat — `active_users` | trailing-28-day (not single-day DAU) |
| `revenue_cents` | RevenueCat — `revenue` | trailing-28-day, dollars→cents |
| `trial_starts` | RevenueCat — `active_trials` | snapshot of trials in progress (best-effort) |

The importer writes one merged row per day (`source = 'import'`), upserted idempotently.

## Enable App Store Connect (installs + reviews)

1. **App Store Connect → Users and Access → Integrations → App Store Connect API** →
   generate a **Team key**, role **Admin** or **Finance**. Download the `.p8` (one chance).
2. Note the **Key ID**, the **Issuer ID** (top of that page), and your **Vendor Number**
   (Payments and Financial Reports → numeric, *not* the Apple ID).
3. Add to Vercel env (Production):
   ```
   ASC_KEY_ID=<10-char key id>
   ASC_ISSUER_ID=<issuer uuid>
   ASC_PRIVATE_KEY=<paste the full .p8 contents, BEGIN/END lines included>
   ASC_VENDOR_NUMBER=<numeric vendor #>     # required for installs
   ```

## Enable RevenueCat (subscribers + revenue)

1. **RevenueCat → Project Settings → API Keys → + New** → version **V2**, scope
   **`charts_metrics:overview:read`**. Copy the `sk_…` secret.
2. Grab the **project id** (`proj…` in the dashboard URL).
3. Add to Vercel env (Production):
   ```
   REVENUECAT_API_KEY=sk_...
   REVENUECAT_PROJECT_ID=proj...
   ```

Redeploy after adding env vars. The next cron run (or a manual `GET /api/cron` with the
`CRON_SECRET` bearer) populates `app_metrics`.

## Manual push (no API setup needed)

You can always post a day's numbers yourself — handy before wiring the APIs:
```bash
curl -X POST https://peptrack-growth.vercel.app/api/metrics \
  -H "authorization: Bearer $CRON_SECRET" \
  -H "content-type: application/json" \
  -d '{"metric_date":"2026-06-10","installs":3,"active_users":2,"paid_subscribers":1,"reviews":1,"revenue_cents":3999}'
```

## Two things to confirm on the first live run (flagged by the API research)

- **RevenueCat** — the exact trailing-metric id spellings (`revenue` vs `revenue_last_28_days`)
  weren't resolvable from docs alone. The parser tries both; check `/api/cron`'s JSON `log`
  on the first run and trim `lib/revenuecat/overview.ts` once confirmed.
- **App Store Connect** — confirm `meta.paging.total` is populated on `customerReviews`
  (the code falls back to paging if not) and that omitting `filter[version]` returns the
  current Summary Sales report for your vendor.
