"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar"

import { ButtonProps, buttonVariants } from "@/registry/default/button/button"

import { cn } from "@/lib/utils"
import {
	solidSurface,
	type SurfaceLevel,
} from "@/registry/default/lib/elevated"

const toolbarVariants = cva(
	"flex items-center gap-1 rounded-lg p-1 data-[orientation=vertical]:flex-col data-disabled:pointer-events-none data-disabled:opacity-60",
	{
		variants: {
			variant: {
				default: "",
				outline: "bg-transparent border border-border",
				ghost: "bg-transparent",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
)

type ToolbarProps = React.ComponentProps<typeof BaseToolbar.Root> &
	VariantProps<typeof toolbarVariants> & {
		/** Surface elevation level for the `default` variant (1-8). Defaults to 3. */
		level?: SurfaceLevel
		/** Shadow weight (1-8). Defaults to 3. */
		shadowLevel?: SurfaceLevel
	}

function Toolbar({
	className,
	variant = "default",
	level = 3,
	shadowLevel = 3,
	...props
}: ToolbarProps) {
	return (
		<BaseToolbar.Root
			data-slot="toolbar"
			data-level={variant === "default" ? level : undefined}
			className={cn(
				toolbarVariants({ variant }),
				variant === "default" && solidSurface(level, shadowLevel),
				className,
			)}
			{...props}
		/>
	)
}

function ToolbarButton({
	className,
	variant = "ghost",
	size = "icon_sm",
	...props
}: React.ComponentProps<typeof BaseToolbar.Button> & ButtonProps) {
	return (
		<BaseToolbar.Button
			data-slot="toolbar-button"
			className={cn(
				buttonVariants({ variant, size }),
				"shrink-0 rounded-md",
				className
			)}
			{...props}
		/>
	)
}

function ToolbarSeparator({
	className,
	...props
}: React.ComponentProps<typeof BaseToolbar.Separator>) {
	return (
		<BaseToolbar.Separator
			data-slot="toolbar-separator"
			className={cn(
				"bg-border shrink-0",
				// Default: vertical line for horizontal toolbar
				"h-6 w-px",
				// When inside vertical toolbar: horizontal line
				"in-data-[orientation=vertical]:h-px in-data-[orientation=vertical]:w-6",
				className
			)}
			{...props}
		/>
	)
}

function ToolbarInput({
	className,
	...props
}: React.ComponentProps<typeof BaseToolbar.Input>) {
	return (
		<BaseToolbar.Input
			data-slot="toolbar-input"
			className={cn(
				"placeholder:text-muted-foreground bg-input border-border",
				"flex h-8 min-w-0 rounded-md border bg-clip-padding px-2 py-1 text-sm",
				"transition-colors duration-100",
				"focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent",
				"transition-[outline-width,outline-offset,outline-color] duration-100 ease-out",
				"outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
				"data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-60",
				className
			)}
			{...props}
		/>
	)
}

function ToolbarGroup({
	className,
	...props
}: React.ComponentProps<typeof BaseToolbar.Group>) {
	return (
		<BaseToolbar.Group
			data-slot="toolbar-group"
			className={cn(
				"flex items-center gap-0.5",
				"data-[orientation=vertical]:flex-col",
				"data-disabled:pointer-events-none data-disabled:opacity-60",
				className
			)}
			{...props}
		/>
	)
}

function ToolbarLink({
	className,
	...props
}: React.ComponentProps<typeof BaseToolbar.Link>) {
	return (
		<BaseToolbar.Link
			data-slot="toolbar-link"
			className={cn(
				"text-muted-foreground inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-2.5 text-sm no-underline",
				"hover:text-foreground hover:bg-(--surface-hover)",
				"transition-[color,background-color,outline-width,outline-offset,outline-color] duration-100 ease-out",
				"focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent",
				"outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		/>
	)
}

export {
	Toolbar,
	ToolbarButton,
	ToolbarSeparator,
	ToolbarInput,
	ToolbarGroup,
	ToolbarLink,
	toolbarVariants,
}

export type { ToolbarProps }
