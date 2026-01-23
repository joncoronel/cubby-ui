"use client"

import * as React from "react"
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	flexRender,
	type ColumnDef,
	type SortingState,
	type RowSelectionState,
	type ColumnFiltersState,
	type PaginationState,
	type VisibilityState,
	type OnChangeFn,
	type Row,
	type Column,
} from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
	SortByDown01Icon,
	SortByUp01Icon,
	ArrowUpDownIcon,
	Search01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/registry/default/checkbox/checkbox"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	type TableProps,
} from "@/registry/default/table/table"
import { ColumnVisibilityPopover } from "@/registry/default/data-table/column-visibility-popover"

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
				<HugeiconsIcon icon={SortByUp01Icon} strokeWidth={2} className="size-4" />
			) : column.getIsSorted() === "desc" ? (
				<HugeiconsIcon icon={SortByDown01Icon} strokeWidth={2} className="size-4" />
			) : (
				<HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-4 opacity-0 group-hover:opacity-50" />
			)}
		</button>
	)
}

export interface DataTableProps<TData, TValue>
	extends Omit<TableProps, "children"> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]

	// Feature flags
	enableSorting?: boolean
	enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
	enableMultiRowSelection?: boolean
	enableFiltering?: boolean
	enablePagination?: boolean
	enableColumnVisibility?: boolean

	// Selection options
	showSelectionColumn?: boolean

	// Controlled state
	sorting?: SortingState
	onSortingChange?: OnChangeFn<SortingState>
	rowSelection?: RowSelectionState
	onRowSelectionChange?: OnChangeFn<RowSelectionState>
	columnFilters?: ColumnFiltersState
	onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
	pagination?: PaginationState
	onPaginationChange?: OnChangeFn<PaginationState>
	columnVisibility?: VisibilityState
	onColumnVisibilityChange?: OnChangeFn<VisibilityState>

	// Row identity
	getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string

	// Customization
	emptyState?: React.ReactNode

	// Toolbar
	globalFilter?: string
	onGlobalFilterChange?: (value: string) => void
	searchPlaceholder?: string
	toolbar?: React.ReactNode
	toolbarLeft?: React.ReactNode
	toolbarRight?: React.ReactNode
}

function DataTable<TData, TValue>({
	columns: userColumns,
	data,
	// Feature flags
	enableSorting = false,
	enableRowSelection = false,
	enableMultiRowSelection = true,
	enableFiltering = false,
	enablePagination = false,
	enableColumnVisibility = false,
	// Selection options
	showSelectionColumn = true,
	// Controlled state
	sorting: controlledSorting,
	onSortingChange,
	rowSelection: controlledRowSelection,
	onRowSelectionChange,
	columnFilters: controlledColumnFilters,
	onColumnFiltersChange,
	pagination: controlledPagination,
	onPaginationChange,
	columnVisibility: controlledColumnVisibility,
	onColumnVisibilityChange,
	// Row identity
	getRowId,
	// Customization
	emptyState,
	// Toolbar
	globalFilter: controlledGlobalFilter,
	onGlobalFilterChange,
	searchPlaceholder,
	toolbar,
	toolbarLeft,
	toolbarRight,
	// Table visual props
	bordered,
	striped,
	hoverable,
	stickyHeader,
	...tableProps
}: DataTableProps<TData, TValue>) {
	// Internal state for uncontrolled mode
	const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
	const [internalRowSelection, setInternalRowSelection] =
		React.useState<RowSelectionState>({})
	const [internalColumnFilters, setInternalColumnFilters] =
		React.useState<ColumnFiltersState>([])
	const [internalPagination, setInternalPagination] =
		React.useState<PaginationState>({
			pageIndex: 0,
			pageSize: 10,
		})
	const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("")
	const [internalColumnVisibility, setInternalColumnVisibility] =
		React.useState<VisibilityState>({})

	// Use controlled state if provided, otherwise use internal state
	const sorting = controlledSorting ?? internalSorting
	const rowSelection = controlledRowSelection ?? internalRowSelection
	const columnFilters = controlledColumnFilters ?? internalColumnFilters
	const pagination = controlledPagination ?? internalPagination
	const globalFilter = controlledGlobalFilter ?? internalGlobalFilter
	const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility

	// Determine if toolbar should be shown
	const hasToolbar = Boolean(
		toolbar || toolbarLeft || toolbarRight || onGlobalFilterChange || enableColumnVisibility
	)

	// Build columns with optional selection column
	const columns = React.useMemo(() => {
		if (!enableRowSelection || !showSelectionColumn) {
			return userColumns
		}

		const selectionColumn: ColumnDef<TData, unknown> = {
			id: "__select__",
			header: ({ table }) =>
				enableMultiRowSelection ? (
					<div className="flex items-center">
						<Checkbox
							checked={table.getIsAllPageRowsSelected()}
							indeterminate={
								table.getIsSomePageRowsSelected() &&
								!table.getIsAllPageRowsSelected()
							}
							onCheckedChange={(value) =>
								table.toggleAllPageRowsSelected(!!value)
							}
							aria-label="Select all"
						/>
					</div>
				) : null,
			cell: ({ row }) => (
				<div className="flex items-center">
					<Checkbox
						checked={row.getIsSelected()}
						disabled={!row.getCanSelect()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		}

		return [selectionColumn, ...userColumns]
	}, [userColumns, enableRowSelection, enableMultiRowSelection, showSelectionColumn])

	const table = useReactTable({
		data,
		columns,
		getRowId,
		state: {
			sorting,
			rowSelection,
			columnFilters,
			pagination,
			globalFilter,
			columnVisibility,
		},
		onSortingChange: onSortingChange ?? setInternalSorting,
		onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
		onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
		onPaginationChange: onPaginationChange ?? setInternalPagination,
		onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobalFilter,
		onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
		...((enableFiltering || hasToolbar) && { getFilteredRowModel: getFilteredRowModel() }),
		...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
		enableRowSelection,
		enableMultiRowSelection,
		globalFilterFn: "includesString",
	})

	// Calculate total columns for empty state
	const totalColumns = columns.length

	// Render header content with automatic sortable wrapper for string headers
	const renderHeader = (
		header: ReturnType<typeof table.getHeaderGroups>[0]["headers"][0],
		index: number,
		totalHeaders: number
	) => {
		if (header.isPlaceholder) return null

		const headerDef = header.column.columnDef.header
		const canSort = header.column.getCanSort()
		const meta = header.column.columnDef.meta as { align?: "left" | "center" | "right" } | undefined

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

	const tableElement = (
		<Table
			bordered={bordered}
			striped={striped}
			hoverable={hoverable}
			stickyHeader={stickyHeader}
			className={cn(hasToolbar && "rounded-t-none ring-0")}
			{...tableProps}
		>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header, index) => (
							<TableHead
								key={header.id}
								colSpan={header.colSpan}
							>
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

	if (!hasToolbar) {
		return tableElement
	}

	return (
		<div className="bg-card ring-border/60 w-full rounded-2xl ring-1 md:max-w-2xl">
			<div className="flex items-center gap-2 px-2 pt-2">
				{toolbar ?? (
					<>
						{toolbarLeft}
						{toolbarLeft && <div className="bg-border/60 h-5 w-px" />}

						<div className="flex flex-1 items-center gap-2">
							<HugeiconsIcon
								icon={Search01Icon}
								className="text-muted-foreground size-4"
								strokeWidth={2}
							/>
							<input
								type="text"
								placeholder={searchPlaceholder ?? "Search and filter"}
								value={globalFilter}
								onChange={(e) =>
									onGlobalFilterChange
										? onGlobalFilterChange(e.target.value)
										: setInternalGlobalFilter(e.target.value)
								}
								className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
							/>
						</div>

						{enableColumnVisibility && (
							<ColumnVisibilityPopover table={table} />
						)}

						{toolbarRight}
					</>
				)}
			</div>
			{tableElement}
		</div>
	)
}

export { DataTable }
export type { ColumnDef, SortingState, RowSelectionState, ColumnFiltersState, VisibilityState }
