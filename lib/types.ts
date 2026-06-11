// Shared types mirroring the Supabase schema (supabase/migrations/0001_schema.sql).

export type ProspectStatus =
  | "New" | "Researched" | "Ready for outreach" | "Draft created" | "Contacted"
  | "Follow-up needed" | "Replied" | "Interested" | "Not interested"
  | "Partnered" | "Converted" | "Do not contact";

export const PROSPECT_STATUSES: ProspectStatus[] = [
  "New", "Researched", "Ready for outreach", "Draft created", "Contacted",
  "Follow-up needed", "Replied", "Interested", "Not interested",
  "Partnered", "Converted", "Do not contact",
];

export const CHANNELS = [
  "GLP-1 Facebook groups", "Tirzepatide Facebook groups", "Semaglutide Facebook groups",
  "Peptide communities", "Reddit communities", "Elite Research USA customers",
  "Telehealth clinics", "Weight loss coaches", "Peptide YouTube creators",
  "GLP-1 TikTok creators", "GLP-1 Instagram creators", "Health & wellness newsletters",
] as const;

export interface Prospect {
  id: string;
  name: string;
  brand_name?: string | null;
  channel?: string | null;
  prospect_type?: string | null;
  platform_url?: string | null;
  email?: string | null;
  social_handle?: string | null;
  follower_count?: number | null;
  est_audience_fit?: string | null;
  contact_status?: string | null;
  outreach_status?: string | null;
  public_contact_method?: string | null;
  last_contacted?: string | null;
  next_follow_up?: string | null;
  notes?: string | null;
  offer_made?: string | null;
  promo_code?: string | null;
  affiliate_code?: string | null;
  partnership_status?: string | null;
  attribution_link?: string | null;
  response_sentiment?: string | null;
  owner?: string | null;
  priority_score?: number | null;
  status?: string | null;
  campaign_id?: string | null;
  created_at?: string;
}

export interface Campaign {
  id: string; key: string; name: string; goal?: string | null;
  timeframe_days?: number | null; target_audience?: string | null;
  offer?: string | null; cta?: string | null;
  utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null;
  promo_code?: string | null;
  message_sequence?: { step: number; day_offset: number; channel: string; message: string }[];
  follow_up_schedule?: string | null; kpis?: string[]; status?: string | null;
}

export interface ProspectContact {
  name?: string | null; email?: string | null; social_handle?: string | null;
  platform_url?: string | null; public_contact_method?: string | null; channel?: string | null;
}

export interface OutreachMessage {
  id: string; audience_key?: string | null; label?: string | null; channel?: string | null;
  variant?: string | null; body: string; is_template?: boolean;
  prospect_id?: string | null; campaign_id?: string | null;
  status?: string; approved_by?: string | null; sent_at?: string | null; notes?: string | null;
  prospect?: ProspectContact | null;
}

export interface ContentItem {
  id: string; day?: number | null; platform?: string | null; pillar?: string | null;
  format?: string | null; hook?: string | null; body?: string | null; cta?: string | null;
  hashtags?: string | null; scheduled_for?: string | null; status?: string;
}

export interface SocialPost {
  id: string; content_id?: string | null; platform?: string | null; body?: string | null;
  status?: string; approved_by?: string | null; scheduled_for?: string | null; permalink?: string | null;
}

export interface AppMetric {
  id?: string; metric_date: string; installs: number; active_users: number;
  trial_starts: number; paid_subscribers: number; reviews: number; revenue_cents: number; source?: string;
}

export interface ReviewEligibility {
  id: string; user_ref: string; injections_logged: number; days_active: number;
  has_reminder: boolean; has_weight: boolean; return_visits: number; eligible: boolean;
  prompt_shown: boolean; prompt_shown_at?: string | null; feedback_submitted: boolean;
  review_link_clicked: boolean;
}

export interface AttributionEvent {
  id: string; event_type: string; source?: string | null; campaign?: string | null;
  creator_code?: string | null; promo_code?: string | null; utm?: Record<string, string>;
  landing_path?: string | null; revenue_cents?: number; occurred_at?: string;
}

export interface Task {
  id: string; title: string; kind?: string | null; prospect_id?: string | null;
  campaign_id?: string | null; status?: string; priority?: string; due_date?: string | null;
  auto_generated?: boolean; rule?: string | null; notes?: string | null;
}

export interface ComplianceFlag {
  id: string; area: string; risk_level: string; issue?: string | null;
  guardrail?: string | null; status?: string; notes?: string | null;
}

export interface CreatorPartner {
  id: string; name: string; handle?: string | null; platform?: string | null;
  follower_count?: number | null; tier?: string | null; promo_code?: string | null;
  affiliate_code?: string | null; tracking_link?: string | null; partnership_status?: string;
  disclosure_ack?: boolean; revenue_share?: string | null;
}
