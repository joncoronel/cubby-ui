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
	{ id: "1", billNumber: "448895349", dateIssued: "Nov 22, 2025", total: 39.99, status: "paid" },
	{ id: "2", billNumber: "551238764", dateIssued: "Nov 18, 2025", total: 124.50, status: "paid" },
	{ id: "3", billNumber: "662341987", dateIssued: "Nov 15, 2025", total: 89.00, status: "pending" },
	{ id: "4", billNumber: "773456210", dateIssued: "Nov 10, 2025", total: 250.75, status: "overdue" },
	{ id: "5", billNumber: "884567321", dateIssued: "Nov 8, 2025", total: 67.25, status: "paid" },
	{ id: "6", billNumber: "995678432", dateIssued: "Nov 5, 2025", total: 189.99, status: "pending" },
	{ id: "7", billNumber: "106789543", dateIssued: "Nov 1, 2025", total: 45.00, status: "paid" },
	{ id: "8", billNumber: "217890654", dateIssued: "Oct 28, 2025", total: 320.00, status: "overdue" },
	{ id: "9", billNumber: "328901765", dateIssued: "Oct 25, 2025", total: 55.50, status: "paid" },
	{ id: "10", billNumber: "439012876", dateIssued: "Oct 22, 2025", total: 175.25, status: "pending" },
	{ id: "11", billNumber: "540123987", dateIssued: "Oct 18, 2025", total: 92.00, status: "paid" },
	{ id: "12", billNumber: "651234098", dateIssued: "Oct 15, 2025", total: 410.50, status: "overdue" },
	{ id: "13", billNumber: "762345109", dateIssued: "Oct 12, 2025", total: 28.75, status: "paid" },
	{ id: "14", billNumber: "873456210", dateIssued: "Oct 8, 2025", total: 145.00, status: "pending" },
	{ id: "15", billNumber: "984567321", dateIssued: "Oct 5, 2025", total: 78.99, status: "paid" },
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
			enableFiltering
			enableRowSelection
		>
			<DataTableToolbar variant="ghost">
				<Select
					items={statusOptions}
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value ?? "all")}
				>
					<SelectTrigger className="w-auto min-w-16 border-transparent bg-transparent shadow-none before:hidden dark:bg-transparent">
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
				<DataTableToolbarSeparator />
				<DataTableSearch placeholder="Search and filter" />
				<DataTableColumnToggle />
			</DataTableToolbar>
			<DataTableContent className="max-h-[400px]" />
		</DataTable>
	)
}
