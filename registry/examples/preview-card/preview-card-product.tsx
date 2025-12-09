import { PreviewCard, PreviewCardTrigger, PreviewCardContent } from "@/registry/default/preview-card/preview-card";

export default function PreviewCardProduct() {
  return (
    <PreviewCard>
      <PreviewCardTrigger>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary hover:bg-secondary/80 cursor-pointer">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded" />
          <span className="font-medium">Design System</span>
        </div>
      </PreviewCardTrigger>
      <PreviewCardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DS</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Design System</h3>
              <p className="text-sm text-muted-foreground">
                Component Library
              </p>
            </div>
          </div>
          <p className="text-sm">
            A comprehensive design system with reusable components, design
            tokens, and guidelines.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Active
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Last updated 2 days ago
            </span>
          </div>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  );
}