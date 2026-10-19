import type { ReactNode } from "react";
import type { Viewport } from "next";
import { LandingNav } from "@/components/home/landing-nav";
import { LandingFooter } from "@/components/home/landing-footer";
import "./home.css";

// The browser toolbar takes the landing page color: --background (0.99 / 0.205).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#161719" },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="landing text-foreground relative flow-root min-h-dvh overflow-x-clip">
      {/* A top-level header (a banner landmark), drawn over the top of the
          hero's slab rather than inside it, so `main` can start with the
          hero. */}
      <LandingNav />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
