import { PackageManagerCommand } from "./package-manager-command";
import {
  packageManagerCommands,
  type CommandType,
} from "./package-manager-commands";

interface PackageManagerCommandServerProps {
  /** The base command without package manager prefix */
  command: string;
  /** Type of command: "run" for npx-style, "add" for install-style. Defaults to "run" */
  type?: CommandType;
}

export function PackageManagerCommandServer({
  command,
  type = "run",
}: PackageManagerCommandServerProps) {
  return (
    <PackageManagerCommand commands={packageManagerCommands(command, type)} />
  );
}
