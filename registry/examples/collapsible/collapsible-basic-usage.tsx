import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/default/collapsible/collapsible";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
export default function CollapsibleBasicUsage() {
  return (
    <Collapsible className="w-full max-w-xs">
      <CollapsibleTrigger>
        <span>Advanced Settings</span>
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 transition-transform duration-200 ease-out group-data-[panel-open]:rotate-90"  strokeWidth={2} />
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
