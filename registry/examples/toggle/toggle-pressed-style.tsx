import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

import { Toggle } from "@/registry/default/toggle/toggle";

export default function TogglePressedStyle() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle variant="soft" defaultPressed>
        <HugeiconsIcon icon={StarIcon} strokeWidth={2} />
        Subtle
      </Toggle>
      <Toggle variant="soft" pressedStyle="solid" defaultPressed>
        <HugeiconsIcon icon={StarIcon} strokeWidth={2} />
        Solid
      </Toggle>
    </div>
  );
}
