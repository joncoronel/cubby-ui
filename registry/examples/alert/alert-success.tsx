import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { RocketIcon } from "@hugeicons/core-free-icons";
export default function AlertSuccess() {
  return (
    <Alert variant="success">
      <HugeiconsIcon icon={RocketIcon} className="h-4 w-4"  strokeWidth={2} />
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Your application has been deployed successfully.
      </AlertDescription>
    </Alert>
  );
}