"use client";

import {
  BloomMenu,
  BloomMenuContainer,
  BloomMenuTrigger,
  BloomMenuContent,
  BloomMenuItem,
} from "@/registry/default/bloom-menu/bloom-menu";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

export default function BloomMenuDirections() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-16 p-8">
      {/* Top direction */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground">Top</span>
        <BloomMenu direction="top">
          <BloomMenuContainer
            buttonSize={40}
            menuWidth={120}
            menuRadius={12}
            className="border bg-popover"
          >
            <BloomMenuTrigger>
              <ArrowUp className="size-5 text-muted-foreground" />
            </BloomMenuTrigger>
            <BloomMenuContent className="p-1">
              <BloomMenuItem onSelect={() => {}}>Option 1</BloomMenuItem>
              <BloomMenuItem onSelect={() => {}}>Option 2</BloomMenuItem>
              <BloomMenuItem onSelect={() => {}}>Option 3</BloomMenuItem>
            </BloomMenuContent>
          </BloomMenuContainer>
        </BloomMenu>
      </div>

      {/* Bottom direction */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground">Bottom</span>
        <BloomMenu direction="bottom">
          <BloomMenuContainer
            buttonSize={40}
            menuWidth={120}
            menuRadius={12}
            className="border bg-popover"
          >
            <BloomMenuTrigger>
              <ArrowDown className="size-5 text-muted-foreground" />
            </BloomMenuTrigger>
            <BloomMenuContent className="p-1">
              <BloomMenuItem onSelect={() => {}}>Option 1</BloomMenuItem>
              <BloomMenuItem onSelect={() => {}}>Option 2</BloomMenuItem>
              <BloomMenuItem onSelect={() => {}}>Option 3</BloomMenuItem>
            </BloomMenuContent>
          </BloomMenuContainer>
        </BloomMenu>
      </div>

      {/* Left direction */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground">Left</span>
        <BloomMenu direction="left">
          <BloomMenuContainer
            buttonSize={40}
            menuWidth={120}
            menuRadius={12}
            className="border bg-popover"
          >
            <BloomMenuTrigger>
              <ArrowLeft className="size-5 text-muted-foreground" />
            </BloomMenuTrigger>
            <BloomMenuContent className="p-1">
              <BloomMenuItem onSelect={() => {}}>Option 1</BloomMenuItem>
              <BloomMenuItem onSelect={() => {}}>Option 2</BloomMenuItem>
              <BloomMenuItem onSelect={() => {}}>Option 3</BloomMenuItem>
            </BloomMenuContent>
          </BloomMenuContainer>
        </BloomMenu>
      </div>

      {/* Right direction */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground">Right</span>
        <BloomMenu direction="right">
          <BloomMenuContainer
            buttonSize={40}
            menuWidth={120}
            menuRadius={12}
            className="border bg-popover"
          >
            <BloomMenuTrigger>
              <ArrowRight className="size-5 text-muted-foreground" />
            </BloomMenuTrigger>
            <BloomMenuContent className="p-1">
              <BloomMenuItem onSelect={() => {}}>Option 1</BloomMenuItem>
              <BloomMenuItem onSelect={() => {}}>Option 2</BloomMenuItem>
              <BloomMenuItem onSelect={() => {}}>Option 3</BloomMenuItem>
            </BloomMenuContent>
          </BloomMenuContainer>
        </BloomMenu>
      </div>
    </div>
  );
}
