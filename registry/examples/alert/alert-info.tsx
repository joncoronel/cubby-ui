import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { Info } from "lucide-react";

export default function AlertInfo() {
  return (
    <Alert variant="info">
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is some helpful information for the user.
      </AlertDescription>
    </Alert>
  );
}