"use client";

import * as React from "react";
import type { ReactElement } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  CodeBlock,
  CodeBlockHeader,
} from "@/registry/default/code-block/code-block";
import { CodePeek } from "./code-peek";
import { SourceFiles } from "./source-files";
import { PackageManagerCommand } from "./package-manager-command";
import type { PackageManager } from "./package-manager-commands";

interface ComponentInstallProps {
  componentFiles?: Array<{
    path: string;
    type: string;
    name: string;
    relativePath: string;
    content: string;
    language: string;
    highlighted: ReactElement;
    peekHighlighted?: ReactElement;
  }>;
  cliCommands: Record<PackageManager, string>;
  /** Only when the source needs packages installed. */
  installCommands?: Record<PackageManager, string>;
}

/** Past this many files a row of tabs overflows; they get a file browser. */
const MAX_FILE_TABS = 3;

/**
 * A file's tab label: its name alone, or its path when another file shares
 * the name. The full path is shown under the code instead.
 */
function fileLabel(path: string, all: string[]): string {
  const name = path.split("/").pop() ?? path;
  const clash = all.some((p) => p !== path && p.split("/").pop() === name);
  return clash ? path : name;
}

export function ComponentInstall({
  componentFiles,
  cliCommands,
  installCommands,
}: ComponentInstallProps) {
  const manualId = React.useId();
  const [manualOpen, setManualOpen] = React.useState(false);
  // The source is built on first open, then kept: closed, it was thousands
  // of highlighted lines nobody sees, rendered on every page switch.
  const [manualShown, setManualShown] = React.useState(false);
  const [activeFile, setActiveFile] = React.useState(
    componentFiles?.[0]?.relativePath ?? "",
  );

  const file =
    componentFiles?.find((f) => f.relativePath === activeFile) ??
    componentFiles?.[0];

  return (
    <div className="not-prose my-6 flex w-full max-w-full min-w-0 flex-col gap-3">
      <PackageManagerCommand commands={cliCommands} className="my-0" />

      {file && (
        <>
          <button
            type="button"
            aria-expanded={manualOpen}
            aria-controls={manualId}
            onClick={() => {
              setManualShown(true);
              setManualOpen((o) => !o);
            }}
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
            {manualShown && (
              <div>
                <ol className="docs-steps pt-2">
                  {installCommands && (
                    <li>
                      <p className="docs-step-title">Add the dependencies</p>
                      <PackageManagerCommand
                        commands={installCommands}
                        className="my-0"
                      />
                    </li>
                  )}
                  <li>
                    <p className="docs-step-title">
                      Copy the source into your project
                    </p>
                    {/* The tray's header names the file (tabs when there are
                      a few, a file browser past that); the code peeks, like
                      an example's, rather than scrolling in a tall box. */}
                    {componentFiles!.length > MAX_FILE_TABS ? (
                      <SourceFiles
                        files={componentFiles!}
                        active={file.relativePath}
                        onActiveChange={setActiveFile}
                      />
                    ) : (
                      <CodeBlock
                        code={file.content}
                        language={file.language}
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
                          onTabChange={(value) =>
                            setActiveFile(value as string)
                          }
                        />
                        <CodePeek
                          variant="card"
                          code={file.content}
                          language={file.language}
                          initial={file.highlighted}
                          peekInitial={file.peekHighlighted}
                        />
                      </CodeBlock>
                    )}
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
