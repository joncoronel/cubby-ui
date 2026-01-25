"use client"

import * as React from "react"
import { type Table } from "@tanstack/react-table"

interface DataTableContextValue<TData> {
	table: Table<TData>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic context requires any; type safety is enforced via useDataTable<TData>()
const DataTableContext = React.createContext<DataTableContextValue<any> | null>(
	null
)

function useDataTable<TData>() {
	const context = React.useContext(DataTableContext)
	if (!context) {
		throw new Error("useDataTable must be used within a DataTable")
	}
	return context as DataTableContextValue<TData>
}

export { DataTableContext, useDataTable }
export type { DataTableContextValue }
