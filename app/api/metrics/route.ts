import { NextRequest, NextResponse } from "next/server";
import { upsertMetrics } from "@/lib/metrics/upsert";

export const dynamic = "force-dynamic";

// Manual metrics push — no external API needed. Send a day's numbers from a
// script or a shortcut. Protected by CRON_SECRET (same header Vercel Cron uses).
//   curl -X POST $URL/api/metrics -H "authorization: Bearer $CRON_SECRET" \
//     -H "content-type: application/json" \
//     -d '{"metric_date":"2026-06-10","installs":3,"active_users":2,"paid_subscribers":1,"reviews":1,"revenue_cents":3999}'
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body?.metric_date || typeof body.metric_date !== "string") {
    return NextResponse.json({ error: "metric_date (YYYY-MM-DD) is required" }, { status: 400 });
  }
  const result = await upsertMetrics({ source: "manual", ...(body as object) } as never);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
