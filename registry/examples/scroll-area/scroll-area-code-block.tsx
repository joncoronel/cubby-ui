import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaCodeBlock() {
  return (
    <ScrollArea className="h-[200px] w-full rounded-md border">
      <pre className="p-4">
        <code className="text-sm">{`import React from 'react';
import { ScrollArea } from '@/registry/default/scroll-area/scroll-area';

function App() {
  const items = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    name: \`Item \${i + 1}\`,
    description: \`Description for item \${i + 1}\`
  }));

  return (
    <ScrollArea className="h-96 w-full">
      <div className="p-4">
        {items.map((item) => (
          <div key={item.id} className="mb-4 p-4 border rounded">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default App;`}</code>
      </pre>
    </ScrollArea>
  );
}