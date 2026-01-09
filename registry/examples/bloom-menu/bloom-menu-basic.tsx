import {
  BloomMenu,
  BloomMenuContainer,
  BloomMenuTrigger,
  BloomMenuContent,
  BloomMenuItem,
  BloomMenuSeparator,
} from "@/registry/default/bloom-menu/bloom-menu";
import { MoreHorizontal, Pencil, Copy, Share, Archive } from "lucide-react";

export default function BloomMenuBasic() {
  return (
    <BloomMenu>
      <BloomMenuContainer
        buttonSize={40}
        menuWidth={160}
        menuRadius={12}
        className="border bg-popover"
      >
        <BloomMenuTrigger>
          <MoreHorizontal className="size-5 text-muted-foreground" />
        </BloomMenuTrigger>

        <BloomMenuContent className="p-1">
          <BloomMenuItem
            className="flex items-center gap-2"
            onSelect={() => console.log("Edit")}
          >
            <Pencil className="size-4 text-muted-foreground" />
            Edit
          </BloomMenuItem>
          <BloomMenuItem
            className="flex items-center gap-2"
            onSelect={() => console.log("Copy")}
          >
            <Copy className="size-4 text-muted-foreground" />
            Copy
          </BloomMenuItem>
          <BloomMenuItem
            className="flex items-center gap-2"
            onSelect={() => console.log("Share")}
          >
            <Share className="size-4 text-muted-foreground" />
            Share
          </BloomMenuItem>
          <BloomMenuSeparator />
          <BloomMenuItem
            className="flex items-center gap-2"
            onSelect={() => console.log("Archive")}
          >
            <Archive className="size-4 text-muted-foreground" />
            Archive
          </BloomMenuItem>
        </BloomMenuContent>
      </BloomMenuContainer>
    </BloomMenu>
  );
}
