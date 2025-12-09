import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/registry/default/collapsible/collapsible";
import { ChevronRight } from "lucide-react";

export default function CollapsibleWithContent() {
  return (
    <Collapsible className="w-full max-w-md">
      <CollapsibleTrigger>
        What are the system requirements?
        <ChevronRight className="size-4 transition-transform duration-200 ease-out group-data-[panel-open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="duration-200 ease-out data-[ending-style]:-translate-y-4 data-[ending-style]:scale-98 data-[ending-style]:blur-sm data-[starting-style]:-translate-y-4 data-[starting-style]:scale-98 data-[starting-style]:blur-sm">
        <div className="border-border bg-card mt-2 space-y-4 rounded-md border px-4 py-3">
          <p>The following are the minimum system requirements:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Node.js 18.0 or higher</li>
            <li>React 18.0 or higher</li>
            <li>TypeScript 4.9 or higher</li>
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
