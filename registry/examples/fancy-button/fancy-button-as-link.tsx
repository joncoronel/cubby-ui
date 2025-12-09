import Link from "next/link";
import { FancyButton } from "@/registry/default/fancy-button/fancy-button";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function FancyButtonAsLink() {
  return (
    <div className="flex flex-wrap gap-4">
      <FancyButton
        render={<Link href="/" />}
        rightSection={<ArrowRight />}
        nativeButton={false}
      >
        Home
      </FancyButton>

      <FancyButton
        nativeButton={false}
        render={<Link href="https://example.com" target="_blank" />}
        color="oklch(0.7 0.2 250)"
        rightSection={<ExternalLink />}
      >
        External Link
      </FancyButton>
    </div>
  );
}
