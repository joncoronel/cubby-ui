"use client"

import { useState } from "react"
import { Checkbox } from "@/registry/default/checkbox/checkbox"
import { Label } from "@/registry/default/label/label"

export default function CheckboxControlled() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => setChecked(value as boolean)}
        />
        Enable notifications
      </Label>
      <p className="text-sm text-muted-foreground">
        Notifications are {checked ? "enabled" : "disabled"}
      </p>
    </div>
  )
}