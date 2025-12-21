"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

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
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");

  return (
    <div className="not-prose my-4">
      <CodeBlock
        code={commands[packageManager]}
        language="bash"
        initial={highlighted[packageManager]}
      >
        <CodeBlockHeader
          tabs={[
            { value: "npm", label: "npm" },
            { value: "pnpm", label: "pnpm" },
            { value: "yarn", label: "yarn" },
            { value: "bun", label: "bun" },
          ]}
          activeTab={packageManager}
          onTabChange={(value) => setPackageManager(value as PackageManager)}
        />
        <CodeBlockPre>
          <CodeBlockCode />
        </CodeBlockPre>
      </CodeBlock>
    </div>
  );
}
