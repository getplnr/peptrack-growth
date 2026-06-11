import { supabaseAdmin } from "./supabase";

// Automation rules (Module 10). DRAFTS + TASKS ONLY — never sends anything.
// Idempotent via status transitions (New → Draft created → Contacted → Follow-up needed).

const PRIORITY_THRESHOLD = 70;
const MAX_PER_RUN = 25;

// Keys are lowercased; lookup normalizes p.channel to lowercase so casing/spacing
// in the seed data can't silently fall through to the wrong template.
const CHANNEL_TO_AUDIENCE: Record<string, string> = {
  "glp-1 facebook groups": "fb_group_admin",
  "tirzepatide facebook groups": "fb_group_admin",
  "semaglutide facebook groups": "fb_group_admin",
  "peptide communities": "reddit_moderator",
  "reddit communities": "reddit_moderator",
  "elite research usa customers": "elite_research_customer",
  "telehealth clinics": "telehealth_clinic",
  "weight-loss coaches": "weight_loss_coach",
  "peptide youtube creators": "peptide_creator",
  "glp-1 tiktok creators": "tiktok_creator",
  "glp-1 instagram creators": "instagram_creator",
  "health & wellness newsletters": "newsletter_owner",
};
const audienceForChannel = (channel: string) =>
  CHANNEL_TO_AUDIENCE[(channel || "").toLowerCase().trim()] || "glp1_creator";

// Turn a messy prospect name into a clean greeting name: strip "(...)" descriptors,
// " -- descriptor" suffixes, and known prefixes (e.g. "GLP-1 Telehealth:").
export function cleanName(raw: string | null | undefined): string {
  if (!raw) return "there";
  const s = raw
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+--.*$/, "")
    .replace(/^(GLP-1 Telehealth|FB search strategy|FB search|TikTok discovery|IG discovery):\s*/i, "")
    .replace(/^[\s,]+|[\s,]+$/g, "")
    .trim();
  return s || "there";
}

const isoDaysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
const todayDate = () => new Date().toISOString().slice(0, 10);

export interface AutomationResult {
  mode: "demo" | "live";
  ranAt: string;
  count?: number;
  note?: string;
  actions: string[];
}

export async function runAutomation(): Promise<AutomationResult> {
  const sb = supabaseAdmin();
  if (!sb) {
    return {
      mode: "demo", ranAt: new Date().toISOString(), actions: [],
      note: "Supabase not configured — automation is a safe no-op. Set .env to enable.",
    };
  }
  const actions: string[] = [];

  const { data: templates } = await sb.from("outreach_messages").select("*").eq("is_template", true);
  const tmplFor = (audience: string, variant = "professional") =>
    (templates || []).find((t: any) => t.audience_key === audience && t.variant === variant) ||
    (templates || []).find((t: any) => t.audience_key === audience && t.variant === "short");

  // Rule: New prospect with score ≥ threshold → auto-draft outreach (ready) + task; status → Draft created.
  const { data: fresh } = await sb.from("prospects").select("*")
    .eq("status", "New").gte("priority_score", PRIORITY_THRESHOLD)
    .order("priority_score", { ascending: false }).limit(MAX_PER_RUN);
  for (const p of fresh || []) {
    const audience = audienceForChannel(p.channel as string);
    const t = tmplFor(audience);
    if (!t) continue;
    const name = cleanName(p.name);
    const body = (t.body || "").replace(/\{\{NAME\}\}/g, name);
    await sb.from("outreach_messages").insert({
      audience_key: audience, label: t.label, channel: t.channel, variant: t.variant,
      body, is_template: false, prospect_id: p.id, status: "ready", notes: "auto-drafted by automation",
    });
    await sb.from("tasks").insert({
      title: `Review & send draft to ${name}`, kind: "draft_outreach", prospect_id: p.id,
      status: "open", priority: "high", due_date: todayDate(), auto_generated: true,
      rule: "Score ≥ threshold → draft outreach → ready for approval",
    });
    await sb.from("prospects").update({ status: "Draft created" }).eq("id", p.id);
    actions.push(`drafted → ${p.name}`);
  }

  // Rule: Contacted + no reply ≥ 3d → follow-up #1 task; status → Follow-up needed.
  const { data: stale3 } = await sb.from("prospects").select("*")
    .eq("status", "Contacted").lte("last_contacted", isoDaysAgo(3)).limit(MAX_PER_RUN);
  for (const p of stale3 || []) {
    await sb.from("tasks").insert({
      title: `Follow-up #1: ${p.name} (no reply 3d)`, kind: "follow_up", prospect_id: p.id,
      status: "open", priority: "normal", due_date: todayDate(), auto_generated: true,
      rule: "No reply after 3 days → follow-up #1",
    });
    await sb.from("prospects").update({ status: "Follow-up needed" }).eq("id", p.id);
    actions.push(`follow-up #1 → ${p.name}`);
  }

  // Rule: Follow-up needed + no reply ≥ 7d → follow-up #2 task (deduped).
  const { data: stale7 } = await sb.from("prospects").select("*")
    .eq("status", "Follow-up needed").lte("last_contacted", isoDaysAgo(7)).limit(MAX_PER_RUN);
  for (const p of stale7 || []) {
    const { data: existing } = await sb.from("tasks").select("id")
      .eq("prospect_id", p.id).eq("rule", "No reply after 7 days → follow-up #2").limit(1);
    if (existing && existing.length) continue;
    await sb.from("tasks").insert({
      title: `Follow-up #2: ${p.name} (no reply 7d)`, kind: "follow_up", prospect_id: p.id,
      status: "open", priority: "normal", due_date: todayDate(), auto_generated: true,
      rule: "No reply after 7 days → follow-up #2",
    });
    actions.push(`follow-up #2 → ${p.name}`);
  }

  return { mode: "live", ranAt: new Date().toISOString(), count: actions.length, actions };
}
