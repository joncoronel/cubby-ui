import type { ReactNode } from "react";
import { LandingNav } from "@/components/home/landing-nav";
import { LandingFooter } from "@/components/home/landing-footer";
import "./home.css";

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
