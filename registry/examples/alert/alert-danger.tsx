import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
export default function AlertDanger() {
  return (
    <Alert variant="danger">
      <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4"  strokeWidth={2} />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  );
}