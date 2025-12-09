import * as React from "react";
import dayjs from "dayjs";
import { CalendarIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/registry/default/button/button";
import { Calendar } from "@/registry/default/calendar/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import { cn } from "@/lib/utils";

import type { DateRange } from "react-day-picker";

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

  // Initialize temp range with current value when popover opens
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
    // Show hover preview when selecting second date
    if (tempRange?.from && !tempRange?.to && hoverDate) {
      // Ensure proper range order
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

    // Clear hover state when a selection is made
    setHoverDate(undefined);

    // Prevent deselecting all dates - if range is undefined or empty, ignore
    if (!range?.from) {
      return;
    }

    // Detect if user is starting a new selection
    if (prevRange?.from && prevRange?.to) {
      // Had a complete range before
      if (range?.from && range?.to) {
        // Still have a complete range
        if (range.from.getTime() === range.to.getTime()) {
          // Single date clicked - start new selection
          setTempRange({ from: range.from, to: undefined });
          previousTempRangeRef.current = { from: range.from, to: undefined };
          return;
        } else if (
          // Check if it's just extending/modifying the existing range
          range.from.getTime() === prevRange.from.getTime() ||
          range.to.getTime() === prevRange.to.getTime()
        ) {
          // This is modifying the existing range, but we want to start fresh
          // So we need to clear and start over with just the newly clicked date
          const clickedDate =
            range.from.getTime() !== prevRange.from.getTime()
              ? range.from
              : range.to;
          setTempRange({ from: clickedDate, to: undefined });
          previousTempRangeRef.current = { from: clickedDate, to: undefined };
          return;
        }
      }

      // Special case: if we had a single-day range and user clicks on a single date
      // This happens when Calendar is in range mode but user clicks on the same date that was selected
      if (range?.from && !range?.to) {
        // Check if this is clicking on the same single-day range
        if (
          prevRange.from.getTime() === prevRange.to.getTime() &&
          range.from.getTime() === prevRange.from.getTime()
        ) {
          // Clicking on the same single-day range - start new selection
          setTempRange({ from: range.from, to: undefined });
          previousTempRangeRef.current = { from: range.from, to: undefined };
          return;
        }
      }
    }

    // If user is selecting a second date
    if (range.from && !range.to && prevRange?.from && !prevRange?.to) {
      // User clicked on the first date again - create single-day range
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

    // Update the actual value and close when both dates are selected
    if (range?.from && range?.to) {
      // Ensure proper range order - from should be earlier than to
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
              <CalendarIcon className="mr-2 size-4" />
              <span className={cn(!value?.from && "text-muted-foreground")}>
                {formatDateRange()}
              </span>
            </span>
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        )}
      />
      <PopoverContent
        className="w-auto border-none p-0 outline-none"
        sideOffset={4}
        arrow={false}
        onMouseLeave={() => {
          // Clear hover when leaving the popover content
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
            // Prevent auto-completion when starting fresh (no existing tempRange)
            if (
              !tempRange?.from &&
              range?.from &&
              range?.to &&
              range.from.getTime() === range.to.getTime()
            ) {
              // This is a fresh selection where Calendar auto-set both dates - convert to single date selection
              setTempRange({ from: range.from, to: undefined });
              previousTempRangeRef.current = {
                from: range.from,
                to: undefined,
              };
              return;
            }

            // Important: when we have a hover preview active, we need to handle the selection differently
            if (tempRange?.from && !tempRange?.to && hoverDate && range?.to) {
              // This is the second date selection with hover preview
              // Use the actual clicked date, not the hover preview
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
            // Handle case where there's no existing selection - start new range selection
            if (!tempRange?.from) {
              setTempRange({ from: date, to: undefined });
              previousTempRangeRef.current = { from: date, to: undefined };
              return;
            }

            // Handle case where user clicks the same date while selecting
            if (
              tempRange?.from &&
              !tempRange?.to &&
              date.getTime() === tempRange.from.getTime()
            ) {
              handleSelect({ from: date, to: date });
              return;
            }

            // Handle case where user clicks on a single-day range to start new selection
            if (
              tempRange?.from &&
              tempRange?.to &&
              tempRange.from.getTime() === tempRange.to.getTime() &&
              date.getTime() === tempRange.from.getTime()
            ) {
              // Clicking on the same single-day range - start new selection
              setTempRange({ from: date, to: undefined });
              previousTempRangeRef.current = { from: date, to: undefined };
              return;
            }
          }}
          onDayMouseEnter={(date) => {
            // Only show hover preview when selecting the second date
            if (tempRange?.from && !tempRange?.to) {
              setHoverDate(date);
            }
          }}
          onDayMouseLeave={() => {
            // Let the Calendar handle its own mouse leave
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
