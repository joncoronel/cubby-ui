import type { ReactElement } from "react";
import { ComponentInstall } from "./component-install";
import { componentMetadata } from "@/app/components/_generated/registry";
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

export async function ComponentInstallServer({
  component,
}: ComponentInstallServerProps) {
  const metadata =
    componentMetadata[component as keyof typeof componentMetadata];

  // Read all files from registry JSON
  const registryJsonPath = path.join(
    process.cwd(),
    "public",
    "r",
    `${component}.json`,
  );

  let componentFiles: Array<{
    path: string;
    type: string;
    name: string;
    relativePath: string;
    content: string;
    highlighted: ReactElement;
  }> = [];

  try {
    const registryJson = JSON.parse(
      fsSync.readFileSync(registryJsonPath, "utf-8"),
    );

    if (registryJson.files && Array.isArray(registryJson.files)) {
      componentFiles = await Promise.all(
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

          // Get relative path for display (remove registry/default/{component}/)
          const relativePath = file.path.replace(
            `registry/default/${component}/`,
            "",
          );

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
  } catch (error) {
    console.warn(`Could not read registry files for ${component}:`, error);
  }

  // Pre-highlight all CLI commands
  const registryUrl = `@cubby-ui/${component}`;
  const highlightedCliCommands = {
    npm: await highlight(`npx shadcn@latest add ${registryUrl}`, "bash"),
    pnpm: await highlight(`pnpm dlx shadcn@latest add ${registryUrl}`, "bash"),
    yarn: await highlight(`npx shadcn@latest add ${registryUrl}`, "bash"),
    bun: await highlight(`bunx shadcn@latest add ${registryUrl}`, "bash"),
  };

  // Pre-highlight install commands if there are dependencies
  let highlightedInstallCommands: Record<string, ReactElement> | undefined;
  if (metadata && metadata.dependencies.length > 0) {
    const deps = metadata.dependencies.join(" ");
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
    />
  );
}
