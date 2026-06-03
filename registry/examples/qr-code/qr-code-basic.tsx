import { QRCode } from "@/registry/default/qr-code/qr-code";

export default function QrCodeBasic() {
  return (
    <QRCode
      value="https://cubby-ui.dev"
      className="text-foreground size-48"
    />
  );
}
