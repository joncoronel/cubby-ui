"use client"

import { useState } from "react"
import { Checkbox } from "@/registry/default/checkbox/checkbox"
import { Label } from "@/registry/default/label/label"

export default function CheckboxFormExample() {
  const [items, setItems] = useState({
    option1: false,
    option2: true,
    option3: false,
  })

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Select your preferences:</h4>
      {Object.entries(items).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2">
          <Checkbox
            id={key}
            checked={value}
            onCheckedChange={(checked) =>
              setItems({ ...items, [key]: checked as boolean })
            }
          />
          <Label htmlFor={key}>
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/(\d+)/, ' $1')}
          </Label>
        </div>
      ))}
    </div>
  )
}