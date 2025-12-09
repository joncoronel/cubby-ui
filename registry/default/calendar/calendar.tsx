"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/registry/default/button/button";

import { cn } from "@/lib/utils";

function Calendar({
  classNames,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <div
      className={cn(
        "size-fit rounded-md p-0.5 pt-0",
        "bg-muted ring-border/60 shadow-top-highlight ring-1 dark:shadow-none",
        props.className,
      )}
    >
      <DayPicker
        showOutsideDays
        classNames={{
          root: cn(
            "relative size-fit select-none border-none",
            classNames?.root,
          ),
          months: cn(
            "flex flex-col md:flex-row [&>*:not(:first-child):not(:last-child)]:md:mr-2",
            classNames?.months,
          ),
          month: cn("m-0 text-center", classNames?.month),
          month_caption: cn(
            "relative flex h-9 items-center justify-center bg-transparent px-10",
            classNames?.month_caption,
          ),
          caption_label: cn("text-sm font-medium", classNames?.caption_label),
          today: cn("bg-accent", classNames?.today),
          week: cn("flex justify-center py-0.5 last:pb-2", classNames?.week),
          day: cn(
            "flex size-9 items-center justify-center rounded-md text-sm font-normal  hover:[&:has(>button)]:bg-accent hover:[&:has(>button)]:text-accent-foreground",
            classNames?.day,
          ),
          day_button: cn(
            "size-9 rounded-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/30",
            classNames?.day_button,
          ),
          weekdays: cn(
            "flex justify-center mb-1 px-4 pt-2",
            classNames?.weekdays,
          ),
          weekday: cn(
            "size-9 text-sm font-normal text-muted-foreground",
            classNames?.weekday,
          ),
          outside: cn(
            "text-muted-foreground/80 hover:text-muted-foreground!",
            classNames?.outside,
          ),
          selected: cn(
            "bg-primary! text-primary-foreground! hover:bg-primary! hover:text-primary-foreground!",
            classNames?.selected,
          ),
          range_middle: cn(
            "bg-secondary! text-secondary-foreground! rounded-none first:rounded-l-md last:rounded-r-md hover:bg-secondary! hover:text-secondary-foreground!",
            classNames?.range_middle,
          ),
          range_start: cn(
            props.mode === "range" &&
              props.selected?.from?.getTime() !== props.selected?.to?.getTime()
              ? " bg-secondary! [&>button]:bg-primary! not-last:[&>button]:rounded-r-none [&>button]:transition-[border-radius]"
              : "",
            classNames?.range_start,
          ),
          range_end: cn(
            props.mode === "range" &&
              props.selected?.from?.getTime() !== props.selected?.to?.getTime()
              ? " bg-secondary! [&>button]:bg-primary! not-first:[&>button]:rounded-l-none [&>button]:transition-[border-radius]"
              : "",
            classNames?.range_end,
          ),
          disabled: cn(
            "pointer-events-none text-muted-foreground opacity-50",
            classNames?.disabled,
          ),
          hidden: cn("pointer-events-none", classNames?.hidden),
          nav: cn("", classNames?.nav),
          month_grid: cn(
            "rounded-sm",
            "bg-card border-border/70 border-1 border-separate border-spacing-0",
            classNames?.month_grid,
          ),
        }}
        components={{
          NextMonthButton: (props) => (
            <button
              {...props}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "hover:bg-accent absolute top-0.5 right-2 z-1 size-8",
                classNames?.button_next,
              )}
            >
              <ChevronRightIcon className="size-4" />
            </button>
          ),
          PreviousMonthButton: (props) => (
            <button
              {...props}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "hover:bg-accent absolute top-0.5 left-2 z-1 size-8",
                classNames?.button_previous,
              )}
            >
              <ChevronLeftIcon className="size-4" />
            </button>
          ),
        }}
        {...props}
      />
    </div>
  );
}

export { Calendar };
