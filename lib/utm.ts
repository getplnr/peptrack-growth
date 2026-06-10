// UTM + attribution link builder (Module 9).
// App Store links can't carry arbitrary params reliably, so the canonical pattern
// is: creator/campaign-specific LANDING URL (full UTM) -> App Store, plus a
// clipboard deferred-deep-link token the app reads on first launch.

const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL || "https://apps.apple.com/app/id6772598337";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://peptrack-marketing.vercel.app";

export interface UtmParams {
  source: string;            // e.g. instagram, reddit, newsletter, elite-research
  medium: string;            // e.g. creator, post, email, insert
  campaign: string;          // e.g. first-100, affiliate-launch
  content?: string;          // e.g. creator handle / message variant
  term?: string;
  code?: string;             // promo / creator code
}

export function buildLandingUrl(p: UtmParams, landingPath = "/c"): string {
  const base = `${SITE}${p.code ? `${landingPath}/${slug(p.code)}` : ""}`;
  const q = new URLSearchParams();
  q.set("utm_source", p.source);
  q.set("utm_medium", p.medium);
  q.set("utm_campaign", p.campaign);
  if (p.content) q.set("utm_content", p.content);
  if (p.term) q.set("utm_term", p.term);
  if (p.code) q.set("ct", p.code);
  return `${base}?${q.toString()}`;
}

/** App Store URL tagged with Apple App-Analytics campaign token (provider/campaign). */
export function buildAppStoreUrl(code: string): string {
  const u = new URL(APP_STORE);
  u.searchParams.set("mt", "8");
  u.searchParams.set("ct", code); // Apple campaign token (App Analytics)
  u.searchParams.set("pt", "1");
  return u.toString();
}

/** Deferred deep-link token the iOS app reads from the clipboard on first launch. */
export function clipboardToken(code: string): string {
  return `PT-${code.toUpperCase()}`;
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
