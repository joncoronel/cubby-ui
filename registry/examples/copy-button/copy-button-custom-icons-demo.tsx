"use client";

import { CopyButton } from "@/registry/default/copy-button/copy-button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy02Icon, TickDouble01Icon } from "@hugeicons/core-free-icons";

export default function CopyButtonCustomIconsDemo() {
  return (
    <div className="flex items-center gap-4">
      <CopyButton
        content="Text copied to clipboard!"
        copyIcon={
          <HugeiconsIcon icon={Copy02Icon} strokeWidth={2} className="size-4" />
        }
        checkIcon={
          <HugeiconsIcon
            icon={TickDouble01Icon}
            strokeWidth={2}
            className="size-4 text-green-500"
          />
        }
      />
    </div>
  );
}
