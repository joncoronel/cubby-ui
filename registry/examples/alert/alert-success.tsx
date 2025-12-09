import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { Rocket } from "lucide-react";

export default function AlertSuccess() {
  return (
    <Alert variant="success">
      <Rocket className="h-4 w-4" />
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Your application has been deployed successfully.
      </AlertDescription>
    </Alert>
  );
}