"use client";

import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

interface MdxCodeBlockProps {
  code: string;
  language?: string;
}

export function MdxCodeBlock({ code, language = "tsx" }: MdxCodeBlockProps) {
  return (
    <CodeBlock code={code} language={language}>
      <CodeBlockHeader />
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
