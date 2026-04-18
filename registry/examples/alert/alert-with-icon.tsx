import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerTerminal01Icon } from "@hugeicons/core-free-icons";
export default function AlertWithIcon() {
  return (
    <Alert>
      <HugeiconsIcon icon={ComputerTerminal01Icon} className="h-4 w-4"  strokeWidth={2} />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the cli.
      </AlertDescription>
    </Alert>
  );
}