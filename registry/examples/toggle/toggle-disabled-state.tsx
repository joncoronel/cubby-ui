import { Toggle } from "@/registry/default/toggle/toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextItalicIcon } from "@hugeicons/core-free-icons";
export default function ToggleDisabledState() {
  return (
    <Toggle disabled>
      <HugeiconsIcon icon={TextItalicIcon} className="h-4 w-4"  strokeWidth={2} />
    </Toggle>
  );
}