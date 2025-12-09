"use client"

import { Button } from "@/registry/default/button/button"
import { toast } from "@/registry/default/toast/toast"

export default function ToastWithAction() {
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => {
          toast({
            title: "Email sent",
            description: "Your message has been sent successfully.",
            action: {
              label: "Undo",
              onClick: () => {
                toast.info({
                  title: "Undone",
                  description: "Email has been moved to drafts.",
                })
              },
            },
          })
        }}
      >
        Send Email
      </Button>
      
      <Button
        onClick={() => {
          toast.success({
            title: "File uploaded",
            description: "document.pdf has been uploaded.",
            action: {
              label: "View",
              onClick: () => {
                toast.info({
                  title: "Opening file",
                  description: "Redirecting to file viewer...",
                })
              },
            },
          })
        }}
      >
        Upload File
      </Button>
    </div>
  )
}