import { Alert, AlertDescription, AlertTitle } from "@/registry/default/alert/alert";

export default function AlertDemo() {
  return (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the cli.
      </AlertDescription>
    </Alert>
  );
}