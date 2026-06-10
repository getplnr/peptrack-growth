"use client";
import { useState } from "react";
import { buildLandingUrl, buildAppStoreUrl, clipboardToken } from "@/lib/utm";

export function UtmBuilder() {
  const [source, setSource] = useState("instagram");
  const [medium, setMedium] = useState("creator");
  const [campaign, setCampaign] = useState("first-100");
  const [content, setContent] = useState("");
  const [code, setCode] = useState("CREATOR10");

  const landing = buildLandingUrl({ source, medium, campaign, content: content || undefined, code });
  const appStore = buildAppStoreUrl(code);
  const token = clipboardToken(code);

  const field = (label: string, val: string, set: (v: string) => void) => (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-dim">{label}</span>
      <input value={val} onChange={(e) => set(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-mint outline-none focus:border-teal" />
    </label>
  );

  const out = (label: string, val: string) => (
    <div className="mt-3">
      <div className="text-[11px] uppercase tracking-wider text-dim mb-1">{label}</div>
      <code className="block break-all rounded-lg border border-line bg-surface2 px-3 py-2 text-xs text-teal">{val}</code>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="grid grid-cols-2 gap-3">
        {field("utm_source", source, setSource)}
        {field("utm_medium", medium, setMedium)}
        {field("utm_campaign", campaign, setCampaign)}
        {field("utm_content", content, setContent)}
        {field("promo / creator code", code, setCode)}
      </div>
      <div>
        {out("Landing URL (full UTM → App Store)", landing)}
        {out("App Store URL (Apple campaign token)", appStore)}
        {out("Clipboard deep-link token (read on first launch)", token)}
      </div>
    </div>
  );
}
