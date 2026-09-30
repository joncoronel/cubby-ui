import { DocsHeader } from "@/components/docs/docs-header";
import { getShelfGroups } from "@/lib/docs-nav";
import "./docs.css";

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
