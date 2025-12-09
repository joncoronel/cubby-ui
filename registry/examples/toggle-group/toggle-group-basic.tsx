"use client"

import { ToggleGroup } from "@/registry/default/toggle-group/toggle-group"
import { Toggle } from "@/registry/default/toggle/toggle"

export default function ToggleGroupBasic() {
  return (
    <ToggleGroup>
      <Toggle value="left">Left</Toggle>
      <Toggle value="center">Center</Toggle>
      <Toggle value="right">Right</Toggle>
    </ToggleGroup>
  )
}