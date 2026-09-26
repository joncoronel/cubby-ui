"use client";

import * as React from "react";
import type { ReactElement } from "react";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import {
  PACKAGE_MANAGERS,
  usePackageManager,
  type PackageManager,
} from "./use-package-manager";
import { CommandMorph, commandParts } from "./command-morph";

interface PackageManagerCommandProps {
  /** Pre-converted commands for each package manager */
  commands: Record<PackageManager, string>;
  /** Pre-highlighted code for each package manager */
  highlighted: Record<PackageManager, ReactElement>;
}

export function PackageManagerCommand({
  commands,
  highlighted,
}: PackageManagerCommandProps) {
  const [packageManager, setPackageManager] = usePackageManager();
  // Morph only once the reader picks a tab; restoring their saved choice
  // after load swaps in place.
  const [picked, setPicked] = React.useState(false);

  return (
    <div className="not-prose my-6">
      <CodeBlock
        code={commands[packageManager]}
        language="bash"
        initial={highlighted[packageManager]}
      >
        <CodeBlockHeader
          tabs={PACKAGE_MANAGERS.map((pm) => ({ value: pm, label: pm }))}
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
