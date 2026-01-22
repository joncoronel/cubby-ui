"use client"

import * as React from "react"

import {
	type ColumnDef,
	DataTable,
	type RowSelectionState,
} from "@/registry/default/data-table/data-table"

type Task = {
	id: string
	title: string
	status: "todo" | "in-progress" | "done"
	priority: "low" | "medium" | "high"
}

const columns: ColumnDef<Task>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "title",
		header: "Title",
		cell: ({ row }) => (
			<span className="font-medium">{row.getValue("title")}</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<span className="capitalize">{row.getValue("status")}</span>
		),
	},
	{
		accessorKey: "priority",
		header: "Priority",
		cell: ({ row }) => (
			<span className="capitalize">{row.getValue("priority")}</span>
		),
	},
]

const data: Task[] = [
	{ id: "TASK-001", title: "Update documentation", status: "in-progress", priority: "high" },
	{ id: "TASK-002", title: "Fix login bug", status: "todo", priority: "high" },
	{ id: "TASK-003", title: "Add dark mode", status: "done", priority: "medium" },
	{ id: "TASK-004", title: "Refactor API layer", status: "in-progress", priority: "low" },
	{ id: "TASK-005", title: "Write unit tests", status: "todo", priority: "medium" },
]

export default function DataTableRowSelection() {
	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

	return (
		<div className="space-y-4">
			<DataTable
				columns={columns}
				data={data}
				enableRowSelection
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
			/>
			<div className="text-muted-foreground text-sm">
				{Object.keys(rowSelection).length} of {data.length} row(s) selected.
			</div>
		</div>
	)
}
