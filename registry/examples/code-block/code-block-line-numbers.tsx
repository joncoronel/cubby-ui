"use client";

import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

export default function CodeBlockLineNumbersExample() {
  const code = `class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = { value, left: null, right: null };

    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return;
        }
        current = current.right;
      }
    }
  }
}`;

  return (
    <CodeBlock code={code} language="javascript">
      <CodeBlockHeader />
      <CodeBlockPre lineNumbers>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
