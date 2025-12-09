import { exampleRegistry } from "@/app/components/_generated/registry";
import { ComponentCode } from "./component-code";

interface ComponentCodeServerProps {
  component: string; // e.g., "button"
  example: string; // e.g., "button-demo"
  language?: string;
}

export function ComponentCodeServer({
  component,
  example,
  language = "tsx",
}: ComponentCodeServerProps) {
  // Get examples for the component
  const examples = exampleRegistry[component as keyof typeof exampleRegistry];

  if (!examples) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Component not found: <code>{component}</code>
        </p>
      </div>
    );
  }

  // Find the specific example
  const exampleData = examples.find((e) => e.importPath === example);

  if (!exampleData) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Example not found: <code>{example}</code> in component{" "}
          <code>{component}</code>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Available examples: {examples.map((e) => e.importPath).join(", ")}
        </p>
      </div>
    );
  }

  // Pass the code to the client component
  return <ComponentCode code={exampleData.source} language={language} />;
}
