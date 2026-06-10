import { getMetrics, getProspects, getAttribution, getTasks, getCampaigns, getCompliance } from "@/lib/data";
import { PageHeader, Stat, Section, Table, Badge, statusTone, money } from "@/components/ui";

export const dynamic = "force-dynamic";

function todayIso() { return new Date().toISOString().slice(0, 10); }

export default async function CommandCenter() {
  const [metrics, prospects, attribution, tasks, campaigns, compliance] = await Promise.all([
    getMetrics(), getProspects(), getAttribution(), getTasks(), getCampaigns(), getCompliance(),
  ]);

  const sum = (k: keyof (typeof metrics)[number]) => metrics.reduce((a, m) => a + (Number(m[k]) || 0), 0);
  const latest = metrics[metrics.length - 1];

  // prospects by channel
  const byChannel = new Map<string, { count: number; prio: number }>();
  for (const p of prospects) {
    const c = p.channel || "—";
    const e = byChannel.get(c) || { count: 0, prio: 0 };
    e.count++; e.prio += p.priority_score || 0;
    byChannel.set(c, e);
  }
  const channelRows = [...byChannel.entries()].map(([c, e]) => ({ c, count: e.count, avg: Math.round(e.prio / e.count) })).sort((a, b) => b.avg - a.avg);

  // attribution by source
  const bySource = new Map<string, { clicks: number; installs: number; subs: number; rev: number }>();
  for (const a of attribution) {
    const s = a.source || "—";
    const e = bySource.get(s) || { clicks: 0, installs: 0, subs: 0, rev: 0 };
    if (a.event_type === "link_click" || a.event_type === "app_store_click") e.clicks++;
    if (a.event_type === "install") e.installs++;
    if (a.event_type === "subscription_start") { e.subs++; e.rev += a.revenue_cents || 0; }
    bySource.set(s, e);
  }
  const sourceRows = [...bySource.entries()].map(([s, e]) => ({ s, ...e })).sort((a, b) => b.installs + b.subs - (a.installs + a.subs));

  const followUpsToday = tasks.filter((t) => t.status === "open" && (t.kind === "follow_up") && (t.due_date || "") <= todayIso()).length;
  const dueToday = tasks.filter((t) => t.status === "open" && (t.due_date || "") <= todayIso()).length;

  return (
    <>
      <PageHeader title="Growth Command Center" sub="First 100 installs · 20 active users · 10 reviews · first paid subscribers" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Stat label="Installs (14d)" value={sum("installs")} sub={`${latest?.installs ?? 0} yesterday`} />
        <Stat label="Active users" value={latest?.active_users ?? 0} sub="latest day" />
        <Stat label="Trial starts" value={sum("trial_starts")} />
        <Stat label="Paid subscribers" value={latest?.paid_subscribers ?? 0} />
        <Stat label="App Store reviews" value={sum("reviews")} sub="goal: 10" />
        <Stat label="Revenue (14d)" value={money(sum("revenue_cents"))} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total prospects" value={prospects.length} />
        <Stat label="Avg priority" value={Math.round(prospects.reduce((a, p) => a + (p.priority_score || 0), 0) / (prospects.length || 1))} />
        <Stat label="Follow-ups due today" value={followUpsToday} />
        <Stat label="Tasks due today" value={dueToday} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Prospects by channel">
          <Table head={["Channel", "Prospects", "Avg priority"]}>
            {channelRows.map((r) => (
              <tr key={r.c}>
                <td className="td">{r.c}</td>
                <td className="td">{r.count}</td>
                <td className="td"><Badge tone={r.avg >= 70 ? "emerald" : r.avg >= 45 ? "teal" : "dim"}>{r.avg}</Badge></td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section title="Conversion & revenue by source">
          <Table head={["Source", "Clicks", "Installs", "Subs", "Revenue"]}>
            {sourceRows.map((r) => (
              <tr key={r.s}>
                <td className="td">{r.s}</td>
                <td className="td">{r.clicks}</td>
                <td className="td">{r.installs}</td>
                <td className="td">{r.subs}</td>
                <td className="td">{money(r.rev)}</td>
              </tr>
            ))}
          </Table>
        </Section>
      </div>

      <Section title="Campaigns">
        <Table head={["Campaign", "Goal", "Window", "Promo", "Status"]}>
          {campaigns.map((c) => (
            <tr key={c.id}>
              <td className="td font-medium text-mint">{c.name}</td>
              <td className="td">{c.goal}</td>
              <td className="td">{c.timeframe_days}d</td>
              <td className="td"><code className="text-teal">{c.promo_code}</code></td>
              <td className="td"><Badge tone={statusTone(c.status)}>{c.status || "active"}</Badge></td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Compliance" right={<Badge tone="emerald">{compliance.filter((f) => f.status === "enforced").length} guardrails enforced</Badge>}>
        <p className="text-sm text-sage">All outbound is draft-first. No medical claims, no review incentives, public-only research. See the Compliance tab for the full register.</p>
      </Section>
    </>
  );
}
