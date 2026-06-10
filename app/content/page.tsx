import { getContent } from "@/lib/data";
import { PageHeader, Section, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const sp = await searchParams;
  let items = await getContent();
  const platforms = [...new Set(items.map((i) => i.platform).filter(Boolean))] as string[];
  if (sp.platform) items = items.filter((i) => i.platform === sp.platform);
  items = [...items].sort((a, b) => (a.day || 0) - (b.day || 0));

  return (
    <>
      <PageHeader title="30-Day Content Calendar" sub="Compliant, tracking/journal-framed. Reddit items only with mod permission. CTA to download in every post." />
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <a href="/content" className={`pill ${!sp.platform ? "bg-teal/15 text-teal" : "bg-white/5 text-sage"}`}>All</a>
        {platforms.map((p) => (
          <a key={p} href={`/content?platform=${p}`} className={`pill ${sp.platform === p ? "bg-teal/15 text-teal" : "bg-white/5 text-sage"}`}>{p}</a>
        ))}
      </div>
      <Section title={`${items.length} posts`}>
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="rounded-xl border border-line bg-surface2/40 p-4">
              <div className="flex items-center gap-2 mb-1 text-xs">
                <Badge tone="azure">Day {it.day}</Badge>
                <Badge tone="teal">{it.platform}</Badge>
                <span className="text-dim">{it.pillar} · {it.format}</span>
              </div>
              <p className="text-mint font-medium">{it.hook}</p>
              <p className="text-sm text-sage mt-1 whitespace-pre-wrap">{it.body}</p>
              <div className="mt-2 flex flex-wrap gap-2 items-center text-xs">
                <span className="text-emerald">CTA: {it.cta}</span>
                {it.hashtags && <span className="text-dim">{it.hashtags}</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
