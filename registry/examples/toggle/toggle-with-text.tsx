import { Toggle } from "@/registry/default/toggle/toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon } from "@hugeicons/core-free-icons";
export default function ToggleWithText() {
  return (
    <Toggle>
      <HugeiconsIcon icon={TextBoldIcon} className="h-4 w-4 mr-2"  strokeWidth={2} />
      Bold
    </Toggle>
  );
}