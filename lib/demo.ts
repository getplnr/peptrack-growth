// Demo dataset — powers the dashboard with zero config (no Supabase needed).
// Pulls the generated content (templates/calendar/campaigns/prospects/compliance)
// and adds illustrative metrics/tasks/attribution so every screen renders.
// Clearly sample data — replace by configuring Supabase (.env) + applying migrations.

import campaignsJson from "@/data/campaigns.json";
import templatesJson from "@/data/outreach-templates.json";
import contentJson from "@/data/content-calendar.json";
import prospectsJson from "@/data/prospects.json";
import complianceJson from "@/data/compliance-flags.json";
import type {
  Campaign, OutreachMessage, ContentItem, Prospect, ComplianceFlag,
  AppMetric, Task, AttributionEvent, ReviewEligibility, CreatorPartner,
} from "./types";

const id = (p: string, i: number) => `demo-${p}-${i}`;

export const demoCampaigns: Campaign[] = (campaignsJson as any[]).map((c, i) => ({ id: id("campaign", i), ...c }));

export const demoTemplates: OutreachMessage[] = (templatesJson as any[]).map((t, i) => ({ id: id("tpl", i), ...t }));

export const demoContent: ContentItem[] = (contentJson as any[]).map((c, i) => ({ id: id("content", i), status: "idea", ...c }));

export const demoProspects: Prospect[] = ((prospectsJson as any).rows as any[]).map((p, i) => ({
  id: id("prospect", i),
  name: p.name, channel: p.channel, prospect_type: p.prospect_type,
  platform_url: p.platform_url, public_contact_method: p.public_contact_method,
  est_audience_fit: p.est_audience_fit, priority_score: p.priority_score,
  notes: p.notes, status: "New", owner: "seed",
}));

export const priorityFormula: string = (prospectsJson as any).priority_formula || "";

export const demoCompliance: ComplianceFlag[] = ((complianceJson as any).flags as any[]).map((f, i) => ({ id: id("flag", i), status: "enforced", ...f }));
export const complianceSummary: string = (complianceJson as any).summary || "";

// ---- illustrative live metrics (deterministic, pre-launch ramp) ----
function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const demoMetrics: AppMetric[] = Array.from({ length: 14 }, (_, k) => {
  const daysAgo = 13 - k; // oldest -> newest
  const ramp = 14 - daysAgo;
  return {
    metric_date: isoDaysAgo(daysAgo),
    installs: Math.max(0, Math.round(ramp * 0.6)),
    active_users: Math.max(0, Math.round(ramp * 0.35)),
    trial_starts: Math.max(0, Math.round(ramp * 0.12)),
    paid_subscribers: Math.max(0, Math.round(ramp * 0.05)),
    reviews: daysAgo < 5 ? 1 : 0,
    revenue_cents: Math.max(0, Math.round(ramp * 0.05)) * 3999,
    source: "demo",
  };
});

export const demoTasks: Task[] = [
  { id: id("task", 1), title: "Approve 10 new prospects in the CRM", kind: "score_lead", status: "open", priority: "high", due_date: isoDaysAgo(0), auto_generated: true, rule: "New prospect added → score lead" },
  { id: id("task", 2), title: "Send 5 ready outreach drafts (GLP-1 creators)", kind: "draft_outreach", status: "open", priority: "high", due_date: isoDaysAgo(0), auto_generated: true, rule: "Lead score ≥ threshold → draft outreach" },
  { id: id("task", 3), title: "Follow-up #1 due: 3 contacted prospects (no reply 3d)", kind: "follow_up", status: "open", priority: "normal", due_date: isoDaysAgo(0), auto_generated: true, rule: "No reply after 3 days → follow-up task" },
  { id: id("task", 4), title: "Post today's content: Reddit educational (with mod permission)", kind: "content", status: "open", priority: "normal", due_date: isoDaysAgo(0) },
  { id: id("task", 5), title: "Onboard partner: send code + tracking link", kind: "onboard_partner", status: "open", priority: "normal", due_date: isoDaysAgo(0), auto_generated: true, rule: "Positive reply → onboard partner" },
];

export const demoAttribution: AttributionEvent[] = [
  { id: id("attr", 1), event_type: "link_click", source: "instagram", campaign: "first-100", creator_code: "SAMPLE10", occurred_at: isoDaysAgo(1) },
  { id: id("attr", 2), event_type: "app_store_click", source: "reddit", campaign: "first-100", occurred_at: isoDaysAgo(1) },
  { id: id("attr", 3), event_type: "install", source: "newsletter", campaign: "first-100", occurred_at: isoDaysAgo(2) },
  { id: id("attr", 4), event_type: "subscription_start", source: "instagram", campaign: "affiliate-launch", creator_code: "SAMPLE10", revenue_cents: 3999, occurred_at: isoDaysAgo(3) },
  { id: id("attr", 5), event_type: "how_heard", source: "elite-research", campaign: "elite-distribution", occurred_at: isoDaysAgo(4) },
];

export const demoReviewEligibility: ReviewEligibility[] = [
  { id: id("rev", 1), user_ref: "u_8f3a", injections_logged: 5, days_active: 9, has_reminder: true, has_weight: true, return_visits: 4, eligible: true, prompt_shown: false, feedback_submitted: false, review_link_clicked: false },
  { id: id("rev", 2), user_ref: "u_2b71", injections_logged: 3, days_active: 7, has_reminder: true, has_weight: false, return_visits: 2, eligible: true, prompt_shown: true, prompt_shown_at: isoDaysAgo(1), feedback_submitted: false, review_link_clicked: true },
  { id: id("rev", 3), user_ref: "u_c40e", injections_logged: 1, days_active: 2, has_reminder: false, has_weight: false, return_visits: 1, eligible: false, prompt_shown: false, feedback_submitted: false, review_link_clicked: false },
];

export const demoPartners: CreatorPartner[] = [
  { id: id("partner", 1), name: "Sample Creator", handle: "@samplecreator", platform: "instagram", follower_count: 42000, tier: "A", promo_code: "SAMPLE10", affiliate_code: "SAMPLE10", partnership_status: "active", disclosure_ack: true, revenue_share: "Flat + bonus on tracked installs" },
];
