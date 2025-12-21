import type { ReactElement } from "react";
import { PackageManagerCommand } from "./package-manager-command";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
type CommandType = "run" | "add";

interface PackageManagerCommandServerProps {
  /** The base command without package manager prefix */
  command: string;
  /** Type of command: "run" for npx-style, "add" for install-style. Defaults to "run" */
  type?: CommandType;
}

/**
 * Generates the full command for a package manager based on type.
 */
function generateCommand(
  baseCommand: string,
  pm: PackageManager,
  type: CommandType,
): string {
  if (type === "add") {
    // Install dependencies: npm install / pnpm add / yarn add / bun add
    switch (pm) {
      case "npm":
        return `npm install ${baseCommand}`;
      case "pnpm":
        return `pnpm add ${baseCommand}`;
      case "yarn":
        return `yarn add ${baseCommand}`;
      case "bun":
        return `bun add ${baseCommand}`;
    }
  }

  // Run command: npx / pnpm dlx / yarn dlx / bunx --bun
  switch (pm) {
    case "npm":
      return `npx ${baseCommand}`;
    case "pnpm":
      return `pnpm dlx ${baseCommand}`;
    case "yarn":
      return `yarn dlx ${baseCommand}`;
    case "bun":
      return `bunx --bun ${baseCommand}`;
  }
}

export async function PackageManagerCommandServer({
  command,
  type = "run",
}: PackageManagerCommandServerProps) {
  const packageManagers: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

  // Build commands and highlighted versions
  const commands = {} as Record<PackageManager, string>;
  const highlighted = {} as Record<PackageManager, ReactElement>;

  await Promise.all(
    packageManagers.map(async (pm) => {
      const fullCommand = generateCommand(command, pm, type);
      commands[pm] = fullCommand;
      highlighted[pm] = await highlight(fullCommand, "bash");
    }),
  );

  return <PackageManagerCommand commands={commands} highlighted={highlighted} />;
}
