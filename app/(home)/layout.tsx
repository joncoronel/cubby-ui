import type { ReactNode } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import { TopNav } from "@/components/home/top-nav";
import { CubbyUILogoDots } from "@/components/cubbyui-logo";
import { cn } from "@/lib/utils";
import "./home.css";

// Display face for the marketing surface only. Scoped to the home tree via the
// `--font-display` variable on the wrapper below — it never reaches /docs or the
// component source, so the rest of the site keeps Rubik headings untouched.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        display.variable,
        "relative flex min-h-dvh flex-col overflow-x-clip",
      )}
    >
      {/* Dot-matrix logo backdrop — the cubby mark printed as a grid of dots.
          A radial mask feathers the dot field toward its edges so it dissolves
          into the page instead of ending on a hard silhouette. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
        style={{
          maskImage:
            "radial-gradient(62% 62% at 50% 50%, #000 25%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(62% 62% at 50% 50%, #000 25%, transparent 70%)",
        }}
      >
        <CubbyUILogoDots
          dotGap={2}
          dotSize={0.5}
          className="text-foreground h-[1200px] w-[1200px] max-w-none -rotate-12 opacity-[0.1] dark:opacity-[0.14]"
        />
      </div>

      <TopNav />
      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}
