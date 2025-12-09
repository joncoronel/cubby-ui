import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

export default function CodeBlockFocus() {
  const code = `async function fetchUser(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  const data = await response.json();
  return data;
}`;

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">
          Focus on specific lines (lines 4-5) - other lines are dimmed
        </p>
        <CodeBlock code={code} language="javascript" focusLines={[4, 5]}>
          <CodeBlockHeader filename="api/users.js" />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">
          Focus on a range using string syntax (lines 1-2, 8)
        </p>
        <CodeBlock code={code} language="javascript" focusLines="1-2,8">
          <CodeBlockHeader filename="api/users.js" />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>
    </div>
  );
}
