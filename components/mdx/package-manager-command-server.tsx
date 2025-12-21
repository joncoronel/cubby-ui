import type { ReactElement } from "react";
import { PackageManagerCommand } from "./package-manager-command";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

interface PackageManagerCommandServerProps {
  /** The npm version of the command (will be auto-converted for other package managers) */
  npm: string;
}

/**
 * Converts an npm command to other package manager equivalents.
 */
function convertCommand(npmCommand: string, pm: PackageManager): string {
  if (pm === "npm") return npmCommand;

  let command = npmCommand;

  // npx -> pnpm dlx / bunx (yarn uses npx)
  if (command.startsWith("npx ")) {
    if (pm === "pnpm") {
      command = command.replace(/^npx /, "pnpm dlx ");
    } else if (pm === "bun") {
      command = command.replace(/^npx /, "bunx ");
    }
  }

  // npm install -> pnpm add / yarn add / bun add
  if (command.startsWith("npm install ")) {
    command = command.replace(
      /^npm install /,
      pm === "pnpm" ? "pnpm add " : pm === "yarn" ? "yarn add " : "bun add ",
    );
  }

  // npm run -> pnpm run / yarn run / bun run
  if (command.startsWith("npm run ")) {
    command = command.replace(
      /^npm run /,
      pm === "pnpm" ? "pnpm run " : pm === "yarn" ? "yarn run " : "bun run ",
    );
  }

  return command;
}

export async function PackageManagerCommandServer({
  npm,
}: PackageManagerCommandServerProps) {
  const packageManagers: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

  // Build commands and highlighted versions
  const commands = {} as Record<PackageManager, string>;
  const highlighted = {} as Record<PackageManager, ReactElement>;

  await Promise.all(
    packageManagers.map(async (pm) => {
      const command = convertCommand(npm, pm);
      commands[pm] = command;
      highlighted[pm] = await highlight(command, "bash");
    }),
  );

  return <PackageManagerCommand commands={commands} highlighted={highlighted} />;
}
