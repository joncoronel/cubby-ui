"use client";

import * as React from "react";
import { toast } from "@/registry/default/toast/toast";
import { CopyButton } from "@/registry/default/copy-button/copy-button";

export default function ToastAnchored() {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapperRef}
      className="inline-block"
      onClickCapture={() => {
        toast.anchored({
          description: "Copied to clipboard!",
          anchor: wrapperRef,
          side: "top",
          sideOffset: 8,
          arrow: true,
          duration: 2000,
        });
      }}
    >
      <CopyButton content="npm install @cubby-ui/toast" />
    </div>
  );
}
