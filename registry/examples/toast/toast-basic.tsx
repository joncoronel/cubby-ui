"use client"

import { Button } from "@/registry/default/button/button"
import { toast } from "@/registry/default/toast/toast"

export default function ToastBasic() {
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => {
          toast({
            title: "Success!",
            description: "Your action was completed successfully.",
          })
        }}
      >
        Show Toast
      </Button>
      
      <Button
        onClick={() => {
          toast.success({
            title: "Success!",
            description: "Operation completed successfully.",
          })
        }}
      >
        Show Success Toast
      </Button>
      
      <Button
        onClick={() => {
          toast.error({
            title: "Error!",
            description: "Something went wrong.",
          })
        }}
      >
        Show Error Toast
      </Button>
      
      <Button
        onClick={() => {
          toast.warning({
            title: "Warning!",
            description: "Please review your input.",
          })
        }}
      >
        Show Warning Toast
      </Button>
      
      <Button
        onClick={() => {
          toast.info({
            title: "Info",
            description: "Here's some useful information.",
          })
        }}
      >
        Show Info Toast
      </Button>
    </div>
  )
}