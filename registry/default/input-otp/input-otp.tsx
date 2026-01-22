"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

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
				"flex items-center gap-2 has-disabled:opacity-50",
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
	...props
}: React.ComponentProps<"div"> & {
	index: number
}) {
	const inputOTPContext = React.useContext(OTPInputContext)
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				// Base styles
				"bg-input dark:bg-input/35 relative flex h-9 w-9 items-center justify-center text-sm shadow-xs",
				// Border handling for adjacent slots
				"border-border border-y border-r first:rounded-l-lg first:border-l last:rounded-r-lg",
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
			{children || <MinusIcon />}
		</div>
	)
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
