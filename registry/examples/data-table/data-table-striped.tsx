"use client"

import { type ColumnDef, DataTable } from "@/registry/default/data-table/data-table"

type Product = {
	id: string
	name: string
	category: string
	price: number
	stock: number
}

const columns: ColumnDef<Product>[] = [
	{
		accessorKey: "id",
		header: "SKU",
	},
	{
		accessorKey: "name",
		header: "Product",
		cell: ({ row }) => (
			<span className="font-medium">{row.getValue("name")}</span>
		),
	},
	{
		accessorKey: "category",
		header: "Category",
	},
	{
		accessorKey: "price",
		header: () => <div className="text-right">Price</div>,
		cell: ({ row }) => {
			const price = parseFloat(row.getValue("price"))
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(price)
			return <div className="text-right">{formatted}</div>
		},
	},
	{
		accessorKey: "stock",
		header: () => <div className="text-right">Stock</div>,
		cell: ({ row }) => (
			<div className="text-right">{row.getValue("stock")}</div>
		),
	},
]

const data: Product[] = [
	{ id: "SKU-001", name: "Wireless Mouse", category: "Electronics", price: 29.99, stock: 150 },
	{ id: "SKU-002", name: "Mechanical Keyboard", category: "Electronics", price: 89.99, stock: 75 },
	{ id: "SKU-003", name: "USB-C Hub", category: "Accessories", price: 49.99, stock: 200 },
	{ id: "SKU-004", name: "Monitor Stand", category: "Furniture", price: 79.99, stock: 50 },
	{ id: "SKU-005", name: "Desk Lamp", category: "Furniture", price: 34.99, stock: 120 },
	{ id: "SKU-006", name: "Webcam HD", category: "Electronics", price: 59.99, stock: 85 },
]

export default function DataTableStriped() {
	return <DataTable columns={columns} data={data} striped hoverable={false} />
}
