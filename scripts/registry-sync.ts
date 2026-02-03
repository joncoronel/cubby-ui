#!/usr/bin/env bun
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
// import { glob } from "glob"; // Using fs.readdir instead
import ts from "typescript";
import { z } from "zod";

const REGISTRY_PATH = path.join(process.cwd(), "registry");
const REGISTRY_JSON_PATH = path.join(process.cwd(), "registry.json");
const EXAMPLES_PATH = path.join(REGISTRY_PATH, "examples");
const THEME_CSS_PATH = path.join(process.cwd(), "registry", "theme.css");
const DEFAULT_STYLE = "default";

// Get registry URL from environment variable or use default
const REGISTRY_URL =
  process.env.REGISTRY_URL || "https://cubby-money.vercel.app";

interface Example {
  title: string;
  importPath: string;
  source: string;
}

interface ComponentAnatomy {
  imports: string;
  anatomy: string;
}

// Enhanced schema for shadcn CLI 3.0 compatibility
const registrySchema = z.object({
  $schema: z.string(),
  name: z.string(),
  homepage: z.string(),
  // CSS Variables for theme customization
  cssVars: z
    .object({
      light: z.record(z.string(), z.string()),
      dark: z.record(z.string(), z.string()),
    })
    .optional(),
  // Enhanced items schema with better error handling support
  items: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      author: z.string().optional(),
      extends: z.string().optional(),
      files: z.array(
        z.object({
          path: z.string(),
          type: z.string(),
          target: z.string().optional(),
        }),
      ),
      // CSS Variables for individual items (like init item)
      cssVars: z
        .object({
          theme: z.record(z.string(), z.string()).optional(),
          light: z.record(z.string(), z.string()).optional(),
          dark: z.record(z.string(), z.string()).optional(),
        })
        .optional(),
      // CSS rules for individual items
      css: z.record(z.string(), z.any()).optional(),
      registryDependencies: z.array(z.string()).optional(),
      dependencies: z.array(z.string()).optional(),
      devDependencies: z.array(z.string()).optional(),
      meta: z
        .object({
          category: z.string().optional(),
          examples: z.record(z.string(), z.string()).optional(),
          // Enhanced meta for better error messages
          errorMessages: z
            .object({
              notFound: z.string().optional(),
              unauthorized: z.string().optional(),
              generic: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    }),
  ),
});

// Extract component anatomy from a basic example file
function extractAnatomyFromExample(
  componentName: string,
): ComponentAnatomy | null {
  const examplesDir = path.join(EXAMPLES_PATH, componentName);

  if (!fsSync.existsSync(examplesDir)) {
    return null;
  }

  // Get all example files and find the best basic example
  const files = fsSync.readdirSync(examplesDir);
  const exampleFiles = files.filter((file) => file.endsWith(".tsx"));

  // Priority order for finding basic examples (exact matches first, then partial matches)
  const exactMatches = [
    `${componentName}-demo.tsx`,
    `${componentName}-basic.tsx`,
    `${componentName}-default.tsx`,
    `${componentName}-simple.tsx`,
  ];

  const partialMatches = ["demo", "basic", "default", "simple"];

  let basicExamplePath = null;

  // First try exact matches
  for (const exactMatch of exactMatches) {
    if (exampleFiles.includes(exactMatch)) {
      basicExamplePath = path.join(examplesDir, exactMatch);
      break;
    }
  }

  // If no exact match, try partial matches (prefer static JSX)
  if (!basicExamplePath) {
    for (const partialMatch of partialMatches) {
      const matchingFiles = exampleFiles.filter(
        (file) =>
          file.toLowerCase().includes(partialMatch) &&
          file !== `${componentName}.tsx`, // Don't match the component file itself
      );

      if (matchingFiles.length > 0) {
        // Prefer files with static JSX structure
        const staticFiles = matchingFiles.filter((file) => {
          try {
            const content = fsSync.readFileSync(
              path.join(examplesDir, file),
              "utf-8",
            );
            return (
              !content.includes(".map(") && !content.includes("Array.from")
            );
          } catch {
            return true;
          }
        });

        const preferredFile =
          staticFiles.length > 0 ? staticFiles[0] : matchingFiles[0];
        basicExamplePath = path.join(examplesDir, preferredFile);
        break;
      }
    }
  }

  // If still no match, prefer examples with static JSX over dynamic ones
  if (!basicExamplePath && exampleFiles.length > 0) {
    // Look for examples that likely have static JSX (no .map, no dynamic generation)
    const staticExamples = exampleFiles.filter((file) => {
      try {
        const content = fsSync.readFileSync(
          path.join(examplesDir, file),
          "utf-8",
        );
        // Prefer examples without .map() which typically indicates dynamic generation
        return !content.includes(".map(") && !content.includes("Array.from");
      } catch {
        return true; // If we can't read it, include it as a fallback
      }
    });

    if (staticExamples.length > 0) {
      staticExamples.sort();
      basicExamplePath = path.join(examplesDir, staticExamples[0]);
    } else {
      exampleFiles.sort();
      basicExamplePath = path.join(examplesDir, exampleFiles[0]);
    }
  }

  if (!basicExamplePath) {
    return null;
  }

  try {
    const content = fsSync.readFileSync(basicExamplePath, "utf-8");
    const sourceFile = ts.createSourceFile(
      basicExamplePath,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    let imports = "";
    const componentImports: Set<string> = new Set();
    let anatomy = "";

    function visit(node: ts.Node) {
      // Extract import statement and component names
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
        if (moduleSpecifier.includes(`/registry/default/${componentName}`)) {
          // Replace the internal path with the user-facing path
          const originalImport = node.getFullText().trim();
          imports = originalImport
            .replace(
              `@/registry/default/${componentName}/${componentName}`,
              `@/components/ui/cubby-ui/${componentName}`,
            )
            .replace(/\r\n/g, "\n") // Normalize CRLF to LF
            .replace(/\r/g, "\n"); // Normalize CR to LF

          // Extract imported component names
          if (node.importClause && node.importClause.namedBindings) {
            if (ts.isNamedImports(node.importClause.namedBindings)) {
              node.importClause.namedBindings.elements.forEach((element) => {
                componentImports.add(element.name.getText());
              });
            }
          }
        }
      }

      // Extract JSX from return statement
      if (ts.isReturnStatement(node) && node.expression) {
        anatomy = extractJSXAnatomy(node.expression, componentImports);
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    if (imports && anatomy) {
      return { imports, anatomy };
    }
  } catch (error) {
    console.warn(
      `Warning: Could not parse example for ${componentName}:`,
      error,
    );
  }

  return null;
}

// Transform component source imports to user-facing paths
function transformComponentImports(
  content: string,
  componentName: string,
  allFiles: Array<{ path: string; type: string }>,
): string {
  let transformed = content;

  // Transform imports based on file type
  // Handle lib and hooks files with potential subdirectories
  transformed = transformed.replace(
    new RegExp(`@/registry/default/${componentName}/(lib|hooks)/([^"']+)`, "g"),
    (_match, type, relativePath) => {
      // Transform: @/registry/default/{component}/lib/... → @/lib/cubby-ui/...
      // Transform: @/registry/default/{component}/hooks/... → @/hooks/cubby-ui/...
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

// Transform example imports to user-facing paths
function transformExampleImports(content: string): string {
  let transformed = content;

  // Transform lib and hooks files from any component
  // @/registry/default/{component}/lib/{file} → @/lib/cubby-ui/{file}
  // @/registry/default/{component}/hooks/{file} → @/hooks/cubby-ui/{file}
  transformed = transformed.replace(
    /@\/registry\/default\/([^/]+)\/(lib|hooks)\/([^"']+)/g,
    (_match, _component, type, relativePath) => {
      return `@/${type}/cubby-ui/${relativePath}`;
    },
  );

  // Transform main component imports
  // @/registry/default/button/button → @/components/ui/cubby-ui/button
  transformed = transformed.replace(
    /@\/registry\/default\/([^/]+)\/\1(?=["'])/g,
    "@/components/ui/cubby-ui/$1",
  );

  return transformed;
}

// Extract JSX structure without props and content, filtering to only component imports
function extractJSXAnatomy(
  node: ts.Node,
  componentImports: Set<string>,
): string {
  const rawAnatomy = extractJSXAnatomyRaw(node, componentImports);
  return deduplicateJSXStructure(rawAnatomy);
}

// Raw extraction without deduplication
function extractJSXAnatomyRaw(
  node: ts.Node,
  componentImports: Set<string>,
): string {
  if (ts.isJsxElement(node)) {
    const tagName = node.openingElement.tagName.getText();

    // Only include if it's one of the imported components
    if (!componentImports.has(tagName)) {
      // If not a component import, check children but don't include this element
      const children = node.children
        .filter(
          (child) =>
            ts.isJsxElement(child) ||
            ts.isJsxSelfClosingElement(child) ||
            ts.isJsxExpression(child),
        )
        .map((child) => extractJSXAnatomyRaw(child, componentImports))
        .filter(Boolean);

      return children.join("\n");
    }

    const children = node.children
      .filter(
        (child) =>
          ts.isJsxElement(child) ||
          ts.isJsxSelfClosingElement(child) ||
          ts.isJsxExpression(child),
      )
      .map((child) => extractJSXAnatomyRaw(child, componentImports))
      .filter(Boolean);

    if (children.length > 0) {
      const indentedChildren = children
        .map((child) =>
          child
            .split("\n")
            .map((line) => (line ? `  ${line}` : line))
            .join("\n"),
        )
        .join("\n");
      return `<${tagName}>\n${indentedChildren}\n</${tagName}>`;
    } else {
      return `<${tagName} />`;
    }
  }

  if (ts.isJsxSelfClosingElement(node)) {
    const tagName = node.tagName.getText();

    // Only include if it's one of the imported components
    if (!componentImports.has(tagName)) {
      return "";
    }

    return `<${tagName} />`;
  }

  if (ts.isParenthesizedExpression(node)) {
    return extractJSXAnatomyRaw(node.expression, componentImports);
  }

  // Handle fragments and other JSX
  if (ts.isJsxFragment(node)) {
    const children = node.children
      .filter(
        (child) => ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child),
      )
      .map((child) => extractJSXAnatomyRaw(child, componentImports))
      .filter(Boolean);

    return children.join("\n");
  }

  // Handle JSX expressions (e.g., {(item) => <Component />})
  if (ts.isJsxExpression(node) && node.expression) {
    return extractJSXAnatomyRaw(node.expression, componentImports);
  }

  // Handle arrow functions (render props pattern)
  if (ts.isArrowFunction(node) && node.body) {
    // If body is a block, look for return statements
    if (ts.isBlock(node.body)) {
      let result = "";
      node.body.statements.forEach((statement) => {
        if (ts.isReturnStatement(statement) && statement.expression) {
          const extracted = extractJSXAnatomyRaw(
            statement.expression,
            componentImports,
          );
          if (extracted) {
            result = extracted;
          }
        }
      });
      return result;
    }
    // If body is an expression, extract directly
    return extractJSXAnatomyRaw(node.body, componentImports);
  }

  return "";
}

// Deduplicate repetitive JSX patterns
function deduplicateJSXStructure(jsxString: string): string {
  if (!jsxString.trim()) return jsxString;

  // First pass: parse into a tree structure
  const tree = parseJSXTree(jsxString);

  // Second pass: deduplicate siblings with same structure
  const deduplicated = deduplicateTreeSiblings(tree);

  // Third pass: convert back to string
  return stringifyJSXTree(deduplicated);
}

// Parse JSX string into a tree structure
function parseJSXTree(jsxString: string): JSXNode {
  const lines = jsxString.split("\n");
  const root: JSXNode = { type: "root", children: [] };
  const stack: JSXNode[] = [root];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const indent = line.match(/^(\s*)/)?.[1].length || 0;

    // Self-closing tag
    const selfClosingMatch = trimmed.match(/^<(\w+)(?:\s[^>]*)?\/>/);
    if (selfClosingMatch) {
      const node: JSXNode = {
        type: "element",
        tagName: selfClosingMatch[1],
        selfClosing: true,
        indent,
        children: [],
      };
      stack[stack.length - 1].children?.push(node);
      continue;
    }

    // Opening tag
    const openingMatch = trimmed.match(/^<(\w+)(?:\s[^>]*)?>/);
    if (openingMatch) {
      const node: JSXNode = {
        type: "element",
        tagName: openingMatch[1],
        selfClosing: false,
        indent,
        children: [],
      };
      stack[stack.length - 1].children?.push(node);
      stack.push(node);
      continue;
    }

    // Closing tag
    const closingMatch = trimmed.match(/^<\/(\w+)>/);
    if (closingMatch) {
      stack.pop();
      continue;
    }
  }

  return root;
}

// Deduplicate sibling nodes with same structure
function deduplicateTreeSiblings(node: JSXNode): JSXNode {
  if (!node.children) return node;

  const deduplicatedChildren: JSXNode[] = [];
  const seenStructures = new Set<string>();

  for (const child of node.children) {
    const signature = createNodeSignature(child);

    if (!seenStructures.has(signature)) {
      seenStructures.add(signature);
      // Recursively deduplicate this child's children
      deduplicatedChildren.push(deduplicateTreeSiblings(child));
    }
  }

  return {
    ...node,
    children: deduplicatedChildren,
  };
}

// Create a signature for a node structure
function createNodeSignature(node: JSXNode): string {
  if (node.selfClosing) {
    return `<${node.tagName} />`;
  }

  const childSignatures = node.children?.map(createNodeSignature) || [];
  return `<${node.tagName}>${childSignatures.join("")}</${node.tagName}>`;
}

// Convert tree back to string
function stringifyJSXTree(node: JSXNode, currentIndent = 0): string {
  if (node.type === "root") {
    return (
      node.children?.map((child) => stringifyJSXTree(child, 0)).join("\n") || ""
    );
  }

  const indent = "  ".repeat(currentIndent);

  if (node.selfClosing) {
    return `${indent}<${node.tagName} />`;
  }

  if (!node.children?.length) {
    return `${indent}<${node.tagName} />`;
  }

  const childrenStr = node.children
    .map((child) => stringifyJSXTree(child, currentIndent + 1))
    .join("\n");

  return `${indent}<${node.tagName}>\n${childrenStr}\n${indent}</${node.tagName}>`;
}

// JSX Node interface
interface JSXNode {
  type: "root" | "element";
  tagName?: string;
  selfClosing?: boolean;
  indent?: number;
  children?: JSXNode[];
}

// Extract component anatomy from a TypeScript file (fallback method)
function extractComponentAnatomy(
  filePath: string,
  componentName: string,
): ComponentAnatomy {
  // First check for manual usage override in metadata
  const metadata = getComponentMetadata(componentName);
  if (metadata.usage) {
    return metadata.usage;
  }

  // Then try to extract from basic example
  const exampleAnatomy = extractAnatomyFromExample(componentName);
  if (exampleAnatomy) {
    return exampleAnatomy;
  }

  // Fallback to component file analysis
  const content = fsSync.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  const exports: string[] = [];
  const mainComponent = componentName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  function visit(node: ts.Node) {
    if (ts.isExportDeclaration(node) && node.exportClause) {
      if (ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach((element) => {
          if (ts.isExportSpecifier(element) && element.name) {
            const exportName = element.name.getText();
            // Only include component exports, not type exports
            if (!exportName.startsWith("type ") && /^[A-Z]/.test(exportName)) {
              exports.push(exportName);
            }
          }
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Generate imports string with user-facing path
  const imports =
    exports.length > 1
      ? `import {\n  ${exports.join(",\n  ")}\n} from "@/components/ui/cubby-ui/${componentName}"`
      : `import { ${exports[0] || mainComponent} } from "@/components/ui/cubby-ui/${componentName}"`;

  // Generate anatomy based on known patterns
  let anatomy = "";
  if (exports.length === 1) {
    anatomy = `<${exports[0]} />`;
  } else {
    // For multi-component exports, try to infer structure
    anatomy = generateAnatomyStructure(exports, componentName);
  }

  return { imports, anatomy };
}

// Generate anatomy structure for multi-component exports
function generateAnatomyStructure(
  exports: string[],
  componentName: string,
): string {
  const mainComponent =
    exports.find(
      (exp) => exp.toLowerCase() === componentName.replace(/-/g, ""),
    ) || exports[0];

  // Known patterns for common component structures
  const patterns: Record<string, string> = {
    accordion: `<Accordion>\n  <AccordionItem>\n    <AccordionTrigger />\n    <AccordionContent />\n  </AccordionItem>\n</Accordion>`,
    alert: `<Alert>\n  <AlertTitle />\n  <AlertDescription />\n</Alert>`,
    "alert-dialog": `<AlertDialog>\n  <AlertDialogTrigger />\n  <AlertDialogContent>\n    <AlertDialogHeader>\n      <AlertDialogTitle />\n      <AlertDialogDescription />\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel />\n      <AlertDialogAction />\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>`,
    avatar: `<Avatar>\n  <AvatarImage />\n  <AvatarFallback />\n</Avatar>`,
    card: `<Card>\n  <CardHeader>\n    <CardTitle />\n    <CardDescription />\n  </CardHeader>\n  <CardContent />\n  <CardFooter />\n</Card>`,
    breadcrumbs: `<Breadcrumbs>\n  <BreadcrumbsItem />\n  <BreadcrumbsSeparator />\n  <BreadcrumbsItem />\n</Breadcrumbs>`,
    button: `<Button>\n  Button\n</Button>`,
    calendar: `<Calendar />`,
    carousel: `<Carousel>\n  <CarouselContent>\n    <CarouselItem />\n  </CarouselContent>\n  <CarouselPrevious />\n  <CarouselNext />\n</Carousel>`,
    checkbox: `<Checkbox />`,
    "checkbox-group": `<CheckboxGroup>\n  <CheckboxGroupItem />\n</CheckboxGroup>`,
    command: `<Command>\n  <CommandInput />\n  <CommandList>\n    <CommandItem />\n  </CommandList>\n</Command>`,
    "context-menu": `<ContextMenu>\n  <ContextMenuTrigger />\n  <ContextMenuContent>\n    <ContextMenuItem />\n  </ContextMenuContent>\n</ContextMenu>`,
    dialog: `<Dialog>\n  <DialogTrigger />\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle />\n      <DialogDescription />\n    </DialogHeader>\n  </DialogContent>\n</Dialog>`,
    "dropdown-menu": `<DropdownMenu>\n  <DropdownMenuTrigger />\n  <DropdownMenuContent>\n    <DropdownMenuItem />\n  </DropdownMenuContent>\n</DropdownMenu>`,
    input: `<Input />`,
    label: `<Label />`,
    popover: `<Popover>\n  <PopoverTrigger />\n  <PopoverContent />\n</Popover>`,
    "radio-group": `<RadioGroup>\n  <RadioGroupItem />\n</RadioGroup>`,
    select: `<Select>\n  <SelectTrigger>\n    <SelectValue />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectItem />\n  </SelectContent>\n</Select>`,
    sheet: `<Sheet>\n  <SheetTrigger />\n  <SheetContent>\n    <SheetHeader>\n      <SheetTitle />\n      <SheetDescription />\n    </SheetHeader>\n  </SheetContent>\n</Sheet>`,
    tabs: `<Tabs>\n  <TabsList>\n    <TabsTrigger />\n  </TabsList>\n  <TabsContent />\n</Tabs>`,
    textarea: `<Textarea />`,
    tooltip: `<Tooltip>\n  <TooltipTrigger />\n  <TooltipContent />\n</Tooltip>`,
  };

  if (patterns[componentName]) {
    return patterns[componentName];
  }

  // Fallback: simple structure
  return `<${mainComponent}>\n  {/* Your content */}\n</${mainComponent}>`;
}

// Extract imports from a TypeScript file
function extractImports(filePath: string): {
  registryDependencies: string[];
  dependencies: string[];
  sharedLibFiles: string[];
} {
  const content = fsSync.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  const registryDependencies = new Set<string>();
  const dependencies = new Set<string>();
  const sharedLibFiles = new Set<string>();

  function processModulePath(importPath: string) {
    // Check if it's a shared lib or hooks import (@/registry/default/lib/... or @/registry/default/hooks/...)
    if (importPath.startsWith("@/registry/")) {
      const sharedItemMatch = importPath.match(
        /@\/registry\/[^/]+\/(?:lib|hooks)\/(.+)/,
      );
      if (sharedItemMatch) {
        // Extract the file path (e.g., "use-fuzzy-filter" from "@/registry/default/hooks/use-fuzzy-filter")
        sharedLibFiles.add(sharedItemMatch[1]);
      } else {
        // Check if it's a component registry import
        const match = importPath.match(/@\/registry\/[^/]+\/([^/]+)/);
        if (match && match[1] !== "lib" && match[1] !== "hooks") {
          registryDependencies.add(match[1]);
        }
      }
    }
    // Check if it's an external dependency
    else if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
      const pkgName = importPath.startsWith("@")
        ? importPath.split("/").slice(0, 2).join("/")
        : importPath.split("/")[0];
      dependencies.add(pkgName);
    }
  }

  function visit(node: ts.Node) {
    // Handle import declarations
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        processModulePath(moduleSpecifier.text);
      }
    }
    // Handle export declarations with module specifier (re-exports like: export { foo } from "bar")
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      if (ts.isStringLiteral(node.moduleSpecifier)) {
        processModulePath(node.moduleSpecifier.text);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    registryDependencies: Array.from(registryDependencies),
    dependencies: Array.from(dependencies),
    sharedLibFiles: Array.from(sharedLibFiles),
  };
}

// Auto-update component-metadata.json with missing components
function autoUpdateComponentMetadata(componentNames: string[]): void {
  const metadataPath = path.join(
    process.cwd(),
    "scripts/component-metadata.json",
  );

  let metadata: Record<string, any> = {};

  // Read existing metadata if it exists
  if (fsSync.existsSync(metadataPath)) {
    metadata = JSON.parse(fsSync.readFileSync(metadataPath, "utf-8"));
  }

  let hasChanges = false;

  // Remove entries for components that no longer exist
  for (const existingComponent of Object.keys(metadata)) {
    if (!componentNames.includes(existingComponent)) {
      delete metadata[existingComponent];
      hasChanges = true;
      console.log(
        `✓ Removed deleted component ${existingComponent} from metadata`,
      );
    }
  }

  // Add missing components with auto-generated metadata
  for (const componentName of componentNames) {
    if (!metadata[componentName]) {
      metadata[componentName] = {
        title: componentName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        description: `A ${componentName} component.`,
        dependencies: [],
        reference: [],
      };
      hasChanges = true;
      console.log(`✓ Auto-added ${componentName} to component-metadata.json`);
    } else {
      // Add missing fields to existing components
      let componentChanged = false;

      if (!metadata[componentName].reference) {
        metadata[componentName].reference = [];
        componentChanged = true;
      }

      // Author field is optional and won't be auto-added
      // Users can manually add it to components they want to attribute

      if (componentChanged) {
        hasChanges = true;
        console.log(`✓ Updated missing fields for ${componentName}`);
      }
    }
  }

  // Write back to file if there were changes
  if (hasChanges) {
    // Sort alphabetically for consistency
    const sortedMetadata: Record<string, any> = {};
    Object.keys(metadata)
      .sort()
      .forEach((key) => {
        sortedMetadata[key] = metadata[key];
      });

    fsSync.writeFileSync(
      metadataPath,
      JSON.stringify(sortedMetadata, null, 2) + "\n",
    );
    console.log(`✓ Updated component-metadata.json`);
  }
}

// Get component metadata
function getComponentMetadata(componentName: string): {
  title: string;
  description: string;
  category: string;
  author?: string;
  reference?: string[];
  usage?: ComponentAnatomy;
} {
  // Try to read from component-metadata.json if it exists
  const metadataPath = path.join(
    process.cwd(),
    "scripts/component-metadata.json",
  );
  if (fsSync.existsSync(metadataPath)) {
    const metadata = JSON.parse(fsSync.readFileSync(metadataPath, "utf-8"));
    if (metadata[componentName]) {
      return {
        title: metadata[componentName].title,
        description: metadata[componentName].description,
        category: metadata[componentName].category || "UI",
        ...(metadata[componentName].author && {
          author: metadata[componentName].author,
        }),
        ...(metadata[componentName].reference && {
          reference: metadata[componentName].reference,
        }),
        ...(metadata[componentName].usage && {
          usage: metadata[componentName].usage,
        }),
      };
    }
  }

  // Default metadata (shouldn't happen after auto-update)
  return {
    title: componentName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    description: `A ${componentName} component.`,
    category: "UI",
  };
}

// Get examples for a component
function getComponentExamples(componentName: string): Record<string, string> {
  const examplesDir = path.join(EXAMPLES_PATH, componentName);
  const examples: Record<string, string> = {};

  if (fsSync.existsSync(examplesDir)) {
    const files = fsSync.readdirSync(examplesDir);
    const exampleFiles = files.filter((file) => file.endsWith(".tsx"));
    exampleFiles.forEach((file) => {
      const name = path.basename(file, ".tsx");
      const content = fsSync.readFileSync(
        path.join(examplesDir, file),
        "utf-8",
      );

      // Extract description from first line comment if present
      const descMatch = content.match(/^\/\/ @description: (.+)$/m);
      const description = descMatch ? descMatch[1] : `${name} example`;

      examples[name] = description;
    });
  }

  return examples;
}

// Scan registry for components
// Recursively scan directory for TypeScript files
function scanDirectoryRecursive(
  dir: string,
  baseDir: string,
  fileExtensions: string[] = [".ts", ".tsx"],
): string[] {
  const files: string[] = [];

  const entries = fsSync.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      files.push(...scanDirectoryRecursive(fullPath, baseDir, fileExtensions));
    } else if (entry.isFile()) {
      // Check if file has valid extension
      if (fileExtensions.some((ext) => entry.name.endsWith(ext))) {
        // Store relative path from baseDir
        const relativePath = path.relative(baseDir, fullPath);
        files.push(relativePath.replace(/\\/g, "/")); // Normalize to forward slashes
      }
    }
  }

  return files;
}

// Generate target path for file installation with cubby-ui namespace
// isMultiFile: if true, component files are placed in a component subdirectory
function getTargetPath(
  registryPath: string,
  fileType: string,
  isMultiFile: boolean = false,
): string {
  // Extract component name and relative path
  // registry/default/{component}/{...rest} → {component}, {...rest}
  const pathParts = registryPath.split("/");
  if (pathParts.length < 4) return ""; // Invalid path

  const componentOrDir = pathParts[2]; // e.g., "drawer" or "hooks" or "lib"
  const relativePath = pathParts.slice(3).join("/"); // Everything after component name

  // Check if this is a shared registry item (in registry/default/hooks/ or registry/default/lib/)
  // vs a component-internal file (in registry/default/{component}/hooks/ or /lib/)
  const isSharedItem = componentOrDir === "hooks" || componentOrDir === "lib";

  // Map file types to target directories with cubby-ui namespace
  switch (fileType) {
    case "registry:ui":
      if (isMultiFile) {
        // Multi-file component: put in subdirectory
        // registry/default/drawer/drawer.tsx → components/ui/cubby-ui/drawer/drawer.tsx
        return `components/ui/cubby-ui/${componentOrDir}/${relativePath}`;
      }
      // Single-file component: flat structure
      // registry/default/button/button.tsx → components/ui/cubby-ui/button.tsx
      return `components/ui/cubby-ui/${relativePath}`;

    case "registry:component":
      // registry/default/foo/components/bar.tsx → components/cubby-ui/components/bar.tsx
      return `components/cubby-ui/${relativePath}`;

    case "registry:block":
      // registry/default/hero/hero.tsx → components/cubby-ui/blocks/hero.tsx
      return `components/cubby-ui/blocks/${relativePath}`;

    case "registry:lib":
      if (isSharedItem) {
        // Shared lib: registry/default/lib/highlight-text.tsx → lib/cubby-ui/highlight-text.tsx
        return `lib/cubby-ui/${relativePath}`;
      }
      // Component-internal lib: registry/default/drawer/lib/utils.ts → components/ui/cubby-ui/drawer/lib/utils.ts
      // Keep the lib/ prefix and co-locate with component
      return `components/ui/cubby-ui/${componentOrDir}/${relativePath}`;

    case "registry:hook":
      if (isSharedItem) {
        // Shared hook: registry/default/hooks/use-fuzzy-filter.ts → hooks/cubby-ui/use-fuzzy-filter.ts
        return `hooks/cubby-ui/${relativePath}`;
      }
      // Component-internal hook: registry/default/drawer/hooks/use-scroll-snap.ts → components/ui/cubby-ui/drawer/hooks/use-scroll-snap.ts
      // Keep the hooks/ prefix and co-locate with component
      return `components/ui/cubby-ui/${componentOrDir}/${relativePath}`;

    case "registry:page":
      // Custom pages with explicit target - prepend cubby-ui to the path
      return `app/cubby-ui/${relativePath}`;

    case "registry:file":
      // CSS and other files go next to their component
      if (isMultiFile) {
        // Multi-file component: put in subdirectory
        // registry/default/drawer/drawer.css → components/ui/cubby-ui/drawer/drawer.css
        return `components/ui/cubby-ui/${componentOrDir}/${relativePath}`;
      }
      // Single-file component: flat structure
      // registry/default/button/button.css → components/ui/cubby-ui/button.css
      return `components/ui/cubby-ui/${relativePath}`;

    case "registry:style":
    case "registry:theme":
      // These merge into global.css/theme system, no target needed
      // Return empty string to skip target (will be filtered out)
      return "";

    case "registry:item":
      // Universal item - default to components directory
      return `components/cubby-ui/${relativePath}`;

    default:
      // Unknown type - default to components with namespace
      console.warn(`Unknown file type: ${fileType}, using default path`);
      return `components/cubby-ui/${relativePath}`;
  }
}

// Scan for additional files within a component directory
function scanComponentFiles(
  componentPath: string,
  componentName: string,
): Array<{
  path: string;
  type: string;
}> {
  const files: Array<{ path: string; type: string }> = [];

  // Check for lib directory
  const libDir = path.join(componentPath, "lib");
  if (fsSync.existsSync(libDir)) {
    const libFiles = scanDirectoryRecursive(libDir, componentPath, [
      ".ts",
      ".tsx",
    ]);
    for (const relativePath of libFiles) {
      files.push({
        path: `registry/${DEFAULT_STYLE}/${componentName}/${relativePath}`,
        type: "registry:lib",
      });
    }
  }

  // Check for hooks directory
  const hooksDir = path.join(componentPath, "hooks");
  if (fsSync.existsSync(hooksDir)) {
    const hookFiles = scanDirectoryRecursive(hooksDir, componentPath, [
      ".ts",
      ".tsx",
    ]);
    for (const relativePath of hookFiles) {
      files.push({
        path: `registry/${DEFAULT_STYLE}/${componentName}/${relativePath}`,
        type: "registry:hook",
      });
    }
  }

  // Check for components directory (sub-components)
  const componentsDir = path.join(componentPath, "components");
  if (fsSync.existsSync(componentsDir)) {
    const componentFiles = scanDirectoryRecursive(
      componentsDir,
      componentPath,
      [".tsx"],
    );
    for (const relativePath of componentFiles) {
      files.push({
        path: `registry/${DEFAULT_STYLE}/${componentName}/${relativePath}`,
        type: "registry:component",
      });
    }
  }

  // Check for sibling .tsx files in component root (e.g., data-table-search.tsx)
  // These are co-located UI components that should be included with the main component
  const rootEntries = fsSync.readdirSync(componentPath, {
    withFileTypes: true,
  });
  const mainFileName = `${componentName}.tsx`;
  for (const entry of rootEntries) {
    if (entry.isFile()) {
      if (entry.name.endsWith(".tsx") && entry.name !== mainFileName) {
        // Sibling .tsx files get registry:ui type for flat co-location
        files.push({
          path: `registry/${DEFAULT_STYLE}/${componentName}/${entry.name}`,
          type: "registry:ui",
        });
      } else if (entry.name.endsWith(".css")) {
        // CSS files
        files.push({
          path: `registry/${DEFAULT_STYLE}/${componentName}/${entry.name}`,
          type: "registry:file",
        });
      }
    }
  }

  return files;
}

// Scan the shared lib directory and create standalone registry items for hooks and utilities
function scanSharedDirectories(): Array<{
  name: string;
  type: string;
  title: string;
  description: string;
  files: Array<{ path: string; type: string; target?: string }>;
  dependencies?: string[];
}> {
  const sharedItems: Array<{
    name: string;
    type: string;
    title: string;
    description: string;
    files: Array<{ path: string; type: string; target?: string }>;
    dependencies?: string[];
  }> = [];

  // Scan both hooks and lib directories
  const dirsToScan = [
    { dir: "hooks", defaultType: "registry:hook" },
    { dir: "lib", defaultType: "registry:lib" },
  ];

  for (const { dir, defaultType } of dirsToScan) {
    const dirPath = path.join(REGISTRY_PATH, DEFAULT_STYLE, dir);

    if (!fsSync.existsSync(dirPath)) {
      continue;
    }

    const files = fsSync.readdirSync(dirPath);

    for (const file of files) {
      // Only process .ts and .tsx files
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;

      const filePath = path.join(dirPath, file);
      const stat = fsSync.statSync(filePath);
      if (!stat.isFile()) continue;

      // Get the name without extension
      const name = file.replace(/\.(ts|tsx)$/, "");

      // Use directory-based type
      const itemType = defaultType;
      const fileType = defaultType;
      const isHook = dir === "hooks";

      // Generate title from name (e.g., "use-fuzzy-filter" -> "useFuzzyFilter")
      const title = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

      // Generate description
      const description = isHook
        ? `A custom React hook for ${name.replace("use-", "").replace(/-/g, " ")}.`
        : `A utility function for ${name.replace(/-/g, " ")}.`;

      // Get target path
      const registryPath = `registry/${DEFAULT_STYLE}/${dir}/${file}`;
      const target = getTargetPath(registryPath, fileType);

      // Extract dependencies from the file
      const imports = extractImports(filePath);
      const dependencies = imports.dependencies.filter(
        (dep) => dep !== "react" && dep !== "@base-ui/react",
      );

      sharedItems.push({
        name,
        type: itemType,
        title,
        description,
        files: [
          {
            path: registryPath,
            type: fileType,
            ...(target && { target }),
          },
        ],
        ...(dependencies.length > 0 && { dependencies }),
      });
    }
  }

  return sharedItems;
}

async function scanRegistry() {
  const stylePath = path.join(REGISTRY_PATH, DEFAULT_STYLE);
  const componentDirs = await fs.readdir(stylePath, { withFileTypes: true });

  const items = [];
  const anatomyMap: Record<string, ComponentAnatomy> = {};

  for (const dir of componentDirs) {
    if (!dir.isDirectory()) continue;

    const componentName = dir.name;

    // Skip utility directories (these are handled by scanSharedDirectories)
    if (
      componentName === "lib" ||
      componentName === "hooks" ||
      componentName === "utils" ||
      componentName === "helpers"
    ) {
      continue;
    }

    const componentPath = path.join(stylePath, componentName);
    const mainFile = path.join(componentPath, `${componentName}.tsx`);

    if (!fsSync.existsSync(mainFile)) {
      console.warn(`Warning: No main file found for ${componentName}`);
      continue;
    }

    // Extract dependencies from main file
    const mainImports = extractImports(mainFile);

    // Scan for additional files within component directory (lib, hooks, etc.)
    const additionalFiles = scanComponentFiles(componentPath, componentName);

    // Extract dependencies from all additional files
    const allDependencies = new Set(mainImports.dependencies);
    const allRegistryDependencies = new Set(mainImports.registryDependencies);
    const allSharedLibFiles = new Set(mainImports.sharedLibFiles);

    for (const file of additionalFiles) {
      const filePath = path.join(process.cwd(), file.path);
      if (fsSync.existsSync(filePath)) {
        const fileImports = extractImports(filePath);
        fileImports.dependencies.forEach((dep) => allDependencies.add(dep));
        fileImports.registryDependencies.forEach((dep) =>
          allRegistryDependencies.add(dep),
        );
        fileImports.sharedLibFiles.forEach((f) => allSharedLibFiles.add(f));
      }
    }

    // Convert shared lib/hooks imports to registry dependencies (not file entries)
    // Each lib/hook file is registered as a standalone registry item
    for (const sharedFile of allSharedLibFiles) {
      // Check both lib and hooks directories
      const dirsToCheck = ["lib", "hooks"];
      let found = false;

      for (const dir of dirsToCheck) {
        const basePath = `registry/${DEFAULT_STYLE}/${dir}/${sharedFile}`;
        const tsPath = `${basePath}.ts`;
        const tsxPath = `${basePath}.tsx`;

        if (
          fsSync.existsSync(path.join(process.cwd(), tsPath)) ||
          fsSync.existsSync(path.join(process.cwd(), tsxPath))
        ) {
          // Add as registry dependency (the item's own dependencies are on the item)
          allRegistryDependencies.add(sharedFile);
          found = true;
          break;
        }
      }
    }

    // Filter out assumed base dependencies
    const filteredDependencies = Array.from(allDependencies).filter(
      (dep) => dep !== "react" && dep !== "@base-ui/react",
    );

    // Filter out self-references from registry dependencies
    const filteredRegistryDependencies = Array.from(
      allRegistryDependencies,
    ).filter((dep) => dep !== componentName);

    // Extract component anatomy
    const anatomy = extractComponentAnatomy(mainFile, componentName);
    anatomyMap[componentName] = anatomy;

    // Get metadata
    const metadata = getComponentMetadata(componentName);

    // Get examples
    const examples = getComponentExamples(componentName);

    // Convert registryDependencies to namespace format for shadcn CLI 3.0
    const namespacedDependencies = filteredRegistryDependencies.map(
      (dep) => `@cubby-ui/${dep}`,
    );

    // Create registry item
    const mainFilePath = `registry/${DEFAULT_STYLE}/${componentName}/${componentName}.tsx`;
    const mainFileType = "registry:ui";
    // Multi-file components get a subdirectory structure for co-location
    const isMultiFile = additionalFiles.length > 0;
    const mainFileTarget = getTargetPath(mainFilePath, mainFileType, isMultiFile);

    // Add target fields to all files and filter out empty targets
    const filesWithTargets = [
      {
        path: mainFilePath,
        type: mainFileType,
        ...(mainFileTarget && { target: mainFileTarget }),
      },
      ...additionalFiles.map((file) => {
        // Additional files are always part of multi-file components
        const target = getTargetPath(file.path, file.type, true);
        return {
          ...file,
          ...(target && { target }),
        };
      }),
      // Note: Shared lib files are now added as registryDependencies, not embedded files
    ];

    const item = {
      name: componentName,
      type: "registry:ui",
      title: metadata.title,
      description: metadata.description,
      ...(metadata.author && { author: metadata.author }),
      files: filesWithTargets,
      ...(namespacedDependencies.length > 0 && {
        registryDependencies: namespacedDependencies,
      }),
      ...(filteredDependencies.length > 0 && {
        dependencies: filteredDependencies,
      }),
      // meta: {
      //   category: metadata.category,
      //   ...(Object.keys(examples).length > 0 && { examples }),
      // },
    };

    items.push(item);
  }

  return { items, anatomyMap };
}

// Collect example data for unified registry
async function collectExampleData(): Promise<Record<string, Example[]>> {
  const examples: Record<string, Example[]> = {};
  const componentDirs = await fs.readdir(EXAMPLES_PATH, {
    withFileTypes: true,
  });

  for (const dir of componentDirs) {
    if (!dir.isDirectory()) continue;

    const componentName = dir.name;
    const examplesDir = path.join(EXAMPLES_PATH, componentName);

    if (!fsSync.existsSync(examplesDir)) continue;

    const files = fsSync.readdirSync(examplesDir);
    const exampleFiles = files.filter((file) => file.endsWith(".tsx"));

    if (exampleFiles.length > 0) {
      examples[componentName] = [];

      for (const file of exampleFiles) {
        const name = path.basename(file, ".tsx");
        const rawContent = fsSync
          .readFileSync(path.join(examplesDir, file), "utf-8")
          .replace(/\r\n/g, "\n") // Normalize CRLF to LF
          .replace(/\r/g, "\n"); // Normalize CR to LF

        // Transform imports to user-facing paths
        const content = transformExampleImports(rawContent);

        // Create title from the example name, removing component prefix
        let titleName = name;
        // Remove the component name prefix if it exists
        const componentPrefix = componentName + "-";
        if (name.startsWith(componentPrefix)) {
          titleName = name.substring(componentPrefix.length);
        }

        const titleParts = titleName.split("-");

        const title = titleParts
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        examples[componentName].push({
          title,
          importPath: name,
          source: content,
        });
      }

      // Sort examples to put demo/basic first
      if (examples[componentName]) {
        examples[componentName].sort((a, b) => {
          const aName = a.importPath.toLowerCase();
          const bName = b.importPath.toLowerCase();

          // Priority order: demo, basic, default, simple, then alphabetical
          const getDemoPriority = (name: string) => {
            if (name.includes("demo")) return 0;
            if (name.includes("basic")) return 1;
            if (name.includes("default")) return 2;
            if (name.includes("simple")) return 3;
            return 4;
          };

          const aPriority = getDemoPriority(aName);
          const bPriority = getDemoPriority(bName);

          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }

          // If same priority, sort alphabetically
          return aName.localeCompare(bName);
        });
      }
    }
  }

  return examples;
}

// Generate unified registry file
async function generateUnifiedRegistry(
  items: any[],
  examples: Record<string, Example[]>,
  anatomyMap: Record<string, ComponentAnatomy>,
) {
  // Generate component metadata
  const componentMetadata: Record<string, any> = {};
  items.forEach((item) => {
    const metadata = getComponentMetadata(item.name);
    componentMetadata[item.name] = {
      name: item.name,
      title: item.title,
      description: item.description,
      category: item.meta?.category || "UI",
      ...(item.author && { author: item.author }),
      registryDependencies: item.registryDependencies || [],
      dependencies: item.dependencies || [],
      examples: item.meta?.examples || {},
      ...(metadata.reference && { reference: metadata.reference }),
    };
  });

  // Collect all example names for component map generation
  const componentMapEntries: string[] = [];
  const componentMapImports: string[] = [];

  for (const [componentName, exampleList] of Object.entries(examples)) {
    for (const example of exampleList) {
      const importName = `${componentName}_${example.importPath}`.replace(
        /-/g,
        "_",
      );
      componentMapImports.push(
        `import ${importName} from "@/registry/examples/${componentName}/${example.importPath}";`,
      );
      componentMapEntries.push(`  "${example.importPath}": ${importName},`);
    }
  }

  const outputPath = path.join(
    process.cwd(),
    "app/components/_generated/registry.ts",
  );

  const output = `// This file is auto-generated. Do not edit.
// Unified component registry consolidating metadata, examples, component map, and anatomy.

${componentMapImports.join("\n")}

export const componentMetadata = ${JSON.stringify(componentMetadata, null, 2)} as const;

export const exampleRegistry = ${JSON.stringify(examples, null, 2)} as const;

export const componentMap = {
${componentMapEntries.join("\n")}
} as const;

export const componentAnatomy = ${JSON.stringify(anatomyMap, null, 2)} as const;

// Unified registry interface
export const componentRegistry = {
  metadata: componentMetadata,
  examples: exampleRegistry,
  componentMap,
  anatomy: componentAnatomy,
} as const;

// Type exports
export interface Example {
  title: string;
  importPath: string;
  source: string;
}

export interface ComponentAnatomy {
  imports: string;
  anatomy: string;
}

export type ComponentName = keyof typeof componentMetadata;
export type ComponentMapKey = keyof typeof componentMap;

// Legacy exports for backwards compatibility
export const examplesRegistry = exampleRegistry;
`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, output);

  console.log("✓ Generated unified registry");
}

// Validate component-example consistency
function validateComponentConsistency(
  items: any[],
  examples: Record<string, Example[]>,
  anatomyMap: Record<string, ComponentAnatomy>,
): string[] {
  const errors: string[] = [];

  // Check that all components with examples have metadata
  for (const componentName of Object.keys(examples)) {
    const hasMetadata = items.some((item) => item.name === componentName);
    if (!hasMetadata) {
      errors.push(`Component '${componentName}' has examples but no metadata`);
    }
  }

  // Check that all UI components with metadata have anatomy
  // (skip hooks and libs since they don't have JSX anatomy)
  for (const item of items) {
    if (item.type === "registry:ui" && !anatomyMap[item.name]) {
      errors.push(`Component '${item.name}' has metadata but no anatomy`);
    }
  }

  // Check that component map imports match actual examples
  const allExampleImports = new Set<string>();
  for (const exampleList of Object.values(examples)) {
    for (const example of exampleList) {
      allExampleImports.add(example.importPath);
    }
  }

  // Validate that all examples can be found in the examples directory
  for (const [componentName, exampleList] of Object.entries(examples)) {
    for (const example of exampleList) {
      const examplePath = path.join(
        EXAMPLES_PATH,
        componentName,
        `${example.importPath}.tsx`,
      );
      if (!fsSync.existsSync(examplePath)) {
        errors.push(`Example file not found: ${examplePath}`);
      }
    }
  }

  return errors;
}

// Generate init registry item with CSS variables
function generateInitItem(cssContent: {
  light: Record<string, string>;
  dark: Record<string, string>;
  theme: Record<string, string>;
  utilities: Record<string, any>;
  layerBase: Record<string, any>;
  keyframes: Record<string, any>;
}) {
  const css = {
    ...cssContent.keyframes,
    ...cssContent.utilities,
    ...cssContent.layerBase,
  };

  return {
    name: "init",
    type: "registry:style",
    title: "Cubby UI Theme",
    description:
      "Initialize your project with Cubby UI's theme system including OKLCH colors and CSS variables.",
    author: "Cubby UI",
    files: [], // Required by schema
    cssVars: {
      theme: cssContent.theme,
      light: cssContent.light,
      dark: cssContent.dark,
    },
    // Only include css if there's content
    ...(Object.keys(css).length > 0 && { css }),
  };
}

// Generate "all" registry item that installs all components
function generateAllItem(componentNames: string[]) {
  return {
    name: "all",
    type: "registry:block",
    title: "All Components",
    description: "Install all Cubby UI components with a single command.",
    author: "Cubby UI",
    files: [],
    registryDependencies: componentNames.map((name) => `@cubby-ui/${name}`),
  };
}

// Main sync function
async function syncRegistry() {
  console.log("Starting registry sync...");

  try {
    // 1. Scan registry and build component items
    const { items: componentItems, anatomyMap } = await scanRegistry();

    // 2. Scan lib directory for standalone hooks and utilities
    const sharedItems = scanSharedDirectories();

    // Merge all items
    const items = [...componentItems, ...sharedItems];
    console.log(
      `✓ Found ${componentItems.length} components and ${sharedItems.length} shared items (hooks/libs)`,
    );

    // 3. Auto-update component-metadata.json with missing components
    const componentNames = componentItems.map((item) => item.name);
    autoUpdateComponentMetadata(componentNames);

    // 3. Extract CSS content from globals.css
    const cssContent = extractCssContent();
    console.log(
      `✓ Extracted ${Object.keys(cssContent.light).length} light mode, ${Object.keys(cssContent.dark).length} dark mode CSS variables, ${Object.keys(cssContent.theme).length} theme variables, ${Object.keys(cssContent.utilities).length} utilities, ${Object.keys(cssContent.keyframes).length} keyframes, and ${Object.keys(cssContent.layerBase).length} layer base rules`,
    );

    // 4. Read existing registry.json
    const existingRegistry = JSON.parse(
      await fs.readFile(REGISTRY_JSON_PATH, "utf-8"),
    );

    // 5. Generate init item with extracted CSS content
    const initItem = generateInitItem(cssContent);

    // 6. Generate "all" item with all component dependencies
    const allItem = generateAllItem(componentItems.map((item) => item.name));

    // 7. Update items while preserving other fields and adding init/all items
    const updatedRegistry = {
      ...existingRegistry,
      items: [...items, initItem, allItem].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };

    // 8. Validate against schema
    const validated = registrySchema.parse(updatedRegistry);

    // 9. Write updated registry.json
    await fs.writeFile(
      REGISTRY_JSON_PATH,
      JSON.stringify(validated, null, 2) + "\n",
    );
    console.log("✓ Updated registry.json with init item");

    // 10. Collect example data for unified registry
    const exampleData = await collectExampleData();

    // 11. Generate unified registry (replaces separate files)
    await generateUnifiedRegistry(items, exampleData, anatomyMap);

    // 12. Validate consistency
    const validationErrors = validateComponentConsistency(
      items,
      exampleData,
      anatomyMap,
    );
    if (validationErrors.length > 0) {
      console.warn("\n⚠️  Validation warnings:");
      validationErrors.forEach((error) => console.warn(`  - ${error}`));
    } else {
      console.log("✓ All components validated successfully");
    }

    // 13. Generate static JSON files for each component (for production deployment) - replaced by shadcn build
    // await generateStaticComponentFiles([...items, initItem]);

    console.log("\n✅ Registry sync completed successfully!");
  } catch (error) {
    console.error("❌ Error syncing registry:", error);
    process.exit(1);
  }
}

// Extract CSS variables from registry/theme.css
function extractCssContent(): {
  light: Record<string, string>;
  dark: Record<string, string>;
  theme: Record<string, string>;
  utilities: Record<string, any>;
  layerBase: Record<string, any>;
  keyframes: Record<string, any>;
} {
  if (!fsSync.existsSync(THEME_CSS_PATH)) {
    console.warn(`⚠️  theme.css not found at ${THEME_CSS_PATH}`);
    return { light: {}, dark: {}, theme: {}, utilities: {}, layerBase: {}, keyframes: {} };
  }

  const content = fsSync.readFileSync(THEME_CSS_PATH, "utf-8");
  const lightVars: Record<string, string> = {};
  const darkVars: Record<string, string> = {};
  const themeVars: Record<string, string> = {};
  const utilities: Record<string, any> = {};
  const layerBase: Record<string, any> = {};
  const keyframes: Record<string, any> = {};

  // Extract :root variables (light mode)
  const rootMatch = content.match(/:root\s*\{([\s\S]*?)\}/);
  if (rootMatch) {
    const rootContent = rootMatch[1];
    const varMatches = rootContent.matchAll(/--([a-z-]+):\s*([^;]+);/g);
    for (const match of varMatches) {
      const varName = match[1];
      const varValue = match[2].trim();
      if (!varValue.includes("/*")) {
        lightVars[varName] = varValue;
      }
    }
  }

  // Extract .dark variables (dark mode)
  const darkMatch = content.match(/\.dark\s*\{([\s\S]*?)\}/);
  if (darkMatch) {
    const darkContent = darkMatch[1];
    const varMatches = darkContent.matchAll(/--([a-z-]+):\s*([^;]+);/g);
    for (const match of varMatches) {
      const varName = match[1];
      const varValue = match[2].trim();
      if (!varValue.includes("/*")) {
        darkVars[varName] = varValue;
      }
    }
  }

  // Extract @theme inline variables
  const themeMatch = content.match(/@theme inline\s*\{([\s\S]*?)\}/);
  if (themeMatch) {
    const themeContent = themeMatch[1];
    const varMatches = themeContent.matchAll(
      /--([a-z0-9-]+(?:-[a-z0-9]+)*):\s*([^;]+);/g,
    );
    for (const match of varMatches) {
      const varName = match[1];
      const varValue = match[2].trim();
      if (!varValue.includes("/*") && !varValue.includes("*/")) {
        // Per shadcn docs, animation variables should keep the -- prefix
        const key = varName.startsWith("animate-") ? `--${varName}` : varName;
        themeVars[key] = varValue;
      }
    }
  }

  // Extract @utility blocks as structured JSON objects
  let pos = 0;
  while (pos < content.length) {
    const utilityMatch = content
      .substring(pos)
      .match(/@utility\s+([a-z-]+)\s*\{/);
    if (!utilityMatch || utilityMatch.index === undefined) break;

    const utilityName = utilityMatch[1];
    const startPos = pos + utilityMatch.index + utilityMatch[0].length;
    let braceCount = 1;
    let endPos = startPos;

    // Find matching closing brace
    while (endPos < content.length && braceCount > 0) {
      if (content[endPos] === "{") braceCount++;
      else if (content[endPos] === "}") braceCount--;
      endPos++;
    }

    if (braceCount === 0) {
      const utilityContent = content.substring(startPos, endPos - 1).trim();
      utilities[`@utility ${utilityName}`] = parseUtilityRules(utilityContent);
    }

    pos = endPos;
  }

  // Extract @layer base content - find matching braces
  const layerStartMatch = content.match(/@layer base\s*\{/);
  if (layerStartMatch && layerStartMatch.index !== undefined) {
    const startPos = layerStartMatch.index + layerStartMatch[0].length;
    let braceCount = 1;
    let endPos = startPos;

    while (endPos < content.length && braceCount > 0) {
      if (content[endPos] === "{") braceCount++;
      else if (content[endPos] === "}") braceCount--;
      endPos++;
    }

    if (braceCount === 0) {
      const layerContent = content.substring(startPos, endPos - 1).trim();
      layerBase["@layer base"] = parseLayerBaseRules(layerContent);
    }
  }

  // Extract @keyframes blocks
  let keyframesPos = 0;
  while (keyframesPos < content.length) {
    const keyframesMatch = content
      .substring(keyframesPos)
      .match(/@keyframes\s+([a-z-]+)\s*\{/);
    if (!keyframesMatch || keyframesMatch.index === undefined) break;

    const keyframeName = keyframesMatch[1];
    const startPos = keyframesPos + keyframesMatch.index + keyframesMatch[0].length;
    let braceCount = 1;
    let endPos = startPos;

    // Find matching closing brace
    while (endPos < content.length && braceCount > 0) {
      if (content[endPos] === "{") braceCount++;
      else if (content[endPos] === "}") braceCount--;
      endPos++;
    }

    if (braceCount === 0) {
      const keyframeContent = content.substring(startPos, endPos - 1).trim();
      keyframes[`@keyframes ${keyframeName}`] = parseKeyframeRules(keyframeContent);
    }

    keyframesPos = endPos;
  }

  return {
    light: lightVars,
    dark: darkVars,
    theme: themeVars,
    utilities,
    layerBase,
    keyframes,
  };
}

// Helper function to parse utility rules into JSON structure
function parseUtilityRules(content: string): Record<string, any> {
  // Remove CSS comments first
  const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, "").trim();

  const rules: Record<string, any> = {};

  // Split content into lines and process
  const lines = cleanContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check if it's a nested selector
    if (line.includes("{")) {
      const selector = line.replace("{", "").trim();
      const nestedRules: Record<string, string> = {};
      i++;

      // Parse nested properties until closing brace
      while (i < lines.length && !lines[i].includes("}")) {
        const propLine = lines[i];
        if (propLine.includes(":")) {
          const [propName, ...valueParts] = propLine.split(":");
          const propValue = valueParts.join(":").replace(";", "").trim();
          nestedRules[propName.trim()] = propValue;
        }
        i++;
      }

      if (Object.keys(nestedRules).length > 0) {
        rules[selector] = nestedRules;
      }
    } else if (line.includes(":") && line.includes(";")) {
      // Root-level property
      const [propName, ...valueParts] = line.split(":");
      const propValue = valueParts.join(":").replace(";", "").trim();
      rules[propName.trim()] = propValue;
    }

    i++;
  }

  return rules;
}

// Helper function to parse @layer base rules
function parseLayerBaseRules(content: string): Record<string, any> {
  const rules: Record<string, any> = {};

  // Parse content by finding selectors and their blocks
  let pos = 0;
  while (pos < content.length) {
    // Skip whitespace
    while (pos < content.length && /\s/.test(content[pos])) pos++;
    if (pos >= content.length) break;

    // Find selector (everything before {)
    const selectorStart = pos;
    while (pos < content.length && content[pos] !== "{") pos++;
    if (pos >= content.length) break;

    const selector = content.substring(selectorStart, pos).trim();
    pos++; // Skip {

    // Find matching closing brace
    let braceCount = 1;
    const propStart = pos;
    while (pos < content.length && braceCount > 0) {
      if (content[pos] === "{") braceCount++;
      else if (content[pos] === "}") braceCount--;
      pos++;
    }

    if (braceCount === 0 && selector) {
      const properties = content.substring(propStart, pos - 1).trim();
      const parsedProperties: Record<string, string> = {};

      // Parse @apply directives
      const applyMatches = properties.matchAll(/@apply\s+([^;]+);/g);
      for (const applyMatch of applyMatches) {
        parsedProperties["@apply"] = applyMatch[1].trim();
      }

      // Parse regular CSS properties
      const propMatches = properties.matchAll(/(?<!@)([a-z-]+):\s*([^;]+);/g);
      for (const propMatch of propMatches) {
        const propName = propMatch[1].trim();
        const propValue = propMatch[2].trim();
        parsedProperties[propName] = propValue;
      }

      if (Object.keys(parsedProperties).length > 0) {
        rules[selector] = parsedProperties;
      }
    }
  }

  return rules;
}

// Helper function to parse @keyframes rules
function parseKeyframeRules(content: string): Record<string, any> {
  const rules: Record<string, any> = {};

  // Parse content by finding keyframe selectors (from, to, percentages) and their blocks
  let pos = 0;
  while (pos < content.length) {
    // Skip whitespace
    while (pos < content.length && /\s/.test(content[pos])) pos++;
    if (pos >= content.length) break;

    // Find selector (everything before {)
    const selectorStart = pos;
    while (pos < content.length && content[pos] !== "{") pos++;
    if (pos >= content.length) break;

    const selector = content.substring(selectorStart, pos).trim();
    pos++; // Skip {

    // Find matching closing brace
    let braceCount = 1;
    const propStart = pos;
    while (pos < content.length && braceCount > 0) {
      if (content[pos] === "{") braceCount++;
      else if (content[pos] === "}") braceCount--;
      pos++;
    }

    if (braceCount === 0 && selector) {
      const properties = content.substring(propStart, pos - 1).trim();
      const parsedProperties: Record<string, string> = {};

      // Parse CSS properties
      const propMatches = properties.matchAll(/([a-z-]+):\s*([^;]+);/g);
      for (const propMatch of propMatches) {
        const propName = propMatch[1].trim();
        const propValue = propMatch[2].trim();
        parsedProperties[propName] = propValue;
      }

      if (Object.keys(parsedProperties).length > 0) {
        rules[selector] = parsedProperties;
      }
    }
  }

  return rules;
}

// Generate static JSON files for each component in public/r directory
async function generateStaticComponentFiles(items: any[]) {
  const publicDir = path.join(process.cwd(), "public", "r");

  // Create public/r directory if it doesn't exist
  await fs.mkdir(publicDir, { recursive: true });

  console.log("\nGenerating static component files...");

  for (const item of items) {
    try {
      let files = [];

      // Handle regular components with files
      if (item.files && Array.isArray(item.files)) {
        files = await Promise.all(
          item.files.map(async (file: any) => {
            const filePath = path.join(process.cwd(), file.path);
            const rawContent = await fs.readFile(filePath, "utf-8");
            const content = transformComponentImports(
              rawContent,
              item.name,
              item.files,
            );
            return {
              path: file.path.replace("registry/default/", ""),
              content,
              type: file.type,
              target: file.target,
            };
          }),
        );
      }

      // Create component JSON object
      const componentData = {
        $schema: "https://ui.shadcn.com/schema/registry-item.json",
        name: item.name,
        type: item.type,
        title: item.title,
        description: item.description,
        ...(item.author && { author: item.author }),
        ...(files.length > 0 && { files }),
        ...(item.cssVars && { cssVars: item.cssVars }),
        ...(item.css && { css: item.css }),
        dependencies: item.dependencies || [],
        devDependencies: item.devDependencies || [],
        registryDependencies: item.registryDependencies || [],
        meta: item.meta || {},
      };

      // Write to public/r/[component].json
      const outputPath = path.join(publicDir, `${item.name}.json`);
      await fs.writeFile(outputPath, JSON.stringify(componentData, null, 2));
    } catch (error) {
      console.error(`  ❌ Error generating ${item.name}.json:`, error);
    }
  }

  console.log(`✓ Generated ${items.length} component JSON files in public/r/`);
}

// Run sync
syncRegistry();
