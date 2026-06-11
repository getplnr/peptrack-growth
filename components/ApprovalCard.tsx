"use client";
import { useState, useTransition } from "react";
import { setMessageStatus, setMessageBody, setProspectContact } from "@/app/approvals/actions";
import { Badge, statusTone } from "@/components/ui";
import type { OutreachMessage } from "@/lib/types";

const btn = "pill cursor-pointer transition hover:opacity-80 disabled:opacity-40 no-underline";
const SUBJECT = "PepTrack — quick note from the founder";

// Where to send a non-email prospect: Reddit → modmail composer, else their profile/site.
function channelDest(url?: string | null): { href: string; label: string } | null {
  if (!url) return null;
  const sub = url.match(/reddit\.com\/(r\/[^/]+)/i)?.[1];
  if (sub) return { href: `https://www.reddit.com/message/compose?to=/${sub}`, label: "Reddit modmail" };
  const label = url.includes("instagram") ? "Instagram"
    : url.includes("tiktok") ? "TikTok"
    : url.includes("youtube") ? "YouTube"
    : url.includes("substack") ? "Substack"
    : url.includes("facebook") ? "Facebook"
    : "their site";
  return { href: url, label };
}

export function ApprovalCard({ m }: { m: OutreachMessage }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(m.body);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [addingEmail, setAddingEmail] = useState(false);
  const [emailVal, setEmailVal] = useState("");

  if (done) {
    return (
      <div className="rounded-xl border border-line bg-surface2/20 p-3 text-xs text-dim flex items-center justify-between">
        <span>{m.label} · <span className="text-sage">{done}</span></span>
        <button className={btn + " bg-white/5 text-sage"} onClick={() => start(async () => { await setMessageStatus(m.id, "ready"); setDone(null); })}>Undo</button>
      </div>
    );
  }

  const p = m.prospect;
  const email = savedEmail ?? p?.email ?? null;
  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`
    : null;
  const dest = channelDest(p?.platform_url);

  const act = (status: string, label: string) =>
    start(async () => { const r = await setMessageStatus(m.id, status); if (r.ok) setDone(label); });
  const save = () => start(async () => { const r = await setMessageBody(m.id, body); if (r.ok) setEditing(false); });
  const copy = async () => {
    try { await navigator.clipboard.writeText(body); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ }
  };
  const saveEmail = () => {
    const v = emailVal.trim();
    if (!v || !m.prospect_id) return;
    start(async () => { const r = await setProspectContact(m.prospect_id as string, v); if (r.ok) { setSavedEmail(v); setAddingEmail(false); } });
  };

  return (
    <div className="rounded-xl border border-line bg-surface2/40 p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-medium text-mint">
          {p?.name ? <span className="text-mint">{p.name}</span> : m.label}
          <span className="text-dim"> · {m.channel} · {m.variant}</span>
        </div>
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

      {/* Send-it row: how to reach this prospect */}
      {p && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {mailto && (
            <a href={mailto} target="_blank" rel="noreferrer" className={btn + " bg-emerald/20 text-emerald"}>✉ Compose email</a>
          )}
          {!email && dest && (
            <a href={dest.href} target="_blank" rel="noreferrer" className={btn + " bg-azure/20 text-azure"}>↗ Open {dest.label}</a>
          )}
          <span className="text-dim">
            Reach via: {email ? email : (p.public_contact_method || p.channel || "—")}
          </span>
          {!email && !addingEmail && m.prospect_id && (
            <button className={btn + " bg-white/5 text-sage"} onClick={() => setAddingEmail(true)}>＋ add email</button>
          )}
          {addingEmail && (
            <span className="flex items-center gap-1">
              <input
                value={emailVal} onChange={(e) => setEmailVal(e.target.value)} placeholder="name@site.com" type="email"
                className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-mint outline-none focus:border-teal w-44"
              />
              <button className={btn + " bg-emerald/15 text-emerald"} onClick={saveEmail} disabled={pending}>Save</button>
              <button className={btn + " bg-white/5 text-sage"} onClick={() => setAddingEmail(false)}>×</button>
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs items-center">
        {editing ? (
          <>
            <button className={btn + " bg-emerald/15 text-emerald"} onClick={save} disabled={pending}>Save</button>
            <button className={btn + " bg-white/5 text-sage"} onClick={() => { setBody(m.body); setEditing(false); }}>Cancel</button>
          </>
        ) : (
          <>
            <button className={btn + " bg-teal/15 text-teal"} onClick={copy}>{copied ? "Copied ✓" : "Copy text"}</button>
            <button className={btn + " bg-azure/15 text-azure"} onClick={() => setEditing(true)}>Edit</button>
            <button className={btn + " bg-emerald/15 text-emerald"} onClick={() => act("sent", "sent")} disabled={pending}>Mark sent</button>
            <button className={btn + " bg-red-400/15 text-red-300"} onClick={() => act("archived", "rejected")} disabled={pending}>Reject</button>
          </>
        )}
        {pending && <span className="text-dim">saving…</span>}
      </div>
    </div>
  );
}
