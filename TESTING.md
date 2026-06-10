# Testing checklist — PepTrack Growth OS

## Local / demo mode (no config)
- [ ] `npm install && npm run dev` → http://localhost:3000 loads with the "Demo mode" banner.
- [ ] **Command Center** `/` renders KPI cards, prospects-by-channel, conversion-by-source, campaigns, compliance count.
- [ ] **Daily Action** `/daily` lists today's priorities + new prospects + ready drafts.
- [ ] **Prospect CRM** `/prospects` shows 51 rows; channel filter chips work; emails are blank; caveats present.
- [ ] **Approval Queue** `/approvals` shows draft/ready items with Approve/Edit/Snooze/Reject affordances.
- [ ] **Campaigns** `/campaigns` shows 4 campaigns with sequences, UTMs, promo codes, KPIs.
- [ ] **Content** `/content` shows 34 posts; platform filter works; every post has a CTA; Reddit items note "mod permission".
- [ ] **Templates** `/templates` shows 11 audiences × 9 variants; opt-out line present in cold variants.
- [ ] **Attribution** `/attribution` UTM builder updates live; landing URL, App Store `?ct=` token, and `PT-CODE` clipboard token all render.
- [ ] **Reviews** `/reviews` shows eligibility signals + dashboard.
- [ ] **Compliance** `/compliance` shows the 8-flag risk register.

## Live mode (Supabase configured)
- [ ] `.env` filled; `0001_schema.sql` applied; `0002_seed.sql` (or `npm run seed`) loaded.
- [ ] Banner disappears (no "demo mode"); tables read from Supabase.
- [ ] RLS verified: anon key returns 0 rows from `prospects` (deny-by-default); server (service role) returns data.
- [ ] Add a prospect via SQL/UI → appears in `/prospects`; priority score sorts correctly.

## Compliance gates (must pass before any send)
- [ ] No message contains a medical/dosing/result claim or a brand drug name.
- [ ] Every cold-outreach variant includes the opt-out line.
- [ ] Reddit/FB-group templates ask mods/admins for permission first.
- [ ] Affiliate/partnership proposals require `#ad` disclosure.
- [ ] Elite Research email/SMS path is gated on opt-in + has identity + opt-out (CAN-SPAM/TCPA).
- [ ] Review prompts use Apple's native flow only, after the 5 usage signals; no incentives.

## Build
- [ ] `npm run build` completes with no type errors.
