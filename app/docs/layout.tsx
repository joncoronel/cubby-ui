import type { Viewport } from "next";
import { DocsHeader } from "@/components/docs/docs-header";
import { getShelfGroups } from "@/lib/docs-nav";
import "./docs.css";

// Hex copies of the docs frame color (0.925 / 0.159); keep them in sync.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e5e6e7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d0f" },
  ],
};

export default function Layout({ children }: LayoutProps<"/docs">) {
  const groups = getShelfGroups();

  return (
    <div className="docs-root relative isolate flex min-h-dvh flex-col">
      {/* The page is a card set inside a frame. The document still scrolls
          natively (restoration, anchors, mobile URL bar all keep working);
          fixed layers draw the card's fill behind the content and the frame
          around it (see docs.css), so content reads as scrolling inside the
          card. */}
      <div aria-hidden="true" className="docs-card-fill" />
      <div aria-hidden="true" className="docs-frame" />
      <div aria-hidden="true" className="docs-frame-bottom" />

      <DocsHeader groups={groups} />
      <main id="docs-main" className="docs-main relative flex-1">
        {children}
      </main>
    </div>
  );
}
