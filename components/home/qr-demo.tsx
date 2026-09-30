"use client";

import * as React from "react";
import { QRCode } from "@/registry/default/qr-code/qr-code";
import { Input } from "@/registry/default/input/input";

/** Type anything and the code redraws as you go. */
export function QrDemo() {
  const [value, setValue] = React.useState("https://cubby-ui.dev");

  return (
    <div className="flex w-full max-w-[15rem] flex-col items-center gap-4">
      <QRCode
        value={value || " "}
        dotStyle="rounded"
        className="text-foreground size-36"
      />
      <Input
        aria-label="Text to encode"
        value={value}
        // Well inside what a QR code can hold: past its capacity the encoder
        // throws, which took the page down.
        maxLength={200}
        onChange={(e) => setValue(e.target.value)}
        className="text-center"
      />
    </div>
  );
}
