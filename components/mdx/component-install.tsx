"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanels,
  TabsContent,
} from "@/registry/default/tabs/tabs";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

interface ComponentInstallProps {
  component: string;
  componentFiles?: Array<{
    path: string;
    type: string;
    name: string;
    relativePath: string;
    content: string;
    highlighted: ReactElement;
  }>;
  highlightedCliCommands?: Record<string, ReactElement>;
  highlightedInstallCommands?: Record<string, ReactElement>;
  allDependencies?: string[];
}

export function ComponentInstall({
  component,
  componentFiles,
  highlightedCliCommands,
  highlightedInstallCommands,
  allDependencies = [],
}: ComponentInstallProps) {
  const [cliPackageManager, setCliPackageManager] = useState("npm");
  const [manualPackageManager, setManualPackageManager] = useState("npm");
  const [activeFileTab, setActiveFileTab] = useState(
    componentFiles?.[0]?.relativePath || "",
  );

  const getCliCommand = (pm: string) => {
    const registryUrl = `@cubby-ui/${component}`;
    switch (pm) {
      case "npm":
        return `npx shadcn@latest add ${registryUrl}`;
      case "pnpm":
        return `pnpm dlx shadcn@latest add ${registryUrl}`;
      case "yarn":
        return `yarn dlx shadcn@latest add ${registryUrl}`;
      case "bun":
        return `bunx --bun shadcn@latest add ${registryUrl}`;
      default:
        return `npx shadcn@latest add ${registryUrl}`;
    }
  };

  const getInstallCommand = (pm: string) => {
    const deps = allDependencies.join(" ");
    switch (pm) {
      case "npm":
        return `npm install ${deps}`;
      case "pnpm":
        return `pnpm add ${deps}`;
      case "yarn":
        return `yarn add ${deps}`;
      case "bun":
        return `bun add ${deps}`;
      default:
        return `npm install ${deps}`;
    }
  };

  return (
    <div className="not-prose my-6 w-full max-w-full min-w-0">
      <Tabs defaultValue="cli" className="gap-6">
        <TabsList variant="underline">
          <TabsTrigger value="cli">CLI</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>
        <TabsPanels>
        <TabsContent value="cli">
          <CodeBlock
            code={getCliCommand(cliPackageManager)}
            language="bash"
            initial={
              highlightedCliCommands?.[
                cliPackageManager as keyof typeof highlightedCliCommands
              ]
            }
          >
            <CodeBlockHeader
              tabs={[
                { value: "npm", label: "npm" },
                { value: "pnpm", label: "pnpm" },
                { value: "yarn", label: "yarn" },
                { value: "bun", label: "bun" },
              ]}
              activeTab={cliPackageManager}
              onTabChange={(value) => setCliPackageManager(value as string)}
            />
            <CodeBlockPre>
              <CodeBlockCode />
            </CodeBlockPre>
          </CodeBlock>
        </TabsContent>
        <TabsContent value="manual">
          <div className="space-y-4">
            {highlightedInstallCommands && (
              <div>
                <p className="mb-2 text-sm font-medium">
                  Install dependencies:
                </p>
                <CodeBlock
                  code={getInstallCommand(manualPackageManager)}
                  language="bash"
                  initial={
                    highlightedInstallCommands[
                      manualPackageManager as keyof typeof highlightedInstallCommands
                    ]
                  }
                >
                  <CodeBlockHeader
                    tabs={[
                      { value: "npm", label: "npm" },
                      { value: "pnpm", label: "pnpm" },
                      { value: "yarn", label: "yarn" },
                      { value: "bun", label: "bun" },
                    ]}
                    activeTab={manualPackageManager}
                    onTabChange={(value) =>
                      setManualPackageManager(value as string)
                    }
                  />
                  <CodeBlockPre>
                    <CodeBlockCode />
                  </CodeBlockPre>
                </CodeBlock>
              </div>
            )}
            {componentFiles && componentFiles.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">
                  Copy and paste the component files:
                </p>
                {componentFiles.length === 1 ? (
                  // Single file: no tabs needed
                  <CodeBlock
                    code={componentFiles[0].content}
                    language="tsx"
                    initial={componentFiles[0].highlighted}
                    floatingCopy
                  >
                    <CodeBlockPre>
                      <CodeBlockCode />
                    </CodeBlockPre>
                  </CodeBlock>
                ) : (
                  // Multiple files: use tabs
                  (() => {
                    const activeFile =
                      componentFiles.find(
                        (f) => f.relativePath === activeFileTab,
                      ) || componentFiles[0];

                    return (
                      <CodeBlock
                        code={activeFile.content}
                        language="tsx"
                        initial={activeFile.highlighted}
                        floatingCopy
                      >
                        <CodeBlockHeader
                          tabs={componentFiles.map((f) => ({
                            value: f.relativePath,
                            label: f.relativePath,
                          }))}
                          activeTab={activeFileTab}
                          onTabChange={(value) =>
                            setActiveFileTab(value as string)
                          }
                          showCopy={false}
                        />
                        <CodeBlockPre>
                          <CodeBlockCode />
                        </CodeBlockPre>
                      </CodeBlock>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        </TabsContent>
        </TabsPanels>
      </Tabs>
    </div>
  );
}
