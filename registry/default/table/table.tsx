"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"
import {
	ScrollArea,
	type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area"

export interface TableProps
	extends React.ComponentProps<"table">,
		Pick<
			ScrollAreaProps,
			| "nativeScroll"
			| "fadeEdges"
			| "scrollbarGutter"
			| "persistScrollbar"
			| "hideScrollbar"
		> {
	bordered?: boolean
	striped?: boolean
	hoverable?: boolean
	rowDividers?: boolean
}

function Table({
	className,
	bordered = false,
	striped = false,
	hoverable = true,
	rowDividers = true,
	nativeScroll = false,
	fadeEdges = "bottom",
	scrollbarGutter = false,
	persistScrollbar,
	hideScrollbar,
	children,
	...props
}: TableProps) {
	return (
		<div
			data-slot="table-container"
			data-bordered={bordered ? "" : undefined}
			data-striped={striped ? "" : undefined}
			data-hoverable={hoverable ? "" : undefined}
			data-row-dividers={rowDividers ? "" : undefined}
			className={cn(
				"group/table bg-card ring-border/60 relative flex w-full flex-col overflow-hidden rounded-2xl px-2 pt-2 ring-1 md:max-w-2xl",
				className
			)}
		>
			<ScrollArea
				nativeScroll={nativeScroll}
				fadeEdges={fadeEdges}
				scrollbarGutter={scrollbarGutter}
				persistScrollbar={persistScrollbar}
				hideScrollbar={hideScrollbar}
				className="min-h-0 flex-1 rounded-lg"
				viewportClassName="pb-2"
			>
				<table
					data-slot="table"
					className={cn(
						"w-full caption-bottom text-sm",
						bordered && "border-separate border-spacing-0"
					)}
					{...props}
				>
					{children}
				</table>
			</ScrollArea>
		</div>
	)
}

export type TableHeaderProps = useRender.ComponentProps<"thead">

function TableHeader({ className, render, ...props }: TableHeaderProps) {
	const defaultProps = {
		"data-slot": "table-header",
		className: cn(
			"[&_tr]:border-0",
			"[&_tr_th]:bg-muted",
			"[&_tr_th:first-child]:rounded-l-lg [&_tr_th:last-child]:rounded-r-lg",
			"sticky top-0 z-10",
			"before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:content-['']",
			"before:rounded-lg before:border",
			"before:shadow-xs",
			className
		),
	}

	return useRender({
		defaultTagName: "thead",
		render,
		props: mergeProps<"thead">(defaultProps, props),
	})
}

export type TableBodyProps = useRender.ComponentProps<"tbody">

function TableBody({ className, render, ...props }: TableBodyProps) {
	const defaultProps = {
		"data-slot": "table-body",
		className: cn(
			"before:block before:h-2 before:content-['']",
			"[&_tr:first-child_td:first-child]:rounded-tl-lg [&_tr:first-child_td:last-child]:rounded-tr-lg",
			"[&_tr:last-child_td:first-child]:rounded-bl-lg [&_tr:last-child_td:last-child]:rounded-br-lg",
			"group-data-[row-dividers]/table:[&_tr:not(:last-child)]:border-b group-data-[row-dividers]/table:[&_tr]:border-border/60",
			"group-data-bordered/table:[&_tr:first-child_td]:border-t group-data-bordered/table:[&_tr:first-child_td]:border-border",
			"group-data-hoverable/table:[&_tr:hover]:bg-muted/40",
			"group-data-striped/table:[&_tr:nth-child(even)]:bg-muted/50",
			className
		),
	}

	return useRender({
		defaultTagName: "tbody",
		render,
		props: mergeProps<"tbody">(defaultProps, props),
	})
}

export type TableFooterProps = useRender.ComponentProps<"tfoot">

function TableFooter({ className, render, ...props }: TableFooterProps) {
	const defaultProps = {
		"data-slot": "table-footer",
		className: cn(
			"before:block before:h-2 before:content-['']",
			"[&_tr]:border-0",
			"[&_tr_td]:bg-muted",
			"[&_tr_td:first-child]:rounded-l-lg [&_tr_td:last-child]:rounded-r-lg",
			"[&_tr_td]:py-2",
			"font-medium",
			className
		),
	}

	return useRender({
		defaultTagName: "tfoot",
		render,
		props: mergeProps<"tfoot">(defaultProps, props),
	})
}

export interface TableRowProps extends useRender.ComponentProps<"tr"> {
	selected?: boolean
}

function TableRow({ className, render, selected, ...props }: TableRowProps) {
	const defaultProps = {
		"data-slot": "table-row",
		"data-state": selected ? "selected" : undefined,
		className: cn(
			"transition-colors duration-100 hover:transition-none",
			selected && "bg-muted/60",
			className
		),
	}

	return useRender({
		defaultTagName: "tr",
		render,
		props: mergeProps<"tr">(defaultProps, props),
	})
}

export type TableHeadProps = useRender.ComponentProps<"th">

function TableHead({ className, render, ...props }: TableHeadProps) {
	const defaultProps = {
		"data-slot": "table-head",
		className: cn(
			"text-muted-foreground px-3 py-2 text-left align-middle text-sm font-medium whitespace-nowrap",
			"[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			"group-data-[bordered]/table:border-r group-data-[bordered]/table:border-border group-data-[bordered]/table:last:border-r-0",
			className
		),
	}

	return useRender({
		defaultTagName: "th",
		render,
		props: mergeProps<"th">(defaultProps, props),
	})
}

export type TableCellProps = useRender.ComponentProps<"td">

function TableCell({ className, render, ...props }: TableCellProps) {
	const defaultProps = {
		"data-slot": "table-cell",
		className: cn(
			"px-3 py-2.5 align-middle whitespace-nowrap",
			"[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			"group-data-bordered/table:border-b group-data-bordered/table:border-r group-data-bordered/table:first:border-l group-data-bordered/table:border-border",
			className
		),
	}

	return useRender({
		defaultTagName: "td",
		render,
		props: mergeProps<"td">(defaultProps, props),
	})
}

export type TableCaptionProps = useRender.ComponentProps<"caption">

function TableCaption({ className, render, ...props }: TableCaptionProps) {
	const defaultProps = {
		"data-slot": "table-caption",
		className: cn("text-muted-foreground mt-4 text-xs", className),
	}

	return useRender({
		defaultTagName: "caption",
		render,
		props: mergeProps<"caption">(defaultProps, props),
	})
}

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
}
