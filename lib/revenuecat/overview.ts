export interface RcMetrics {
  paid_subscribers: number | null;
  active_trials: number | null;
  active_users: number | null;
  revenue_cents: number | null;
}

/**
 * RevenueCat v2 project Overview metrics. Snapshot / trailing-28-day aggregates
 * (not per-day). Revenue/MRR come back as DOLLARS (decimal) → convert to cents.
 * Shape-tolerant: handles both the documented `{metrics:[{id,value}]}` array and
 * the flattened `{id: value}` form. Returns null when credentials are absent.
 */
export async function fetchRevenueCatMetrics(): Promise<RcMetrics | null> {
  const key = process.env.REVENUECAT_API_KEY; // sk_... v2 secret
  const projectId = process.env.REVENUECAT_PROJECT_ID; // proj...
  if (!key || !projectId) return null;

  const res = await fetch(
    `https://api.revenuecat.com/v2/projects/${projectId}/metrics/overview?currency=USD`,
    { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`RevenueCat ${res.status}: ${await res.text()}`); // 403 = missing charts_metrics scope

  const json = (await res.json()) as { metrics?: Array<{ id: string; value: number }> } & Record<string, unknown>;
  const byId = new Map<string, number>();
  if (Array.isArray(json?.metrics)) {
    for (const m of json.metrics) if (typeof m?.value === "number") byId.set(m.id, m.value);
  } else {
    for (const [k, v] of Object.entries(json ?? {})) if (typeof v === "number") byId.set(k, v as number);
  }
  const pick = (...ids: string[]) => {
    for (const i of ids) { const v = byId.get(i); if (v != null) return v; }
    return null;
  };
  const revenueDollars = pick("revenue", "revenue_last_28_days");
  return {
    paid_subscribers: pick("active_subscriptions"),
    active_trials: pick("active_trials"),
    active_users: pick("active_users", "active_users_last_28_days"),
    revenue_cents: revenueDollars == null ? null : Math.round(revenueDollars * 100),
  };
}
