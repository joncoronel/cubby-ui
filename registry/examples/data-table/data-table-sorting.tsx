"use client"

import { type ColumnDef, DataTable } from "@/registry/default/data-table/data-table"

type Employee = {
	id: string
	name: string
	email: string
	department: string
	salary: number
}

const columns: ColumnDef<Employee>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "department",
		header: "Department",
	},
	{
		accessorKey: "salary",
		header: "Salary",
		meta: { align: "right" as const },
		cell: ({ row }) => {
			const salary = parseFloat(row.getValue("salary"))
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(salary)
			return <div className="text-right font-medium">{formatted}</div>
		},
	},
]

const data: Employee[] = [
	{ id: "1", name: "Alice Johnson", email: "alice@example.com", department: "Engineering", salary: 95000 },
	{ id: "2", name: "Bob Smith", email: "bob@example.com", department: "Design", salary: 85000 },
	{ id: "3", name: "Charlie Brown", email: "charlie@example.com", department: "Marketing", salary: 75000 },
	{ id: "4", name: "Diana Prince", email: "diana@example.com", department: "Engineering", salary: 105000 },
	{ id: "5", name: "Eve Wilson", email: "eve@example.com", department: "Sales", salary: 80000 },
	{ id: "6", name: "Frank Miller", email: "frank@example.com", department: "Design", salary: 90000 },
]

export default function DataTableSorting() {
	return <DataTable columns={columns} data={data} enableSorting />
}
