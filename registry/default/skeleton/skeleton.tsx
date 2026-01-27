import * as React from "react"

import { cn } from "@/lib/utils"

type SkeletonProps = React.ComponentProps<"div"> & {
	visible?: boolean
	animate?: boolean
}

function Skeleton({
	className,
	children,
	visible = true,
	animate = true,
	...props
}: SkeletonProps) {
	if (!visible && children) {
		return <>{children}</>
	}

	return (
		<div
			data-slot="skeleton"
			className={cn(
				"bg-muted rounded-md",
				animate && [
					"animate-skeleton bg-fixed",
					"bg-[linear-gradient(90deg,transparent_35%,oklch(1_0_0/50%),transparent_65%)]",
					"bg-size-[200%_100%]",
					"dark:bg-[linear-gradient(90deg,transparent_35%,oklch(1_0_0/5%),transparent_65%)]",
				],
				children && "*:invisible",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
export { Skeleton }
