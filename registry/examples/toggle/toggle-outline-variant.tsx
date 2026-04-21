import { Toggle } from "@/registry/default/toggle/toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextUnderlineIcon } from "@hugeicons/core-free-icons";
export default function ToggleOutlineVariant() {
  return (
    <Toggle variant="outline">
      <HugeiconsIcon icon={TextUnderlineIcon} className="h-4 w-4"  strokeWidth={2} />
    </Toggle>
  );
}