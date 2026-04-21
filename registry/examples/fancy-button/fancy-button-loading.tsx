import { FancyButton } from "@/registry/default/fancy-button/fancy-button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
export default function FancyButtonLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Loading states with text */}
      <div className="flex items-center gap-4">
        <FancyButton
          disabled
          leftSection={<HugeiconsIcon icon={Loading03Icon} className="animate-spin"  strokeWidth={2} />}
        >
          Loading...
        </FancyButton>

        <FancyButton
          disabled
          leftSection={<HugeiconsIcon icon={Loading03Icon} className="animate-spin"  strokeWidth={2} />}
          color="#3b82f6"
        >
          Processing...
        </FancyButton>
      </div>

      {/* Icon only loading */}
      <div className="flex items-center gap-4">
        <FancyButton size="icon" disabled>
          <HugeiconsIcon icon={Loading03Icon} className="animate-spin"  strokeWidth={2} />
        </FancyButton>

        <FancyButton size="icon" disabled color="#10b981">
          <HugeiconsIcon icon={Loading03Icon} className="animate-spin"  strokeWidth={2} />
        </FancyButton>
      </div>
    </div>
  );
}
