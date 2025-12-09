import { FancyButton } from "@/registry/default/fancy-button/fancy-button";
import { Loader2 } from "lucide-react";

export default function FancyButtonLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Loading states with text */}
      <div className="flex items-center gap-4">
        <FancyButton
          disabled
          leftSection={<Loader2 className="animate-spin" />}
        >
          Loading...
        </FancyButton>

        <FancyButton
          disabled
          leftSection={<Loader2 className="animate-spin" />}
          color="#3b82f6"
        >
          Processing...
        </FancyButton>
      </div>

      {/* Icon only loading */}
      <div className="flex items-center gap-4">
        <FancyButton size="icon" disabled>
          <Loader2 className="animate-spin" />
        </FancyButton>

        <FancyButton size="icon" disabled color="#10b981">
          <Loader2 className="animate-spin" />
        </FancyButton>
      </div>
    </div>
  );
}
