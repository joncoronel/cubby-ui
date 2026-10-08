import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
  PreviewCardMedia,
  PreviewCardTitle,
  PreviewCardDescription,
} from "@/registry/default/preview-card/preview-card";

export default function PreviewCardLink() {
  return (
    <p className="text-muted-foreground max-w-80 text-sm leading-7">
      Before you pick a grid, read{" "}
      <PreviewCard>
        <PreviewCardTrigger
          href="#"
          className="text-primary decoration-primary/30 hover:decoration-primary data-popup-open:decoration-primary focus-visible:outline-ring rounded-sm font-medium underline underline-offset-4 transition-[text-decoration-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          the notes on page rhythm
        </PreviewCardTrigger>
        <PreviewCardContent className="w-72">
          <PreviewCardMedia>
            <img
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=640&q=80&auto=format&fit=crop"
              alt="A fountain pen writing on lined paper"
            />
          </PreviewCardMedia>
          <PreviewCardTitle>Notes on page rhythm</PreviewCardTitle>
          <PreviewCardDescription>
            Why a baseline grid matters less than the space between a heading
            and the paragraph it introduces.
          </PreviewCardDescription>
          <p className="text-muted-foreground mt-3 text-xs">
            journal.example.com
          </p>
        </PreviewCardContent>
      </PreviewCard>
      .
    </p>
  );
}
