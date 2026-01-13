"use client";

import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

export default function ToastAction() {
  const handleAction = () => {
    const id = toast({
      title: "Action performed",
      description: "You can undo this action.",

      action: {
        label: "Undo",
        onClick: () => {
          if (id) {
            toast.dismiss(id);
          }
          toast({
            title: "Action undone",
          });
        },
      },
    });
  };

  return <Button onClick={handleAction}>Perform Action</Button>;
}
