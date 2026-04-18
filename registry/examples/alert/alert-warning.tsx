import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
export default function AlertWarning() {
  return (
    <Alert variant="warning">
      <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4"  strokeWidth={2} />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        This action cannot be undone. Please proceed with caution.
      </AlertDescription>
    </Alert>
  );
}