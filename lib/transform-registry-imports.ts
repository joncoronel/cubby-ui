import registry from "@/registry.json";

/**
 * Components that ship more than their main .tsx install into a directory of
 * their own, so their import path keeps both segments
 * (`.../cubby-ui/switch/switch`, not `.../cubby-ui/switch`). Read off the
 * targets the sync script already wrote rather than re-deriving the rule, so
 * the two can't disagree — printing the flat path for a nested install gives
 * the reader an import that resolves to nothing.
 */
const MULTI_FILE_COMPONENTS: ReadonlySet<string> = new Set(
  (registry.items as Array<{ name: string; files?: { target?: string }[] }>)
    .filter((item) =>
      item.files?.some((file) =>
        file.target?.startsWith(`components/ui/cubby-ui/${item.name}/`),
      ),
    )
    .map((item) => item.name),
);

function installedImportPath(componentName: string): string {
  return MULTI_FILE_COMPONENTS.has(componentName)
    ? `@/components/ui/cubby-ui/${componentName}/${componentName}`
    : `@/components/ui/cubby-ui/${componentName}`;
}

/**
 * Transform component source imports from internal registry paths to user-facing paths
 * Used for displaying code to users in documentation and installation instructions
 *
 * Multi-file components use co-location with relative imports that stay as-is.
 * Only @/registry/... absolute imports are transformed.
 */
export function transformComponentImports(
  content: string,
  _componentName: string,
  _filePath: string,
  _fileType: string,
): string {
  let transformed = content;

  // IMPORTANT: Relative imports (./lib/, ../lib/, ./hooks/, etc.) are LEFT UNCHANGED
  // Multi-file components are installed co-located, so relative imports work as-is.
  // Only transform @/registry/... absolute imports below.

  // Transform shared hooks directory imports
  // @/registry/default/hooks/use-fuzzy-filter → @/hooks/cubby-ui/use-fuzzy-filter
  transformed = transformed.replace(
    /@\/registry\/default\/hooks\/([^"']+)/g,
    (_match, fileName) => {
      return `@/hooks/cubby-ui/${fileName}`;
    },
  );

  // Transform shared lib directory imports
  // @/registry/default/lib/highlight-text → @/lib/cubby-ui/highlight-text
  transformed = transformed.replace(
    /@\/registry\/default\/lib\/([^"']+)/g,
    (_match, fileName) => {
      return `@/lib/cubby-ui/${fileName}`;
    },
  );

  // Transform imports from other registry components
  // @/registry/default/button/button → @/components/ui/cubby-ui/button
  transformed = transformed.replace(
    /@\/registry\/default\/([^/]+)\/\1(?=["'])/g,
    (_match, component: string) => installedImportPath(component),
  );

  return transformed;
}
