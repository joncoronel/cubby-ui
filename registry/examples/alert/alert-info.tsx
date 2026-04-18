import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
export default function AlertInfo() {
  return (
    <Alert variant="info">
      <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4"  strokeWidth={2} />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is some helpful information for the user.
      </AlertDescription>
    </Alert>
  );
}