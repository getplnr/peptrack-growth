#!/usr/bin/env node
// Seed Supabase from data/*.json using the service_role key.
// Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
// (Alternatively apply supabase/migrations/0001_schema.sql + 0002_seed.sql via `supabase db push` / the SQL editor.)

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });
const j = (p) => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url)));

const campaigns = j("campaigns.json");
const templates = j("outreach-templates.json");
const content = j("content-calendar.json");
const prospects = j("prospects.json").rows;
const flags = j("compliance-flags.json").flags;

async function up(table, rows, onConflict) {
  const { error } = await sb.from(table).upsert(rows, onConflict ? { onConflict } : undefined);
  console.log(error ? `  ✗ ${table}: ${error.message}` : `  ✓ ${table}: ${rows.length}`);
}

console.log("Seeding PepTrack Growth OS…");
await up("campaigns", campaigns.map((c) => ({ ...c, message_sequence: c.message_sequence ?? [], kpis: c.kpis ?? [] })), "key");
await up("outreach_messages", templates.map((t) => ({ ...t, is_template: true, status: "template" })));
await up("content_calendar", content.map((c) => ({ ...c, status: "idea" })));
await up("prospects", prospects.map((p) => ({
  name: p.name, channel: p.channel, prospect_type: p.prospect_type, platform_url: p.platform_url,
  public_contact_method: p.public_contact_method, est_audience_fit: p.est_audience_fit,
  priority_score: p.priority_score, notes: p.notes, status: "New", owner: "seed",
})));
await up("compliance_flags", flags.map((f) => ({ ...f, status: "enforced" })));
console.log("Done.");
