import { FancyButton } from "@/registry/default/fancy-button/fancy-button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
export default function FancyButtonSizes() {
  return (
    <div className="flex flex-col gap-6">
      {/* Text buttons */}
      <div className="flex flex-wrap items-end gap-2">
        <FancyButton size="xs">Extra Small</FancyButton>
        <FancyButton size="sm">Small</FancyButton>
        <FancyButton size="default">Default</FancyButton>
        <FancyButton size="lg">Large</FancyButton>
      </div>

      {/* Icon buttons */}
      <div className="flex flex-wrap items-end gap-2">
        <FancyButton size="icon_xs">
          <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
        </FancyButton>
        <FancyButton size="icon_sm">
          <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
        </FancyButton>
        <FancyButton size="icon">
          <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
        </FancyButton>
        <FancyButton size="icon_lg">
          <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
        </FancyButton>
      </div>

      {/* Text with icons (automatic optical padding adjustment) */}
      <div className="flex flex-wrap items-end gap-2">
        <FancyButton size="xs" leftSection={<HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />}>
          Extra Small
        </FancyButton>
        <FancyButton size="sm" leftSection={<HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />}>
          Small
        </FancyButton>
        <FancyButton size="default" leftSection={<HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />}>
          Default
        </FancyButton>
        <FancyButton size="lg" leftSection={<HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />}>
          Large
        </FancyButton>
      </div>
    </div>
  );
}
