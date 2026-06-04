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

import type { DateRange } from "react-day-picker";

import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
export interface DateRangePickerProps {
  value?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  format?: string;
  numberOfMonths?: number;
  fixedWeeks?: boolean;
}

export function DateRangePicker({
  value,
  onSelect,
  placeholder = "Select date range",
  className,
  disabled = false,
  format = "DD MMM YYYY",
  numberOfMonths = 1,
  fixedWeeks = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(
    undefined,
  );
  const [hoverDate, setHoverDate] = React.useState<Date | undefined>(undefined);
  const previousTempRangeRef = React.useRef<DateRange | undefined>(undefined);

  React.useEffect(() => {
    if (open) {
      setTempRange(value);
      previousTempRangeRef.current = value;
      setHoverDate(undefined);
    }
  }, [open, value]);

  const formatDateRange = () => {
    if (!value?.from) return placeholder;
    if (!value.to) return dayjs(value.from).format(format);
    return `${dayjs(value.from).format(format)} - ${dayjs(value.to).format(format)}`;
  };

  const displayRange = React.useMemo(() => {
    if (tempRange?.from && !tempRange?.to && hoverDate) {
      const start = tempRange.from;
      const end = hoverDate;
      if (start.getTime() <= end.getTime()) {
        return { from: start, to: end };
      } else {
        return { from: end, to: start };
      }
    }
    return tempRange;
  }, [tempRange, hoverDate]);

  const handleSelect = (range: DateRange | undefined) => {
    const prevRange = previousTempRangeRef.current;

    setHoverDate(undefined);

    if (!range?.from) {
      return;
    }

    if (prevRange?.from && prevRange?.to) {
      if (range?.from && range?.to) {
        if (range.from.getTime() === range.to.getTime()) {
          setTempRange({ from: range.from, to: undefined });
          previousTempRangeRef.current = { from: range.from, to: undefined };
          return;
        } else if (
          // Calendar extends an existing range instead of starting fresh —
          // detect that and restart from the clicked date.
          range.from.getTime() === prevRange.from.getTime() ||
          range.to.getTime() === prevRange.to.getTime()
        ) {
          const clickedDate =
            range.from.getTime() !== prevRange.from.getTime()
              ? range.from
              : range.to;
          setTempRange({ from: clickedDate, to: undefined });
          previousTempRangeRef.current = { from: clickedDate, to: undefined };
          return;
        }
      }

      // Clicking the same single-day range clears it and restarts selection.
      if (range?.from && !range?.to) {
        if (
          prevRange.from.getTime() === prevRange.to.getTime() &&
          range.from.getTime() === prevRange.from.getTime()
        ) {
          setTempRange({ from: range.from, to: undefined });
          previousTempRangeRef.current = { from: range.from, to: undefined };
          return;
        }
      }
    }

    if (range.from && !range.to && prevRange?.from && !prevRange?.to) {
      if (range.from.getTime() === prevRange.from.getTime()) {
        const singleDayRange = { from: range.from, to: range.from };
        setTempRange(singleDayRange);
        previousTempRangeRef.current = singleDayRange;
        onSelect?.(singleDayRange);
        setOpen(false);
        return;
      }
    }

    setTempRange(range);
    previousTempRangeRef.current = range;

    if (range?.from && range?.to) {
      const normalizedRange = {
        from:
          range.from.getTime() <= range.to.getTime() ? range.from : range.to,
        to: range.from.getTime() <= range.to.getTime() ? range.to : range.from,
      };
      onSelect?.(normalizedRange);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <Button
            {...props}
            variant="outline"
            className={cn("w-[300px] justify-between", className)}
            disabled={disabled}
          >
            <span className="flex w-full items-center">
              <HugeiconsIcon icon={Calendar01Icon} className="mr-2 size-4"  strokeWidth={2} />
              <span className={cn(!value?.from && "text-muted-foreground")}>
                {formatDateRange()}
              </span>
            </span>
            <HugeiconsIcon icon={UnfoldMoreIcon} className="ml-2 size-4 shrink-0 opacity-50"  strokeWidth={2} />
          </Button>
        )}
      />
      <PopoverContent
        className="w-auto border-none p-0 outline-none"
        sideOffset={4}
        arrow={false}
        onMouseLeave={() => {
          setHoverDate(undefined);
        }}
      >
        <Calendar
          className="border-0"
          mode="range"
          numberOfMonths={numberOfMonths}
          showOutsideDays
          fixedWeeks={fixedWeeks}
          selected={displayRange}
          onSelect={(range) => {
            // Calendar auto-sets both dates on first click — convert to a single
            // anchor date so the user can pick the end of the range normally.
            if (
              !tempRange?.from &&
              range?.from &&
              range?.to &&
              range.from.getTime() === range.to.getTime()
            ) {
              setTempRange({ from: range.from, to: undefined });
              previousTempRangeRef.current = {
                from: range.from,
                to: undefined,
              };
              return;
            }

            // With hover preview active, `range.to` is the hovered date; use it
            // as the actual end date rather than relying on the preview state.
            if (tempRange?.from && !tempRange?.to && hoverDate && range?.to) {
              const actualRange = {
                from:
                  tempRange.from.getTime() <= range.to.getTime()
                    ? tempRange.from
                    : range.to,
                to:
                  tempRange.from.getTime() <= range.to.getTime()
                    ? range.to
                    : tempRange.from,
              };
              handleSelect(actualRange);
            } else {
              handleSelect(range);
            }
          }}
          onDayClick={(date) => {
            if (!tempRange?.from) {
              setTempRange({ from: date, to: undefined });
              previousTempRangeRef.current = { from: date, to: undefined };
              return;
            }

            if (
              tempRange?.from &&
              !tempRange?.to &&
              date.getTime() === tempRange.from.getTime()
            ) {
              handleSelect({ from: date, to: date });
              return;
            }

            if (
              tempRange?.from &&
              tempRange?.to &&
              tempRange.from.getTime() === tempRange.to.getTime() &&
              date.getTime() === tempRange.from.getTime()
            ) {
              setTempRange({ from: date, to: undefined });
              previousTempRangeRef.current = { from: date, to: undefined };
              return;
            }
          }}
          onDayMouseEnter={(date) => {
            if (tempRange?.from && !tempRange?.to) {
              setHoverDate(date);
            }
          }}
          onDayMouseLeave={() => {
            // Calendar handles its own mouse-leave; no action needed here.
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
