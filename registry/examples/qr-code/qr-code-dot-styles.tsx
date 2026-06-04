import { QRCode } from "@/registry/default/qr-code/qr-code";
import type { QRDotStyle } from "@/registry/default/qr-code/qr-code";

const STYLES: QRDotStyle[] = ["square", "circle", "rounded"];

export default function QrCodeDotStyles() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      {STYLES.map((style) => (
        <div key={style} className="flex flex-col items-center gap-3">
          <QRCode
            value="https://cubby-ui.dev"
            dotStyle={style}
            className="text-foreground size-40"
          />
          <span className="text-muted-foreground text-sm capitalize">
            {style}
          </span>
        </div>
      ))}
    </div>
  );
}
