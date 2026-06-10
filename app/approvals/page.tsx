import { getApprovalQueue } from "@/lib/data";
import { PageHeader, Section, Badge, statusTone } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const queue = await getApprovalQueue();
  return (
    <>
      <PageHeader title="Admin Approval Queue" sub="Nothing leaves the building without your explicit approval. Review → approve → send/post manually." />
      <Section title={`Awaiting approval (${queue.length})`} right={<Badge tone="amber">manual send only</Badge>}>
        <div className="space-y-3">
          {queue.map((m) => (
            <div key={m.id} className="rounded-xl border border-line bg-surface2/40 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-mint">{m.label} <span className="text-dim">· {m.channel} · {m.variant}</span></div>
                <Badge tone={statusTone(m.status)}>{m.status}</Badge>
              </div>
              <p className="text-sm text-sage whitespace-pre-wrap">{m.body}</p>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="pill bg-emerald/15 text-emerald">Approve</span>
                <span className="pill bg-azure/15 text-azure">Edit</span>
                <span className="pill bg-white/5 text-sage">Snooze</span>
                <span className="pill bg-red-400/15 text-red-300">Reject</span>
                <span className="ml-auto text-dim self-center">Actions wire to Supabase updates when configured.</span>
              </div>
            </div>
          ))}
          {queue.length === 0 && <p className="text-sm text-sage">Queue empty. Drafts created from the CRM/campaigns land here for approval.</p>}
        </div>
      </Section>
    </>
  );
}
