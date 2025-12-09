import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const COMPONENTS_DIR = "content/docs/components";

async function updateMdxFile(filePath) {
  const content = await readFile(filePath, "utf-8");
  let updated = content;

  // Remove all imports from @/registry/examples
  updated = updated.replace(
    /^import\s+.*?\s+from\s+["']@\/registry\/examples\/.*?["'];?\s*$/gm,
    ""
  );

  // Replace <ComponentPreview ...>...</ComponentPreview> with <ComponentPreview ... />
  // Match multi-line ComponentPreview tags with children
  updated = updated.replace(
    /<ComponentPreview\s+([^>]+)>\s*<[^>]+\s*\/>\s*<\/ComponentPreview>/g,
    "<ComponentPreview $1 />"
  );

  // Clean up multiple consecutive empty lines (more than 2)
  updated = updated.replace(/\n\n\n+/g, "\n\n");

  // Only write if content changed
  if (updated !== content) {
    await writeFile(filePath, updated, "utf-8");
    return true;
  }
  return false;
}

async function main() {
  // Read all .mdx files from the components directory
  const files = await readdir(COMPONENTS_DIR);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

  console.log(`Found ${mdxFiles.length} MDX files in ${COMPONENTS_DIR}`);
  console.log("Updating all component files...\n");

  let updatedCount = 0;

  for (const fileName of mdxFiles) {
    const filePath = join(COMPONENTS_DIR, fileName);
    try {
      const wasUpdated = await updateMdxFile(filePath);
      if (wasUpdated) {
        console.log(`✓ Updated: ${fileName}`);
        updatedCount++;
      } else {
        console.log(`- Skipped: ${fileName} (no changes)`);
      }
    } catch (error) {
      console.error(`✗ Error updating ${fileName}:`, error.message);
    }
  }

  console.log(`\nTotal files updated: ${updatedCount} / ${mdxFiles.length}`);
}

main().catch(console.error);
