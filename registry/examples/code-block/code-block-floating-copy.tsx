"use client";

import {
  CodeBlock,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

export default function CodeBlockFloatingCopyExample() {
  const code = `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`;

  return (
    <CodeBlock code={code} language="javascript" floatingCopy>
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
