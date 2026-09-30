export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

/** "run" is npx-style (a package's CLI); "add" installs dependencies. */
export type CommandType = "run" | "add";

const PREFIX: Record<CommandType, Record<PackageManager, string>> = {
  run: { npm: "npx", pnpm: "pnpm dlx", yarn: "yarn dlx", bun: "bunx --bun" },
  add: {
    npm: "npm install",
    pnpm: "pnpm add",
    yarn: "yarn add",
    bun: "bun add",
  },
};

/** One command written for every package manager. */
export function packageManagerCommands(
  command: string,
  type: CommandType,
): Record<PackageManager, string> {
  return Object.fromEntries(
    PACKAGE_MANAGERS.map((pm) => [pm, `${PREFIX[type][pm]} ${command}`]),
  ) as Record<PackageManager, string>;
}
