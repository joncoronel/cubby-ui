"use client";

import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

export default function ToastDeduplicated() {
  return (
    <Button
      onClick={() => {
        toast({
          id: "save-status",
          title: "Draft saved",
          description: "Click again while visible to see the pulse.",
        });
      }}
    >
      Save Draft
    </Button>
  );
}
