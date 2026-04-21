import { Toggle } from "@/registry/default/toggle/toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon } from "@hugeicons/core-free-icons";
export default function ToggleDifferentSizes() {
  return (
    <div className="flex items-center space-x-2">
      <Toggle size="sm">
        <HugeiconsIcon icon={TextBoldIcon} className="h-4 w-4"  strokeWidth={2} />
      </Toggle>
      <Toggle size="default">
        <HugeiconsIcon icon={TextBoldIcon} className="h-4 w-4"  strokeWidth={2} />
      </Toggle>
      <Toggle size="lg">
        <HugeiconsIcon icon={TextBoldIcon} className="h-4 w-4"  strokeWidth={2} />
      </Toggle>
    </div>
  );
}