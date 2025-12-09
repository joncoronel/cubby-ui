import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/default/alert/alert";
import { Button } from "@/registry/default/button/button";
import { Info } from "lucide-react";

export default function AlertWithActions() {
  return (
    <Alert variant="info">
      <Info />
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
