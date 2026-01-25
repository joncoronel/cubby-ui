import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/registry/default/table/table"

const transactions = [
	{ id: "TXN001", date: "2024-01-15", description: "Office Supplies", amount: "$125.00", status: "Completed" },
	{ id: "TXN002", date: "2024-01-14", description: "Software License", amount: "$299.00", status: "Completed" },
	{ id: "TXN003", date: "2024-01-13", description: "Cloud Hosting", amount: "$89.00", status: "Pending" },
	{ id: "TXN004", date: "2024-01-12", description: "Marketing Campaign", amount: "$450.00", status: "Completed" },
	{ id: "TXN005", date: "2024-01-11", description: "Consulting Fee", amount: "$750.00", status: "Completed" },
	{ id: "TXN006", date: "2024-01-10", description: "Hardware Upgrade", amount: "$1,200.00", status: "Pending" },
	{ id: "TXN007", date: "2024-01-09", description: "Training Materials", amount: "$85.00", status: "Completed" },
	{ id: "TXN008", date: "2024-01-08", description: "Travel Expenses", amount: "$320.00", status: "Completed" },
	{ id: "TXN009", date: "2024-01-07", description: "Team Lunch", amount: "$156.00", status: "Completed" },
	{ id: "TXN010", date: "2024-01-06", description: "Domain Renewal", amount: "$45.00", status: "Completed" },
	{ id: "TXN011", date: "2024-01-05", description: "API Integration", amount: "$199.00", status: "Pending" },
	{ id: "TXN012", date: "2024-01-04", description: "Security Audit", amount: "$500.00", status: "Completed" },
]

export default function TableStickyHeader() {
	return (
		<Table className="max-h-[300px]">
			<TableHeader>
				<TableRow>
					<TableHead>Transaction ID</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{transactions.map((txn) => (
					<TableRow key={txn.id}>
						<TableCell className="font-medium">{txn.id}</TableCell>
						<TableCell>{txn.date}</TableCell>
						<TableCell>{txn.description}</TableCell>
						<TableCell>{txn.amount}</TableCell>
						<TableCell>{txn.status}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
