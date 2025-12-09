import { FancyButton } from "@/registry/default/fancy-button/fancy-button";

export default function FancyButtonDisabled() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <FancyButton variant="default">Default</FancyButton>
      </div>

      <div className="flex items-center gap-4">
        <FancyButton variant="default" disabled>
          Default Disabled
        </FancyButton>
      </div>
    </div>
  );
}
