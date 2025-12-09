import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

export default function CodeBlockHighlightLines() {
  const code = `function calculateTotal(items) {
  let total = 0;

  for (const item of items) {
    total += item.price * item.quantity;
  }

  return total;
}`;

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">
          Highlight specific lines (lines 2, 5)
        </p>
        <CodeBlock code={code} language="javascript" highlightLines={[2, 5]}>
          <CodeBlockHeader filename="utils/cart.js" />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">
          Highlight range using string syntax (lines 1-3, 7)
        </p>
        <CodeBlock code={code} language="javascript" highlightLines="1-3,7">
          <CodeBlockHeader filename="utils/cart.js" />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>
    </div>
  );
}
