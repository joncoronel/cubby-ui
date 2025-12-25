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
    "@/components/ui/cubby-ui/$1",
  );

  return transformed;
}
