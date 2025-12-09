import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { AlertCircle } from "lucide-react";

export default function AlertDanger() {
  return (
    <Alert variant="danger">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  );
}