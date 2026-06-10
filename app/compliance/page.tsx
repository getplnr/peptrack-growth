import { getCompliance } from "@/lib/data";
import { complianceSummary } from "@/lib/demo";
import { PageHeader, Section, Table, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const flags = await getCompliance();
  return (
    <>
      <PageHeader title="Compliance Review" sub="CAN-SPAM · FTC endorsement · Apple review · medical-claim · platform policy · privacy · data · affiliate disclosure" />
      {complianceSummary && <Section title="Summary"><p className="text-sm text-sage">{complianceSummary}</p></Section>}
      <Section title={`Risk register (${flags.length})`}>
        <Table head={["Area", "Risk", "Issue", "Guardrail enforced", "Status"]}>
          {flags.map((f) => (
            <tr key={f.id}>
              <td className="td font-medium text-mint whitespace-nowrap">{f.area}</td>
              <td className="td"><Badge tone={f.risk_level === "high" ? "red" : f.risk_level === "medium" ? "amber" : "teal"}>{f.risk_level}</Badge></td>
              <td className="td text-sage max-w-sm">{f.issue}</td>
              <td className="td text-sage max-w-md">{f.guardrail}</td>
              <td className="td"><Badge tone="emerald">{f.status}</Badge></td>
            </tr>
          ))}
        </Table>
      </Section>
    </>
  );
}
