import { getProspects } from "@/lib/data";
import { PageHeader, Section, Table, Badge, statusTone } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProspectsPage({ searchParams }: { searchParams: Promise<{ channel?: string; status?: string }> }) {
  const sp = await searchParams;
  let prospects = await getProspects();
  if (sp.channel) prospects = prospects.filter((p) => p.channel === sp.channel);
  if (sp.status) prospects = prospects.filter((p) => p.status === sp.status);

  const channels = [...new Set((await getProspects()).map((p) => p.channel).filter(Boolean))] as string[];

  return (
    <>
      <PageHeader title="Prospect CRM" sub={`${prospects.length} prospects · public research only · no fabricated private contacts`} />

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <a href="/prospects" className={`pill ${!sp.channel ? "bg-teal/15 text-teal" : "bg-white/5 text-sage"}`}>All channels</a>
        {channels.map((c) => (
          <a key={c} href={`/prospects?channel=${encodeURIComponent(c)}`} className={`pill ${sp.channel === c ? "bg-teal/15 text-teal" : "bg-white/5 text-sage"}`}>{c}</a>
        ))}
      </div>

      <Section title="Prospects">
        <Table head={["Name", "Channel", "Type", "Fit", "Contact method", "Priority", "Status"]}>
          {prospects.map((p) => (
            <tr key={p.id}>
              <td className="td">
                <div className="text-mint font-medium">{p.platform_url ? <a className="hover:text-teal" href={p.platform_url} target="_blank" rel="noreferrer">{p.name}</a> : p.name}</div>
                {p.notes && <div className="text-xs text-dim max-w-md mt-0.5">{p.notes}</div>}
              </td>
              <td className="td text-sage whitespace-nowrap">{p.channel}</td>
              <td className="td text-sage">{p.prospect_type}</td>
              <td className="td"><Badge tone={p.est_audience_fit === "high" ? "emerald" : p.est_audience_fit === "medium" ? "teal" : "dim"}>{p.est_audience_fit}</Badge></td>
              <td className="td text-xs text-sage max-w-[16rem]">{p.public_contact_method}</td>
              <td className="td"><Badge tone={(p.priority_score || 0) >= 70 ? "emerald" : (p.priority_score || 0) >= 45 ? "teal" : "dim"}>{p.priority_score}</Badge></td>
              <td className="td"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
            </tr>
          ))}
        </Table>
      </Section>
    </>
  );
}
