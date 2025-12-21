import { docs } from "fumadocs-mdx:collections/server";
import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import {
  exampleRegistry,
  componentMetadata,
  componentAnatomy,
} from "@/app/components/_generated/registry";
import { transformComponentImports } from "@/lib/transform-registry-imports";
import * as fs from "node:fs";
import * as path from "node:path";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `/og/docs/${segments.join("/")}`,
  };
}

function stripMDXForLLM(content: string): string {
  let cleaned = content;

  // Store code blocks to protect them from processing
  const codeBlocks: string[] = [];
  const CODE_BLOCK_PLACEHOLDER = "___CODE_BLOCK_PLACEHOLDER___";

  // Temporarily replace existing code blocks with placeholders
  cleaned = cleaned.replace(/(```[\s\S]*?```)/g, (match) => {
    codeBlocks.push(match);
    return `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length - 1}${CODE_BLOCK_PLACEHOLDER}`;
  });

  // Remove all import statements
  cleaned = cleaned.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "");

  // Special handling for ApiProp components - extract metadata and format nicely
  // This regex captures the entire opening tag and content separately
  // Use negative lookahead to NOT match ApiPropsList
  // Match any characters except > to handle both quoted and JSX expression attributes
  cleaned = cleaned.replace(
    /<ApiProp(?!sList)([^>]*?)>([\s\S]*?)<\/ApiProp>/g,
    (_match, attributes, description) => {
      // Extract individual attributes from the tag
      // Use backreferences to match opening/closing quotes of the same type
      // This handles cases like fullType='"value" | "other"' where inner quotes differ
      const nameMatch = attributes.match(/name\s*=\s*(["'])([^"']*)\1/);
      const fullTypeMatch = attributes.match(
        /fullType\s*=\s*(["'])([\s\S]*?)\1/,
      );
      const simpleTypeMatch = attributes.match(
        /simpleType\s*=\s*(["'])([\s\S]*?)\1/,
      );
      const defaultValueMatch = attributes.match(
        /defaultValue\s*=\s*(["'])([\s\S]*?)\1/,
      );

      // Extract values from capture group 2 (group 1 is the quote character)
      // Replace HTML entities in the extracted values
      const name = nameMatch ? nameMatch[2] : "";
      const fullType = fullTypeMatch
        ? fullTypeMatch[2].replace(/&#x[\dA-F]+;/gi, '"')
        : "";
      const simpleType = simpleTypeMatch
        ? simpleTypeMatch[2].replace(/&#x[\dA-F]+;/gi, '"')
        : "";
      const defaultValue = defaultValueMatch
        ? defaultValueMatch[2].replace(/&#x[\dA-F]+;/gi, '"')
        : "";

      const cleanDesc = description.trim();
      let result = `\n- **${name}**`;

      // Show both types when both are provided
      if (simpleType && fullType) {
        result += ` (type: \`${simpleType}\`, full: \`${fullType}\`)`;
      } else if (simpleType || fullType) {
        result += ` (type: \`${simpleType || fullType}\`)`;
      }

      if (defaultValue) {
        result += ` - Default: \`${defaultValue}\``;
      }

      if (cleanDesc) {
        result += `\n  ${cleanDesc}`;
      }

      return result;
    },
  );

  // Remove HTML entities that might remain in content
  cleaned = cleaned.replace(/&#x[\dA-F]+;/gi, '"');

  // Remove ApiPropsList wrapper but keep content
  cleaned = cleaned.replace(/<ApiPropsList>([\s\S]*?)<\/ApiPropsList>/g, "$1");

  // Extract source code from ComponentPreview tags (both self-closing and with children)
  cleaned = cleaned.replace(
    /<ComponentPreview([^>\/]*)(?:\/>|>[\s\S]*?<\/ComponentPreview>)/g,
    (_match, attributes) => {
      // Extract component and example attributes
      const componentMatch = attributes.match(/component\s*=\s*"([^"]*)"/);
      const exampleMatch = attributes.match(/example\s*=\s*"([^"]*)"/);

      if (componentMatch && exampleMatch) {
        const component = componentMatch[1];
        const example = exampleMatch[1];

        // Look up the example in the registry
        const examples =
          exampleRegistry[component as keyof typeof exampleRegistry];
        if (examples) {
          const exampleData = examples.find((e) => e.importPath === example);
          if (exampleData) {
            // Create code block and store it with a placeholder
            const codeBlock = `\n\`\`\`tsx
// ${example}.tsx
${exampleData.source}
\`\`\`\n`;
            codeBlocks.push(codeBlock);
            return `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length - 1}${CODE_BLOCK_PLACEHOLDER}`;
          }
        }
      }

      // Fallback if we couldn't find the source
      return "\n[Interactive component preview - source not available]\n";
    },
  );

  // Extract installation instructions from ComponentInstall tags
  cleaned = cleaned.replace(
    /<ComponentInstall\s+component\s*=\s*"([^"]+)"\s*\/>/g,
    (_match, component) => {
      const metadata =
        componentMetadata[component as keyof typeof componentMetadata];
      let installBlock =
        "\n### Installation\n\n**CLI:**\n\n```bash\nnpx shadcn@latest add @cubby-ui/" +
        component +
        "\n```\n";

      if (metadata && metadata.dependencies.length > 0) {
        const deps = metadata.dependencies.join(" ");
        installBlock +=
          "\n**Manual:**\n\n1. Install dependencies:\n\n```bash\nnpm install " +
          deps +
          "\n```\n";
        installBlock +=
          "\n2. Copy the component source code to your project:\n\n";
      } else {
        installBlock +=
          "\n**Manual:**\n\nCopy the component source code to your project:\n\n";
      }

      // Read component source from public/r/[component].json
      try {
        const componentJsonPath = path.join(
          process.cwd(),
          "public",
          "r",
          `${component}.json`,
        );
        const componentJson = JSON.parse(
          fs.readFileSync(componentJsonPath, "utf-8"),
        );

        // Add source code for each file
        if (componentJson.files && Array.isArray(componentJson.files)) {
          for (const file of componentJson.files) {
            if (file.content) {
              // Convert registry path to typical installation path
              let installPath = file.path;

              if (file.type === "registry:ui") {
                // Main component: registry/default/button/button.tsx -> components/ui/button.tsx
                const filename = path.basename(file.path);
                installPath = `components/ui/${filename}`;
              } else if (file.type === "registry:lib") {
                // Library files: registry/default/autocomplete/lib/highlight-text.tsx -> lib/highlight-text.tsx
                const filename = path.basename(file.path);
                installPath = `lib/${filename}`;
              } else if (file.type === "registry:hook") {
                // Hooks: registry/default/autocomplete/hooks/use-fuzzy-filter.ts -> hooks/use-fuzzy-filter.ts
                const filename = path.basename(file.path);
                installPath = `hooks/${filename}`;
              }

              // Transform imports to user-facing paths
              const transformedContent = transformComponentImports(
                file.content,
                component,
                file.path,
                file.type,
              );

              installBlock += `Create \`${installPath}\`:\n\n\`\`\`tsx\n${transformedContent}\n\`\`\`\n\n`;
            }
          }
        }
      } catch (error) {
        // If we can't read the file, just note it
        installBlock += "[Component source code not available]\n";
      }

      // Store the installation block as a code block to protect it
      codeBlocks.push(installBlock);
      return `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length - 1}${CODE_BLOCK_PLACEHOLDER}`;
    },
  );

  // Extract usage examples from ComponentUsage tags
  cleaned = cleaned.replace(
    /<ComponentUsage\s+component\s*=\s*"([^"]+)"\s*\/>/g,
    (_match, component) => {
      const anatomy =
        componentAnatomy[component as keyof typeof componentAnatomy];

      if (!anatomy) {
        return "\n[Usage example not available]\n";
      }

      const codeBlock = `\n**Imports:**\n\n\`\`\`tsx\n${anatomy.imports}\n\`\`\`\n\n**Basic Usage:**\n\n\`\`\`tsx\n${anatomy.anatomy}\n\`\`\`\n`;
      codeBlocks.push(codeBlock);
      return `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length - 1}${CODE_BLOCK_PLACEHOLDER}`;
    },
  );

  // Extract package manager commands from PackageManagerCommand tags
  cleaned = cleaned.replace(
    /<PackageManagerCommand\s+npm\s*=\s*"([^"]+)"\s*\/>/g,
    (_match, npmCommand) => {
      // Convert npm command to other package manager equivalents
      let pnpmCommand = npmCommand;
      let yarnCommand = npmCommand;
      let bunCommand = npmCommand;

      // npx -> pnpm dlx / bunx (yarn uses npx)
      if (npmCommand.startsWith("npx ")) {
        pnpmCommand = npmCommand.replace(/^npx /, "pnpm dlx ");
        bunCommand = npmCommand.replace(/^npx /, "bunx ");
      }

      // npm install -> pnpm add / yarn add / bun add
      if (npmCommand.startsWith("npm install ")) {
        pnpmCommand = npmCommand.replace(/^npm install /, "pnpm add ");
        yarnCommand = npmCommand.replace(/^npm install /, "yarn add ");
        bunCommand = npmCommand.replace(/^npm install /, "bun add ");
      }

      const codeBlock = `
**npm:**
\`\`\`bash
${npmCommand}
\`\`\`

**pnpm:**
\`\`\`bash
${pnpmCommand}
\`\`\`

**yarn:**
\`\`\`bash
${yarnCommand}
\`\`\`

**bun:**
\`\`\`bash
${bunCommand}
\`\`\`
`;
      codeBlocks.push(codeBlock);
      return `${CODE_BLOCK_PLACEHOLDER}${codeBlocks.length - 1}${CODE_BLOCK_PLACEHOLDER}`;
    },
  );

  // Remove any remaining self-closing component tags
  cleaned = cleaned.replace(
    /<[A-Z][^>]*\/>/g,
    "\n[Component omitted for brevity]\n",
  );

  // Remove remaining component opening and closing tags but keep content in between
  // Match: <ComponentName ...> content </ComponentName>
  // Replace with just: content
  cleaned = cleaned.replace(
    /<[A-Z][A-Za-z]*[^>]*>([\s\S]*?)<\/[A-Z][A-Za-z]*>/g,
    "$1",
  );

  // Remove any remaining orphaned opening/closing tags
  cleaned = cleaned.replace(/<\/?[A-Z][A-Za-z]*[^>]*>/g, "");

  // Clean up excessive blank lines (more than 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Restore all code blocks
  cleaned = cleaned.replace(
    new RegExp(`${CODE_BLOCK_PLACEHOLDER}(\\d+)${CODE_BLOCK_PLACEHOLDER}`, "g"),
    (_match, index) => codeBlocks[parseInt(index)],
  );

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");
  const cleaned = stripMDXForLLM(processed);

  return `# ${page.data.title} (${page.url})

${cleaned}`;
}
