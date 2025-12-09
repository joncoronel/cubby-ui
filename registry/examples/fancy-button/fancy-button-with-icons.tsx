import { FancyButton } from "@/registry/default/fancy-button/fancy-button";
import { Plus, Heart, Settings, Download, ArrowRight } from "lucide-react";

export default function FancyButtonWithIcons() {
  return (
    <div className="flex flex-col gap-6">
      {/* Icon only buttons */}
      <div className="flex items-center gap-4">
        <FancyButton size="icon">
          <Plus />
        </FancyButton>

        <FancyButton size="icon" color="#3b82f6">
          <Settings />
        </FancyButton>
      </div>

      {/* Text with leading icons (with optical padding) */}
      <div className="flex items-center gap-4">
        <FancyButton leftSection={<Download />}>Download</FancyButton>

        <FancyButton leftSection={<Heart />} color="#ef4444">
          Favorite
        </FancyButton>
      </div>

      {/* Text with trailing icons (with optical padding) */}
      <div className="flex items-center gap-4">
        <FancyButton rightSection={<ArrowRight />}>Continue</FancyButton>

        <FancyButton rightSection={<ArrowRight />} color="#8b5cf6">
          Next Step
        </FancyButton>
      </div>
    </div>
  );
}
