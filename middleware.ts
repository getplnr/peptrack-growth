import { NextRequest, NextResponse } from "next/server";

// Simple Basic-Auth gate for the internal dashboard. Active only when
// DASHBOARD_PASSWORD is set (so local dev stays open). Excludes /api so the
// cron route can authenticate with its own CRON_SECRET.
export function middleware(req: NextRequest) {
  const pass = process.env.DASHBOARD_PASSWORD;
  if (!pass) return NextResponse.next();
  const user = process.env.DASHBOARD_USER || "peptrack";
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const [u, p] = atob(auth.slice(6)).split(":");
      if (u === user && p === pass) return NextResponse.next();
    } catch { /* fallthrough */ }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="PepTrack Growth OS"' },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
