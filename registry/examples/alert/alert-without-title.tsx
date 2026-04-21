import { Alert, AlertDescription } from "@/registry/default/alert/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
export default function AlertWithoutTitle() {
  return (
    <Alert>
      <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4"  strokeWidth={2} />
      <AlertDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </AlertDescription>
    </Alert>
  );
}