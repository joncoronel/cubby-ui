"use client";

import * as React from "react";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";

import { cn } from "@/lib/utils";
import { TextMorph } from "@/registry/default/text-morph/text-morph";

import "./otp-field.css";

const SLOT_SELECTOR = '[data-slot="otp-field-slot"]';

/*
 * One focus ring for the whole field, sliding from slot to slot as focus
 * moves. Positions are layout pixels (screen rects divided by the root's
 * scale), so a field inside a dialog that is still scaling in lands true.
 */
function useSlidingIndicator(
  indicatorRef: React.RefObject<HTMLSpanElement | null>,
): void {
  React.useEffect(() => {
    const indicator = indicatorRef.current;
    const root = indicator?.parentElement;
    if (!indicator || !root) return;

    let active: HTMLElement | null = null;

    function place(slot: HTMLElement): void {
      if (!indicator || !root) return;
      const rootRect = root.getBoundingClientRect();
      const scale =
        root.offsetWidth > 0 ? rootRect.width / root.offsetWidth : 1;
      const rect = slot.getBoundingClientRect();
      const { style } = indicator;
      style.setProperty(
        "--otp-indicator-x",
        `${(rect.left - rootRect.left) / scale - root.clientLeft}px`,
      );
      style.setProperty(
        "--otp-indicator-y",
        `${(rect.top - rootRect.top) / scale - root.clientTop}px`,
      );
      style.setProperty("--otp-indicator-w", `${rect.width / scale}px`);
      style.setProperty("--otp-indicator-h", `${rect.height / scale}px`);
    }

    function show(target: EventTarget | null): void {
      if (!indicator || !(target instanceof Element)) return;
      const slot = target.closest<HTMLElement>(SLOT_SELECTOR);
      if (!slot || !root?.contains(slot)) return;
      active = slot;
      // Hidden, the ring has no transition on position, so it lands under
      // the slot at once and only fades in; visible, it slides.
      place(slot);
      if (!indicator.hasAttribute("data-visible")) {
        indicator.getBoundingClientRect();
        indicator.setAttribute("data-visible", "");
      }
    }

    function handleFocusIn(event: FocusEvent): void {
      show(event.target);
    }

    function handleFocusOut(event: FocusEvent): void {
      if (
        event.relatedTarget instanceof Node &&
        root?.contains(event.relatedTarget)
      ) {
        return;
      }
      indicator?.removeAttribute("data-visible");
    }

    // The slot's invalid shake: the ring shakes and tints with it.
    function handleAnimationStart(event: AnimationEvent): void {
      const match = /^otp-field-shake-(a|b)$/.exec(event.animationName);
      if (match && event.target === active) {
        indicator?.setAttribute("data-shake", match[1]);
      }
    }

    function handleAnimationEnd(event: AnimationEvent): void {
      if (event.animationName.startsWith("otp-field-shake")) {
        indicator?.removeAttribute("data-shake");
      }
    }

    // Layout moved under a visible ring: follow without sliding.
    const observer = new ResizeObserver(() => {
      if (!active || !indicator.hasAttribute("data-visible")) return;
      indicator.setAttribute("data-instant", "");
      place(active);
      indicator.getBoundingClientRect();
      indicator.removeAttribute("data-instant");
    });

    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);
    root.addEventListener("animationstart", handleAnimationStart);
    root.addEventListener("animationend", handleAnimationEnd);
    observer.observe(root);
    // A slot focused before this ran (autoFocus).
    show(document.activeElement);

    return () => {
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      root.removeEventListener("animationstart", handleAnimationStart);
      root.removeEventListener("animationend", handleAnimationEnd);
      observer.disconnect();
    };
  }, [indicatorRef]);
}

function OTPField({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseOTPField.Root>) {
  const indicatorRef = React.useRef<HTMLSpanElement>(null);
  useSlidingIndicator(indicatorRef);

  return (
    <BaseOTPField.Root
      data-slot="otp-field"
      className={cn(
        "group/otp-field relative flex items-center gap-2",
        className,
      )}
      {...props}
    >
      {children}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        data-slot="otp-field-indicator"
        className="otp-field-indicator outline-ring/50 group-data-[invalid]/otp-field:outline-destructive/50 data-[shake]:outline-destructive/80 rounded-lg outline-2 outline-offset-2 outline-solid"
      />
    </BaseOTPField.Root>
  );
}

type OTPFieldInputProps = Omit<
  React.ComponentProps<typeof BaseOTPField.Input>,
  "className" | "style" | "render"
> & {
  /** Applied to the visible slot around the input. */
  className?: string;
  style?: React.CSSProperties;
  variant?: "default" | "elevated";
};

function OTPFieldInput({
  className,
  style,
  variant = "default",
  ...props
}: OTPFieldInputProps) {
  return (
    <BaseOTPField.Input
      data-slot="otp-field-input"
      {...props}
      render={(inputProps, state) => {
        const invalid =
          inputProps["aria-invalid"] === true ||
          inputProps["aria-invalid"] === "true";
        // A masked slot shows a dot instead of the character.
        const masked = inputProps.type === "password";
        const shown = masked && state.value ? "•" : state.value;

        return (
          <span
            data-slot="otp-field-slot"
            data-filled={state.filled ? "" : undefined}
            data-invalid={invalid ? "" : undefined}
            data-disabled={state.disabled ? "" : undefined}
            className={cn(
              // Base styling
              "relative flex h-10 w-10 cursor-text items-center justify-center rounded-lg border bg-clip-padding text-base font-medium tabular-nums sm:h-9 sm:w-9 md:text-sm",
              variant === "default" ? "bg-input" : "bg-input-elevated",
              // Invalid state (the focused slot's ring comes from the root)
              "data-[invalid]:outline-destructive/50 data-[invalid]:outline-2 data-[invalid]:outline-offset-2 data-[invalid]:outline-solid",
              // Disabled state
              "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
              className,
            )}
            style={style}
          >
            {/* The real input fills the slot, its own text and selection
                hidden: the character is drawn above. */}
            <input
              {...inputProps}
              className={cn(
                "absolute inset-0 size-full cursor-text rounded-[inherit] bg-transparent text-center text-base outline-none md:text-sm",
                // Text and caret color are set in otp-field.css.
                "selection:bg-transparent",
                "placeholder:text-muted-foreground placeholder:[-webkit-text-fill-color:currentColor] focus:placeholder:text-transparent",
              )}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <TextMorph
                value={shown}
                className={masked ? "text-[1.5em] leading-none" : undefined}
                mode="roll"
                duration={380}
                options={{ trend: "up", roll: { rotate: 0 } }}
              />
            </span>
          </span>
        );
      }}
    />
  );
}

function OTPFieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseOTPField.Separator>) {
  return (
    <BaseOTPField.Separator
      data-slot="otp-field-separator"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children ?? <SeparatorDash />}
    </BaseOTPField.Separator>
  );
}

function OTPFieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="otp-field-group"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function SeparatorDash(props: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 8 2"
      width="8"
      height="2"
      fill="none"
      {...props}
    >
      <path
        d="M1 1H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { OTPField, OTPFieldInput, OTPFieldSeparator, OTPFieldGroup };
