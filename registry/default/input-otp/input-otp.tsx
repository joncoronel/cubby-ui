"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { cn } from "@/lib/utils"

function InputOTP({
	className,
	containerClassName,
	...props
}: React.ComponentProps<typeof OTPInput> & {
	containerClassName?: string
}) {
	return (
		<OTPInput
			data-slot="input-otp"
			containerClassName={cn(
				"flex items-center gap-2 has-disabled:opacity-60",
				containerClassName
			)}
			className={cn("disabled:cursor-not-allowed", className)}
			{...props}
		/>
	)
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="input-otp-group"
			className={cn("flex items-center", className)}
			{...props}
		/>
	)
}

function InputOTPSlot({
	index,
	className,
	variant = "default",
	...props
}: React.ComponentProps<"div"> & {
	index: number
	variant?: "default" | "elevated"
}) {
	const inputOTPContext = React.useContext(OTPInputContext)
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				// Base styles
				"relative flex h-9 w-9 items-center justify-center text-sm",
				variant === "default" ? "bg-input" : "bg-input-elevated",
				// Border-y + border-r forms both the outer perimeter and inter-slot
				// dividers. bg-clip-padding composites the translucent --border
				// against the substrate, matching the rest of the form-field family.
				"border-border border-y border-r bg-clip-padding first:rounded-l-lg first:border-l last:rounded-r-lg",
				// Outline transition base
				"outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out",
				// Active state
				"data-[active=true]:outline-ring/50 data-[active=true]:outline-2 data-[active=true]:outline-offset-2 data-[active=true]:outline-solid data-[active=true]:z-10",
				// Invalid state
				"aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",
				className
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
				</div>
			)}
		</div>
	)
}

function InputOTPSeparator({
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div data-slot="input-otp-separator" role="separator" {...props}>
			{children || <HugeiconsIcon icon={MinusSignIcon}  strokeWidth={2} />}
		</div>
	)
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon } from "@hugeicons/core-free-icons";
