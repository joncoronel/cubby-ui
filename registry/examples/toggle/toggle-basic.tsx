import { Toggle } from "@/registry/default/toggle/toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextItalicIcon } from "@hugeicons/core-free-icons";
export default function ToggleBasic() {
  return (
    <Toggle aria-label="Toggle italic">
      <HugeiconsIcon icon={TextItalicIcon} className="h-4 w-4"  strokeWidth={2} />
    </Toggle>
  );
}