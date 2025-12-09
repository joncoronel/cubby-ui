import { FancyButton } from "@/registry/default/fancy-button/fancy-button";

export default function FancyButtonCustomColors() {
  return (
    <div className="flex flex-col gap-6">
      {/* Default variant with colors */}
      <div className="flex flex-wrap items-center gap-4">
        <FancyButton color="#3b82f6">Blue</FancyButton>
        <FancyButton color="#10b981">Green</FancyButton>
        <FancyButton color="#E36323">Orange</FancyButton>
        <FancyButton color="#ef4444">Red</FancyButton>
        <FancyButton color="#8b5cf6">Purple</FancyButton>
      </div>
    </div>
  );
}
