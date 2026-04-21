import Link from "next/link";
import { FancyButton } from "@/registry/default/fancy-button/fancy-button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
export default function FancyButtonAsLink() {
  return (
    <div className="flex flex-wrap gap-4">
      <FancyButton
        render={<Link href="/" />}
        rightSection={<HugeiconsIcon icon={ArrowRight01Icon}  strokeWidth={2} />}
        nativeButton={false}
      >
        Home
      </FancyButton>

      <FancyButton
        nativeButton={false}
        render={<Link href="https://example.com" target="_blank" />}
        color="oklch(0.7 0.2 250)"
        rightSection={<HugeiconsIcon icon={LinkSquare02Icon}  strokeWidth={2} />}
      >
        External Link
      </FancyButton>
    </div>
  );
}
