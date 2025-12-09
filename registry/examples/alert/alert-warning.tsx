import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { TriangleAlert } from "lucide-react";

export default function AlertWarning() {
  return (
    <Alert variant="warning">
      <TriangleAlert className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        This action cannot be undone. Please proceed with caution.
      </AlertDescription>
    </Alert>
  );
}