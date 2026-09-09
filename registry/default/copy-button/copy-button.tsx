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
import {
  Cancel01Icon,
  CheckIcon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";

type CopyButtonToastConfig = Omit<AnchoredToastOptions, "anchor">;

const DEFAULT_COPY_ICON = (
  <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-4" />
);
const DEFAULT_CHECK_ICON = (
  <HugeiconsIcon
    icon={CheckIcon}
    strokeWidth={2}
    className="size-4 text-green-500"
  />
);
const DEFAULT_ERROR_ICON = (
  <HugeiconsIcon
    icon={Cancel01Icon}
    strokeWidth={2}
    className="size-4 text-red-500"
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
  errorIcon?: React.ReactNode;
  onCopied?: (text: string) => void;
  onCopyError?: (text: string) => void;
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
  errorIcon,
  onCopied,
  onCopyError,
  toast,
  ref,
  ...props
}: CopyButtonProps) {
  const internalRef = React.useRef<HTMLButtonElement>(null);
  const toastEnabled = Boolean(toast);
  const toastConfig: CopyButtonToastConfig =
    toast === true ? {} : (toast ?? {});

  const { isCopied, isError, copyToClipboard, reset } = useCopyToClipboard({
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
    onCopyError: (text) => {
      onCopyError?.(text);
      if (toastEnabled) {
        toastApi.anchored({
          side: "top",
          sideOffset: 8,
          arrow: true,
          duration: timeout,
          ...toastConfig,
          // The configurable description is the success message — the error
          // toast always states the failure.
          description: "Failed to copy to clipboard",
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

  const button = (
    <Button
      ref={mergedRef}
      data-slot="copy-button"
      size="icon_xs"
      variant="ghost"
      data-copied={isCopied || undefined}
      data-error={isError || undefined}
      disabled={isCopied}
      // Keeps focus on the button through the copied window. Without it the
      // browser blurs a disabled element, so a keyboard user is dropped to
      // <body> the instant their own keypress succeeds. Base UI trades the
      // native `disabled` attribute for aria-disabled to do that, which leaves
      // the element clickable — it blocks the keyboard path itself, and the
      // guard below is the pointer half.
      focusableWhenDisabled
      onClick={() => {
        if (isCopied) return;
        copyToClipboard(content);
      }}
      className={cn(
        "text-muted-foreground size-auto rounded-md p-1.5",
        className,
      )}
      // Deliberately fixed while the state underneath is not. Focus stays here
      // now, so a label that rewrote itself mid-copy would be a second
      // announcement racing the live region below, and which of the two a
      // screen reader reads is up to the screen reader. The label names the
      // control, the region reports the outcome.
      aria-label="Copy to clipboard"
      title={isCopied ? "Copied!" : isError ? "Copy failed" : "Copy"}
      {...props}
    >
      {/* The three icons crossfade in place, so they share one grid cell.
          This wrapper owns that grid rather than styling Button's internal
          content span through `[&>span]`. That span is Button's private DOM,
          and reaching for it is not a theoretical risk: it did not exist until
          the Button redesign added it, so for every release before that one
          `[&>span]` matched these three icons themselves and stacked nothing —
          they sat side by side, two of them invisible but still taking width.
          The selector did not break, it silently changed which element it
          meant, in both directions, unnoticed.

          `grid-template-areas` on the Button root was inert throughout: the
          root is `inline-flex`, so it is not a grid. Declaring the area here
          is what lets `[grid-area:stack]` below resolve by name rather than
          through the implicit-line fallback it has been leaning on. */}
      <span
        data-slot="copy-button-stack"
        className="grid place-items-center [grid-template-areas:'stack']"
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center blur-none transition-[scale,opacity,filter] duration-300 [grid-area:stack]",
            (isCopied || isError) && "scale-50 opacity-0 blur-xs",
          )}
        >
          {copyIcon ?? DEFAULT_COPY_ICON}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "flex scale-50 items-center justify-center opacity-0 blur-xs transition-[scale,opacity,filter] duration-300 [grid-area:stack]",
            isCopied && "scale-100 opacity-100 blur-none",
          )}
        >
          {checkIcon ?? DEFAULT_CHECK_ICON}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "flex scale-50 items-center justify-center opacity-0 blur-xs transition-[scale,opacity,filter] duration-300 [grid-area:stack]",
            isError && "scale-100 opacity-100 blur-none",
          )}
        >
          {errorIcon ?? DEFAULT_ERROR_ICON}
        </span>
      </span>
    </Button>
  );

  // The icons are aria-hidden and the label is fixed, so this is the only
  // thing that reports the outcome. Two rules govern where it can live.
  //
  // Mounted for the whole life of the button, never conditionally rendered
  // around the result: a region that arrives already holding its text is not a
  // change, and screen readers announce the change.
  //
  // And a SIBLING of the button, not a child. `role="button"` is Children
  // Presentational, so a conforming reader prunes the semantics of everything
  // inside it — a live region in there is not a live region. This is why the
  // fixed `aria-label` above is safe: the region genuinely does the reporting.
  //
  // Suppressed entirely when a toast is attached, which says the same words out
  // loud on its own.
  //
  // `display: contents` rather than a bare fragment, so the component still
  // resolves to one element for anything that counts them — `Children.only`,
  // a `render` prop, `:only-child`, `> * + *`. It adds no box, so it creates no
  // containing block and the absolutely-positioned floating variant in
  // CodeBlock still resolves against the same ancestor it did before.
  return (
    <span className="contents">
      {button}
      {!toastEnabled && (
        <span role="status" className="sr-only">
          {isCopied
            ? "Copied to clipboard"
            : isError
              ? "Failed to copy to clipboard. Copy it manually."
              : ""}
        </span>
      )}
    </span>
  );
}

export { CopyButton };
