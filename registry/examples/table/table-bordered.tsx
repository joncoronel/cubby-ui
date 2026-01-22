import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/registry/default/table/table"

const schedule = [
	{ day: "Monday", morning: "Yoga", afternoon: "Cardio", evening: "Rest" },
	{ day: "Tuesday", morning: "Strength", afternoon: "Rest", evening: "Swimming" },
	{ day: "Wednesday", morning: "Rest", afternoon: "Cycling", evening: "Yoga" },
	{ day: "Thursday", morning: "Cardio", afternoon: "Strength", evening: "Rest" },
	{ day: "Friday", morning: "Swimming", afternoon: "Rest", evening: "Cardio" },
]

export default function TableBordered() {
	return (
		<Table bordered>
			<TableHeader>
				<TableRow>
					<TableHead>Day</TableHead>
					<TableHead>Morning</TableHead>
					<TableHead>Afternoon</TableHead>
					<TableHead>Evening</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{schedule.map((item) => (
					<TableRow key={item.day}>
						<TableCell className="font-medium">{item.day}</TableCell>
						<TableCell>{item.morning}</TableCell>
						<TableCell>{item.afternoon}</TableCell>
						<TableCell>{item.evening}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
