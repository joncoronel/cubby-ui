"use client";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  createAlertDialogHandle,
} from "@/registry/default/alert-dialog/alert-dialog";
import { Button } from "@/registry/default/button/button";

export default function AlertDialogDetachedTrigger() {
  const alertHandle = createAlertDialogHandle();

  return (
    <div className="flex gap-4">
      {/* Trigger placed OUTSIDE AlertDialog.Root */}
      <AlertDialogTrigger
        handle={alertHandle}
        render={<Button variant="destructive">Delete Account</Button>}
      />

      <AlertDialog handle={alertHandle}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline">Cancel</Button>}
            />
            <AlertDialogClose
              render={<Button variant="destructive">Continue</Button>}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
