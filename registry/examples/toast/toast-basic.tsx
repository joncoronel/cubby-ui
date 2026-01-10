"use client"

import { Button } from "@/registry/default/button/button"
import { toast } from "@/registry/default/toast/toast"

export default function ToastBasic() {
  return (
    <Button
      onClick={() => {
        toast({
          title: "Event has been created",
          description: "Sunday, December 03, 2023 at 9:00 AM",
        })
      }}
    >
      Show Toast
    </Button>
  )
}
