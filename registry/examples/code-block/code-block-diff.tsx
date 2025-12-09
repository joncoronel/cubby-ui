import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

export default function CodeBlockDiff() {
  const code = `function greet(name) {
-  console.log("Hello " + name);
+  console.log(\`Hello, \${name}!\`);
}

function calculatePrice(item) {
-  return item.price;
+  return item.price * (1 - item.discount);
!  // Apply discount
}`;

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">
          Diff view with added (+), removed (-), and modified (!) lines
        </p>
        <CodeBlock code={code} language="javascript" showDiff>
          <CodeBlockHeader filename="utils/helpers.js" />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">
          Using comment-style markers for TypeScript/JSX compatibility
        </p>
        <CodeBlock
          code={`export interface User {
  id: string;
  name: string;
  + email: string;
  + emailAddress: string;
  - emailVerified: boolean;
}`}
          language="typescript"
          showDiff
        >
          <CodeBlockHeader filename="types/user.ts" />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>
    </div>
  );
}
