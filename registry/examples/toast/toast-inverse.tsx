"use client";

import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

export default function ToastInverse() {
  const handleDelete = () => {
    const id = toast({
      title: "Message deleted",
      variant: "inverse",
      action: {
        label: "Undo",
        onClick: () => {
          if (id) {
            toast.dismiss(id);
          }
        },
      },
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={handleDelete}>
        Delete message
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success({
            title: "Changes saved",
            description: "Your profile is up to date.",
            variant: "inverse",
          })
        }
      >
        Save changes
      </Button>
    </div>
  );
}
