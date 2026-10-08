import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
  PreviewCardTitle,
  PreviewCardDescription,
} from "@/registry/default/preview-card/preview-card";

export default function PreviewCardInline() {
  return (
    <p className="text-muted-foreground max-w-72 text-sm leading-7">
      The framework was first announced at a small developer conference and grew
      out of work on{" "}
      <PreviewCard>
        <PreviewCardTrigger
          href="#"
          className="text-primary decoration-primary/30 hover:decoration-primary data-popup-open:decoration-primary focus-visible:outline-ring rounded-sm font-medium underline underline-offset-4 transition-[text-decoration-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          a long-running internal rendering engine
        </PreviewCardTrigger>
        <PreviewCardContent className="w-64">
          <PreviewCardTitle>Internal rendering engine</PreviewCardTitle>
          <PreviewCardDescription>
            Hover anywhere along the phrase, even where it wraps to a new line,
            and the card anchors to that exact line.
          </PreviewCardDescription>
        </PreviewCardContent>
      </PreviewCard>{" "}
      that the team had maintained for years before open-sourcing it.
    </p>
  );
}
