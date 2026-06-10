import { gunzipSync } from "node:zlib";
import { getAscToken } from "./token";

/**
 * Daily first-time installs for one app from the App Store Connect Sales & Trends
 * "Summary Sales" report (gzip TSV). Reports lag ~1-2 days (Pacific). Returns the
 * Units sum of first-time downloads, or null when not available / no vendor number.
 */
export async function fetchDailyInstalls(
  reportDate: string, // YYYY-MM-DD
  appleId = process.env.ASC_APP_ID ?? "6772598337",
): Promise<number | null> {
  const vendor = process.env.ASC_VENDOR_NUMBER;
  if (!vendor) return null; // installs require the vendor number; skip cleanly
  const token = await getAscToken();
  if (!token) return null;

  const qs = new URLSearchParams({
    "filter[frequency]": "DAILY",
    "filter[reportType]": "SALES",
    "filter[reportSubType]": "SUMMARY",
    "filter[vendorNumber]": vendor,
    "filter[reportDate]": reportDate,
    // filter[version] intentionally omitted — Apple defaults to the current version (1_3).
  });

  const res = await fetch(`https://api.appstoreconnect.apple.com/v1/salesReports?${qs}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/a-gzip" },
  });
  if (res.status === 404) return null; // no sales that date, or report not ready yet
  if (!res.ok) throw new Error(`salesReports ${res.status}: ${await res.text()}`);

  const text = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8");
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return 0;

  const header = lines[0].split("\t");
  const iApple = header.indexOf("Apple Identifier");
  const iUnits = header.indexOf("Units");
  const iPti = header.indexOf("Product Type Identifier");
  if (iApple < 0 || iUnits < 0 || iPti < 0) return null; // layout changed unexpectedly

  let total = 0;
  for (let r = 1; r < lines.length; r++) {
    const cols = lines[r].split("\t");
    if (cols[iApple] !== appleId) continue;
    const pti = cols[iPti] ?? "";
    // first-time downloads start with "1"; exclude auto-renew subscriptions ("1AY")
    if (!pti.startsWith("1") || pti === "1AY") continue;
    const units = parseFloat(cols[iUnits] ?? "0"); // DECIMAL(18,2), can be negative (refunds)
    if (!Number.isNaN(units)) total += units;
  }
  return Math.round(total);
}
