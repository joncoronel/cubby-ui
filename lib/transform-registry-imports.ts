/**
 * Transform component source imports from internal registry paths to user-facing paths
 * Used for displaying code to users in documentation and installation instructions
 */
export function transformComponentImports(
  content: string,
  componentName: string,
  filePath: string,
  fileType: string,
): string {
  let transformed = content;

  // Calculate target directory for relative import resolution
  // registry/default/code-block/lib/transformers/focus.ts → lib/cubby-ui/transformers/
  // registry/default/autocomplete/hooks/use-fuzzy-filter.ts → hooks/cubby-ui/
  // registry/default/tree/tree.tsx → components/ui/cubby-ui/
  let targetDir = "";
  if (fileType === "registry:lib" || fileType === "registry:hook") {
    const typePrefix = fileType === "registry:lib" ? "lib" : "hooks";
    const registryPrefix = `registry/default/${componentName}/${typePrefix}/`;

    if (filePath.startsWith(registryPrefix)) {
      const afterPrefix = filePath.substring(registryPrefix.length);
      const lastSlash = afterPrefix.lastIndexOf("/");

      if (lastSlash !== -1) {
        // File is in a subdirectory: lib/transformers/focus.ts → lib/cubby-ui/transformers/
        targetDir = `${typePrefix}/cubby-ui/${afterPrefix.substring(0, lastSlash)}/`;
      } else {
        // File is directly in lib or hooks: lib/utils.ts → lib/cubby-ui/
        targetDir = `${typePrefix}/cubby-ui/`;
      }
    }
  } else if (fileType === "registry:ui") {
    // Main component files install to components/ui/cubby-ui/
    targetDir = "components/ui/cubby-ui/";
  }

  // Transform ./lib/ and ./hooks/ imports to @/lib/cubby-ui/ and @/hooks/cubby-ui/
  // This must run before general relative import transformation
  // ./lib/tree-utils → @/lib/cubby-ui/tree-utils
  // ./hooks/use-something → @/hooks/cubby-ui/use-something
  transformed = transformed.replace(
    /from\s+["']\.\/(lib|hooks)\/([^"']+)["']/g,
    (_match, type, relativePath) => {
      return `from "@/${type}/cubby-ui/${relativePath}"`;
    },
  );

  // Transform relative imports (./utils, ../foo) to absolute paths
  if (targetDir) {
    transformed = transformed.replace(
      /from\s+["'](\.\.?\/[^"']+)["']/g,
      (_match, relativePath) => {
        // Count the number of ../ to go up directories
        const upLevels = (relativePath.match(/\.\.\//g) || []).length;
        const importFile = relativePath.replace(/\.\.\//g, "").replace(/^\.\//g, "");

        // Split target directory and go up the appropriate levels
        const dirParts = targetDir.split("/").filter(Boolean);
        const resultParts = dirParts.slice(0, Math.max(0, dirParts.length - upLevels));

        const absolutePath = resultParts.length > 0
          ? `@/${resultParts.join("/")}/${importFile}`
          : `@/${importFile}`;

        return `from "${absolutePath}"`;
      },
    );
  }

  // Transform shorthand component imports
  // @/tree → @/components/ui/cubby-ui/tree
  // This must run before the general component transformation to catch shorthand patterns
  transformed = transformed.replace(
    new RegExp(`@/${componentName}(?=["'])`, "g"),
    `@/components/ui/cubby-ui/${componentName}`,
  );

  // Transform lib and hooks files with subdirectories
  // @/registry/default/{component}/lib/{file} → @/lib/cubby-ui/{file}
  // @/registry/default/{component}/hooks/{file} → @/hooks/cubby-ui/{file}
  transformed = transformed.replace(
    new RegExp(`@/registry/default/${componentName}/(lib|hooks)/([^"']+)`, "g"),
    (_match, type, relativePath) => {
      return `@/${type}/cubby-ui/${relativePath}`;
    },
  );

  // Transform imports from other registry components
  // @/registry/default/button/button → @/components/ui/cubby-ui/button
  transformed = transformed.replace(
    /@\/registry\/default\/([^/]+)\/\1(?=["'])/g,
    "@/components/ui/cubby-ui/$1",
  );

  return transformed;
}
