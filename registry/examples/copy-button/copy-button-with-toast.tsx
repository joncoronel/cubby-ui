"use client";

import { CopyButton } from "@/registry/default/copy-button/copy-button";

export default function CopyButtonWithToast() {
  return (
    <div className="flex items-center gap-2">
      <CopyButton content="npm install @cubby-ui/copy-button" toast />
    </div>
  );
}
