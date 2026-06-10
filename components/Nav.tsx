"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Command Center" },
  { href: "/daily", label: "Daily Action" },
  { href: "/prospects", label: "Prospect CRM" },
  { href: "/approvals", label: "Approval Queue" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/content", label: "Content Calendar" },
  { href: "/templates", label: "Outreach Templates" },
  { href: "/attribution", label: "Attribution & Links" },
  { href: "/reviews", label: "Reviews" },
  { href: "/compliance", label: "Compliance" },
];

export function Nav() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-line bg-surface/40 p-4 hidden md:block">
      <div className="px-2 pb-5">
        <div className="text-lg font-bold text-mint">PepTrack</div>
        <div className="eyebrow">Growth OS</div>
      </div>
      <nav className="space-y-1">
        {LINKS.map((l) => {
          const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={`navlink ${active ? "navlink-active" : ""}`}>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 rounded-lg border border-line bg-surface2/50 p-3 text-[11px] text-dim leading-relaxed">
        Draft-first. Nothing sends without your approval. No medical claims. Public research only.
      </div>
    </aside>
  );
}
