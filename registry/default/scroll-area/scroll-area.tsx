import * as React from "react"
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
	className,
	children,
	scrollFade = false,
	scrollbarGutter = false,
	...props
}: React.ComponentProps<typeof BaseScrollArea.Root> & {
	scrollFade?: boolean
	scrollbarGutter?: boolean
}) {
	return (
		<BaseScrollArea.Root
			data-slot="scroll-area"
			className={cn("relative", className)}
			{...props}
		>
			<BaseScrollArea.Viewport
				data-slot="scroll-area-viewport"
				className={cn(
					"size-full overscroll-contain rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline",
					scrollFade && [
						"[--fade-size:1.5rem]",
						"mask-t-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-start,0px)))]",
						"mask-b-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-end,var(--fade-size))))]",
						"mask-l-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-start,0px)))]",
						"mask-r-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-end,var(--fade-size))))]",
					],
					scrollbarGutter &&
						"data-has-overflow-y:pe-2.5 data-has-overflow-x:pb-2.5"
				)}
			>
				{children}
			</BaseScrollArea.Viewport>
			<ScrollBar orientation="vertical" />
			<ScrollBar orientation="horizontal" />
			<BaseScrollArea.Corner />
		</BaseScrollArea.Root>
	)
}

function ScrollBar({
	className,
	...props
}: React.ComponentProps<typeof BaseScrollArea.Scrollbar>) {
	return (
		<BaseScrollArea.Scrollbar
			data-slot="scroll-area-scrollbar"
			className={cn(
				"m-1 flex touch-none p-px opacity-0 transition-[colors,opacity] delay-200 select-none data-hovering:opacity-100 data-hovering:delay-0 data-hovering:duration-100 data-scrolling:opacity-100 data-scrolling:delay-0 data-scrolling:duration-100",
				"data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent",
				"data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent",
				className
			)}
			{...props}
		>
			<BaseScrollArea.Thumb
				data-slot="scroll-area-thumb"
				className="bg-border relative flex-1 rounded-full"
			/>
		</BaseScrollArea.Scrollbar>
	)
}

export { ScrollArea }
