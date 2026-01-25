"use client"

import * as React from "react"
import { flexRender, type Column } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
	SortByDown01Icon,
	SortByUp01Icon,
	ArrowUpDownIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	type TableProps,
} from "@/registry/default/table/table"
import { useDataTable } from "@/registry/default/data-table/data-table-context"

// Internal component for sortable column headers
function SortableHeader<TData>({
	column,
	children,
	align,
	isFirst,
	isLast,
}: {
	column: Column<TData, unknown>
	children: React.ReactNode
	align?: "left" | "center" | "right"
	isFirst?: boolean
	isLast?: boolean
}) {
	return (
		<button
			type="button"
			className={cn(
				"group -mx-3 -my-2 flex w-[calc(100%+1.5rem)] cursor-pointer items-center gap-1.5 px-3 py-2 hover:bg-accent/50",
				align === "right" && "justify-end",
				align === "center" && "justify-center",
				isFirst && "rounded-l-lg",
				isLast && "rounded-r-lg"
			)}
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			{children}
			{column.getIsSorted() === "asc" ? (
				<HugeiconsIcon
					icon={SortByUp01Icon}
					strokeWidth={2}
					className="size-4"
				/>
			) : column.getIsSorted() === "desc" ? (
				<HugeiconsIcon
					icon={SortByDown01Icon}
					strokeWidth={2}
					className="size-4"
				/>
			) : (
				<HugeiconsIcon
					icon={ArrowUpDownIcon}
					strokeWidth={2}
					className="size-4 opacity-0 group-hover:opacity-50"
				/>
			)}
		</button>
	)
}

export interface DataTableContentProps
	extends Omit<TableProps, "children"> {
	emptyState?: React.ReactNode
	enableSorting?: boolean
}

function DataTableContent({
	bordered,
	striped,
	hoverable,
	rowDividers = true,
	emptyState,
	enableSorting = false,
	className,
	...tableProps
}: DataTableContentProps) {
	const { table } = useDataTable()

	// Render header content with automatic sortable wrapper for string headers
	const renderHeader = (
		header: ReturnType<typeof table.getHeaderGroups>[0]["headers"][0],
		index: number,
		totalHeaders: number
	) => {
		if (header.isPlaceholder) return null

		const headerDef = header.column.columnDef.header
		const canSort = header.column.getCanSort()
		const meta = header.column.columnDef.meta as
			| { align?: "left" | "center" | "right" }
			| undefined

		// If header is a string and sorting is enabled, wrap with SortableHeader
		if (typeof headerDef === "string" && enableSorting && canSort) {
			return (
				<SortableHeader
					column={header.column}
					align={meta?.align}
					isFirst={index === 0}
					isLast={index === totalHeaders - 1}
				>
					{headerDef}
				</SortableHeader>
			)
		}

		// Otherwise render normally (custom render function or non-sortable)
		return flexRender(headerDef, header.getContext())
	}

	const totalColumns = table.getAllColumns().length

	return (
		<Table
			bordered={bordered}
			striped={striped}
			hoverable={hoverable}
			rowDividers={rowDividers}
			className={cn("rounded-none bg-transparent ring-0", className)}
			{...tableProps}
		>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header, index) => (
							<TableHead key={header.id} colSpan={header.colSpan}>
								{renderHeader(header, index, headerGroup.headers.length)}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow key={row.id} selected={row.getIsSelected()}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={totalColumns} className="h-24 text-center">
							{emptyState ?? "No results."}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	)
}

export { DataTableContent }
