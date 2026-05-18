"use client";
import type { ReactElement } from "react";
import { componentMap } from "@/app/components/_generated/registry";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanels,
  TabsContent,
} from "@/registry/default/tabs/tabs";
import {
  CodeBlock,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";

interface ComponentPreviewProps {
  code?: string;
  language?: string;
  className?: string;
  example?: string;
  initialHighlighted?: ReactElement;
  serverRenderedExample?: ReactElement;
}

export function ComponentPreview({
  code,
  language = "tsx",
  className = "",
  example,
  initialHighlighted,
  serverRenderedExample,
}: ComponentPreviewProps) {
  // Look up the example component from componentMap on the client
  // (unless a server-rendered example is already provided)
  const ExampleComponent = example
    ? componentMap[example as keyof typeof componentMap]
    : null;

  // Render the appropriate example:
  // - serverRenderedExample: Already a ReactElement from server (for async components)
  // - ExampleComponent: Client component function to instantiate
  const exampleNode =
    serverRenderedExample || (ExampleComponent && <ExampleComponent />);

  // If no code is provided, just show the preview
  if (!code) {
    return (
      <div className={`not-prose my-6 w-full max-w-full min-w-0 ${className}`}>
        <div className={cn("rounded-md p-1", solidSurface(3, 3), "bg-muted")}>
          <div className="bg-background flex min-h-[300px] items-center justify-center rounded-sm border p-8">
            {exampleNode}
          </div>
        </div>
      </div>
    );
  }

  // Show preview/code tabs using our custom Tabs component
  return (
    <div className={`not-prose my-6 w-full max-w-full min-w-0 ${className}`}>
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsPanels className="">
          <TabsContent value="preview">
            <div className={cn("rounded-2xl p-1", solidSurface(3, 3), "bg-muted")}>
              <div className="bg-background flex min-h-[300px] items-center justify-center rounded-lg border p-8">
                {exampleNode}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <CodeBlock
              code={code}
              language={language}
              floatingCopy
              initial={initialHighlighted}
            >
              <CodeBlockPre>
                <CodeBlockCode />
              </CodeBlockPre>
            </CodeBlock>
          </TabsContent>
        </TabsPanels>
      </Tabs>
    </div>
  );
}
