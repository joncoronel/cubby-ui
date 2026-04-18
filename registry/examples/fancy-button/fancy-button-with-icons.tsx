import { FancyButton } from "@/registry/default/fancy-button/fancy-button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Download01Icon,
  FavouriteIcon,
  PlusSignIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
export default function FancyButtonWithIcons() {
  return (
    <div className="flex flex-col gap-6">
      {/* Icon only buttons */}
      <div className="flex items-center gap-4">
        <FancyButton size="icon">
          <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
        </FancyButton>

        <FancyButton size="icon" color="#3b82f6">
          <HugeiconsIcon icon={Settings01Icon}  strokeWidth={2} />
        </FancyButton>
      </div>

      {/* Text with leading icons (with optical padding) */}
      <div className="flex items-center gap-4">
        <FancyButton leftSection={<HugeiconsIcon icon={Download01Icon}  strokeWidth={2} />}>Download</FancyButton>

        <FancyButton leftSection={<HugeiconsIcon icon={FavouriteIcon}  strokeWidth={2} />} color="#ef4444">
          Favorite
        </FancyButton>
      </div>

      {/* Text with trailing icons (with optical padding) */}
      <div className="flex items-center gap-4">
        <FancyButton rightSection={<HugeiconsIcon icon={ArrowRight01Icon}  strokeWidth={2} />}>Continue</FancyButton>

        <FancyButton rightSection={<HugeiconsIcon icon={ArrowRight01Icon}  strokeWidth={2} />} color="#8b5cf6">
          Next Step
        </FancyButton>
      </div>
    </div>
  );
}
