import { supabaseAdmin } from "@/lib/supabase";

export interface DailyMetrics {
  metric_date: string; // YYYY-MM-DD
  installs?: number;
  active_users?: number;
  trial_starts?: number;
  paid_subscribers?: number;
  reviews?: number;
  revenue_cents?: number;
  source?: string;
}

/** Idempotent upsert of one day's metrics into app_metrics (unique on metric_date+source). */
export async function upsertMetrics(m: DailyMetrics): Promise<{ ok: boolean; reason?: string }> {
  const sb = supabaseAdmin();
  if (!sb) return { ok: false, reason: "supabase not configured" };
  const row = {
    source: "import",
    installs: 0, active_users: 0, trial_starts: 0, paid_subscribers: 0, reviews: 0, revenue_cents: 0,
    ...m,
  };
  const { error } = await sb.from("app_metrics").upsert(row, { onConflict: "metric_date,source" });
  return error ? { ok: false, reason: error.message } : { ok: true };
}

/** Yesterday's date (UTC) as YYYY-MM-DD — App Store/RevenueCat data lags ~1 day. */
export function yesterdayIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
