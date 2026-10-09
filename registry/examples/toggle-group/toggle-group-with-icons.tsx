"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";

export default function ToggleGroupWithIcons() {
  return (
    <ToggleGroup aria-label="Text formatting" defaultValue={["bold"]}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <HugeiconsIcon
          icon={TextBoldIcon}
          className="h-4 w-4"
          strokeWidth={2}
        />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <HugeiconsIcon
          icon={TextItalicIcon}
          className="h-4 w-4"
          strokeWidth={2}
        />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <HugeiconsIcon
          icon={TextUnderlineIcon}
          className="h-4 w-4"
          strokeWidth={2}
        />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
