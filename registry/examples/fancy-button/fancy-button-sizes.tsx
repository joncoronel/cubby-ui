import { FancyButton } from "@/registry/default/fancy-button/fancy-button";
import { Plus } from "lucide-react";

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
          <Plus />
        </FancyButton>
        <FancyButton size="icon_sm">
          <Plus />
        </FancyButton>
        <FancyButton size="icon">
          <Plus />
        </FancyButton>
        <FancyButton size="icon_lg">
          <Plus />
        </FancyButton>
      </div>

      {/* Text with icons (automatic optical padding adjustment) */}
      <div className="flex flex-wrap items-end gap-2">
        <FancyButton size="xs" leftSection={<Plus />}>
          Extra Small
        </FancyButton>
        <FancyButton size="sm" leftSection={<Plus />}>
          Small
        </FancyButton>
        <FancyButton size="default" leftSection={<Plus />}>
          Default
        </FancyButton>
        <FancyButton size="lg" leftSection={<Plus />}>
          Large
        </FancyButton>
      </div>
    </div>
  );
}
