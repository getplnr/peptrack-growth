-- PepTrack Growth OS — schema (14 tables)
-- Security model: RLS is ENABLED on every table with NO public policy (deny-by-
-- default). The Next.js dashboard reads/writes server-side with the service_role
-- key (bypasses RLS) — standard for a single-admin internal tool. An optional
-- admin-email policy is included for future client-side auth. `rls_enabled_no_policy`
-- INFO from the linter is therefore expected/safe here.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- campaigns
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  goal text,
  timeframe_days int,
  target_audience text,
  offer text,
  cta text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  promo_code text,
  message_sequence jsonb default '[]'::jsonb,
  follow_up_schedule text,
  kpis jsonb default '[]'::jsonb,
  status text default 'active',           -- active | paused | done
  created_at timestamptz default now()
);

-- prospects (CRM)  — status: New|Researched|Ready for outreach|Draft created|
-- Contacted|Follow-up needed|Replied|Interested|Not interested|Partnered|Converted|Do not contact
create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_name text,
  channel text,                            -- one of the 12 channel categories
  prospect_type text,                      -- community|creator|clinic|coach|newsletter|customer_segment
  platform_url text,
  email text,                              -- PUBLIC business email only; blank until verified
  social_handle text,
  follower_count int,
  est_audience_fit text,                   -- high|medium|low
  contact_status text default 'New',
  outreach_status text,
  public_contact_method text,
  last_contacted timestamptz,
  next_follow_up date,
  notes text,
  offer_made text,
  promo_code text,
  affiliate_code text,
  partnership_status text,
  attribution_link text,
  response_sentiment text,                 -- positive|neutral|negative
  owner text default 'Jordan',
  priority_score int default 0,
  status text default 'New',
  campaign_id uuid references campaigns(id) on delete set null,
  created_at timestamptz default now()
);

-- creator_partners
create table if not exists creator_partners (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete set null,
  name text not null,
  handle text,
  platform text,
  follower_count int,
  tier text,                               -- A|B|C
  promo_code text,
  affiliate_code text,
  tracking_link text,
  partnership_status text default 'invited', -- invited|negotiating|active|paused|ended
  disclosure_ack boolean default false,    -- creator confirmed #ad/paid-partnership disclosure
  revenue_share text,
  notes text,
  created_at timestamptz default now()
);

-- promo_codes
create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text default 'campaign',            -- campaign|creator
  campaign_id uuid references campaigns(id) on delete set null,
  partner_id uuid references creator_partners(id) on delete set null,
  utm_campaign text,
  landing_path text,
  active boolean default true,
  redemptions int default 0,
  notes text,
  created_at timestamptz default now()
);

-- outreach_messages (template library + per-prospect drafts/queue)
-- status: draft | ready | approved | sent | replied | archived
create table if not exists outreach_messages (
  id uuid primary key default gen_random_uuid(),
  audience_key text,
  label text,
  channel text,
  variant text,                            -- short|professional|friendly_founder|follow_up_1|...
  body text not null,
  is_template boolean default true,
  prospect_id uuid references prospects(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  status text default 'draft',
  approved_by text,
  approved_at timestamptz,
  sent_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- outreach_sequences (named multi-step cadences)
create table if not exists outreach_sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  audience_key text,
  steps jsonb default '[]'::jsonb,         -- [{step, day_offset, channel, variant}]
  created_at timestamptz default now()
);

-- content_calendar  status: idea|draft|approved|scheduled|posted
create table if not exists content_calendar (
  id uuid primary key default gen_random_uuid(),
  day int,
  platform text,
  pillar text,
  format text,
  hook text,
  body text,
  cta text,
  hashtags text,
  scheduled_for date,
  status text default 'idea',
  created_at timestamptz default now()
);

-- social_posts (an approval-gated instance of a content item for a platform)
create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references content_calendar(id) on delete set null,
  platform text,
  body text,
  status text default 'draft',             -- draft|approved|scheduled|posted
  approved_by text,
  scheduled_for timestamptz,
  posted_at timestamptz,
  permalink text,
  created_at timestamptz default now()
);

-- app_metrics (daily snapshot — manual or API import)
create table if not exists app_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  installs int default 0,
  active_users int default 0,
  trial_starts int default 0,
  paid_subscribers int default 0,
  reviews int default 0,
  revenue_cents int default 0,
  source text default 'manual',
  created_at timestamptz default now(),
  unique (metric_date, source)
);

-- review_eligibility (compliant, native-prompt gating; anonymized user ref)
create table if not exists review_eligibility (
  id uuid primary key default gen_random_uuid(),
  user_ref text not null,                  -- anonymized id, never PII
  injections_logged int default 0,
  days_active int default 0,
  has_reminder boolean default false,
  has_weight boolean default false,
  return_visits int default 0,
  eligible boolean default false,
  prompt_shown boolean default false,
  prompt_shown_at timestamptz,
  feedback_submitted boolean default false,
  review_link_clicked boolean default false,
  created_at timestamptz default now(),
  unique (user_ref)
);

-- attribution_events
create table if not exists attribution_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,                -- link_click|app_store_click|install|trial_start|subscription_start|how_heard
  source text,
  campaign text,
  creator_code text,
  promo_code text,
  utm jsonb default '{}'::jsonb,
  landing_path text,
  revenue_cents int default 0,
  occurred_at timestamptz default now()
);

-- tasks (founder action items + automation output)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text,                               -- score_lead|draft_outreach|follow_up|onboard_partner|review_check|message_test|content
  prospect_id uuid references prospects(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  status text default 'open',              -- open|done|snoozed
  priority text default 'normal',          -- high|normal|low
  due_date date,
  auto_generated boolean default false,
  rule text,
  notes text,
  created_at timestamptz default now()
);

-- compliance_flags
create table if not exists compliance_flags (
  id uuid primary key default gen_random_uuid(),
  area text not null,                      -- can_spam|ftc_endorsement|apple_review|medical_claim|platform_policy|privacy|data_storage|affiliate_disclosure
  risk_level text default 'medium',        -- low|medium|high
  issue text,
  guardrail text,
  status text default 'enforced',          -- enforced|open|waived
  notes text,
  created_at timestamptz default now()
);

-- campaign_daily_metrics
create table if not exists campaign_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  metric_date date not null,
  outreach_sent int default 0,
  replies int default 0,
  positive_replies int default 0,
  installs int default 0,
  conversions int default 0,
  revenue_cents int default 0,
  unique (campaign_id, metric_date)
);

-- ---------------------------------------------------------------------------
-- Indexes
create index if not exists idx_prospects_status on prospects(status);
create index if not exists idx_prospects_channel on prospects(channel);
create index if not exists idx_prospects_followup on prospects(next_follow_up);
create index if not exists idx_prospects_priority on prospects(priority_score desc);
create index if not exists idx_outreach_status on outreach_messages(status);
create index if not exists idx_outreach_template on outreach_messages(is_template);
create index if not exists idx_content_status on content_calendar(status);
create index if not exists idx_social_status on social_posts(status);
create index if not exists idx_tasks_status_due on tasks(status, due_date);
create index if not exists idx_attr_event on attribution_events(event_type, occurred_at);
create index if not exists idx_attr_source on attribution_events(source);
create index if not exists idx_metrics_date on app_metrics(metric_date);

-- ---------------------------------------------------------------------------
-- Row Level Security: enable on all; deny-by-default (no public policy).
-- The server uses the service_role key which bypasses RLS for this admin tool.
do $$
declare t text;
begin
  foreach t in array array[
    'campaigns','prospects','creator_partners','promo_codes','outreach_messages',
    'outreach_sequences','content_calendar','social_posts','app_metrics',
    'review_eligibility','attribution_events','tasks','compliance_flags','campaign_daily_metrics'
  ] loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- OPTIONAL: allow signed-in admins (by email allowlist in JWT) full client access.
-- Enable by setting an "admin_emails" claim or adapt to your auth. Commented out by
-- default so the table stays deny-all until you wire Supabase Auth.
-- create policy "admins full access" on prospects for all to authenticated
--   using ( (auth.jwt() ->> 'email') = any (string_to_array(current_setting('app.admin_emails', true), ',')) )
--   with check ( true );
