import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";
import type { BundledLanguage } from "shiki/langs";

interface MdxCodeBlockServerProps {
  code: string;
  language?: string;
}

export async function MdxCodeBlockServer({
  code,
  language = "tsx",
}: MdxCodeBlockServerProps) {
  // Highlight on the server
  const highlighted = await highlight(code, language as BundledLanguage);

  return (
    <div className="not-prose my-4">
      <CodeBlock
        code={code}
        language={language}
        initial={highlighted}
        floatingCopy
      >
        <CodeBlockPre>
          <CodeBlockCode />
        </CodeBlockPre>
      </CodeBlock>
    </div>
  );
}
