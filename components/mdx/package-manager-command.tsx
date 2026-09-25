"use client";

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
          onTabChange={(value) => setPackageManager(value as PackageManager)}
        />
        <CodeBlockPre>
          <CodeBlockCode />
        </CodeBlockPre>
      </CodeBlock>
    </div>
  );
}
