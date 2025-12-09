import { PreviewCard, PreviewCardTrigger, PreviewCardContent } from "@/registry/default/preview-card/preview-card";

export default function PreviewCardTextTrigger() {
  return (
    <PreviewCard>
      <PreviewCardTrigger>
        <span className="text-purple-600 hover:underline cursor-pointer">
          Hover for more info
        </span>
      </PreviewCardTrigger>
      <PreviewCardContent>
        <div className="p-4">
          <p className="text-sm">
            Preview cards work great with text triggers for showing
            additional context.
          </p>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  );
}