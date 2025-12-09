"use client";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/registry/default/collapsible/collapsible";
import { Button } from "@/registry/default/button/button";
import { useState } from "react";

export default function CollapsibleControlled() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Close" : "Open"} Panel
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
          Reset
        </Button>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger>
          How do I customize the appearance?
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-border bg-card mt-2 space-y-4 rounded-md border px-4 py-3">
            <p>You can customize the appearance by:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Overriding CSS classes</li>
              <li>Using Tailwind utilities</li>
              <li>Customizing the theme variables</li>
            </ul>
            <p className="text-muted-foreground mt-2 text-sm">
              Current state: {isOpen ? "Open" : "Closed"}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
