import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui-components/react/alert-dialog";
import { Button } from "@/registry/default/button/button";

import { cn } from "@/lib/utils";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Root>) {
  return <BaseAlertDialog.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Portal>) {
  return <BaseAlertDialog.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogClose({
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Close>) {
  return <BaseAlertDialog.Close data-slot="alert-dialog-close" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Trigger>) {
  return (
    <BaseAlertDialog.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Backdrop>) {
  return (
    <BaseAlertDialog.Backdrop
      className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 ease-out dark:bg-black/60",
        "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      data-slot="alert-dialog-backdrop"
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  backdropClassName,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Popup> & {
  backdropClassName?: string;
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogBackdrop className={backdropClassName} />
      <BaseAlertDialog.Popup
        className={cn(
          "fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-1/2 z-50 grid w-full max-w-[calc(100%-1rem)] translate-x-[-50%] translate-y-[-50%] sm:max-w-lg",
          "bg-popover text-popover-foreground ring-border/60 scale-[calc(1-0.1*var(--nested-dialogs))] gap-4 rounded-lg p-6 shadow-lg ring-1",
          "transition-all duration-200",
          // Enter and exit animations
          "data-[starting-style]:translate-y-[-50%] data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
          "data-[ending-style]:translate-y-[-50%] data-[ending-style]:scale-90 data-[ending-style]:opacity-0",
          // Nested dialogs animations
          "data-[nested]:data-[starting-style]:translate-y-[calc(-50%-1.25rem)] data-[nested]:data-[starting-style]:scale-110",
          "data-[nested]:data-[ending-style]:translate-y-[calc(-50%-1.25rem)] data-[nested]:data-[ending-style]:scale-110",
          // Nested dialog overlay
          "data-[nested-dialog-open]:after:absolute data-[nested-dialog-open]:after:inset-0",
          "data-[nested-dialog-open]:after:rounded-[inherit] data-[nested-dialog-open]:after:bg-black/5",
          className,
        )}
        data-slot="alert-dialog-content"
        {...props}
      >
        {children}
      </BaseAlertDialog.Popup>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      data-slot="alert-dialog-header"
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      data-slot="alert-dialog-footer"
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Title>) {
  return (
    <BaseAlertDialog.Title
      className={cn("text-lg font-semibold", className)}
      data-slot="alert-dialog-title"
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Description>) {
  return (
    <BaseAlertDialog.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Close>) {
  return (
    <BaseAlertDialog.Close
      data-slot="alert-dialog-action"
      render={<Button variant="destructive" />}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Close>) {
  return (
    <BaseAlertDialog.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant="ghost" />}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
