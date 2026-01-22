import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/registry/default/table/table"

const employees = [
	{ id: "EMP001", name: "John Doe", department: "Engineering", status: "Active" },
	{ id: "EMP002", name: "Jane Smith", department: "Design", status: "Active" },
	{ id: "EMP003", name: "Bob Johnson", department: "Marketing", status: "On Leave" },
	{ id: "EMP004", name: "Alice Brown", department: "Engineering", status: "Active" },
	{ id: "EMP005", name: "Charlie Wilson", department: "Sales", status: "Active" },
	{ id: "EMP006", name: "Diana Lee", department: "Design", status: "Active" },
]

export default function TableStriped() {
	return (
		<Table striped hoverable={false}>
			<TableHeader>
				<TableRow>
					<TableHead>ID</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Department</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{employees.map((employee) => (
					<TableRow key={employee.id}>
						<TableCell className="font-medium">{employee.id}</TableCell>
						<TableCell>{employee.name}</TableCell>
						<TableCell>{employee.department}</TableCell>
						<TableCell>{employee.status}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
