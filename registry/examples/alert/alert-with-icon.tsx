import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";
import { Terminal } from "lucide-react";

export default function AlertWithIcon() {
  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the cli.
      </AlertDescription>
    </Alert>
  );
}