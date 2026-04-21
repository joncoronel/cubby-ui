import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/default/alert/alert";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
export default function AlertWithActions() {
  return (
    <Alert variant="info">
      <HugeiconsIcon icon={InformationCircleIcon}  strokeWidth={2} />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        Describe what can be done about it here.
      </AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="xs">
          Dismiss
        </Button>
        <Button size="xs">Accept</Button>
      </AlertAction>
    </Alert>
  );
}
