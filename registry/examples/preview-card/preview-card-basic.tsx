import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
} from "@/registry/default/preview-card/preview-card";
import { Avatar, AvatarFallback } from "@/registry/default/avatar/avatar";

export default function PreviewCardBasic() {
  return (
    <p className="text-muted-foreground max-w-80 text-sm leading-7">
      The type scale was drawn up by{" "}
      <PreviewCard>
        <PreviewCardTrigger
          href="#"
          className="text-foreground decoration-foreground/30 hover:decoration-foreground data-popup-open:decoration-foreground focus-visible:outline-ring rounded-sm font-medium underline underline-offset-4 transition-[text-decoration-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          @maren
        </PreviewCardTrigger>
        <PreviewCardContent className="w-72">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-amber-100 font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                MO
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-foreground font-semibold">Maren Okafor</p>
              <p className="text-muted-foreground">@maren</p>
            </div>
          </div>
          <p className="text-foreground mt-3 leading-relaxed text-pretty">
            Type designer. Spends too long on the spacing of question marks.
          </p>
          <div className="text-muted-foreground mt-3 flex gap-4 tabular-nums">
            <span>
              <span className="text-foreground font-medium">214</span> following
            </span>
            <span>
              <span className="text-foreground font-medium">8,902</span>{" "}
              followers
            </span>
          </div>
        </PreviewCardContent>
      </PreviewCard>{" "}
      over a long winter, then tested at every size it would ever be read.
    </p>
  );
}
