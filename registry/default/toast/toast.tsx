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
}

export interface AnchoredToastOptions<TData extends object = object>
  extends Omit<ToastOptions<TData>, "type"> {
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
    ...(options.data && { data: options.data }),
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
    <Toast.Provider
      limit={limit}
      timeout={timeout}
      toastManager={toastManager}
    >
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
  const type = toast.type || "default";

  // Check if this is a custom JSX toast
  const hasCustomJSX =
    toast.data &&
    typeof toast.data === "object" &&
    "customJSX" in toast.data;

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
          "flex items-start gap-3 overflow-hidden px-3.5 py-3 text-sm",
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
                className="[&>svg]:size-4 [&>svg]:shrink-0"
              >
                <Icon
                  className={cn(
                    "in-data-[type=success]:text-success-foreground",
                    "in-data-[type=error]:text-danger-foreground",
                    "in-data-[type=warning]:text-warning-foreground",
                    "in-data-[type=info]:text-info-foreground",
                    "in-data-[type=loading]:animate-spin in-data-[type=loading]:text-muted-foreground",
                  )}
                />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Toast.Title
                data-slot="toast-title"
                className="text-sm font-medium leading-5"
              />
              <Toast.Description
                data-slot="toast-description"
                className="text-sm leading-5 text-muted-foreground"
              />
            </div>
            <Toast.Action
              data-slot="toast-action"
              className={buttonVariants({ variant: "outline", size: "xs" })}
            />
            <Toast.Close
              data-slot="toast-close"
              className="-mr-1 -mt-1 flex size-6 shrink-0 items-center justify-center rounded-md border-none bg-transparent text-muted-foreground transition-colors duration-200 hover:bg-accent/50 hover:text-foreground"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </Toast.Close>
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
          "border border-border bg-card text-card-foreground",
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
          <Toast.Title data-slot="toast-title" className="text-sm font-medium" />
          <Toast.Description
            data-slot="toast-description"
            className="text-sm text-muted-foreground"
          />
        </Toast.Content>
      </Toast.Root>
    </Toast.Positioner>
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
