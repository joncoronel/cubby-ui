import { QRCode } from "@/registry/default/qr-code/qr-code";
import { CubbyUILogo } from "@/components/cubbyui-logo";

/**
 * The QR code dressed as a brand mark: the Cubby logo in the knocked-out
 * centre (error correction rises on its own to keep it scannable), rounded
 * modules, rounded finders with Cubby Blue eyes. Dark on a white plate in
 * both themes, since that's what scanners read most reliably.
 */
export function QrLogoDemo() {
  return (
    <QRCode
      value="https://cubby-ui.dev"
      dotStyle="rounded"
      foreground="oklch(0.2 0.004 270)"
      background="#ffffff"
      finder={{
        outerStyle: "rounded",
        innerStyle: "circle",
        innerColor: "oklch(0.55 0.2 250)",
      }}
      logo={
        <CubbyUILogo className="h-auto w-full text-[oklch(0.2_0.004_270)]" />
      }
      logoSize={0.3}
      title="Cubby UI"
      className="size-44 rounded-2xl shadow-[0_0_0_1px_oklch(0_0_0/0.06),0_4px_12px_-4px_oklch(0_0_0/0.12)]"
    />
  );
}
