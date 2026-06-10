import { NextRequest, NextResponse } from "next/server";
import { runAutomation } from "@/lib/automation";
import { importMetrics } from "@/lib/metrics/import";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // metrics importer uses node:zlib + jose

// Daily cron (vercel.json). Runs the draft-only automation rules AND the metrics
// importer. Both are safe: automation creates drafts/tasks only (never sends);
// the importer is credential-gated and no-ops any source whose keys aren't set.
// Protected by CRON_SECRET (Vercel sends it as a Bearer token automatically).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [automation, metrics] = await Promise.all([runAutomation(), importMetrics()]);
  return NextResponse.json({ ranAt: new Date().toISOString(), automation, metrics });
}
