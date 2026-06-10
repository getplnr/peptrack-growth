import { getCampaigns } from "@/lib/data";
import { PageHeader, Section, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  return (
    <>
      <PageHeader title="Campaign Builder" sub="Four loaded campaigns. Each: audience, offer, CTA, UTM, promo code, sequence, follow-ups, KPIs." />
      <div className="space-y-6">
        {campaigns.map((c) => (
          <Section key={c.id} title={c.name} right={<div className="flex gap-2"><Badge tone="teal">{c.timeframe_days}d</Badge><Badge tone="emerald">{c.goal}</Badge></div>}>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dim text-xs uppercase tracking-wider mb-1">Target audience</p>
                <p className="text-sage mb-3">{c.target_audience}</p>
                <p className="text-dim text-xs uppercase tracking-wider mb-1">Offer (compliant)</p>
                <p className="text-sage mb-3">{c.offer}</p>
                <p className="text-dim text-xs uppercase tracking-wider mb-1">CTA</p>
                <p className="text-sage">{c.cta}</p>
              </div>
              <div>
                <p className="text-dim text-xs uppercase tracking-wider mb-1">Tracking</p>
                <p className="text-sage mb-1">utm: <code className="text-teal">{c.utm_source}/{c.utm_medium}/{c.utm_campaign}</code></p>
                <p className="text-sage mb-3">promo: <code className="text-teal">{c.promo_code}</code></p>
                <p className="text-dim text-xs uppercase tracking-wider mb-1">Follow-up schedule</p>
                <p className="text-sage mb-3">{c.follow_up_schedule}</p>
                <p className="text-dim text-xs uppercase tracking-wider mb-1">KPIs</p>
                <div className="flex flex-wrap gap-1">{(c.kpis || []).map((k, i) => <Badge key={i} tone="dim">{k}</Badge>)}</div>
              </div>
            </div>
            {c.message_sequence && c.message_sequence.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="text-dim text-xs uppercase tracking-wider mb-2">Message sequence</p>
                <ol className="space-y-2">
                  {c.message_sequence.map((s) => (
                    <li key={s.step} className="text-sm">
                      <span className="text-teal">Day {s.day_offset}</span> <span className="text-dim">· {s.channel}</span>
                      <p className="text-sage mt-0.5">{s.message}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Section>
        ))}
      </div>
    </>
  );
}
