"use client"

import { Button } from "@/registry/default/button/button"
import { toast } from "@/registry/default/toast/toast"

export default function ToastTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast({ title: "Default", description: "This is a default toast." })}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success({ title: "Success", description: "Operation completed successfully." })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error({ title: "Error", description: "Something went wrong." })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning({ title: "Warning", description: "Please review before continuing." })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info({ title: "Info", description: "Here's some helpful information." })
        }
      >
        Info
      </Button>
    </div>
  )
}
