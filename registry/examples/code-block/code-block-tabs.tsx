"use client";

import { useState } from "react";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

export default function CodeBlockTabsExample() {
  const [packageManager, setPackageManager] = useState("npm");

  const getInstallCommand = (pm: string) => {
    switch (pm) {
      case "npm":
        return "npm install react-query";
      case "pnpm":
        return "pnpm add react-query";
      case "yarn":
        return "yarn add react-query";
      case "bun":
        return "bun add react-query";
      default:
        return "npm install react-query";
    }
  };

  return (
    <div className="w-full space-y-2">
      <p className="text-muted-foreground text-sm">
        Switch between package managers using the tabs in the header.
      </p>
      <CodeBlock code={getInstallCommand(packageManager)} language="bash">
        <CodeBlockHeader
          tabs={[
            { value: "npm", label: "npm" },
            { value: "pnpm", label: "pnpm" },
            { value: "yarn", label: "yarn" },
            { value: "bun", label: "bun" },
          ]}
          activeTab={packageManager}
          onTabChange={(value) => setPackageManager(value as string)}
        />
        <CodeBlockPre>
          <CodeBlockCode />
        </CodeBlockPre>
      </CodeBlock>
    </div>
  );
}
