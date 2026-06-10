import { getTasks, getProspects, getMetrics, getAttribution, getReviewEligibility, getApprovalQueue } from "@/lib/data";
import { PageHeader, Stat, Section, Table, Badge, statusTone, money } from "@/components/ui";

export const dynamic = "force-dynamic";
const todayIso = () => new Date().toISOString().slice(0, 10);

export default async function DailyAction() {
  const [tasks, prospects, metrics, attribution, reviews, queue] = await Promise.all([
    getTasks(), getProspects(), getMetrics(), getAttribution(), getReviewEligibility(), getApprovalQueue(),
  ]);
  const latest = metrics[metrics.length - 1];
  const open = tasks.filter((t) => t.status === "open");
  const dueToday = open.filter((t) => (t.due_date || "") <= todayIso());
  const newProspects = prospects.filter((p) => p.status === "New").slice(0, 10);
  const readyDrafts = queue.filter((q) => q.status === "ready");
  const reviewEligible = reviews.filter((r) => r.eligible && !r.prompt_shown);
  const replies = attribution.filter((a) => a.event_type === "link_click").length;

  return (
    <>
      <PageHeader title="Founder Daily Action" sub={`${todayIso()} — your highest-leverage moves, in order. Built for 30 focused minutes.`} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Stat label="Installs yesterday" value={latest?.installs ?? 0} />
        <Stat label="Active users" value={latest?.active_users ?? 0} />
        <Stat label="Revenue yesterday" value={money(latest?.revenue_cents)} />
        <Stat label="New replies" value={replies} />
        <Stat label="Drafts ready" value={readyDrafts.length} />
        <Stat label="Review-eligible" value={reviewEligible.length} />
      </div>

      <Section title={`Today's priorities (${dueToday.length})`}>
        <ul className="space-y-2">
          {dueToday.map((t) => (
            <li key={t.id} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5"><Badge tone={t.priority === "high" ? "amber" : "teal"}>{t.priority}</Badge></span>
              <div>
                <div className="text-mint">{t.title}</div>
                {t.rule && <div className="text-xs text-dim">auto-rule: {t.rule}</div>}
              </div>
            </li>
          ))}
          {dueToday.length === 0 && <li className="text-sm text-sage">Nothing due — add prospects or load a campaign.</li>}
        </ul>
      </Section>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title={`Approve ${newProspects.length} new prospects`} right={<Badge tone="azure">CRM</Badge>}>
          <Table head={["Name", "Channel", "Priority"]}>
            {newProspects.map((p) => (
              <tr key={p.id}>
                <td className="td">{p.name}</td>
                <td className="td text-sage">{p.channel}</td>
                <td className="td"><Badge tone={(p.priority_score || 0) >= 70 ? "emerald" : "teal"}>{p.priority_score}</Badge></td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section title={`Send ${readyDrafts.length} ready drafts`} right={<Badge tone="emerald">Approved → send manually</Badge>}>
          <ul className="space-y-2 text-sm">
            {readyDrafts.map((d) => (
              <li key={d.id} className="border-t border-line/60 pt-2">
                <div className="flex justify-between"><span className="text-mint">{d.label}</span><Badge tone={statusTone(d.status)}>{d.status}</Badge></div>
                <p className="text-xs text-sage line-clamp-2 mt-1">{d.body}</p>
              </li>
            ))}
            {readyDrafts.length === 0 && <li className="text-sage">No drafts marked ready. Review the Approval Queue.</li>}
          </ul>
        </Section>
      </div>
    </>
  );
}
