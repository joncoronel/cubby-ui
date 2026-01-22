"use client"

import * as React from "react"

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/registry/default/table/table"

const tasks = [
	{ id: "1", title: "Update documentation", priority: "High", status: "In Progress" },
	{ id: "2", title: "Fix login bug", priority: "Critical", status: "Todo" },
	{ id: "3", title: "Add dark mode", priority: "Medium", status: "Done" },
	{ id: "4", title: "Refactor API layer", priority: "Low", status: "In Progress" },
	{ id: "5", title: "Write unit tests", priority: "High", status: "Todo" },
]

export default function TableRowSelection() {
	const [selectedIds, setSelectedIds] = React.useState<string[]>(["2"])

	const toggleSelection = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
		)
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[50px]">#</TableHead>
					<TableHead>Task</TableHead>
					<TableHead>Priority</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tasks.map((task) => (
					<TableRow
						key={task.id}
						selected={selectedIds.includes(task.id)}
						onClick={() => toggleSelection(task.id)}
						className="cursor-pointer"
					>
						<TableCell>{task.id}</TableCell>
						<TableCell className="font-medium">{task.title}</TableCell>
						<TableCell>{task.priority}</TableCell>
						<TableCell>{task.status}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
