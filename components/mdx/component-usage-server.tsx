import type { ReactElement } from "react";
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

  const importsCode = anatomy.imports;
  const anatomyCode = anatomy.anatomy;

  // Pre-highlight both code blocks separately
  const highlightedImports = await highlight(importsCode, "tsx");
  const highlightedAnatomy = await highlight(anatomyCode, "tsx");

  return (
    <ComponentUsage
      component={component}
      highlightedImports={highlightedImports}
      highlightedAnatomy={highlightedAnatomy}
    />
  );
}
