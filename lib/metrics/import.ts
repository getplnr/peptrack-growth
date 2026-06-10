import { fetchDailyInstalls } from "@/lib/asc/installs";
import { fetchReviewCount } from "@/lib/asc/reviews";
import { fetchRevenueCatMetrics } from "@/lib/revenuecat/overview";
import { upsertMetrics, yesterdayIso, DailyMetrics } from "./upsert";

/** App Store sales reports lag ~2 days (Pacific). */
function ascReportDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 2);
  return d.toISOString().slice(0, 10);
}

/**
 * Pull live numbers and upsert one merged `app_metrics` row (source='import') for
 * yesterday. Fault-isolated + credential-gated: each source is independent and a
 * missing key or API error never blocks the others. Returns a summary log.
 *
 * Field caveats (see SUPABASE_SETUP / research): installs+reviews come from App
 * Store Connect (reliable, ~1-2d lag); paid_subscribers is an RC snapshot; active_users
 * & revenue_cents are RC trailing-28-day aggregates; trial_starts holds RC's
 * active_trials snapshot (not true per-day starts). No creds → safe no-op.
 */
export async function importMetrics(): Promise<{ imported: boolean; reason?: string; row?: DailyMetrics; log: string[] }> {
  const row: DailyMetrics = { metric_date: yesterdayIso(), source: "import" };
  const log: string[] = [];

  if (process.env.ASC_KEY_ID && process.env.ASC_ISSUER_ID && process.env.ASC_PRIVATE_KEY) {
    try {
      const installs = await fetchDailyInstalls(ascReportDate());
      if (installs != null) { row.installs = installs; log.push(`installs=${installs}`); }
      else log.push("installs=skipped(no vendor# or not ready)");
    } catch (e) { log.push(`asc.installs error: ${(e as Error).message}`); }
    try {
      const reviews = await fetchReviewCount();
      if (reviews != null) { row.reviews = reviews; log.push(`reviews=${reviews}`); }
    } catch (e) { log.push(`asc.reviews error: ${(e as Error).message}`); }
  } else {
    log.push("app_store_connect skipped (no creds)");
  }

  if (process.env.REVENUECAT_API_KEY && process.env.REVENUECAT_PROJECT_ID) {
    try {
      const rc = await fetchRevenueCatMetrics();
      if (rc) {
        if (rc.paid_subscribers != null) row.paid_subscribers = rc.paid_subscribers;
        if (rc.active_trials != null) row.trial_starts = rc.active_trials;
        if (rc.active_users != null) row.active_users = rc.active_users;
        if (rc.revenue_cents != null) row.revenue_cents = rc.revenue_cents;
        log.push(`subs=${rc.paid_subscribers} active=${rc.active_users} rev_cents=${rc.revenue_cents}`);
      }
    } catch (e) { log.push(`revenuecat error: ${(e as Error).message}`); }
  } else {
    log.push("revenuecat skipped (no creds)");
  }

  const hasData = [row.installs, row.reviews, row.paid_subscribers, row.active_users, row.revenue_cents]
    .some((v) => v != null);
  if (!hasData) return { imported: false, reason: "no data (sources skipped or empty)", log };

  const r = await upsertMetrics(row);
  return { imported: r.ok, reason: r.reason, row, log };
}
