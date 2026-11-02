"use client"

import * as React from "react"
import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFns,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFns,
	tableFeatures,
	type ReactTable,
	type RowData,
} from "@tanstack/react-table"

// Every feature DataTable exposes, registered once so the table and every
// column type share one feature set. The built-in filter and sort registries
// keep "auto" filtering and sorting resolving as they did in v8.
const dataTableFeatures = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	rowSortingFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	columnVisibilityFeature,
	filteredRowModel: createFilteredRowModel(),
	sortedRowModel: createSortedRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	filterFns,
	sortFns,
})

type DataTableFeatures = typeof dataTableFeatures

interface DataTableContextValue<TData extends RowData> {
	table: ReactTable<DataTableFeatures, TData>
}

// A table of one row type doesn't fit a context typed for any other, so the
// context holds it untyped and useDataTable<TData>() restores the type.
const DataTableContext = React.createContext<{ table: unknown } | null>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Callers that don't name their row type get the untyped table, as in v8
function useDataTable<TData extends RowData = any>() {
	const context = React.useContext(DataTableContext)
	if (!context) {
		throw new Error("useDataTable must be used within a DataTable")
	}
	return context as DataTableContextValue<TData>
}

export { DataTableContext, dataTableFeatures, useDataTable }
export type { DataTableContextValue, DataTableFeatures }
