"use client";

import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
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

/** Duration in ms before a completed group item auto-dismisses */
const GROUP_ITEM_DISMISS_DURATION = 5000;

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
  /** Timestamp when this item transitioned to a completed state */
  completedAt?: number;
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
  /** Pending items (loading state) */
  items: GroupedToastItem[];
  /** Completed items that are transitioning out with progress bar */
  completedItems: GroupedToastItem[];
  isExpanded: boolean;
  summary: string | ((count: number) => string);
  action: {
    label: string;
    expandedLabel: string;
  };
  /** True once we've shown "All complete" (2+ items completed simultaneously) - stays in summary mode */
  hasShownAllComplete: boolean;
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
          completedItems: existingData.completedItems ?? [],
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
        completedItems: [],
        isExpanded: false,
        summary: options.groupSummary,
        action: {
          label: options.groupAction?.label ?? "Show",
          expandedLabel: options.groupAction?.expandedLabel ?? "Hide",
        },
        hasShownAllComplete: false,
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
            (data.completedItems ?? []).forEach((item) =>
              groupItemToGroupMap.delete(item.id),
            );
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
  /** Dismiss a single item from a grouped toast (checks both pending and completed arrays) */
  dismissGroupItem: (itemId: string) => {
    const groupId = groupItemToGroupMap.get(itemId);
    if (!groupId) return;

    const toastId = groupToToastMap.get(groupId);
    if (!toastId) return;

    const data = groupDataMap.get(groupId);
    if (!data) return;

    // Check both arrays
    const inPending = data.items.some((item) => item.id === itemId);
    const inCompleted = (data.completedItems ?? []).some(
      (item) => item.id === itemId,
    );

    let newItems = data.items;
    let newCompletedItems = data.completedItems ?? [];

    if (inPending) {
      newItems = data.items.filter((item) => item.id !== itemId);
    }
    if (inCompleted) {
      newCompletedItems = newCompletedItems.filter(
        (item) => item.id !== itemId,
      );
    }

    groupItemToGroupMap.delete(itemId);

    if (newItems.length === 0 && newCompletedItems.length === 0) {
      // Last item - close the toast entirely
      toastManager.close(toastId);
      groupToToastMap.delete(groupId);
      groupDataMap.delete(groupId);
    } else {
      // Update toast with remaining items
      const updatedData: GroupedToastData = {
        ...data,
        items: newItems,
        completedItems: newCompletedItems,
        // Collapse if only 1 pending item remains and no completed
        isExpanded:
          newItems.length <= 1 && newCompletedItems.length === 0
            ? false
            : data.isExpanded,
      };
      groupDataMap.set(groupId, updatedData);
      toastManager.update(toastId, { data: updatedData });
    }
  },
  /** Dismiss an entire group of toasts */
  dismissGroup: (groupId: string) => {
    const toastId = groupToToastMap.get(groupId);
    if (!toastId) return;

    // Clean up item mappings for both arrays
    const data = groupDataMap.get(groupId);
    if (data) {
      data.items.forEach((item) => groupItemToGroupMap.delete(item.id));
      (data.completedItems ?? []).forEach((item) =>
        groupItemToGroupMap.delete(item.id),
      );
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

    if (wasLoading && isNowComplete && currentItem) {
      // Move item from pending to completed
      const newItems = data.items.filter((item) => item.id !== itemId);
      const completedItem: GroupedToastItem = {
        ...currentItem,
        ...options,
        completedAt: Date.now(),
      };

      // Insert at beginning (newest on top)
      const newCompletedItems = [completedItem, ...(data.completedItems ?? [])];

      // Check if we have 2+ complete items (triggers "All complete" summary)
      const completeCount = newCompletedItems.length;
      const shouldShowAllComplete = completeCount >= 2;

      const updatedData: GroupedToastData = {
        ...data,
        items: newItems,
        completedItems: newCompletedItems,
        hasShownAllComplete: data.hasShownAllComplete || shouldShowAllComplete,
      };
      groupDataMap.set(groupId, updatedData);
      toastManager.update(toastId, { data: updatedData });

      // Start dismiss timer for the completed item
      setTimeout(() => {
        toast.dismissCompletedItem(itemId);
      }, GROUP_ITEM_DISMISS_DURATION);
    } else {
      // Just update in place (not a loading->complete transition)
      const newItems = data.items.map((item) =>
        item.id === itemId ? { ...item, ...options } : item,
      );

      const updatedData: GroupedToastData = {
        ...data,
        items: newItems,
      };
      groupDataMap.set(groupId, updatedData);
      toastManager.update(toastId, { data: updatedData });
    }
  },
  /** Dismiss a completed item (removes from completedItems array) */
  dismissCompletedItem: (itemId: string) => {
    const groupId = groupItemToGroupMap.get(itemId);
    if (!groupId) return;

    const toastId = groupToToastMap.get(groupId);
    if (!toastId) return;

    const data = groupDataMap.get(groupId);
    if (!data) return;

    const newCompletedItems = (data.completedItems ?? []).filter(
      (item) => item.id !== itemId,
    );
    groupItemToGroupMap.delete(itemId);

    // Check if entire group should close
    if (data.items.length === 0 && newCompletedItems.length === 0) {
      toastManager.close(toastId);
      groupToToastMap.delete(groupId);
      groupDataMap.delete(groupId);
      return;
    }

    const updatedData: GroupedToastData = {
      ...data,
      completedItems: newCompletedItems,
      // Collapse if only 1 pending item remains and no completed
      isExpanded:
        data.items.length <= 1 && newCompletedItems.length === 0
          ? false
          : data.isExpanded,
    };
    groupDataMap.set(groupId, updatedData);
    toastManager.update(toastId, { data: updatedData });
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
      {/* Render expanded cards outside Toast.Content to avoid clipping */}
      {data.isExpanded && <ExpandedCardsContainer data={data} isTop={isTop} />}
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
  // Total items across both arrays
  const totalPending = data.items.length;
  const totalCompleted = (data.completedItems ?? []).length;
  const totalItems = totalPending + totalCompleted;

  // Show single-item view when there's exactly 1 total item (pending OR completed)
  // and we haven't shown "All complete" mode yet
  const isSingle = totalItems === 1 && !data.hasShownAllComplete;

  // Get the single item to display (prefer pending, fallback to completed)
  const singleItem = data.items[0] ?? data.completedItems?.[0];

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
        {isSingle && singleItem ? (
          <GroupedSingleItemContent
            item={singleItem}
            showCloseButton={singleItem.showCloseButton}
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
          {singleItem && (
            <GroupedSingleItemContent
              item={singleItem}
              showCloseButton={singleItem.showCloseButton}
            />
          )}
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
      {/* Show button when there are items to expand (pending or completed) */}
      {(data.items.length > 1 || (data.completedItems ?? []).length > 0) && (
        <button
          onClick={onToggle}
          className={buttonVariants({ variant: "outline", size: "xs" })}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

interface ExpandedCardsContainerProps {
  data: GroupedToastData;
  isTop: boolean;
}

/**
 * Container for expanded cards that handles stacking of pending and completed items.
 * Uses flex layout to properly stack cards without needing to know heights.
 * Cards are wrapped in AnimatePresence so they animate out smoothly when removed.
 */
function ExpandedCardsContainer({ data, isTop }: ExpandedCardsContainerProps) {
  const completedCount = (data.completedItems ?? []).length;
  const pendingCount = data.items.length;
  const hasCompletedItems = completedCount > 0;

  // Show pending card when:
  // - There are 2+ pending items (original behavior), OR
  // - There's at least 1 pending item AND completed items exist (so user can see it)
  const hasPendingItems =
    pendingCount > 1 || (pendingCount >= 1 && hasCompletedItems);

  // Don't render if nothing to show
  if (!hasCompletedItems && !hasPendingItems) {
    return null;
  }

  return (
    <div
      data-slot="expanded-cards-container"
      className={cn(
        "absolute w-full",
        isTop ? "top-full mt-2" : "bottom-full mb-2",
        // Flex column with gap, reversed for bottom position
        "flex gap-2",
        isTop ? "flex-col" : "flex-col-reverse",
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {/* Pending items card (closer to summary toast) */}
        {hasPendingItems && (
          <m.div
            key="pending-card"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <GroupedToastCard data={data} isTop={isTop} />
          </m.div>
        )}

        {/* Completed items card (further from summary toast) */}
        {hasCompletedItems && (
          <m.div
            key="completed-card"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <CompletedItemsCard
              items={data.completedItems}
              isTop={isTop}
              dismissDuration={GROUP_ITEM_DISMISS_DURATION}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GroupedToastCardProps {
  data: GroupedToastData;
  isTop: boolean;
}

function GroupedToastCard({ data, isTop }: GroupedToastCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Use native event listeners to stop propagation at the capture phase
  React.useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const stopPropagation = (e: TouchEvent) => {
      e.stopPropagation();
    };

    // Stop all touch events from reaching the toast's swipe handler
    card.addEventListener("touchstart", stopPropagation, { passive: true });
    card.addEventListener("touchmove", stopPropagation, { passive: true });
    card.addEventListener("touchend", stopPropagation, { passive: true });

    return () => {
      card.removeEventListener("touchstart", stopPropagation);
      card.removeEventListener("touchmove", stopPropagation);
      card.removeEventListener("touchend", stopPropagation);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      data-slot="grouped-toast-card"
      data-swipe-ignore
      className={cn(
        "max-h-64 w-full overflow-y-auto overscroll-contain",
        "border-border bg-card text-card-foreground rounded-lg border",
        "shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        isTop ? "slide-in-from-top-2" : "slide-in-from-bottom-2",
      )}
    >
      <AnimatePresence initial={false}>
        {data.items.map((item, index) => (
          <m.div
            key={item.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <GroupedToastCardItem item={item} showSeparator={index > 0} />
          </m.div>
        ))}
      </AnimatePresence>
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
// Completed Items Components (for grouped toasts)
// =============================================================================

interface CompletedItemRowProps {
  item: GroupedToastItem;
  showSeparator: boolean;
  dismissDuration: number;
}

function CompletedItemRow({
  item,
  showSeparator,
  dismissDuration,
}: CompletedItemRowProps) {
  const type = item.type || "success";
  const Icon =
    type !== "default" ? TOAST_ICONS[type as keyof typeof TOAST_ICONS] : null;

  // Calculate CSS custom property for animation duration
  const animationStyle = {
    "--dismiss-duration": `${dismissDuration}ms`,
  } as React.CSSProperties;

  return (
    <>
      {showSeparator && (
        <div
          className="bg-border h-px w-full"
          data-slot="completed-item-separator"
        />
      )}
      <div
        data-slot="completed-item-row"
        className="relative flex items-center gap-3 overflow-hidden px-3.5 py-3 text-sm"
        style={animationStyle}
      >
        {/* Progress bar background (fills left-to-right) */}
        <div
          data-slot="completed-item-progress"
          className={cn(
            "absolute inset-0 origin-left",
            type === "success" && "bg-success/15",
            type === "error" && "bg-danger/15",
            type === "warning" && "bg-warning/15",
            type === "info" && "bg-info/15",
            "animate-[progress-fill_var(--dismiss-duration)_linear_forwards]",
          )}
        />

        {/* Content layer (above progress bar) */}
        <div className="relative z-10 flex w-full items-center gap-3">
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

          {/* Action button on right */}
          {item.action && (
            <button
              onClick={item.action.onClick}
              className={buttonVariants({ variant: "outline", size: "xs" })}
            >
              {item.action.label}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

interface CompletedItemsCardProps {
  items: GroupedToastItem[];
  isTop: boolean;
  dismissDuration: number;
}

function CompletedItemsCard({
  items,
  isTop,
  dismissDuration,
}: CompletedItemsCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Touch event isolation (same pattern as GroupedToastCard)
  React.useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const stopPropagation = (e: TouchEvent) => {
      e.stopPropagation();
    };

    card.addEventListener("touchstart", stopPropagation, { passive: true });
    card.addEventListener("touchmove", stopPropagation, { passive: true });
    card.addEventListener("touchend", stopPropagation, { passive: true });

    return () => {
      card.removeEventListener("touchstart", stopPropagation);
      card.removeEventListener("touchmove", stopPropagation);
      card.removeEventListener("touchend", stopPropagation);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      data-slot="completed-items-card"
      data-swipe-ignore
      className={cn(
        "max-h-48 w-full overflow-y-auto overscroll-contain",
        "border-border bg-card text-card-foreground rounded-lg border",
        "shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        isTop ? "slide-in-from-top-2" : "slide-in-from-bottom-2",
      )}
    >
      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <m.div
            key={item.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <CompletedItemRow
              item={item}
              showSeparator={index > 0}
              dismissDuration={dismissDuration}
            />
          </m.div>
        ))}
      </AnimatePresence>
    </div>
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
