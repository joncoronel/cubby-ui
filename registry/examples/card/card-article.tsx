import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreVerticalIcon } from "@hugeicons/core-free-icons";
export default function CardWithFooter() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Team Meeting</CardTitle>
        <CardDescription>Scheduled for tomorrow at 2:00 PM</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon_sm">
            <HugeiconsIcon icon={MoreVerticalIcon}  strokeWidth={2} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Discuss Q4 roadmap and project priorities with the team.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="ml-auto">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}