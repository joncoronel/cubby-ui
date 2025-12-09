"use client";

import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { Sparkles } from "lucide-react";

export default function CodeBlockCustomIcon() {
  const code = `function greet(name) {
  return \`Hello, \${name}! ✨\`;
}

console.log(greet("World"));`;

  return (
    <CodeBlock code={code} language="javascript">
      <CodeBlockHeader
        customIcon={<Sparkles size={16} className="text-muted-foreground" />}
      />
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
