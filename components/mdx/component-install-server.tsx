import type { ReactElement } from "react";
import { ComponentInstall } from "./component-install";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";
import { transformComponentImports } from "@/lib/transform-registry-imports";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import type { BundledLanguage } from "shiki/langs";

interface ComponentInstallServerProps {
  component: string;
}

// Helper to get language from file extension
function getLanguageFromPath(filePath: string): BundledLanguage {
  const ext = path.extname(filePath);
  switch (ext) {
    case ".ts":
      return "typescript";
    case ".tsx":
      return "tsx";
    case ".js":
      return "javascript";
    case ".jsx":
      return "jsx";
    default:
      return "tsx";
  }
}

// Helper to process files from a registry JSON
async function processRegistryFiles(
  registryJson: any,
  component: string,
): Promise<
  Array<{
    path: string;
    type: string;
    name: string;
    relativePath: string;
    content: string;
    highlighted: ReactElement;
  }>
> {
  if (!registryJson.files || !Array.isArray(registryJson.files)) {
    return [];
  }

  return Promise.all(
    registryJson.files.map(async (file: any) => {
      const fullPath = path.join(process.cwd(), file.path);
      const rawContent = await fs.readFile(fullPath, "utf-8");
      const transformedContent = transformComponentImports(
        rawContent,
        component,
        file.path,
        file.type,
      );
      const language = getLanguageFromPath(file.path);
      const highlighted = await highlight(transformedContent, language);

      // Use target path for display if available, otherwise compute from source path
      // target is the actual install location (e.g., "hooks/cubby-ui/use-fuzzy-filter.ts")
      let relativePath = file.target;
      if (!relativePath) {
        // Fallback: compute from source path
        relativePath = file.path.replace(`registry/default/${component}/`, "");
      }

      return {
        path: file.path,
        type: file.type,
        name: path.basename(file.path),
        relativePath,
        content: transformedContent,
        highlighted,
      };
    }),
  );
}

// Helper to read a registry item JSON
function readRegistryJson(itemName: string): any | null {
  try {
    const registryJsonPath = path.join(
      process.cwd(),
      "public",
      "r",
      `${itemName}.json`,
    );
    return JSON.parse(fsSync.readFileSync(registryJsonPath, "utf-8"));
  } catch {
    return null;
  }
}

export async function ComponentInstallServer({
  component,
}: ComponentInstallServerProps) {
  let componentFiles: Array<{
    path: string;
    type: string;
    name: string;
    relativePath: string;
    content: string;
    highlighted: ReactElement;
  }> = [];

  // Collect all dependencies (including from registry dependencies)
  const allDependencies = new Set<string>();

  try {
    const registryJson = readRegistryJson(component);

    if (registryJson) {
      // Process main component files
      componentFiles = await processRegistryFiles(registryJson, component);

      // Add component's own dependencies
      if (registryJson.dependencies) {
        registryJson.dependencies.forEach((dep: string) =>
          allDependencies.add(dep),
        );
      }

      // Process registry dependencies (hooks and libs only, not other components)
      if (
        registryJson.registryDependencies &&
        Array.isArray(registryJson.registryDependencies)
      ) {
        for (const regDep of registryJson.registryDependencies) {
          // Extract item name from @cubby-ui/item-name format
          const itemName = regDep.replace("@cubby-ui/", "");
          const depJson = readRegistryJson(itemName);

          if (depJson) {
            // Only include hooks and libs in manual install files
            // Components (like scroll-area) are installed separately
            const isHookOrLib =
              depJson.type === "registry:hook" ||
              depJson.type === "registry:lib";

            if (isHookOrLib) {
              // Add files from this dependency
              const depFiles = await processRegistryFiles(depJson, component);
              componentFiles.push(...depFiles);

              // Add dependencies from this registry dependency
              if (depJson.dependencies) {
                depJson.dependencies.forEach((dep: string) =>
                  allDependencies.add(dep),
                );
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Could not read registry files for ${component}:`, error);
  }

  // Pre-highlight all CLI commands
  const registryUrl = `@cubby-ui/${component}`;
  const highlightedCliCommands = {
    npm: await highlight(`npx shadcn@latest add ${registryUrl}`, "bash"),
    pnpm: await highlight(`pnpm dlx shadcn@latest add ${registryUrl}`, "bash"),
    yarn: await highlight(`yarn dlx shadcn@latest add ${registryUrl}`, "bash"),
    bun: await highlight(`bunx --bun shadcn@latest add ${registryUrl}`, "bash"),
  };

  // Pre-highlight install commands if there are dependencies
  let highlightedInstallCommands: Record<string, ReactElement> | undefined;
  const depsArray = Array.from(allDependencies);
  if (depsArray.length > 0) {
    const deps = depsArray.join(" ");
    highlightedInstallCommands = {
      npm: await highlight(`npm install ${deps}`, "bash"),
      pnpm: await highlight(`pnpm add ${deps}`, "bash"),
      yarn: await highlight(`yarn add ${deps}`, "bash"),
      bun: await highlight(`bun add ${deps}`, "bash"),
    };
  }

  return (
    <ComponentInstall
      component={component}
      componentFiles={componentFiles}
      highlightedCliCommands={highlightedCliCommands}
      highlightedInstallCommands={highlightedInstallCommands}
      allDependencies={depsArray}
    />
  );
}
