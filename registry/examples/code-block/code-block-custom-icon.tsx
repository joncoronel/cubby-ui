"use client";

import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
export default function CodeBlockCustomIcon() {
  const code = `function greet(name) {
  return \`Hello, \${name}! ✨\`;
}

console.log(greet("World"));`;

  return (
    <CodeBlock code={code} language="javascript">
      <CodeBlockHeader
        customIcon={<HugeiconsIcon icon={SparklesIcon} size={16} className="text-muted-foreground"  strokeWidth={2} />}
      />
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
