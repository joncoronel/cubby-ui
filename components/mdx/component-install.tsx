"use client";

import * as React from "react";
import type { ReactElement } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { CodePeek } from "./code-peek";
import { CommandMorph, commandParts } from "./command-morph";
import {
  PACKAGE_MANAGERS,
  usePackageManager,
  type PackageManager,
} from "./use-package-manager";

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

const PM_TABS = PACKAGE_MANAGERS.map((pm) => ({ value: pm, label: pm }));

function getCliCommand(pm: string, component: string): string {
  const item = `@cubby-ui/${component}`;
  switch (pm) {
    case "pnpm":
      return `pnpm dlx shadcn@latest add ${item}`;
    case "yarn":
      return `yarn dlx shadcn@latest add ${item}`;
    case "bun":
      return `bunx --bun shadcn@latest add ${item}`;
    default:
      return `npx shadcn@latest add ${item}`;
  }
}

/**
 * A file's tab label: its name alone, or its path when another file shares
 * the name. The full path is shown under the code instead.
 */
function fileLabel(path: string, all: string[]): string {
  const name = path.split("/").pop() ?? path;
  const clash = all.some((p) => p !== path && p.split("/").pop() === name);
  return clash ? path : name;
}

/** A command for every package manager. */
function perManager(
  build: (pm: PackageManager) => string,
): Record<PackageManager, string> {
  return Object.fromEntries(
    PACKAGE_MANAGERS.map((pm) => [pm, build(pm)]),
  ) as Record<PackageManager, string>;
}

function getInstallCommand(pm: string, deps: string[]): string {
  const list = deps.join(" ");
  switch (pm) {
    case "pnpm":
      return `pnpm add ${list}`;
    case "yarn":
      return `yarn add ${list}`;
    case "bun":
      return `bun add ${list}`;
    default:
      return `npm install ${list}`;
  }
}

export function ComponentInstall({
  component,
  componentFiles,
  highlightedCliCommands,
  highlightedInstallCommands,
  allDependencies = [],
}: ComponentInstallProps) {
  const manualId = React.useId();
  const [pm, setPm] = usePackageManager();
  // Commands morph only once the reader picks a tab; restoring their saved
  // choice after load swaps in place.
  const [picked, setPicked] = React.useState(false);
  const pick = (value: string): void => {
    setPicked(true);
    setPm(value as typeof pm);
  };
  const [manualOpen, setManualOpen] = React.useState(false);
  const [activeFile, setActiveFile] = React.useState(
    componentFiles?.[0]?.relativePath ?? "",
  );

  const file =
    componentFiles?.find((f) => f.relativePath === activeFile) ??
    componentFiles?.[0];
  const hasDependencies =
    allDependencies.length > 0 && Boolean(highlightedInstallCommands);

  return (
    <div className="not-prose my-6 flex w-full max-w-full min-w-0 flex-col gap-3">
      <CodeBlock
        code={getCliCommand(pm, component)}
        language="bash"
        initial={highlightedCliCommands?.[pm]}
      >
        <CodeBlockHeader tabs={PM_TABS} activeTab={pm} onTabChange={pick} />
        <CodeBlockPre>
          <CodeBlockCode>
            <CommandMorph
              parts={commandParts(
                perManager((m) => getCliCommand(m, component)),
                pm,
              )}
              animate={picked}
            />
          </CodeBlockCode>
        </CodeBlockPre>
      </CodeBlock>

      {file && (
        <>
          <button
            type="button"
            aria-expanded={manualOpen}
            aria-controls={manualId}
            onClick={() => setManualOpen((o) => !o)}
            className="docs-disclosure text-muted-foreground hover:text-foreground focus-visible:outline-ring/50 -ml-1 flex w-fit items-center gap-1 rounded-md px-1 py-0.5 text-sm outline-none focus-visible:outline-2"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="docs-disclosure-chevron size-3.5"
            />
            Or install it by hand
          </button>

          <div id={manualId} hidden={!manualOpen} className="docs-code-reveal">
            <div>
              <ol className="docs-steps pt-2">
                {hasDependencies && (
                  <li>
                    <p className="docs-step-title">Add the dependencies</p>
                    <CodeBlock
                      code={getInstallCommand(pm, allDependencies)}
                      language="bash"
                      initial={highlightedInstallCommands?.[pm]}
                    >
                      <CodeBlockHeader
                        tabs={PM_TABS}
                        activeTab={pm}
                        onTabChange={pick}
                      />
                      <CodeBlockPre>
                        <CodeBlockCode>
                          <CommandMorph
                            parts={commandParts(
                              perManager((m) =>
                                getInstallCommand(m, allDependencies),
                              ),
                              pm,
                            )}
                            animate={picked}
                          />
                        </CodeBlockCode>
                      </CodeBlockPre>
                    </CodeBlock>
                  </li>
                )}
                <li>
                  <p className="docs-step-title">
                    Copy the source into your project
                  </p>
                  {/* The tray's header names the file (tabs when there are
                      several); the code peeks, like an example's, rather
                      than scrolling in a tall box. */}
                  <CodeBlock
                    code={file.content}
                    language="tsx"
                    initial={file.highlighted}
                  >
                    <CodeBlockHeader
                      showCopy={false}
                      filename={
                        componentFiles!.length === 1
                          ? fileLabel(file.relativePath, [])
                          : undefined
                      }
                      tabs={
                        componentFiles!.length > 1
                          ? componentFiles!.map((f) => ({
                              value: f.relativePath,
                              label: fileLabel(
                                f.relativePath,
                                componentFiles!.map((g) => g.relativePath),
                              ),
                            }))
                          : undefined
                      }
                      activeTab={file.relativePath}
                      onTabChange={(value) => setActiveFile(value as string)}
                    />
                    <CodePeek
                      variant="card"
                      code={file.content}
                      initial={file.highlighted}
                    />
                  </CodeBlock>
                  <p className="docs-step-note">
                    Save it as <code>{file.relativePath}</code>
                  </p>
                </li>
                <li>
                  <p className="docs-step-title">Update the import paths</p>
                  <p className="docs-step-body">
                    {"The source imports through the "}
                    <code>@/</code>
                    {" alias ("}
                    <code>@/lib/utils</code>
                    {", "}
                    <code>@/components/ui/cubby-ui</code>
                    {
                      "). If your project uses another alias or folder, change them to match."
                    }
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
