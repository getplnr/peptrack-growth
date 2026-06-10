import { supabaseAdmin } from "./supabase";
import * as demo from "./demo";
import type {
  Prospect, Campaign, OutreachMessage, ContentItem, AppMetric, Task,
  AttributionEvent, ComplianceFlag, ReviewEligibility, CreatorPartner,
} from "./types";

export const usingDemo = () => supabaseAdmin() === null;

async function fetchOr<T>(table: string, fallback: T[], order?: { col: string; asc?: boolean }): Promise<T[]> {
  const sb = supabaseAdmin();
  if (!sb) return fallback;
  let q = sb.from(table).select("*");
  if (order) q = q.order(order.col, { ascending: order.asc ?? true });
  const { data, error } = await q;
  if (error || !data) return fallback;
  return data as T[];
}

export const getProspects = () => fetchOr<Prospect>("prospects", demo.demoProspects, { col: "priority_score", asc: false });
export const getCampaigns = () => fetchOr<Campaign>("campaigns", demo.demoCampaigns);
export const getTemplates = () => fetchOr<OutreachMessage>("outreach_messages", demo.demoTemplates);
export const getContent = () => fetchOr<ContentItem>("content_calendar", demo.demoContent, { col: "day" });
export const getMetrics = () => fetchOr<AppMetric>("app_metrics", demo.demoMetrics, { col: "metric_date" });
export const getTasks = () => fetchOr<Task>("tasks", demo.demoTasks, { col: "due_date" });
export const getAttribution = () => fetchOr<AttributionEvent>("attribution_events", demo.demoAttribution, { col: "occurred_at", asc: false });
export const getCompliance = () => fetchOr<ComplianceFlag>("compliance_flags", demo.demoCompliance);
export const getReviewEligibility = () => fetchOr<ReviewEligibility>("review_eligibility", demo.demoReviewEligibility);
export const getPartners = () => fetchOr<CreatorPartner>("creator_partners", demo.demoPartners);

export async function getTemplatesOnly(): Promise<OutreachMessage[]> {
  const all = await getTemplates();
  return all.filter((m) => m.is_template !== false);
}

/** Approval queue = outreach drafts/ready + social posts awaiting approval. */
export async function getApprovalQueue(): Promise<OutreachMessage[]> {
  const sb = supabaseAdmin();
  if (!sb) {
    // demo: surface a few "ready for approval" sample drafts derived from templates
    return demo.demoTemplates
      .filter((t) => ["short", "professional", "friendly_founder"].includes(t.variant || ""))
      .slice(0, 6)
      .map((t, i) => ({ ...t, id: `demo-queue-${i}`, is_template: false, status: i % 2 === 0 ? "ready" : "draft" }));
  }
  const { data } = await sb
    .from("outreach_messages")
    .select("*")
    .eq("is_template", false)
    .in("status", ["draft", "ready"]);
  return (data as OutreachMessage[]) || [];
}
