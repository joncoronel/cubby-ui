"use client";

import { CopyButton } from "@/registry/default/copy-button/copy-button";

export default function CopyButtonDemo() {
  const textToCopy = "npm install @base-ui/react";

  return (
    <div className="flex items-center gap-2">
      <CopyButton content={textToCopy} />
    </div>
  );
}
