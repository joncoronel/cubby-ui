"use client"

import * as React from "react"
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	type ColumnDef,
	type SortingState,
	type RowSelectionState,
	type ColumnFiltersState,
	type PaginationState,
	type VisibilityState,
	type OnChangeFn,
	type Row,
} from "@tanstack/react-table"

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
import { DataTableSearch } from "@/registry/default/data-table/data-table-search"
import { DataTableColumnToggle } from "@/registry/default/data-table/data-table-column-toggle"
import { DataTableContent } from "@/registry/default/data-table/data-table-content"
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

export {
	DataTable,
	DataTableToolbar,
	ToolbarSeparator as DataTableToolbarSeparator,
	DataTableSearch,
	DataTableColumnToggle,
	DataTableContent,
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
