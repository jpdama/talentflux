import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "TalentPulse",
  description: "Public competitor hiring intelligence for AI/SaaS teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 grid-overlay opacity-30" />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <div className="fixed bottom-5 right-5 hidden rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 backdrop-blur md:flex">
            Live intelligence by{" "}
            <Link className="ml-1 text-cyan-300 hover:text-cyan-200" href="/dashboard">
              TalentPulse
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
