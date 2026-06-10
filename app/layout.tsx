import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { usingDemo } from "@/lib/data";

export const metadata: Metadata = {
  title: "PepTrack Growth OS",
  description: "Compliant, founder-led traction operating system for PepTrack.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const demo = usingDemo();
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 min-w-0">
            {demo && (
              <div className="bg-azure/10 border-b border-line px-6 py-2 text-xs text-azure">
                Demo mode — showing generated sample data. Configure Supabase in <code>.env</code> + apply{" "}
                <code>supabase/migrations</code> to go live.
              </div>
            )}
            <div className="p-6 max-w-7xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
