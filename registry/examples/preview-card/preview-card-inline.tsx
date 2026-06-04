import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
} from "@/registry/default/preview-card/preview-card";

export default function PreviewCardInline() {
  return (
    <p className="text-foreground max-w-72 text-sm leading-7">
      The framework was first announced at a small developer conference and
      grew out of work on{" "}
      <PreviewCard>
        <PreviewCardTrigger className="text-primary decoration-primary/40 hover:decoration-primary cursor-pointer font-medium underline underline-offset-4 transition-colors">
          a long-running internal rendering engine
        </PreviewCardTrigger>
        <PreviewCardContent className="w-64">
          <p className="text-foreground text-sm leading-6 font-medium">
            Internal rendering engine
          </p>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Hover anywhere along the linked phrase — even where it wraps to a
            new line — and the card anchors to that exact line box.
          </p>
        </PreviewCardContent>
      </PreviewCard>{" "}
      that the team had maintained for years before open-sourcing it.
    </p>
  );
}
