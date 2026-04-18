"use client";

import { Button } from "@/registry/default/button/button";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/registry/default/copy-button/hooks/use-copy-to-clipboard";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

interface CopyButtonProps
  extends Omit<
    React.ComponentProps<typeof Button>,
    "onClick" | "children" | "size" | "variant"
  > {
  content: string;
  timeout?: number;
  copyIcon?: React.ReactNode;
  checkIcon?: React.ReactNode;
}

function CopyButton({
  content,
  timeout = 2000,
  className,
  copyIcon,
  checkIcon,
  ...props
}: CopyButtonProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard(timeout);

  const defaultCopyIcon = (
    <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-4" />
  );
  const defaultCheckIcon = (
    <HugeiconsIcon
      icon={Tick02Icon}
      strokeWidth={2}
      className="size-4 text-green-500"
    />
  );

  return (
    <Button
      data-slot="copy-button"
      size="icon_xs"
      variant="ghost"
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
        {copyIcon ?? defaultCopyIcon}
      </span>

      {/* Check Icon - Enters with scale up and fade in */}
      <span
        aria-hidden="true"
        className={cn(
          "ease flex scale-50 items-center justify-center opacity-0 blur-xs transition-[scale,opacity,filter] delay-0 duration-300 [grid-area:stack]",
          isCopied && "scale-100 opacity-100 blur-none delay-0",
        )}
      >
        {checkIcon ?? defaultCheckIcon}
      </span>
    </Button>
  );
}

export { CopyButton };
