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
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/registry/default/checkbox/checkbox"
import {
	DataTableContext,
	useDataTable,
} from "@/registry/default/data-table/data-table-context"
import {
	Toolbar,
	ToolbarSeparator,
	type ToolbarProps,
} from "@/registry/default/toolbar/toolbar"
import {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	type TableProps,
} from "@/registry/default/table/table"
import { DataTableSearch } from "@/registry/default/data-table/data-table-search"
import { DataTableColumnToggle } from "@/registry/default/data-table/data-table-column-toggle"
import { DataTablePagination } from "@/registry/default/data-table/data-table-pagination"

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	children: React.ReactNode
	className?: string

	// Feature flags
	enableSorting?: boolean
	enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
	enableMultiRowSelection?: boolean
	enableFiltering?: boolean
	enablePagination?: boolean

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
	globalFilter?: string
	onGlobalFilterChange?: OnChangeFn<string>

	// Row identity
	getRowId?: (
		originalRow: TData,
		index: number,
		parent?: Row<TData>
	) => string
}

function DataTable<TData, TValue>({
	columns: userColumns,
	data,
	children,
	className,
	// Feature flags
	enableSorting = false,
	enableRowSelection = false,
	enableMultiRowSelection = true,
	enableFiltering = false,
	enablePagination = false,
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
	globalFilter: controlledGlobalFilter,
	onGlobalFilterChange,
	// Row identity
	getRowId,
}: DataTableProps<TData, TValue>) {
	// Internal state for uncontrolled mode
	const [internalSorting, setInternalSorting] = React.useState<SortingState>(
		[]
	)
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
	}, [
		userColumns,
		enableRowSelection,
		enableMultiRowSelection,
		showSelectionColumn,
	])

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
		onColumnVisibilityChange:
			onColumnVisibilityChange ?? setInternalColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
		...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),
		...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
		enableRowSelection,
		enableMultiRowSelection,
		globalFilterFn: "includesString",
	})

	return (
		<DataTableContext.Provider value={{ table }}>
			<div
				className={cn(
					"bg-card ring-border/60 w-full rounded-2xl ring-1 md:max-w-2xl",
					className
				)}
			>
				{children}
			</div>
		</DataTableContext.Provider>
	)
}

function DataTableToolbar({ className, ...props }: ToolbarProps) {
	return (
		<Toolbar
			className={cn("rounded-b-none px-2 pt-2 pb-0", className)}
			{...props}
		/>
	)
}

export interface DataTableContentProps
	extends Omit<TableProps, "children"> {
	children: React.ReactNode
}

function DataTableContent({
	bordered,
	striped,
	hoverable,
	rowDividers = true,
	className,
	children,
	...tableProps
}: DataTableContentProps) {
	return (
		<Table
			bordered={bordered}
			striped={striped}
			hoverable={hoverable}
			rowDividers={rowDividers}
			className={cn("rounded-none bg-transparent ring-0", className)}
			{...tableProps}
		>
			{children}
		</Table>
	)
}

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

export interface DataTableHeaderProps
	extends React.ComponentProps<typeof TableHeader> {
	enableSorting?: boolean
}

function DataTableHeader({
	enableSorting = false,
	className,
	...props
}: DataTableHeaderProps) {
	const { table } = useDataTable()

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

		return flexRender(headerDef, header.getContext())
	}

	return (
		<TableHeader className={className} {...props}>
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
	)
}

export interface DataTableBodyProps
	extends React.ComponentProps<typeof TableBody> {
	emptyState?: React.ReactNode
}

function DataTableBody({
	emptyState,
	className,
	...props
}: DataTableBodyProps) {
	const { table } = useDataTable()
	const totalColumns = table.getAllColumns().length

	return (
		<TableBody className={className} {...props}>
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
	)
}

export type DataTableFooterProps = React.ComponentProps<typeof TableFooter>

function DataTableFooter({ className, children, ...props }: DataTableFooterProps) {
	return (
		<TableFooter className={className} {...props}>
			{children}
		</TableFooter>
	)
}

export {
	DataTable,
	DataTableToolbar,
	ToolbarSeparator as DataTableToolbarSeparator,
	DataTableSearch,
	DataTableColumnToggle,
	DataTableContent,
	DataTableHeader,
	DataTableBody,
	DataTableFooter,
	DataTablePagination,
	useDataTable,
}

export type {
	ColumnDef,
	SortingState,
	RowSelectionState,
	ColumnFiltersState,
	VisibilityState,
	PaginationState,
}
