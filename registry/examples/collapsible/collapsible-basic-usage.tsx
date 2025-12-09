import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/default/collapsible/collapsible";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { ChevronRight } from "lucide-react";

export default function CollapsibleBasicUsage() {
  return (
    <Collapsible className="w-full max-w-xs">
      <CollapsibleTrigger>
        <span>Advanced Settings</span>
        <ChevronRight className="size-4 transition-transform duration-200 ease-out group-data-[panel-open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-border bg-card mt-2 space-y-4 rounded-md border px-4 py-3">
          <div className="flex items-center justify-between">
            <label htmlFor="notifications" className="text-sm font-medium">
              Enable notifications
            </label>
            <Checkbox id="notifications" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="auto-save" className="text-sm font-medium">
              Auto-save drafts
            </label>
            <Checkbox id="auto-save" defaultChecked />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
