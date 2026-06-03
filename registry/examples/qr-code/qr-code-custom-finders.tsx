import { QRCode } from "@/registry/default/qr-code/qr-code";

export default function QrCodeCustomFinders() {
  return (
    <QRCode
      value="https://cubby-ui.dev"
      dotStyle="rounded"
      foreground="#6d28d9"
      background="#faf5ff"
      finder={{
        outerStyle: "rounded",
        outerColor: "#6d28d9",
        innerStyle: "circle",
        innerColor: "#db2777",
      }}
      className="size-48 rounded-xl"
    />
  );
}
