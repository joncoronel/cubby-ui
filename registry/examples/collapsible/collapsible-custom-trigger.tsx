"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { Button } from "@/registry/default/button/button";
import { CollapsibleContent } from "@/registry/default/collapsible/collapsible";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
export default function CollapsibleCustomTrigger() {
  return (
    <BaseCollapsible.Root className="w-full max-w-sm">
      <BaseCollapsible.Trigger
        render={(props, state) => (
          <Button
            {...props}
            variant="outline"
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={Settings01Icon} className="size-4"  strokeWidth={2} />
              Custom Settings
            </span>
            <HugeiconsIcon icon={ArrowRight01Icon}
              className={`size-4 transition-transform duration-200 ease-out ${
                state.open ? "rotate-90" : ""
              }`}
             strokeWidth={2} />
          </Button>
        )}
      />
      <CollapsibleContent>
        <div className="border-border bg-card mt-2 space-y-4 rounded-md border px-4 py-3">
          <div className="flex items-center justify-between">
            <label htmlFor="dark-mode" className="text-sm font-medium">
              Dark mode
            </label>
            <Checkbox id="dark-mode" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="compact-view" className="text-sm font-medium">
              Compact view
            </label>
            <Checkbox id="compact-view" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="show-tooltips" className="text-sm font-medium">
              Show tooltips
            </label>
            <Checkbox id="show-tooltips" defaultChecked />
          </div>
        </div>
      </CollapsibleContent>
    </BaseCollapsible.Root>
  );
}
