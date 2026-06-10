import { getAttribution } from "@/lib/data";
import { PageHeader, Section, Table, Badge, money } from "@/components/ui";
import { UtmBuilder } from "@/components/UtmBuilder";

export const dynamic = "force-dynamic";

export default async function AttributionPage() {
  const events = await getAttribution();
  return (
    <>
      <PageHeader title="Attribution & Link Builder" sub="App Store install attribution is limited, so we lean on landing URLs, per-creator codes, Apple campaign tokens, a first-launch clipboard token, and an in-app 'How did you hear about us?'." />

      <Section title="UTM / tracking link builder">
        <UtmBuilder />
      </Section>

      <Section title="Practical attribution stack (when direct install attribution is limited)">
        <ul className="text-sm text-sage space-y-1 list-disc pl-5">
          <li>Unique <b>landing page</b> per creator/campaign (full UTM) → App Store.</li>
          <li>Unique <b>promo / creator code</b> (e.g. CREATOR10) spoken + typed by the user.</li>
          <li>Apple <b>campaign token</b> <code className="text-teal">?ct=CODE</code> on the App Store link (App Analytics → Campaigns).</li>
          <li>First-launch <b>clipboard deep-link</b> <code className="text-teal">PT-CODE</code> the app reads once.</li>
          <li>In-app <b>“How did you hear about us?”</b> single-tap survey → attribution_events.</li>
        </ul>
      </Section>

      <Section title="Recent attribution events">
        <Table head={["When", "Event", "Source", "Campaign", "Code", "Revenue"]}>
          {events.map((e) => (
            <tr key={e.id}>
              <td className="td text-sage">{(e.occurred_at || "").slice(0, 10)}</td>
              <td className="td"><Badge tone={e.event_type.includes("subscription") ? "emerald" : "teal"}>{e.event_type}</Badge></td>
              <td className="td text-sage">{e.source}</td>
              <td className="td text-sage">{e.campaign}</td>
              <td className="td"><code className="text-teal">{e.creator_code || e.promo_code || "—"}</code></td>
              <td className="td">{money(e.revenue_cents)}</td>
            </tr>
          ))}
        </Table>
      </Section>
    </>
  );
}
