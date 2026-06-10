import { getReviewEligibility } from "@/lib/data";
import { PageHeader, Stat, Section, Table, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const rows = await getReviewEligibility();
  const eligible = rows.filter((r) => r.eligible);
  const shown = rows.filter((r) => r.prompt_shown);
  const clicked = rows.filter((r) => r.review_link_clicked);

  return (
    <>
      <PageHeader title="Review Generation (compliant)" sub="Goal: 10 legitimate App Store reviews via Apple's native prompt — no incentives, no money/discounts/perks, only after genuine positive usage." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Eligible users" value={eligible.length} />
        <Stat label="Prompt shown" value={shown.length} />
        <Stat label="Review link clicks" value={clicked.length} />
        <Stat label="Goal" value="10 reviews" />
      </div>

      <Section title="Eligibility signals (ALL required before the native prompt)">
        <ul className="text-sm text-sage space-y-1 list-disc pl-5">
          <li>Logged <b>3+ injections</b></li>
          <li>Used the app <b>7+ days</b></li>
          <li>Set a <b>reminder</b></li>
          <li>Entered <b>weight / progress</b></li>
          <li>Returned at least <b>twice</b></li>
        </ul>
        <p className="text-xs text-dim mt-3">Implementation: gate <code>SKStoreReviewController.requestReview</code> (iOS) behind these signals and fire only at a positive moment (e.g., a logged dose completing a streak). Apple caps display ~3×/year. Never route unhappy users to the store deceptively — offer a private feedback path instead.</p>
      </Section>

      <Section title="Eligibility dashboard">
        <Table head={["User", "Injections", "Days", "Reminder", "Weight", "Returns", "Eligible", "Prompt", "Clicked"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="td"><code className="text-sage">{r.user_ref}</code></td>
              <td className="td">{r.injections_logged}</td>
              <td className="td">{r.days_active}</td>
              <td className="td">{r.has_reminder ? "✓" : "—"}</td>
              <td className="td">{r.has_weight ? "✓" : "—"}</td>
              <td className="td">{r.return_visits}</td>
              <td className="td"><Badge tone={r.eligible ? "emerald" : "dim"}>{r.eligible ? "yes" : "no"}</Badge></td>
              <td className="td">{r.prompt_shown ? "shown" : "—"}</td>
              <td className="td">{r.review_link_clicked ? "✓" : "—"}</td>
            </tr>
          ))}
        </Table>
      </Section>
    </>
  );
}
