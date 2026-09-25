import { DocsHeader } from "@/components/docs/docs-header";
import { getShelfGroups } from "@/lib/docs-nav";
import "./docs.css";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const groups = getShelfGroups();

  return (
    <div className="docs-root relative flex min-h-dvh flex-col">
      <DocsHeader groups={groups} />
      <main id="docs-main" className="relative flex-1">
        {children}
      </main>
    </div>
  );
}
