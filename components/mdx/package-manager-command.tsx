"use client";

import * as React from "react";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { cn } from "@/lib/utils";
import {
  PACKAGE_MANAGERS,
  usePackageManager,
  type PackageManager,
} from "./use-package-manager";
import { CommandMorph, commandParts } from "./command-morph";

const PM_TABS = PACKAGE_MANAGERS.map((pm) => ({ value: pm, label: pm }));

/**
 * The morph draws the command in Shiki's colors itself, so CodeBlock's own
 * highlighting would never show. Handing it a finished (empty) result
 * skips that work on the server and the client.
 */
const DRAWN_BY_MORPH = <></>;

interface PackageManagerCommandProps {
  /** The command written for each package manager. */
  commands: Record<PackageManager, string>;
  className?: string;
}

export function PackageManagerCommand({
  commands,
  className,
}: PackageManagerCommandProps) {
  const [packageManager, setPackageManager] = usePackageManager();
  // Morph only once the reader picks a tab; restoring their saved choice
  // after load swaps in place.
  const [picked, setPicked] = React.useState(false);

  return (
    <div className={cn("not-prose my-6", className)}>
      <CodeBlock
        code={commands[packageManager]}
        language="bash"
        initial={DRAWN_BY_MORPH}
      >
        <CodeBlockHeader
          tabs={PM_TABS}
          activeTab={packageManager}
          onTabChange={(value) => {
            setPicked(true);
            setPackageManager(value as PackageManager);
          }}
        />
        <CodeBlockPre>
          <CodeBlockCode>
            <CommandMorph
              parts={commandParts(commands, packageManager)}
              animate={picked}
            />
          </CodeBlockCode>
        </CodeBlockPre>
      </CodeBlock>
    </div>
  );
}
