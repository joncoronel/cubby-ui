import { Alert, AlertDescription } from "@/registry/default/alert/alert";
import { AlertCircle } from "lucide-react";

export default function AlertWithoutTitle() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </AlertDescription>
    </Alert>
  );
}