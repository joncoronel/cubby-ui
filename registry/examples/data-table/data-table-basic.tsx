"use client"

import { type ColumnDef, DataTable } from "@/registry/default/data-table/data-table"

type Invoice = {
	id: string
	status: "pending" | "paid" | "unpaid"
	method: string
	amount: number
}

const columns: ColumnDef<Invoice>[] = [
	{
		accessorKey: "id",
		header: "Invoice",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<span className="capitalize">{row.getValue("status")}</span>
		),
	},
	{
		accessorKey: "method",
		header: "Method",
	},
	{
		accessorKey: "amount",
		header: () => <div className="text-right">Amount</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("amount"))
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount)
			return <div className="text-right font-medium">{formatted}</div>
		},
	},
]

const data: Invoice[] = [
	{ id: "INV001", status: "paid", amount: 250.0, method: "Credit Card" },
	{ id: "INV002", status: "pending", amount: 150.0, method: "PayPal" },
	{ id: "INV003", status: "unpaid", amount: 350.0, method: "Bank Transfer" },
	{ id: "INV004", status: "paid", amount: 450.0, method: "Credit Card" },
	{ id: "INV005", status: "paid", amount: 550.0, method: "PayPal" },
]

export default function DataTableBasic() {
	return <DataTable columns={columns} data={data} />
}
