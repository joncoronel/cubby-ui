"use client";

import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

// Simulated async operation
function saveData(): Promise<{ name: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Randomly succeed or fail for demo
      if (Math.random() > 0.3) {
        resolve({ name: "Project Alpha" });
      } else {
        reject(new Error("Connection failed"));
      }
    }, 2000);
  });
}

export default function ToastPromise() {
  const handleSave = () => {
    toast.promise(saveData(), {
      loading: {
        title: "Saving...",
        description: "Please wait while we save your changes.",
      },
      success: (data) => ({
        title: "Saved!",
        description: `${data.name} has been saved successfully.`,
      }),
      error: (err) => ({
        title: "Save failed",
        description: err.message,
      }),
    });
  };

  return <Button onClick={handleSave}>Save Changes</Button>;
}
