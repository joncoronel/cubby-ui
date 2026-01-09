"use client";

import {
  BloomMenu,
  BloomMenuContainer,
  BloomMenuTrigger,
  BloomMenuContent,
  BloomMenuItem,
  BloomMenuSeparator,
  BloomMenuSub,
  BloomMenuSubTrigger,
  BloomMenuSubContent,
} from "@/registry/default/bloom-menu/bloom-menu";
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Share,
  Archive,
  ChevronRight,
  Twitter,
  Mail,
  Link2,
} from "lucide-react";

export default function BloomMenuSubmenu() {
  return (
    <BloomMenu direction="top">
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

          <BloomMenuSub id="share">
            <BloomMenuSubTrigger className="flex w-full items-center justify-between">
              {(isActive: boolean) => (
                <>
                  <span className="flex items-center gap-2">
                    <Share className="size-4 text-muted-foreground" />
                    Share
                  </span>
                  <ChevronRight
                    className="size-4 text-muted-foreground transition-transform duration-200"
                    style={{
                      transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                </>
              )}
            </BloomMenuSubTrigger>
            <BloomMenuSubContent className="rounded-xl border p-1 shadow-lg">
              <BloomMenuItem
                className="flex items-center gap-2"
                onSelect={() => console.log("Twitter")}
              >
                <Twitter className="size-4 text-muted-foreground" />
                Twitter
              </BloomMenuItem>
              <BloomMenuItem
                className="flex items-center gap-2"
                onSelect={() => console.log("Email")}
              >
                <Mail className="size-4 text-muted-foreground" />
                Email
              </BloomMenuItem>
              <BloomMenuItem
                className="flex items-center gap-2"
                onSelect={() => console.log("Copy Link")}
              >
                <Link2 className="size-4 text-muted-foreground" />
                Copy Link
              </BloomMenuItem>
            </BloomMenuSubContent>
          </BloomMenuSub>

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
