"use client";

import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

export default function CodeBlockLanguagesExample() {
  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">TypeScript</h3>
        <CodeBlock
          code={`interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`}
          language="typescript"
        >
          <CodeBlockHeader />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Python</h3>
        <CodeBlock
          code={`def quicksort(arr):
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))  # [1, 1, 2, 3, 6, 8, 10]`}
          language="python"
        >
          <CodeBlockHeader />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Bash</h3>
        <CodeBlock
          code={`#!/bin/bash

# Deploy script
echo "Starting deployment..."

npm run build
npm run test

if [ $? -eq 0 ]; then
  echo "Tests passed! Deploying..."
  npm run deploy
else
  echo "Tests failed. Deployment cancelled."
  exit 1
fi`}
          language="bash"
        >
          <CodeBlockHeader />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </div>
    </div>
  );
}
