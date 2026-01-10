"use client";

import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/default/button/button";

// =============================================================================
// Module-level managers (like Coss UI / Base UI pattern)
// =============================================================================

const toastManager = Toast.createToastManager();
const anchoredToastManager = Toast.createToastManager();

// =============================================================================
// Grouped Toast Mappings (simplified - no separate state manager)
// =============================================================================

// Map groupId -> Base UI toastId
const groupToToastMap = new Map<string, string>();
// Map itemId -> groupId for lookups
const groupItemToGroupMap = new Map<string, string>();
// Map groupId -> GroupedToastData (we track our own data since toastManager doesn't expose getSnapshot)
const groupDataMap = new Map<string, GroupedToastData>();

// =============================================================================
// Types
// =============================================================================

const TOAST_ICONS = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
  loading: LoaderCircleIcon,
} as const;

// Icon colors are handled via in-data-[type=*] selectors in the Icon className,
// which automatically style based on the data-type attribute set by Base UI on Toast.Root

export interface ToastOptions<TData extends object = object> {
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
  priority?: "low" | "high";
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: TData;
  onClose?: () => void;
  onRemove?: () => void;
  /** Whether to show the close button. Defaults to true. */
  showCloseButton?: boolean;
}

export interface AnchoredToastOptions<
  TData extends object = object,
> extends Omit<ToastOptions<TData>, "type"> {
  anchor: Element | React.RefObject<Element | null>;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  arrow?: boolean;
}

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning" | "info" | "loading";
  action?: {
    label: string;
    onClick: () => void;
  };
  showCloseButton?: boolean;
  data?: unknown;
  positionerProps?: {
    anchor?: Element | null;
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
    align?: "start" | "center" | "end";
    alignOffset?: number;
  };
}

// =============================================================================
// Grouped Toast Types
// =============================================================================

type ToastType =
  | "default"
  | "loading"
  | "success"
  | "error"
  | "warning"
  | "info";

/** Individual item within a grouped toast */
export interface GroupedToastItem {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: object;
  createdAt: number;
  showCloseButton?: boolean;
}

/** Options for creating a grouped toast item */
export interface GroupedToastOptions<TData extends object = object> {
  groupId: string;
  title?: string;
  description?: string;
  type?: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: TData;
  onClose?: () => void;
  onRemove?: () => void;
  /** Whether to show the close button. Defaults to true. */
  showCloseButton?: boolean;
  groupSummary: string | ((count: number) => string);
  groupAction?: {
    label: string;
    expandedLabel?: string;
  };
}

/** Data structure stored in Base UI toast for grouped toasts */
interface GroupedToastData {
  isGrouped: true;
  groupId: string;
  items: GroupedToastItem[];
  isExpanded: boolean;
  summary: string | ((count: number) => string);
  action: {
    label: string;
    expandedLabel: string;
  };
}

// =============================================================================
// Toast Helper Functions
// =============================================================================

// Overloaded function signatures for JSX support
function baseToast(jsx: React.ReactElement): string | undefined;
function baseToast<TData extends object = object>(
  jsx: React.ReactElement,
  options: Omit<ToastOptions<TData>, "title" | "description">,
): string | undefined;
function baseToast<TData extends object = object>(
  options: ToastOptions<TData>,
): string | undefined;

function baseToast<TData extends object = object>(
  optionsOrJSX: ToastOptions<TData> | React.ReactElement,
  jsxOptions?: Omit<ToastOptions<TData>, "title" | "description">,
): string | undefined {
  // Handle JSX element passed directly (with optional options)
  if (React.isValidElement(optionsOrJSX)) {
    return toastManager.add({
      title: "",
      description: "",
      type: jsxOptions?.type || "default",
      timeout: jsxOptions?.duration || undefined,
      priority: jsxOptions?.priority || "low",
      ...(jsxOptions?.action && {
        actionProps: {
          children: jsxOptions.action.label,
          onClick: jsxOptions.action.onClick,
        },
      }),
      data: {
        customJSX: optionsOrJSX,
        ...(jsxOptions?.data && jsxOptions.data),
        showCloseButton: jsxOptions?.showCloseButton ?? true,
      },
      ...(jsxOptions?.onClose && { onClose: jsxOptions.onClose }),
      ...(jsxOptions?.onRemove && { onRemove: jsxOptions.onRemove }),
    });
  }

  // Handle options object
  const options = optionsOrJSX as ToastOptions<TData>;
  return toastManager.add({
    title: options.title,
    description: options.description || "",
    type: options.type || "default",
    timeout: options.duration || undefined,
    priority: options.priority || "low",
    ...(options.action && {
      actionProps: {
        children: options.action.label,
        onClick: options.action.onClick,
      },
    }),
    data: {
      ...(options.data || {}),
      showCloseButton: options.showCloseButton ?? true,
    },
    ...(options.onClose && { onClose: options.onClose }),
    ...(options.onRemove && { onRemove: options.onRemove }),
  });
}

/** Message format for promise toasts - can be a string or an object with title/description */
type PromiseMessage = string | { title?: string; description?: string };

/** Promise message that can also be a function returning the message */
type PromiseMessageOrFn<T> = PromiseMessage | ((data: T) => PromiseMessage);

const promise = async <T,>(
  promiseToResolve: Promise<T>,
  messages: {
    loading: PromiseMessage;
    success: PromiseMessageOrFn<T>;
    error: PromiseMessageOrFn<Error>;
  },
) => {
  // Helper to normalize message to Base UI format
  const normalizeMessage = <U,>(
    msg: PromiseMessageOrFn<U>,
    data?: U,
  ): string | { title?: string; description?: string } => {
    if (typeof msg === "function") {
      const result = data !== undefined ? msg(data) : msg;
      return result as string | { title?: string; description?: string };
    }
    return msg;
  };

  return toastManager.promise(promiseToResolve, {
    loading: normalizeMessage(messages.loading) as
      | string
      | { title?: string; description?: string },
    success:
      typeof messages.success === "function"
        ? (data: T) =>
            normalizeMessage(messages.success, data) as
              | string
              | { title?: string; description?: string }
        : (normalizeMessage(messages.success) as
            | string
            | { title?: string; description?: string }),
    error:
      typeof messages.error === "function"
        ? (err: Error) =>
            normalizeMessage(messages.error, err) as
              | string
              | { title?: string; description?: string }
        : (normalizeMessage(messages.error) as
            | string
            | { title?: string; description?: string }),
  });
};

// Factory function to create typed toast methods (DRY)
function createTypedToast(type: NonNullable<ToastOptions["type"]>) {
  return <TData extends object = object>(
    optionsOrJSX: Omit<ToastOptions<TData>, "type"> | React.ReactElement,
    jsxOptions?: Omit<ToastOptions<TData>, "title" | "description" | "type">,
  ) => {
    if (React.isValidElement(optionsOrJSX)) {
      return baseToast(optionsOrJSX, { ...jsxOptions, type });
    }
    return baseToast({ ...optionsOrJSX, type });
  };
}

// Create the toast object with methods like Sonner
export const toast = Object.assign(baseToast, {
  success: createTypedToast("success"),
  error: createTypedToast("error"),
  warning: createTypedToast("warning"),
  info: createTypedToast("info"),
  promise,
  dismiss: (toastId: string) => {
    return toastManager.close(toastId);
  },
  update: (toastId: string, options: Partial<ToastOptions>) => {
    const updateOptions: Record<string, unknown> = {};
    if (options.title !== undefined) updateOptions.title = options.title;
    if (options.description !== undefined)
      updateOptions.description = options.description;
    if (options.type !== undefined) updateOptions.type = options.type;
    if (options.data !== undefined) updateOptions.data = options.data;

    return toastManager.update(toastId, updateOptions);
  },
  custom: <TData extends object = object>(options: ToastOptions<TData>) =>
    baseToast(options),
  /** Show an anchored toast near an element */
  anchored: <TData extends object = object>(
    options: AnchoredToastOptions<TData>,
  ) => {
    const anchor =
      options.anchor instanceof Element
        ? options.anchor
        : options.anchor?.current;

    if (!anchor) {
      console.warn("Toast anchor element not found");
      return;
    }

    return anchoredToastManager.add({
      title: options.title,
      description: options.description || "",
      timeout: options.duration || undefined,
      priority: options.priority || "low",
      ...(options.action && {
        actionProps: {
          children: options.action.label,
          onClick: options.action.onClick,
        },
      }),
      data: {
        ...(options.data || {}),
        arrow: options.arrow ?? false,
      },
      positionerProps: {
        anchor,
        side: options.side ?? "top",
        sideOffset: options.sideOffset ?? 8,
        align: options.align,
        alignOffset: options.alignOffset,
      },
      ...(options.onClose && { onClose: options.onClose }),
      ...(options.onRemove && { onRemove: options.onRemove }),
    });
  },
  /** Dismiss an anchored toast */
  dismissAnchored: (toastId: string) => {
    return anchoredToastManager.close(toastId);
  },
  /** Show a grouped toast that collapses multiple items into a summary */
  grouped: <TData extends object = object>(
    options: GroupedToastOptions<TData>,
  ) => {
    const existingToastId = groupToToastMap.get(options.groupId);
    const itemId = `grouped-${options.groupId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const newItem: GroupedToastItem = {
      id: itemId,
      title: options.title,
      description: options.description,
      type: options.type,
      action: options.action,
      data: options.data,
      createdAt: Date.now(),
      showCloseButton: options.showCloseButton ?? true,
    };

    if (existingToastId) {
      // Add to existing group
      const existingData = groupDataMap.get(options.groupId);
      if (existingData) {
        const updatedData: GroupedToastData = {
          ...existingData,
          items: [...existingData.items, newItem],
        };
        groupDataMap.set(options.groupId, updatedData);
        toastManager.update(existingToastId, { data: updatedData });
      }
    } else {
      // Create new group
      const groupId = options.groupId;
      const groupData: GroupedToastData = {
        isGrouped: true,
        groupId,
        items: [newItem],
        isExpanded: false,
        summary: options.groupSummary,
        action: {
          label: options.groupAction?.label ?? "Show",
          expandedLabel: options.groupAction?.expandedLabel ?? "Hide",
        },
      };
      const toastId = toastManager.add({
        title: "",
        description: "",
        data: groupData,
        timeout: 0, // Groups don't auto-dismiss
        // Clean up our maps when the toast is closed (via close button or swipe)
        onClose: () => {
          const data = groupDataMap.get(groupId);
          if (data) {
            data.items.forEach((item) => groupItemToGroupMap.delete(item.id));
          }
          groupToToastMap.delete(groupId);
          groupDataMap.delete(groupId);
        },
      });
      if (toastId) {
        groupToToastMap.set(groupId, toastId);
        groupDataMap.set(groupId, groupData);
      }
    }

    groupItemToGroupMap.set(itemId, options.groupId);
    return itemId;
  },
  /** Dismiss a single item from a grouped toast */
  dismissGroupItem: (itemId: string) => {
    const groupId = groupItemToGroupMap.get(itemId);
    if (!groupId) return;

    const toastId = groupToToastMap.get(groupId);
    if (!toastId) return;

    const data = groupDataMap.get(groupId);
    if (!data) return;

    const newItems = data.items.filter((item) => item.id !== itemId);
    groupItemToGroupMap.delete(itemId);

    if (newItems.length === 0) {
      // Last item - close the toast entirely
      toastManager.close(toastId);
      groupToToastMap.delete(groupId);
      groupDataMap.delete(groupId);
    } else if (newItems.length === 1 && newItems[0].type !== "loading") {
      // Only 1 item remains and it's already complete - dismiss the whole toast
      // This avoids the awkward transition from "All complete" to single-item view
      toastManager.close(toastId);
      groupItemToGroupMap.delete(newItems[0].id);
      groupToToastMap.delete(groupId);
      groupDataMap.delete(groupId);
    } else {
      // Update toast with remaining items
      const updatedData: GroupedToastData = {
        ...data,
        items: newItems,
        // Collapse if only 1 item remains
        isExpanded: newItems.length === 1 ? false : data.isExpanded,
      };
      groupDataMap.set(groupId, updatedData);
      toastManager.update(toastId, { data: updatedData });

      // If only 1 item remains and it's still loading, it will complete later
      // and trigger auto-dismiss via updateGroupItem
    }
  },
  /** Dismiss an entire group of toasts */
  dismissGroup: (groupId: string) => {
    const toastId = groupToToastMap.get(groupId);
    if (!toastId) return;

    // Clean up item mappings
    const data = groupDataMap.get(groupId);
    if (data) {
      data.items.forEach((item) => groupItemToGroupMap.delete(item.id));
    }

    toastManager.close(toastId);
    groupToToastMap.delete(groupId);
    groupDataMap.delete(groupId);
  },
  /** Update a single item in a grouped toast */
  updateGroupItem: (
    itemId: string,
    options: Partial<Omit<GroupedToastItem, "id" | "createdAt">>,
  ) => {
    const groupId = groupItemToGroupMap.get(itemId);
    if (!groupId) return;

    const toastId = groupToToastMap.get(groupId);
    if (!toastId) return;

    const data = groupDataMap.get(groupId);
    if (!data) return;

    // Find the current item to check if type is changing from loading
    const currentItem = data.items.find((item) => item.id === itemId);
    const wasLoading = currentItem?.type === "loading";
    const isNowComplete =
      options.type !== undefined && options.type !== "loading";

    const newItems = data.items.map((item) =>
      item.id === itemId ? { ...item, ...options } : item,
    );

    const updatedData: GroupedToastData = { ...data, items: newItems };
    groupDataMap.set(groupId, updatedData);
    toastManager.update(toastId, { data: updatedData });

    // If transitioning from loading to complete, start individual item dismiss timer
    if (wasLoading && isNowComplete) {
      setTimeout(() => {
        toast.dismissGroupItem(itemId);
      }, 5000);
    }
  },
});

// =============================================================================
// Toast Provider (Stacked Toasts)
// =============================================================================

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  limit?: number;
  timeout?: number;
  container?: HTMLElement | React.RefObject<HTMLElement | null> | null;
}

export function ToastProvider({
  children,
  position = "bottom-right",
  limit = 3,
  timeout = 5000,
  container,
}: ToastProviderProps) {
  return (
    <Toast.Provider limit={limit} timeout={timeout} toastManager={toastManager}>
      {children}
      <Toast.Portal container={container}>
        <Toast.Viewport
          data-slot="toast-viewport"
          data-position={position}
          className={cn(
            "fixed z-50 flex w-[calc(100%-var(--toast-inset)*2)] max-w-[360px]",
            "[--toast-inset:1rem] sm:[--toast-inset:2rem]",
            // Vertical positioning
            "data-[position*=top]:top-(--toast-inset)",
            "data-[position*=bottom]:bottom-(--toast-inset)",
            // Horizontal positioning
            "data-[position*=left]:left-(--toast-inset)",
            "data-[position*=right]:right-(--toast-inset)",
            "data-[position*=center]:left-1/2 data-[position*=center]:-translate-x-1/2",
          )}
        >
          <StackedToasts position={position} />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function StackedToasts({ position }: { position: ToastPosition }) {
  const { toasts } = Toast.useToastManager();
  const isTop = position.startsWith("top");

  return (
    <>
      {toasts.map((toast) => (
        <StackedToastItem
          key={toast.id}
          toast={toast as ToastData}
          position={position}
          swipeDirection={
            position.includes("center")
              ? [isTop ? "up" : "down"]
              : position.includes("left")
                ? ["left", isTop ? "up" : "down"]
                : ["right", isTop ? "up" : "down"]
          }
        />
      ))}
    </>
  );
}

interface StackedToastItemProps {
  toast: ToastData;
  position: ToastPosition;
  swipeDirection:
    | ("up" | "down" | "left" | "right")
    | ("up" | "down" | "left" | "right")[];
}

function StackedToastItem({
  toast,
  position,
  swipeDirection,
}: StackedToastItemProps) {
  // Check if this is a grouped toast
  const isGrouped =
    toast.data &&
    typeof toast.data === "object" &&
    "isGrouped" in toast.data &&
    (toast.data as GroupedToastData).isGrouped === true;

  // For grouped toasts, render with GroupedToastContent
  if (isGrouped) {
    return (
      <GroupedToastRoot
        toast={toast}
        position={position}
        swipeDirection={swipeDirection}
        data={toast.data as GroupedToastData}
      />
    );
  }

  const type = toast.type || "default";

  // Check if this is a custom JSX toast
  const hasCustomJSX =
    toast.data && typeof toast.data === "object" && "customJSX" in toast.data;

  // Check if close button should be shown (defaults to true)
  const showCloseButton =
    toast.data &&
    typeof toast.data === "object" &&
    "showCloseButton" in toast.data &&
    (toast.data as Record<string, unknown>).showCloseButton === false
      ? false
      : true;

  // Get icon for toast type
  const Icon =
    type !== "default" ? TOAST_ICONS[type as keyof typeof TOAST_ICONS] : null;

  // Organized class arrays for readability
  const cssVariables = [
    "[--toast-gap:0.75rem] [--toast-peek:0.75rem]",
    "[--toast-scale:calc(max(0,1-(var(--toast-index)*0.1)))]",
    "[--toast-shrink:calc(1-var(--toast-scale))]",
    "[--toast-calc-height:var(--toast-frontmost-height,var(--toast-height))]",
    // Offset-y variable (position-aware)
    "data-[position*=top]:[--toast-calc-offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--toast-gap))+var(--toast-swipe-movement-y))]",
    "data-[position*=bottom]:[--toast-calc-offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--toast-gap)*-1)+var(--toast-swipe-movement-y))]",
  ];

  const positionClasses = [
    "absolute z-[calc(1000-var(--toast-index))] w-full",
    "data-[position*=top]:top-0 data-[position*=top]:right-0 data-[position*=top]:left-0 data-[position*=top]:origin-top",
    "data-[position*=bottom]:right-0 data-[position*=bottom]:bottom-0 data-[position*=bottom]:left-0 data-[position*=bottom]:origin-bottom",
  ];

  const transformClasses = [
    // Default transform (position-aware)
    "data-[position*=top]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--toast-peek))+(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
    "data-[position*=bottom]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
    // Expanded state
    "data-expanded:h-(--toast-height)",
    "data-position:data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-calc-offset-y))]",
  ];

  const animationClasses = [
    // Starting animation (position-aware)
    "data-[position*=top]:data-starting-style:transform-[translateY(calc(-100%-var(--toast-inset)))]",
    "data-[position*=bottom]:data-starting-style:transform-[translateY(calc(100%+var(--toast-inset)))]",
    // Ending opacity
    "data-ending-style:opacity-0",
    // Default ending - close button
    "data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(100%+var(--toast-inset)))]",
    // Swipe endings
    "data-ending-style:data-[swipe-direction=down]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
    "data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
    "data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-ending-style:data-[swipe-direction=up]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]",
    "data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]",
  ];

  const visualClasses = [
    "rounded-lg border border-border bg-card text-card-foreground",
    "bg-clip-padding shadow-lg select-none",
    // After element for spacing
    'after:absolute after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full after:content-[""]',
    "data-[position*=top]:after:bottom-full",
    "data-[position*=bottom]:after:top-full",
    // States
    "data-limited:opacity-0",
    // Height & transitions
    "h-(--toast-calc-height)",
    "transition-[transform,opacity,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
  ];

  return (
    <Toast.Root
      toast={toast}
      swipeDirection={swipeDirection}
      data-slot="toast"
      data-position={position}
      className={cn(
        cssVariables,
        positionClasses,
        transformClasses,
        animationClasses,
        visualClasses,
      )}
    >
      <Toast.Content
        data-slot="toast-content"
        className={cn(
          "flex gap-3 overflow-hidden px-3.5 py-3 text-sm",
          showCloseButton ? "items-start" : "items-center",
          "transition-opacity duration-250",
          "data-behind:pointer-events-none data-behind:opacity-0",
          "data-expanded:pointer-events-auto data-expanded:opacity-100",
        )}
      >
        {hasCustomJSX ? (
          <div className="w-full">
            {(toast.data as Record<string, React.ReactNode>).customJSX}
          </div>
        ) : (
          <>
            {Icon && (
              <div
                data-slot="toast-icon"
                className={cn(
                  "[&>svg]:size-4 [&>svg]:shrink-0",
                  showCloseButton && "mt-0.5",
                )}
              >
                <Icon
                  className={cn(
                    "in-data-[type=success]:text-success-foreground",
                    "in-data-[type=error]:text-danger-foreground",
                    "in-data-[type=warning]:text-warning-foreground",
                    "in-data-[type=info]:text-info-foreground",
                    "in-data-[type=loading]:text-muted-foreground in-data-[type=loading]:animate-spin",
                  )}
                />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Toast.Title
                data-slot="toast-title"
                className="text-sm leading-5 font-medium"
              />
              <Toast.Description
                data-slot="toast-description"
                className="text-muted-foreground text-sm leading-5"
              />
              {/* Action underneath text when close button exists */}
              {showCloseButton && (
                <Toast.Action
                  data-slot="toast-action"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "xs" }),
                    "mt-1.5 w-fit",
                  )}
                />
              )}
            </div>
            {/* Action on right when no close button */}
            {!showCloseButton && (
              <Toast.Action
                data-slot="toast-action"
                className={buttonVariants({ variant: "outline", size: "xs" })}
              />
            )}
            {showCloseButton && (
              <Toast.Close
                data-slot="toast-close"
                className="text-muted-foreground hover:bg-accent/50 hover:text-foreground -mt-1 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md border-none bg-transparent transition-colors duration-200"
                aria-label="Close"
              >
                <XIcon className="size-4" />
              </Toast.Close>
            )}
          </>
        )}
      </Toast.Content>
    </Toast.Root>
  );
}

// =============================================================================
// Anchored Toast Provider
// =============================================================================

interface AnchoredToastProviderProps {
  children: React.ReactNode;
  limit?: number;
  timeout?: number;
  container?: HTMLElement | React.RefObject<HTMLElement | null> | null;
}

export function AnchoredToastProvider({
  children,
  limit = 5,
  timeout = 2000,
  container,
}: AnchoredToastProviderProps) {
  return (
    <Toast.Provider
      limit={limit}
      timeout={timeout}
      toastManager={anchoredToastManager}
    >
      {children}
      <Toast.Portal container={container}>
        <Toast.Viewport data-slot="toast-viewport" className="outline-none">
          <AnchoredToasts />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function AnchoredToasts() {
  const { toasts } = Toast.useToastManager();

  return (
    <>
      {toasts.map((toast) => {
        const toastData = toast as ToastData;
        if (!toastData.positionerProps?.anchor) {
          return null;
        }
        return <AnchoredToastItem key={toast.id} toast={toastData} />;
      })}
    </>
  );
}

function AnchoredToastItem({ toast }: { toast: ToastData }) {
  const showArrow = Boolean(
    toast.data &&
    typeof toast.data === "object" &&
    "arrow" in toast.data &&
    (toast.data as Record<string, unknown>).arrow === true,
  );

  return (
    <Toast.Positioner
      toast={toast}
      data-slot="toast-positioner"
      className="z-[calc(1000-var(--toast-index))]"
    >
      <Toast.Root
        toast={toast}
        data-slot="toast"
        className={cn(
          "flex w-max origin-[var(--transform-origin)] flex-col rounded-md",
          "border-border bg-card text-card-foreground border",
          "px-3 py-2 text-sm shadow-lg",
          "transition-all duration-200",
          "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
        )}
      >
        {showArrow && (
          <Toast.Arrow
            data-slot="toast-arrow"
            className="fill-card [&>path:first-child]:fill-card [&>path:not(:first-child)]:stroke-border"
          />
        )}
        <Toast.Content data-slot="toast-content">
          <Toast.Title
            data-slot="toast-title"
            className="text-sm font-medium"
          />
          <Toast.Description
            data-slot="toast-description"
            className="text-muted-foreground text-sm"
          />
        </Toast.Content>
      </Toast.Root>
    </Toast.Positioner>
  );
}

// =============================================================================
// Grouped Toast Components (using Base UI primitives)
// =============================================================================

// Feature detection for calc-size() support (Chrome 129+, Edge 129+)
// Used to conditionally render different DOM structures for height animation
const supportsCalcSize =
  typeof CSS !== "undefined" && CSS.supports("height", "calc-size(auto, size)");

interface GroupedToastRootProps {
  toast: ToastData;
  position: ToastPosition;
  swipeDirection:
    | ("up" | "down" | "left" | "right")
    | ("up" | "down" | "left" | "right")[];
  data: GroupedToastData;
}

/** Helper to toggle expand/collapse for a grouped toast */
function toggleGroupExpanded(toastId: string) {
  // Find the groupId from toastId
  let groupId: string | undefined;
  for (const [gId, tId] of groupToToastMap.entries()) {
    if (tId === toastId) {
      groupId = gId;
      break;
    }
  }
  if (!groupId) return;

  const data = groupDataMap.get(groupId);
  if (!data) return;

  const updatedData: GroupedToastData = {
    ...data,
    isExpanded: !data.isExpanded,
  };
  groupDataMap.set(groupId, updatedData);
  toastManager.update(toastId, { data: updatedData });
}

function GroupedToastRoot({
  toast,
  position,
  swipeDirection,
  data,
}: GroupedToastRootProps) {
  const isTop = position.startsWith("top");

  // Organized class arrays for readability (same as regular toast)
  const cssVariables = [
    "[--toast-gap:0.75rem] [--toast-peek:0.75rem]",
    "[--toast-scale:calc(max(0,1-(var(--toast-index)*0.1)))]",
    "[--toast-shrink:calc(1-var(--toast-scale))]",
    "[--toast-calc-height:var(--toast-frontmost-height,var(--toast-height))]",
    "data-[position*=top]:[--toast-calc-offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--toast-gap))+var(--toast-swipe-movement-y))]",
    "data-[position*=bottom]:[--toast-calc-offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--toast-gap)*-1)+var(--toast-swipe-movement-y))]",
  ];

  const positionClasses = [
    "absolute z-[calc(1000-var(--toast-index))] w-full",
    "data-[position*=top]:top-0 data-[position*=top]:right-0 data-[position*=top]:left-0 data-[position*=top]:origin-top",
    "data-[position*=bottom]:right-0 data-[position*=bottom]:bottom-0 data-[position*=bottom]:left-0 data-[position*=bottom]:origin-bottom",
  ];

  const transformClasses = [
    "data-[position*=top]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--toast-peek))+(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
    "data-[position*=bottom]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
    "data-expanded:h-(--toast-height)",
    "data-position:data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-calc-offset-y))]",
  ];

  const animationClasses = [
    "data-[position*=top]:data-starting-style:transform-[translateY(calc(-100%-var(--toast-inset)))]",
    "data-[position*=bottom]:data-starting-style:transform-[translateY(calc(100%+var(--toast-inset)))]",
    "data-ending-style:opacity-0",
    "data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(100%+var(--toast-inset)))]",
    "data-ending-style:data-[swipe-direction=down]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
    "data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
    "data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-ending-style:data-[swipe-direction=up]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]",
    "data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]",
  ];

  const visualClasses = [
    "rounded-lg border border-border bg-card text-card-foreground",
    "bg-clip-padding shadow-lg select-none overflow-visible",
    'after:absolute after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full after:content-[""]',
    "data-[position*=top]:after:bottom-full",
    "data-[position*=bottom]:after:top-full",
    "data-limited:opacity-0",
    "h-(--toast-calc-height)",
    "transition-[transform,opacity,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
  ];

  return (
    <Toast.Root
      toast={toast}
      swipeDirection={swipeDirection}
      data-slot="toast"
      data-position={position}
      className={cn(
        cssVariables,
        positionClasses,
        transformClasses,
        animationClasses,
        visualClasses,
      )}
    >
      <Toast.Content
        data-slot="toast-content"
        className={cn(
          "text-sm",
          "transition-[opacity,height] duration-300",
          "data-behind:pointer-events-none data-behind:opacity-0",
          "data-expanded:pointer-events-auto data-expanded:opacity-100",
        )}
      >
        <GroupedToastSummaryOrSingle data={data} toastId={toast.id} />
      </Toast.Content>
      {/* Render expanded card outside Toast.Content to avoid clipping */}
      {data.isExpanded && data.items.length > 1 && (
        <GroupedToastCard data={data} isTop={isTop} />
      )}
    </Toast.Root>
  );
}

interface GroupedToastSummaryOrSingleProps {
  data: GroupedToastData;
  toastId: string;
}

function GroupedToastSummaryOrSingle({
  data,
  toastId,
}: GroupedToastSummaryOrSingleProps) {
  const isSingle = data.items.length === 1;
  const item = data.items[0];

  // Modern browsers (Chrome 129+): single element with key switching
  // Height animates from CSS var to calc-size(auto, size)
  if (supportsCalcSize) {
    return (
      <div
        key={isSingle ? "single" : "summary"}
        className={cn(
          "ease-out-cubic duration-200",
          "transition-[height,opacity,filter,scale]",
          "overflow-clip",
          // Height: start from CSS var, animate to intrinsic size
          "h-[calc-size(auto,size)]",
          "starting:h-(--toast-calc-height)",
          // Opacity/blur/scale entry animation

          "starting:scale-95 starting:opacity-0 starting:blur-[2px]",
          "blur-0 scale-100 opacity-100",
        )}
      >
        {isSingle ? (
          <GroupedSingleItemContent
            item={item}
            showCloseButton={item.showCloseButton}
          />
        ) : (
          <GroupedToastSummaryContent
            data={data}
            onToggle={() => toggleGroupExpanded(toastId)}
          />
        )}
      </div>
    );
  }

  // Fallback (Firefox/Safari): two elements with grid-based height animation
  return (
    <>
      {/* Single item view */}
      <div
        className={cn(
          "ease-out-cubic grid duration-200",
          "transition-[grid-template-rows,opacity,filter,scale]",
          isSingle
            ? "blur-0 scale-100 grid-rows-[1fr] opacity-100"
            : "pointer-events-none scale-95 grid-rows-[0fr] opacity-0 blur-[2px]",
        )}
      >
        <div className="overflow-hidden">
          <GroupedSingleItemContent
            item={item}
            showCloseButton={item.showCloseButton}
          />
        </div>
      </div>

      {/* Summary view */}
      <div
        className={cn(
          "ease-out-cubic grid duration-200",
          "transition-[grid-template-rows,opacity,filter,scale]",
          !isSingle
            ? "blur-0 scale-100 grid-rows-[1fr] opacity-100"
            : "pointer-events-none scale-95 grid-rows-[0fr] opacity-0 blur-[2px]",
        )}
      >
        <div className="overflow-hidden">
          <GroupedToastSummaryContent
            data={data}
            onToggle={() => toggleGroupExpanded(toastId)}
          />
        </div>
      </div>
    </>
  );
}

interface GroupedSingleItemContentProps {
  item: GroupedToastItem;
  showCloseButton?: boolean;
}

function GroupedSingleItemContent({
  item,
  showCloseButton = true,
}: GroupedSingleItemContentProps) {
  const type = item.type || "default";
  const Icon =
    type !== "default" ? TOAST_ICONS[type as keyof typeof TOAST_ICONS] : null;

  // When close button exists: action underneath text, items-start
  // When no close button: action on right side, items-center
  return (
    <div
      className={cn(
        "flex gap-3 px-3.5 py-3",
        showCloseButton ? "items-start" : "items-center",
      )}
    >
      {Icon && (
        <div
          data-slot="toast-icon"
          className={cn(
            "[&>svg]:size-4 [&>svg]:shrink-0",
            showCloseButton && "mt-0.5",
          )}
        >
          <Icon
            className={cn(
              type === "success" && "text-success-foreground",
              type === "error" && "text-danger-foreground",
              type === "warning" && "text-warning-foreground",
              type === "info" && "text-info-foreground",
              type === "loading" && "text-muted-foreground animate-spin",
            )}
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {item.title && (
          <span className="text-sm leading-5 font-medium">{item.title}</span>
        )}
        {item.description && (
          <span className="text-muted-foreground text-sm leading-5">
            {item.description}
          </span>
        )}
        {/* Action underneath text when close button exists */}
        {showCloseButton && item.action && (
          <div className="mt-1.5">
            <button
              onClick={item.action.onClick}
              className={buttonVariants({ variant: "outline", size: "xs" })}
            >
              {item.action.label}
            </button>
          </div>
        )}
      </div>
      {/* Action on right when no close button */}
      {!showCloseButton && item.action && (
        <button
          onClick={item.action.onClick}
          className={buttonVariants({ variant: "outline", size: "xs" })}
        >
          {item.action.label}
        </button>
      )}
      {showCloseButton && (
        <Toast.Close
          data-slot="toast-close"
          className="text-muted-foreground hover:bg-accent/50 hover:text-foreground -mt-1 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md border-none bg-transparent transition-colors duration-200"
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </Toast.Close>
      )}
    </div>
  );
}

interface GroupedToastSummaryContentProps {
  data: GroupedToastData;
  onToggle: () => void;
}

function GroupedToastSummaryContent({
  data,
  onToggle,
}: GroupedToastSummaryContentProps) {
  // Count items still in progress (loading)
  const loadingCount = data.items.filter(
    (item) => item.type === "loading",
  ).length;
  const hasLoadingItem = loadingCount > 0;
  const iconType = hasLoadingItem ? "loading" : "success";
  const Icon = TOAST_ICONS[iconType];

  // Generate summary text - use loading count, not total count
  const summaryText =
    typeof data.summary === "function"
      ? data.summary(loadingCount)
      : data.summary;

  const buttonLabel = data.isExpanded
    ? data.action.expandedLabel
    : data.action.label;

  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <div data-slot="toast-icon" className="[&>svg]:size-4 [&>svg]:shrink-0">
        <Icon
          className={cn(
            iconType === "loading" && "text-muted-foreground animate-spin",
            iconType === "success" && "text-success-foreground",
          )}
        />
      </div>
      <span className="flex-1 font-medium">{summaryText}</span>
      <button
        onClick={onToggle}
        className={buttonVariants({ variant: "outline", size: "xs" })}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

interface GroupedToastCardProps {
  data: GroupedToastData;
  isTop: boolean;
}

function GroupedToastCard({ data, isTop }: GroupedToastCardProps) {
  return (
    <div
      data-slot="grouped-toast-card"
      className={cn(
        "absolute w-full",
        isTop ? "top-full mt-2" : "bottom-full mb-2",
        "border-border bg-card text-card-foreground rounded-lg border",
        "overflow-hidden shadow-lg",
        "ease-out-cubic transition-all duration-200",
        "animate-in fade-in-0 zoom-in-95",
        isTop ? "slide-in-from-top-2" : "slide-in-from-bottom-2",
      )}
    >
      <div className="max-h-64 overflow-y-auto">
        {data.items.map((item, index) => (
          <GroupedToastCardItem
            key={item.id}
            item={item}
            showSeparator={index > 0}
          />
        ))}
      </div>
    </div>
  );
}

interface GroupedToastCardItemProps {
  item: GroupedToastItem;
  showSeparator: boolean;
}

function GroupedToastCardItem({
  item,
  showSeparator,
}: GroupedToastCardItemProps) {
  const type = item.type || "default";
  const Icon =
    type !== "default" ? TOAST_ICONS[type as keyof typeof TOAST_ICONS] : null;

  return (
    <>
      {showSeparator && (
        <div
          className="bg-border h-px w-full"
          data-slot="grouped-toast-separator"
        />
      )}
      <div
        data-slot="grouped-toast-card-item"
        className="flex items-center gap-3 px-3.5 py-3 text-sm"
      >
        {Icon && (
          <div
            data-slot="toast-icon"
            className="[&>svg]:size-4 [&>svg]:shrink-0"
          >
            <Icon
              className={cn(
                type === "success" && "text-success-foreground",
                type === "error" && "text-danger-foreground",
                type === "warning" && "text-warning-foreground",
                type === "info" && "text-info-foreground",
                type === "loading" && "text-muted-foreground animate-spin",
              )}
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {item.title && (
            <span className="leading-5 font-medium">{item.title}</span>
          )}
          {item.description && (
            <span className="text-muted-foreground leading-5">
              {item.description}
            </span>
          )}
        </div>
        {item.action && (
          <button
            onClick={item.action.onClick}
            className={buttonVariants({ variant: "outline", size: "xs" })}
          >
            {item.action.label}
          </button>
        )}
      </div>
    </>
  );
}

// =============================================================================
// Utility Components
// =============================================================================

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// =============================================================================
// Exports
// =============================================================================

export { Toast, toastManager, anchoredToastManager };
