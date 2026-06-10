import { getApprovalQueue } from "@/lib/data";
import { PageHeader, Section, Badge } from "@/components/ui";
import { ApprovalCard } from "@/components/ApprovalCard";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const queue = await getApprovalQueue();
  return (
    <>
      <PageHeader
        title="Admin Approval Queue"
        sub="Nothing leaves the building without you. Copy → send manually in the channel → Approve to clear it."
      />
      <Section title={`Awaiting approval (${queue.length})`} right={<Badge tone="amber">manual send only</Badge>}>
        <div className="space-y-3">
          {queue.map((m) => (
            <ApprovalCard key={m.id} m={m} />
          ))}
          {queue.length === 0 && (
            <p className="text-sm text-sage">Queue empty. Drafts created from the CRM/campaigns land here for approval.</p>
          )}
        </div>
      </Section>
    </>
  );
}
