"use client";

import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

export function ToastDemo() {
  const handleSuccess = () => {
    toast.success({ title: "Saved", description: "Your changes were saved." });
  };
  const handleError = () => {
    toast.error({ title: "Error", description: "Something went wrong." });
  };
  const handlePromise = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1200)), {
      loading: "Saving...",
      success: "All set!",
      error: "Failed to save",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={handleSuccess}>Success toast</Button>
      <Button variant="outline" onClick={handleError}>
        Error toast
      </Button>
      <Button variant="ghost" onClick={handlePromise}>
        Promise toast
      </Button>
    </div>
  );
}
