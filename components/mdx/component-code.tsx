"use client";

import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

interface ComponentCodeProps {
  code: string;
  language?: string;
}

export function ComponentCode({ code, language = "tsx" }: ComponentCodeProps) {
  return (
    <CodeBlock code={code} language={language}>
      <CodeBlockHeader />
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
