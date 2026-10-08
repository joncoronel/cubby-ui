import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
  PreviewCardTitle,
  PreviewCardDescription,
} from "@/registry/default/preview-card/preview-card";

export default function PreviewCardArrow() {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        href="#"
        className="text-foreground decoration-foreground/30 hover:decoration-foreground data-popup-open:decoration-foreground focus-visible:outline-ring rounded-sm text-sm font-medium underline underline-offset-4 transition-[text-decoration-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Optical sizing
      </PreviewCardTrigger>
      <PreviewCardContent side="top" arrow className="w-64">
        <PreviewCardTitle>Optical sizing</PreviewCardTitle>
        <PreviewCardDescription>
          Variable fonts with an opsz axis redraw their letters for the size
          they are set at: sturdier at caption sizes, finer at display sizes.
        </PreviewCardDescription>
      </PreviewCardContent>
    </PreviewCard>
  );
}
