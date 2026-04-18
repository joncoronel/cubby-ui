"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Button } from "@/registry/default/button/button";
import { Calendar } from "@/registry/default/calendar/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import { cn } from "@/lib/utils";

import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
export interface DatePickerProps {
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  format?: string;
}

export function DatePicker({
  value,
  onSelect,
  placeholder = "Select a date",
  className,
  disabled = false,
  format = "DD MMMM YYYY",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <Button
            {...props}
            variant="outline"
            className={cn("w-[280px] justify-between", className)}
            disabled={disabled}
          >
            <span className="flex w-full items-center">
              <HugeiconsIcon icon={Calendar01Icon} className="mr-2 size-4"  strokeWidth={2} />
              {value ? (
                <span>{dayjs(value).format(format)}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <HugeiconsIcon icon={UnfoldMoreIcon} className="ml-2 size-4 shrink-0 opacity-50"  strokeWidth={2} />
          </Button>
        )}
      />
      <PopoverContent
        className="w-auto border-none p-0 outline-none"
        sideOffset={8}
        arrow={false}
      >
        <Calendar
          className="border-0"
          mode="single"
          showOutsideDays
          selected={value}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
