"use client";

import * as React from "react";
import { Toast } from "@base-ui-components/react/toast";
import { clsx } from "clsx";

export interface ToastOptions<TData = unknown> {
  title?: string;
  description?: string; // Made optional to support JSX-only toasts
  type?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
  priority?: "low" | "high"; // Priority support from Base UI
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: TData; // Custom data support
  onClose?: () => void; // Lifecycle callback
  onRemove?: () => void; // Lifecycle callback
}

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: unknown; // Custom data that can be used in rendering logic
}

// Global toast manager instance
let toastManagerInstance: ReturnType<typeof Toast.useToastManager> | null =
  null;

const setToastManager = (manager: ReturnType<typeof Toast.useToastManager>) => {
  toastManagerInstance = manager;
};

// Overloaded function signatures for JSX support
function baseToast(jsx: React.ReactElement): string | undefined;
function baseToast<TData = unknown>(
  jsx: React.ReactElement,
  options: Omit<ToastOptions<TData>, "title" | "description">,
): string | undefined;
function baseToast<TData = unknown>(
  options: ToastOptions<TData>,
): string | undefined;

function baseToast<TData = unknown>(
  optionsOrJSX: ToastOptions<TData> | React.ReactElement,
  jsxOptions?: Omit<ToastOptions<TData>, "title" | "description">,
): string | undefined {
  if (!toastManagerInstance) {
    console.error(
      "Toast manager not initialized. Make sure ToastProvider is wrapping your app.",
    );
    return;
  }

  // Handle JSX element passed directly (with optional options)
  if (React.isValidElement(optionsOrJSX)) {
    return toastManagerInstance.add({
      title: "", // Empty title for JSX toasts
      description: "", // Empty description - JSX will be rendered as custom content
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
        ...(jsxOptions?.data && jsxOptions.data), // Merge any additional data
      },
      ...(jsxOptions?.onClose && { onClose: jsxOptions.onClose }),
      ...(jsxOptions?.onRemove && { onRemove: jsxOptions.onRemove }),
    });
  }

  // Handle options object
  const options = optionsOrJSX as ToastOptions<TData>;
  return toastManagerInstance.add({
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
    ...(options.data && { data: options.data }), // Pass custom data
    ...(options.onClose && { onClose: options.onClose }),
    ...(options.onRemove && { onRemove: options.onRemove }),
  });
}

const promise = async <T,>(
  promiseToResolve: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
) => {
  if (!toastManagerInstance) {
    console.error(
      "Toast manager not initialized. Make sure ToastProvider is wrapping your app.",
    );
    return;
  }

  return toastManagerInstance.promise(promiseToResolve, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};

// Create the toast object with methods like Sonner
export const toast = Object.assign(baseToast, {
  success: <TData = unknown,>(
    optionsOrJSX: Omit<ToastOptions<TData>, "type"> | React.ReactElement,
    jsxOptions?: Omit<ToastOptions<TData>, "title" | "description" | "type">,
  ) => {
    if (React.isValidElement(optionsOrJSX)) {
      return baseToast(optionsOrJSX, { ...jsxOptions, type: "success" });
    }
    const options = optionsOrJSX as Omit<ToastOptions<TData>, "type">;
    return baseToast({ ...options, type: "success" });
  },
  error: <TData = unknown,>(
    optionsOrJSX: Omit<ToastOptions<TData>, "type"> | React.ReactElement,
    jsxOptions?: Omit<ToastOptions<TData>, "title" | "description" | "type">,
  ) => {
    if (React.isValidElement(optionsOrJSX)) {
      return baseToast(optionsOrJSX, { ...jsxOptions, type: "error" });
    }
    const options = optionsOrJSX as Omit<ToastOptions<TData>, "type">;
    return baseToast({ ...options, type: "error" });
  },
  warning: <TData = unknown,>(
    optionsOrJSX: Omit<ToastOptions<TData>, "type"> | React.ReactElement,
    jsxOptions?: Omit<ToastOptions<TData>, "title" | "description" | "type">,
  ) => {
    if (React.isValidElement(optionsOrJSX)) {
      return baseToast(optionsOrJSX, { ...jsxOptions, type: "warning" });
    }
    const options = optionsOrJSX as Omit<ToastOptions<TData>, "type">;
    return baseToast({ ...options, type: "warning" });
  },
  info: <TData = unknown,>(
    optionsOrJSX: Omit<ToastOptions<TData>, "type"> | React.ReactElement,
    jsxOptions?: Omit<ToastOptions<TData>, "title" | "description" | "type">,
  ) => {
    if (React.isValidElement(optionsOrJSX)) {
      return baseToast(optionsOrJSX, { ...jsxOptions, type: "info" });
    }
    const options = optionsOrJSX as Omit<ToastOptions<TData>, "type">;
    return baseToast({ ...options, type: "info" });
  },
  promise,
  dismiss: (toastId: string) => {
    if (!toastManagerInstance) {
      console.error(
        "Toast manager not initialized. Make sure ToastProvider is wrapping your app.",
      );
      return;
    }
    return toastManagerInstance.close(toastId);
  },
  update: (toastId: string, options: Partial<ToastOptions>) => {
    if (!toastManagerInstance) {
      console.error(
        "Toast manager not initialized. Make sure ToastProvider is wrapping your app.",
      );
      return;
    }
    // Extract only the properties that Base UI's update method expects
    const updateOptions: Record<string, unknown> = {};
    if (options.title !== undefined) updateOptions.title = options.title;
    if (options.description !== undefined)
      updateOptions.description = options.description;
    if (options.type !== undefined) updateOptions.type = options.type;
    if (options.data !== undefined) updateOptions.data = options.data;

    return toastManagerInstance.update(toastId, updateOptions);
  },
  custom: <TData = unknown,>(options: ToastOptions<TData>) =>
    baseToast(options), // Explicit custom method for clarity
});

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
  limit?: number; // Maximum number of toasts (default: 3)
  timeout?: number; // Default timeout for toasts in ms (default: 5000)
  toastManager?: ReturnType<typeof Toast.createToastManager>; // Global toast manager
  container?: HTMLElement | React.RefObject<HTMLElement | null> | null; // Portal container
}

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "fixed top-[1rem] left-[1rem] bottom-auto right-auto",
  "top-center": "fixed top-[1rem] left-0 right-0 bottom-auto mx-auto",
  "top-right": "fixed top-[1rem] right-[1rem] bottom-auto left-auto",
  "bottom-left": "fixed bottom-[1rem] left-[1rem] top-auto right-auto",
  "bottom-center": "fixed bottom-[1rem] left-0 right-0 top-auto mx-auto",
  "bottom-right": "fixed bottom-[1rem] right-[1rem] top-auto left-auto",
};

export function ToastProvider({
  children,
  position = "bottom-right",
  limit = 3,
  timeout = 5000,
  toastManager,
  container,
}: ToastProviderProps) {
  return (
    <Toast.Provider limit={limit} timeout={timeout} toastManager={toastManager}>
      {children}
      <Toast.Portal container={container}>
        <Toast.Viewport
          className={clsx(
            positionClasses[position],
            "flex w-[250px] max-w-[calc(100vw-2rem)] sm:w-[300px]",
          )}
          data-position={position}
        >
          <ToastList position={position} />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList({ position }: { position: ToastPosition }) {
  const toastManager = Toast.useToastManager();
  const { toasts } = toastManager;

  // Initialize the global toast manager
  React.useEffect(() => {
    setToastManager(toastManager);
  }, [toastManager]);

  const isTop = position.startsWith("top");

  // Determine swipe directions based on position
  let swipeDirection:
    | ("up" | "down" | "left" | "right")
    | ("up" | "down" | "left" | "right")[];

  switch (position) {
    case "top-left":
      swipeDirection = ["left", "up"]; // Can swipe left or up
      break;
    case "top-center":
      swipeDirection = "up"; // Only swipe up
      break;
    case "top-right":
      swipeDirection = ["right", "up"]; // Can swipe right or up
      break;
    case "bottom-left":
      swipeDirection = ["left", "down"]; // Can swipe left or down
      break;
    case "bottom-center":
      swipeDirection = "down"; // Only swipe down
      break;
    case "bottom-right":
      swipeDirection = ["right", "down"]; // Can swipe right or down (default)
      break;
    default:
      swipeDirection = ["right", "down"];
  }

  return toasts.map((toast) => {
    const toastData = toast as ToastData;
    const type = toastData.type || "default";

    // Check if this is a custom JSX toast
    const hasCustomJSX =
      toastData.data &&
      typeof toastData.data === "object" &&
      "customJSX" in toastData.data;

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        swipeDirection={swipeDirection}
        className={clsx(
          // CSS variables
          "[--gap:0.75rem] [--peek:0.75rem]",
          "[--scale:calc(max(0,1-(var(--toast-index)*0.1)))]",
          "[--shrink:calc(1-var(--scale))]",
          "[--height:var(--toast-frontmost-height,var(--toast-height))]",
          isTop
            ? "[--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]"
            : "[--offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
          // Position
          "absolute z-[calc(1000-var(--toast-index))] w-full",
          isTop ? "top-0 right-0 left-0" : "right-0 bottom-0 left-0",
          isTop ? "origin-top" : "origin-bottom",
          // Default transform
          isTop
            ? "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]"
            : "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
          // Visual styles
          "rounded-md border bg-clip-padding p-4 shadow-[0_6px_20px_0_oklch(0.18_0_0_/_0.12)] select-none",
          "border-border/70",
          // After element for spacing
          'after:absolute after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[""]',
          isTop ? "after:bottom-full" : "after:top-full",
          // Opacity
          "data-[ending-style]:opacity-0",
          // Expanded state
          "data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))]",
          "data-[limited]:opacity-0",
          // Starting animation
          isTop
            ? "data-[starting-style]:[transform:translateY(-150%)]"
            : "data-[starting-style]:[transform:translateY(150%)]",
          // Default ending (X button - no swipe)
          isTop
            ? "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]"
            : "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
          // Swipe endings
          "data-[ending-style]:data-[swipe-direction=down]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+150%))]",
          "data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+150%))]",
          "data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
          "data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
          "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
          "data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
          "data-[ending-style]:data-[swipe-direction=up]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-150%))]",
          "data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-150%))]",
          // Height
          "h-[var(--height)]",
          "data-[expanded]:h-[var(--toast-height)]",
          // Transitions
          "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
          // Type-based colors
          {
            "border-border bg-card text-card-foreground": type === "default",
            "border-success-border bg-success text-success-foreground":
              type === "success",
            "border-danger-border bg-danger text-danger-foreground":
              type === "error",
            "border-warning-border bg-warning text-warning-foreground":
              type === "warning",
            "border-info-border bg-info text-info-foreground": type === "info",
          },
        )}
      >
        <Toast.Content
          className={clsx(
            "overflow-hidden transition-opacity duration-[250ms]",
            "data-[behind]:opacity-0 data-[expanded]:opacity-100",
          )}
        >
          {hasCustomJSX ? (
            // Render custom JSX content
            <div className="w-full">
              {hasCustomJSX &&
              toastData.data &&
              typeof toastData.data === "object" &&
              "customJSX" in toastData.data
                ? (toastData.data as Record<string, React.ReactNode>).customJSX
                : null}
            </div>
          ) : (
            // Render standard toast content
            <>
              <Toast.Title className="text-[0.975rem] leading-5 font-medium" />
              <Toast.Description className="text-[0.925rem] leading-5 text-gray-700 dark:text-gray-300" />
              <Toast.Action className="ml-auto cursor-pointer text-xs font-medium underline-offset-2 hover:underline" />
              <Toast.Close
                className="text-muted-foreground hover:bg-accent/50 hover:text-foreground absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-md border-none bg-transparent transition-colors duration-200"
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
              </Toast.Close>
            </>
          )}
        </Toast.Content>
      </Toast.Root>
    );
  });
}

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

export { Toast };
