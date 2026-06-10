import React from "react";

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-mint">{title}</h1>
      {sub && <p className="text-sm text-sage mt-1">{sub}</p>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="stat">
      <div className="text-[11px] uppercase tracking-wider text-dim">{label}</div>
      <div className="text-2xl font-bold text-mint mt-1">{value}</div>
      {sub && <div className="text-xs text-sage mt-0.5">{sub}</div>}
    </div>
  );
}

export function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="card mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-mint">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  teal: "bg-teal/15 text-teal",
  azure: "bg-azure/15 text-azure",
  emerald: "bg-emerald/15 text-emerald",
  amber: "bg-yellow-400/15 text-yellow-300",
  red: "bg-red-400/15 text-red-300",
  dim: "bg-white/5 text-sage",
};

export function Badge({ children, tone = "dim" }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return <span className={`pill ${TONES[tone] || TONES.dim}`}>{children}</span>;
}

export function statusTone(status?: string | null): keyof typeof TONES {
  const s = (status || "").toLowerCase();
  if (["partnered", "converted", "interested", "replied", "approved", "active", "enforced", "high"].some((k) => s.includes(k))) return "emerald";
  if (["contacted", "ready", "draft created", "scheduled"].some((k) => s.includes(k))) return "azure";
  if (["follow-up", "draft", "new", "researched", "idea", "medium"].some((k) => s.includes(k))) return "teal";
  if (["not interested", "do not contact", "paused", "low"].some((k) => s.includes(k))) return "red";
  return "dim";
}

export function money(cents?: number | null): string {
  return `$${(((cents || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full border-collapse">
        <thead>
          <tr>{head.map((h) => <th key={h} className="th">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
