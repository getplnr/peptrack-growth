import { getTemplatesOnly } from "@/lib/data";
import { PageHeader, Section, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const VARIANT_ORDER = ["short", "professional", "friendly_founder", "follow_up_1", "follow_up_2", "thank_you", "not_interested", "partnership_proposal", "affiliate_proposal"];

export default async function TemplatesPage() {
  const all = await getTemplatesOnly();
  const byAudience = new Map<string, { label: string; channel: string; items: typeof all }>();
  for (const m of all) {
    const k = m.audience_key || "other";
    const e = byAudience.get(k) || { label: m.label || k, channel: m.channel || "", items: [] };
    e.items.push(m);
    byAudience.set(k, e);
  }

  return (
    <>
      <PageHeader title="Outreach Template Library" sub={`${all.length} approved drafts · ${byAudience.size} audiences × 9 variants · human, respectful, opt-out included, no claims`} />
      <div className="space-y-6">
        {[...byAudience.entries()].map(([key, group]) => (
          <Section key={key} title={group.label} right={<Badge tone="azure">{group.channel}</Badge>}>
            <div className="grid md:grid-cols-2 gap-3">
              {group.items
                .sort((a, b) => VARIANT_ORDER.indexOf(a.variant || "") - VARIANT_ORDER.indexOf(b.variant || ""))
                .map((m) => (
                  <div key={m.id} className="rounded-xl border border-line bg-surface2/40 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-teal mb-1">{(m.variant || "").replace(/_/g, " ")}</div>
                    <p className="text-sm text-sage whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
            </div>
          </Section>
        ))}
      </div>
    </>
  );
}
