import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPanels,
  TabsTrigger,
} from "@/registry/default/tabs/tabs";
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockPre,
} from "@/registry/default/code-block/code-block";

const SNIPPETS: { id: "npm" | "pnpm" | "yarn" | "bun"; command: string }[] = [
  {
    id: "npm",
    command: "npx shadcn@latest add https://cubby-ui.dev/r/button.json",
  },
  {
    id: "pnpm",
    command:
      "pnpm dlx shadcn@latest add https://cubby-ui.dev/r/button.json",
  },
  {
    id: "yarn",
    command: "yarn dlx shadcn@latest add https://cubby-ui.dev/r/button.json",
  },
  {
    id: "bun",
    command: "bunx shadcn@latest add https://cubby-ui.dev/r/button.json",
  },
];

export function InstallTabs() {
  return (
    <Tabs defaultValue="npm" className="w-full">
      <TabsList variant="underline" className="border-border/60 w-full border-b">
        {SNIPPETS.map((s) => (
          <TabsTrigger key={s.id} value={s.id}>
            {s.id}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsPanels className="mt-4 min-w-0">
        {SNIPPETS.map((s) => (
          <TabsContent key={s.id} value={s.id} className="min-w-0">
            <CodeBlock code={s.command} language="bash">
              <CodeBlockPre className="max-w-full">
                <CodeBlockCode />
              </CodeBlockPre>
            </CodeBlock>
          </TabsContent>
        ))}
      </TabsPanels>
    </Tabs>
  );
}
