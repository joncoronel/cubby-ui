"use client";

import { Toggle } from "@/registry/default/toggle/toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon } from "@hugeicons/core-free-icons";

export default function ToggleSoftVariant() {
  return (
    <Toggle variant="soft" aria-label="Bold">
      <HugeiconsIcon icon={TextBoldIcon} className="h-4 w-4" strokeWidth={2} />
    </Toggle>
  );
}
