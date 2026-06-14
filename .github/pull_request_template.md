<!--
  Portfolio PR. Keep PRs small and single-purpose (see docs/engineering-standards.md).
  Title format (Conventional Commits): feat|fix|chore|docs|refactor|perf|sec(scope): summary
-->

## What & why
<!-- One paragraph: what this changes and the problem it solves. -->

Closes #

## Type of change
- [ ] feat — new capability
- [ ] fix — bug fix
- [ ] perf — performance
- [ ] refactor — no behavior change
- [ ] sec — security / compliance
- [ ] chore / docs / infra

## Product(s)
<!-- TALNT / PLNR / Estimatics / PepTrack / RewardEd / Hart Vintage / Org-tooling -->

## How it was tested
<!-- Commands run, manual steps, preview URL, screenshots/recordings for UI. -->

## Definition of Done (docs/quality-framework.md)
- [ ] Builds locally; `tsc --noEmit` (or Swift build) passes
- [ ] Lint passes; no new warnings
- [ ] No new `any` / `ts-ignore` / force-unwrap without a justifying comment
- [ ] No TODO/FIXME left in shipped code (or each links a tracked issue)
- [ ] No placeholder / fake / lorem data on a user-facing surface
- [ ] Tests added/updated for changed logic; critical paths covered
- [ ] Mobile-first verified (web: 375px) / HIG-conformant (iOS)
- [ ] Accessibility: keyboard + contrast checked for changed UI
- [ ] No secrets added to the repo; `.env.example` updated if env changed

## Security & compliance
- [ ] No secrets, tokens, or live customer PII in the diff
- [ ] DB change: new tables ship **RLS-enabled**; ran Supabase advisors (see docs/security-standards.md)
- [ ] Input validated at boundaries (zod / webhook signature verification)
- [ ] Product-specific: TCPA/CAN-SPAM (TALNT) · Apple 3.1.1 IAP · Apple Kids math-gate (RewardEd) · no medical claims (PepTrack)

## Deployment & rollback
- [ ] Migrations are additive and applied to prod safely (DIRECT_URL) **before** deploy
- [ ] Rollback plan understood (Vercel instant rollback / iOS server-gate kill switch)

## Screenshots / preview
<!-- Before/after for any UI change. Vercel preview URL. -->
