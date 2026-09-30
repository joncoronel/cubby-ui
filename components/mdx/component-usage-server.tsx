import { ComponentUsage } from "./component-usage";
import { componentAnatomy } from "@/app/components/_generated/registry";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";

interface ComponentUsageServerProps {
  component: string;
}

export async function ComponentUsageServer({
  component,
}: ComponentUsageServerProps) {
  const anatomy = componentAnatomy[component as keyof typeof componentAnatomy];

  if (!anatomy) {
    return <ComponentUsage component={component} />;
  }

  // Highlighted apart: they render as two cards, copied separately.
  const [highlightedImports, highlightedAnatomy] = await Promise.all([
    highlight(anatomy.imports.trimEnd(), "tsx"),
    highlight(anatomy.anatomy.trimEnd(), "tsx"),
  ]);

  return (
    <ComponentUsage
      component={component}
      highlightedImports={highlightedImports}
      highlightedAnatomy={highlightedAnatomy}
    />
  );
}
