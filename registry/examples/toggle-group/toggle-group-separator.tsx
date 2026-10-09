"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";

import {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupSeparator,
} from "@/registry/default/toggle-group/toggle-group";

export default function ToggleGroupSeparatorDemo() {
  return (
    <ToggleGroup
      multiple
      aria-label="Text formatting"
      defaultValue={["bold", "italic"]}
    >
      <ToggleGroupItem value="bold" aria-label="Bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupSeparator />
      <ToggleGroupItem value="strikethrough" aria-label="Strikethrough">
        <HugeiconsIcon icon={TextStrikethroughIcon} strokeWidth={2} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
