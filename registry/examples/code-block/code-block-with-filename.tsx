"use client";

import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

export default function CodeBlockWithFilename() {
  const code = `export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export function createUser(data: Omit<User, "id">): User {
  return {
    ...data,
    id: crypto.randomUUID(),
  };
}`;

  return (
    <CodeBlock code={code} language="typescript">
      <CodeBlockHeader filename="types/user.ts" />
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
