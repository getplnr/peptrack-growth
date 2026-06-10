import { NextRequest, NextResponse } from "next/server";
import { runAutomation } from "@/lib/automation";

export const dynamic = "force-dynamic";

// Daily automation endpoint. Wired to Vercel Cron (vercel.json). Generates DRAFTS
// and TASKS only — never sends. Protected by CRON_SECRET (Vercel sends it as a
// Bearer token automatically when the env var is set).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const result = await runAutomation();
  return NextResponse.json(result);
}
