"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import {
  elevatedSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

export interface TableProps
  extends
    React.ComponentProps<"table">,
    Pick<
      ScrollAreaProps,
      | "nativeScroll"
      | "fadeEdges"
      | "scrollbarGutter"
      | "persistScrollbar"
      | "hideScrollbar"
    > {
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  rowDividers?: boolean;
  /** Surface elevation level (1-8). Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Defaults to 1 — flat outlined card, just rim. */
  shadowLevel?: SurfaceLevel;
}

function Table({
  className,
  bordered = false,
  striped = false,
  hoverable = true,
  rowDividers = true,
  nativeScroll = false,
  fadeEdges = false,
  scrollbarGutter = false,
  persistScrollbar,
  hideScrollbar,
  level = 3,
  shadowLevel = 1,
  children,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-bordered={bordered ? "" : undefined}
      data-striped={striped ? "" : undefined}
      data-hoverable={hoverable ? "" : undefined}
      data-row-dividers={rowDividers ? "" : undefined}
      data-level={level}
      className={cn(
        "group/table relative flex w-full flex-col overflow-hidden rounded-2xl p-1 pt-0 md:max-w-2xl",
        // Same pattern as Card inset outer — gray frame with elevation shadow + rim.
        // Inner body cells drop to `bg-surface-3 dark:bg-surface-1` (see TableBody)
        // to create the mode-asymmetric "card-on-tray (light) / well (dark)" look.
        // pt-0 because TableHead's py-2 already provides the header's top padding —
        // adding outer pt would stack and create a too-thick top strip.
        // has-[tfoot]:pb-0 mirrors that logic: when a footer is present its own
        // py-2 carries the bottom padding. Without a footer, the outer keeps
        // pb-1 to give the body's last row breathing room before the frame edge.
        "has-[tfoot]:pb-0",
        // elevatedSurface (rim on ::after) because the sticky TableHeader is
        // an opaque child near the top edge — solidSurface's combined shadow
        // would let the header bg cover the rim line at the top in dark mode.
        elevatedSurface(level, shadowLevel),
        "bg-muted",
        className,
      )}
    >
      <ScrollArea
        nativeScroll={nativeScroll}
        fadeEdges={fadeEdges}
        scrollbarGutter={scrollbarGutter}
        persistScrollbar={persistScrollbar}
        hideScrollbar={hideScrollbar}
        className="min-h-0 flex-1 rounded-lg"
      >
        <table
          data-slot="table"
          className={cn(
            "w-full caption-bottom text-sm",
            bordered && "border-separate border-spacing-0",
          )}
          {...props}
        >
          {children}
        </table>
      </ScrollArea>
    </div>
  );
}

export type TableHeaderProps = useRender.ComponentProps<"thead">;

function TableHeader({ className, render, ...props }: TableHeaderProps) {
  const defaultProps = {
    "data-slot": "table-header",
    className: cn(
      "[&_tr]:border-0",
      // th cells use bg-muted — same color as the outer Table frame, so the
      // header strip blends into the frame visually. bg-muted also gives the
      // sticky header an opaque bg so scrolling body content doesn't bleed
      // through it.
      "[&_tr_th]:bg-muted",
      // z-1 keeps the header above scrolling body rows but below the table
      // container's ::after rim (z-2) so the rim stays visible in dark mode.
      "sticky top-0 z-1",
      className,
    ),
  };

  return useRender({
    defaultTagName: "thead",
    render,
    props: mergeProps<"thead">(defaultProps, props),
  });
}

export type TableBodyProps = useRender.ComponentProps<"tbody">;

function TableBody({ className, render, ...props }: TableBodyProps) {
  const defaultProps = {
    "data-slot": "table-body",
    className: cn(
      // Body cells form the "inner card" — bg-surface-3 (pure white) in light,
      // bg-surface-1 (page color) in dark. Same mode-asymmetric pattern as Command.
      "[&_tr_td]:bg-surface-3 dark:[&_tr_td]:bg-surface-1",
      "[&_tr:first-child_td:first-child]:rounded-tl-lg [&_tr:first-child_td:last-child]:rounded-tr-lg",
      "[&_tr:last-child_td:first-child]:rounded-bl-lg [&_tr:last-child_td:last-child]:rounded-br-lg",
      "group-data-[row-dividers]/table:[&_tr:not(:last-child)]:border-b group-data-[row-dividers]/table:[&_tr]:border-border/60",
      "group-data-bordered/table:[&_tr:first-child_td]:border-t group-data-bordered/table:[&_tr:first-child_td]:border-border",

      "group-data-hoverable/table:[&_tr:hover_td]:bg-(--surface-hover)",
      "group-data-striped/table:[&_tr:nth-child(even)_td]:bg-muted/50",
      className,
    ),
  };

  return useRender({
    defaultTagName: "tbody",
    render,
    props: mergeProps<"tbody">(defaultProps, props),
  });
}

export type TableFooterProps = useRender.ComponentProps<"tfoot">;

function TableFooter({ className, render, ...props }: TableFooterProps) {
  const defaultProps = {
    "data-slot": "table-footer",
    className: cn(
      "[&_tr]:border-0",
      "[&_tr_td]:bg-muted",
      "[&_tr_td:first-child]:rounded-l-lg [&_tr_td:last-child]:rounded-r-lg",
      "[&_tr_td]:py-2",
      "font-medium",
      className,
    ),
  };

  return useRender({
    defaultTagName: "tfoot",
    render,
    props: mergeProps<"tfoot">(defaultProps, props),
  });
}

export interface TableRowProps extends useRender.ComponentProps<"tr"> {
  selected?: boolean;
}

function TableRow({ className, render, selected, ...props }: TableRowProps) {
  const defaultProps = {
    "data-slot": "table-row",
    "data-state": selected ? "selected" : undefined,
    className: cn(
      "transition-colors duration-100 hover:transition-none",
      className,
    ),
  };

  return useRender({
    defaultTagName: "tr",
    render,
    props: mergeProps<"tr">(defaultProps, props),
  });
}

export type TableHeadProps = useRender.ComponentProps<"th">;

function TableHead({ className, render, ...props }: TableHeadProps) {
  const defaultProps = {
    "data-slot": "table-head",
    className: cn(
      "text-muted-foreground relative px-3 py-2 text-left align-middle text-sm font-medium whitespace-nowrap",
      "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      // Short "tick" separator between header cells via ::after. Hidden on the
      // last cell so the row ends cleanly. Uses bg-border (translucent) so it
      // reads as a faint divider on the bg-muted header strip.
      "after:absolute after:right-0 after:top-1/2 after:h-4 after:w-px after:-translate-y-1/2 after:bg-border after:content-['']",
      "last:after:hidden",
      "group-data-[bordered]/table:border-r group-data-[bordered]/table:border-border group-data-[bordered]/table:last:border-r-0",
      className,
    ),
  };

  return useRender({
    defaultTagName: "th",
    render,
    props: mergeProps<"th">(defaultProps, props),
  });
}

export type TableCellProps = useRender.ComponentProps<"td">;

function TableCell({ className, render, ...props }: TableCellProps) {
  const defaultProps = {
    "data-slot": "table-cell",
    className: cn(
      "px-3 py-2.5 align-middle whitespace-nowrap",
      "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      "group-data-bordered/table:border-b group-data-bordered/table:border-r group-data-bordered/table:first:border-l group-data-bordered/table:border-border",
      // ! to override the dark-mode TableBody base bg-surface-1 which would
      // otherwise win on specificity (.dark .body tr td vs. [data-state=selected] td).
      "[[data-state=selected]_&]:bg-(--surface-selected) dark:[[data-state=selected]_&]:bg-(--surface-selected)",
      className,
    ),
  };

  return useRender({
    defaultTagName: "td",
    render,
    props: mergeProps<"td">(defaultProps, props),
  });
}

export type TableCaptionProps = useRender.ComponentProps<"caption">;

function TableCaption({ className, render, ...props }: TableCaptionProps) {
  const defaultProps = {
    "data-slot": "table-caption",
    className: cn("text-muted-foreground mt-4 text-xs", className),
  };

  return useRender({
    defaultTagName: "caption",
    render,
    props: mergeProps<"caption">(defaultProps, props),
  });
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
