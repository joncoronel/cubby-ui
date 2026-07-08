"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
} from "@hugeicons/core-free-icons"

export default function ToggleGroupOrientation() {
  return (
    <ToggleGroup
      orientation="vertical"
      aria-label="Text alignment"
      defaultValue={["center"]}
    >
      <ToggleGroupItem value="left" aria-label="Align left">
        <HugeiconsIcon icon={TextAlignLeftIcon} className="h-4 w-4" strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <HugeiconsIcon icon={TextAlignCenterIcon} className="h-4 w-4" strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <HugeiconsIcon icon={TextAlignRightIcon} className="h-4 w-4" strokeWidth={2} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
