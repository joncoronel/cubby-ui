"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group"

export default function ToggleGroupBasic() {
  return (
    <ToggleGroup aria-label="Text alignment" defaultValue={["center"]}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  )
}
