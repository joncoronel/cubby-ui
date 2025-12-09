import { PreviewCard, PreviewCardTrigger, PreviewCardContent } from "@/registry/default/preview-card/preview-card";

export default function PreviewCardSimple() {
  return (
    <PreviewCard>
      <PreviewCardTrigger>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me
        </button>
      </PreviewCardTrigger>
      <PreviewCardContent>
        <div className="p-4">
          <h3 className="font-semibold mb-2">Preview Title</h3>
          <p className="text-sm text-muted-foreground">
            This is a simple preview card that appears when you hover over
            the trigger.
          </p>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  );
}