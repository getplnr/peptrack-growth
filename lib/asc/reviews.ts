import { getAscToken } from "./token";

/** Total written customer reviews for the app (uses meta.paging.total when present, else pages). */
export async function fetchReviewCount(
  appleId = process.env.ASC_APP_ID ?? "6772598337",
): Promise<number | null> {
  const token = await getAscToken();
  if (!token) return null;

  let url: string | null =
    `https://api.appstoreconnect.apple.com/v1/apps/${appleId}/customerReviews?limit=200&sort=-createdDate`;
  let count = 0;
  let guard = 0;
  while (url && guard++ < 50) {
    const res: Response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`customerReviews ${res.status}: ${await res.text()}`);
    const json: { meta?: { paging?: { total?: number } }; data?: unknown[]; links?: { next?: string } } =
      await res.json();
    const total = json?.meta?.paging?.total;
    if (typeof total === "number") return total; // fast path
    count += Array.isArray(json?.data) ? json.data.length : 0;
    url = json?.links?.next ?? null;
  }
  return count;
}
