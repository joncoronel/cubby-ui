"use client"

import * as React from "react"

import {
	type ColumnDef,
	DataTable,
	DataTableToolbar,
	DataTableToolbarSeparator,
	DataTableSearch,
	DataTableColumnToggle,
	DataTableContent,
	DataTableHeader,
	DataTableBody,
} from "@/registry/default/data-table/data-table"
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
		cell: ({ row }) => {
			return new Date(row.getValue("dateIssued")).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		},
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
				<Badge
					variant={
						status === "paid"
							? "success"
							: status === "pending"
								? "warning"
								: "danger"
					}
				>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Badge>
			)
		},
	},
]

const data: Bill[] = [
	{ id: "1", billNumber: "448895349", dateIssued: "2025-11-22", total: 39.99, status: "paid" },
	{ id: "2", billNumber: "551238764", dateIssued: "2025-11-18", total: 124.50, status: "paid" },
	{ id: "3", billNumber: "662341987", dateIssued: "2025-11-15", total: 89.00, status: "pending" },
	{ id: "4", billNumber: "773456210", dateIssued: "2025-11-10", total: 250.75, status: "overdue" },
	{ id: "5", billNumber: "884567321", dateIssued: "2025-11-08", total: 67.25, status: "paid" },
	{ id: "6", billNumber: "995678432", dateIssued: "2025-11-05", total: 189.99, status: "pending" },
	{ id: "7", billNumber: "106789543", dateIssued: "2025-11-01", total: 45.00, status: "paid" },
	{ id: "8", billNumber: "217890654", dateIssued: "2025-10-28", total: 320.00, status: "overdue" },
	{ id: "9", billNumber: "328901765", dateIssued: "2025-10-25", total: 55.50, status: "paid" },
	{ id: "10", billNumber: "439012876", dateIssued: "2025-10-22", total: 175.25, status: "pending" },
	{ id: "11", billNumber: "540123987", dateIssued: "2025-10-18", total: 92.00, status: "paid" },
	{ id: "12", billNumber: "651234098", dateIssued: "2025-10-15", total: 410.50, status: "overdue" },
	{ id: "13", billNumber: "762345109", dateIssued: "2025-10-12", total: 28.75, status: "paid" },
	{ id: "14", billNumber: "873456210", dateIssued: "2025-10-08", total: 145.00, status: "pending" },
	{ id: "15", billNumber: "984567321", dateIssued: "2025-10-05", total: 78.99, status: "paid" },
]

const statusOptions = [
	{ label: "All", value: "all" },
	{ label: "Paid", value: "paid" },
	{ label: "Pending", value: "pending" },
	{ label: "Overdue", value: "overdue" },
]

export default function DataTableToolbarExample() {
	const [statusFilter, setStatusFilter] = React.useState("all")

	// Filter data based on status
	const filteredData =
		statusFilter === "all"
			? data
			: data.filter((row) => row.status === statusFilter)

	return (
		<DataTable
			columns={columns}
			data={filteredData}
			enableSorting
			enableFiltering
			enableRowSelection
		>
			<DataTableToolbar variant="ghost">
				<Select
					items={statusOptions}
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value ?? "all")}
				>
					<SelectTrigger size="sm" className="w-auto min-w-16 border-transparent bg-transparent shadow-none before:hidden dark:bg-transparent">
						<SelectValue />
					</SelectTrigger>
					<SelectContent size="sm" alignItemWithTrigger>
						{statusOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<DataTableToolbarSeparator />
				<DataTableSearch placeholder="Search and filter" />
				<DataTableColumnToggle />
			</DataTableToolbar>
			<DataTableContent className="max-h-[400px]">
				<DataTableHeader enableSorting />
				<DataTableBody />
			</DataTableContent>
		</DataTable>
	)
}
