import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";

export default async function CodeBlockServerHighlight() {
  const code = `export async function fetchUserData(userId: string) {
  const response = await fetch(\`/api/users/\${userId}\`);

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  return response.json();
}`;

  // Pre-highlight on the server for instant rendering
  const highlighted = await highlight(code, "typescript");

  return (
    <CodeBlock code={code} language="typescript" initial={highlighted}>
      <CodeBlockHeader filename="lib/api.ts" />
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
