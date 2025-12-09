"use client"

import * as React from "react"
import { Toggle as BaseToggle } from "@base-ui-components/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
	"inline-flex bg-transparent items-center justify-center gap-2.5 rounded-lg text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-60 data-[pressed]:bg-accent/80 data-[pressed]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2 outline-none transition-all duration-200 aria-invalid:ring-destructive/30 aria-invalid:border-destructive whitespace-nowrap",
	{
		variants: {
			variant: {
				default: "",
				outline: "border border-border/60 shadow-[0_1px_3px_0_oklch(0.18_0_0_/_0.06)] ring-1 ring-border/15 dark:ring-0",
			},
			size: {
				default: "h-10 px-3 min-w-10",
				sm: "h-9 px-2.5 min-w-9",
				lg: "h-11 px-4 min-w-11",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
)

function Toggle({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<typeof BaseToggle> &
	VariantProps<typeof toggleVariants>) {
	return (
		<BaseToggle
			data-slot="toggle"
			className={cn(toggleVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { Toggle, toggleVariants }
