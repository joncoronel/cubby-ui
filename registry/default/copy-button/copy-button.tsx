"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/registry/default/copy-button/hooks/use-copy-to-clipboard";
import {
  toast as toastApi,
  type AnchoredToastOptions,
} from "@/registry/default/toast/toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

type CopyButtonToastConfig = Omit<AnchoredToastOptions, "anchor">;

const DEFAULT_COPY_ICON = (
  <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-4" />
);
const DEFAULT_CHECK_ICON = (
  <HugeiconsIcon
    icon={Tick02Icon}
    strokeWidth={2}
    className="size-4 text-green-500"
  />
);

interface CopyButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "children" | "size" | "variant"
> {
  content: string;
  timeout?: number;
  copyIcon?: React.ReactNode;
  checkIcon?: React.ReactNode;
  onCopied?: (text: string) => void;
  /**
   * Show an anchored toast above the button on successful copy.
   * Pass `true` for defaults, or an options object to customize the toast.
   */
  toast?: true | CopyButtonToastConfig;
}

function CopyButton({
  content,
  timeout = 2000,
  className,
  copyIcon,
  checkIcon,
  onCopied,
  toast,
  ref,
  ...props
}: CopyButtonProps) {
  const internalRef = React.useRef<HTMLButtonElement>(null);
  const toastEnabled = Boolean(toast);
  const toastConfig: CopyButtonToastConfig = toast === true ? {} : (toast ?? {});

  const { isCopied, copyToClipboard, reset } = useCopyToClipboard({
    // When an anchored toast is attached, the toast's lifecycle owns the
    // reset via `onClose` — so disable the hook's internal auto-reset.
    timeout: toastEnabled ? null : timeout,
    onCopied: (text) => {
      onCopied?.(text);
      if (toastEnabled) {
        toastApi.anchored({
          description: "Copied to clipboard!",
          side: "top",
          sideOffset: 8,
          arrow: true,
          duration: timeout,
          ...toastConfig,
          anchor: internalRef,
          onClose: () => {
            reset();
            toastConfig.onClose?.();
          },
        });
      }
    },
  });

  const mergedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  return (
    <Button
      ref={mergedRef}
      data-slot="copy-button"
      size="icon_xs"
      variant="ghost"
      disabled={isCopied}
      onClick={() => copyToClipboard(content)}
      className={cn(
        "text-muted-foreground size-auto rounded-md p-1.5 [grid-template-areas:'stack'] [&>span]:grid [&>span]:place-content-center [&>span]:p-0",
        className,
      )}
      aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
      title={isCopied ? "Copied!" : "Copy"}
      {...props}
    >
      {/* Copy Icon - Exits with scale down, fade, and blur */}
      <span
        aria-hidden="true"
        className={cn(
          "ease flex items-center justify-center blur-none transition-[scale,opacity,filter] delay-0 duration-300 [grid-area:stack]",
          isCopied && "scale-50 opacity-0 blur-xs delay-0",
        )}
      >
        {copyIcon ?? DEFAULT_COPY_ICON}
      </span>

      {/* Check Icon - Enters with scale up and fade in */}
      <span
        aria-hidden="true"
        className={cn(
          "ease flex scale-50 items-center justify-center opacity-0 blur-xs transition-[scale,opacity,filter] delay-0 duration-300 [grid-area:stack]",
          isCopied && "scale-100 opacity-100 blur-none delay-0",
        )}
      >
        {checkIcon ?? DEFAULT_CHECK_ICON}
      </span>
    </Button>
  );
}

export { CopyButton };
