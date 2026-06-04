import { QRCode } from "@/registry/default/qr-code/qr-code";

// A self-contained SVG logo as a data URI (no external asset required).
const LOGO =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
       <rect width="100" height="100" rx="22" fill="#0a0a0a"/>
       <text x="50" y="70" font-size="60" font-family="sans-serif" font-weight="700"
             fill="#ffffff" text-anchor="middle">C</text>
     </svg>`,
  );

export default function QrCodeWithLogo() {
  return (
    <QRCode
      value="https://cubby-ui.dev"
      dotStyle="rounded"
      background="#ffffff"
      foreground="#0a0a0a"
      logo={{ src: LOGO, alt: "Cubby UI" }}
      logoSize={0.24}
      className="size-48 rounded-xl"
    />
  );
}
