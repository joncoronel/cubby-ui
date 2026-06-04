"use client";

import * as React from "react";
import { QRCode } from "@/registry/default/qr-code/qr-code";
import type { QRCodeHandle, QRDataURLType } from "@/registry/default/qr-code/qr-code";
import { Button } from "@/registry/default/button/button";

const FORMATS: QRDataURLType[] = ["png", "jpeg", "svg"];

export default function QrCodeDownload() {
  const ref = React.useRef<QRCodeHandle>(null);

  async function download(type: QRDataURLType) {
    const url = await ref.current?.toDataURL({ type, pixelSize: 1024 });
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-code.${type === "jpeg" ? "jpg" : type}`;
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <QRCode
        ref={ref}
        value="https://cubby-ui.dev"
        dotStyle="rounded"
        background="#ffffff"
        foreground="#0a0a0a"
        className="size-44 rounded-xl"
      />
      <div className="flex gap-2">
        {FORMATS.map((format) => (
          <Button
            key={format}
            variant="outline"
            size="sm"
            onClick={() => download(format)}
          >
            {format.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );
}
