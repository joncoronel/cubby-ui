"use client"

import * as React from "react"

import { type ColumnDef, DataTable } from "@/registry/default/data-table/data-table"
import { Badge } from "@/registry/default/badge/badge"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/registry/default/select/select"

type Bill = {
	id: string
	billNumber: string
	dateIssued: string
	total: number
	status: "paid" | "pending" | "overdue"
}

const columns: ColumnDef<Bill>[] = [
	{
		accessorKey: "billNumber",
		header: "Bill",
	},
	{
		accessorKey: "dateIssued",
		header: "Date issued",
	},
	{
		accessorKey: "total",
		header: "Total",
		cell: ({ row }) => {
			const total = parseFloat(row.getValue("total"))
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(total)
			return formatted
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string
			return (
				<Badge variant={status === "paid" ? "success" : status === "pending" ? "warning" : "danger"}>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Badge>
			)
		},
	},
]

const data: Bill[] = [
	{ id: "1", billNumber: "448895349", dateIssued: "Nov 22, 2025", total: 39.99, status: "paid" },
	{ id: "2", billNumber: "448895349", dateIssued: "Nov 22, 2025", total: 39.99, status: "paid" },
	{ id: "3", billNumber: "448895349", dateIssued: "Nov 22, 2025", total: 39.99, status: "paid" },
	{ id: "4", billNumber: "448895349", dateIssued: "Nov 22, 2025", total: 39.99, status: "paid" },
]

const statusOptions = [
	{ label: "All", value: "all" },
	{ label: "Paid", value: "paid" },
	{ label: "Pending", value: "pending" },
	{ label: "Overdue", value: "overdue" },
]


export default function DataTableToolbar() {
	const [globalFilter, setGlobalFilter] = React.useState("")
	const [statusFilter, setStatusFilter] = React.useState("all")

	// Filter data based on status
	const filteredData = statusFilter === "all"
		? data
		: data.filter(row => row.status === statusFilter)

	return (
		<DataTable
			columns={columns}
			data={filteredData}
			enableFiltering
			enableRowSelection
			enableColumnVisibility
			globalFilter={globalFilter}
			onGlobalFilterChange={setGlobalFilter}
			toolbarLeft={
				<Select
					items={statusOptions}
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value ?? "all")}
					
				>
					<SelectTrigger className="w-auto min-w-16">
						<SelectValue />
					</SelectTrigger>
					<SelectContent alignItemWithTrigger>
						{statusOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			}
		/>
	)
}
