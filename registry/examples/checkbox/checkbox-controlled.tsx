"use client"

import { useState } from "react"
import { Checkbox } from "@/registry/default/checkbox/checkbox"
import { Label } from "@/registry/default/label/label"

export default function CheckboxControlled() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="controlled" 
          checked={checked}
          onCheckedChange={(value) => setChecked(value as boolean)}
        />
        <Label htmlFor="controlled">
          Enable notifications
        </Label>
      </div>
      <p className="text-sm text-muted-foreground">
        Notifications are {checked ? "enabled" : "disabled"}
      </p>
    </div>
  )
}