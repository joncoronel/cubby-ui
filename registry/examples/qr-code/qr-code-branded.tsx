import { QRCode } from "@/registry/default/qr-code/qr-code";

const LOGO =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
       <rect width="100" height="100" rx="24" fill="#4f46e5"/>
       <path d="M30 64V36h12a14 14 0 1 1 0 28z" fill="none" stroke="#ffffff"
             stroke-width="9" stroke-linecap="round"/>
     </svg>`,
  );

export default function QrCodeBranded() {
  return (
    <QRCode
      value="https://cubby-ui.dev"
      dotStyle="rounded"
      foreground="#4f46e5"
      background="#ffffff"
      finder={{
        outerStyle: "rounded",
        outerColor: "#4f46e5",
        innerStyle: "circle",
        innerColor: "#0ea5e9",
      }}
      logo={{ src: LOGO, alt: "Cubby UI" }}
      logoSize={0.22}
      className="size-56 rounded-2xl shadow-sm"
    />
  );
}
