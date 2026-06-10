"use client";
import { useState, useTransition } from "react";
import { setMessageStatus, setMessageBody } from "@/app/approvals/actions";
import { Badge, statusTone } from "@/components/ui";
import type { OutreachMessage } from "@/lib/types";

const btn = "pill cursor-pointer transition hover:opacity-80 disabled:opacity-40";

export function ApprovalCard({ m }: { m: OutreachMessage }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(m.body);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <div className="rounded-xl border border-line bg-surface2/20 p-3 text-xs text-dim flex items-center justify-between">
        <span>{m.label} · <span className="text-sage">{done}</span></span>
        <button className={btn + " bg-white/5 text-sage"} onClick={() => start(async () => { await setMessageStatus(m.id, "ready"); setDone(null); })}>Undo</button>
      </div>
    );
  }

  const act = (status: string, label: string) =>
    start(async () => { const r = await setMessageStatus(m.id, status); if (r.ok) setDone(label); });
  const save = () => start(async () => { const r = await setMessageBody(m.id, body); if (r.ok) setEditing(false); });
  const copy = async () => {
    try { await navigator.clipboard.writeText(body); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ }
  };

  return (
    <div className="rounded-xl border border-line bg-surface2/40 p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-medium text-mint">{m.label} <span className="text-dim">· {m.channel} · {m.variant}</span></div>
        <Badge tone={statusTone(m.status)}>{m.status}</Badge>
      </div>
      {editing ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-mint outline-none focus:border-teal"
        />
      ) : (
        <p className="text-sm text-sage whitespace-pre-wrap">{body}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs items-center">
        {editing ? (
          <>
            <button className={btn + " bg-emerald/15 text-emerald"} onClick={save} disabled={pending}>Save</button>
            <button className={btn + " bg-white/5 text-sage"} onClick={() => { setBody(m.body); setEditing(false); }}>Cancel</button>
          </>
        ) : (
          <>
            <button className={btn + " bg-teal/15 text-teal"} onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
            <button className={btn + " bg-azure/15 text-azure"} onClick={() => setEditing(true)}>Edit</button>
            <button className={btn + " bg-emerald/15 text-emerald"} onClick={() => act("approved", "approved")} disabled={pending}>Approve</button>
            <button className={btn + " bg-emerald/15 text-emerald"} onClick={() => act("sent", "sent")} disabled={pending}>Mark sent</button>
            <button className={btn + " bg-red-400/15 text-red-300"} onClick={() => act("archived", "rejected")} disabled={pending}>Reject</button>
          </>
        )}
        {pending && <span className="text-dim">saving…</span>}
      </div>
    </div>
  );
}
