import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import type { StructuredData } from "fumadocs-core/mdx-plugins";

// Import meta.json files to filter search results
import componentsMeta from "@/content/docs/components/meta.json";
import hooksMeta from "@/content/docs/hooks/meta.json";
import utilsMeta from "@/content/docs/utils/meta.json";
import gettingStartedMeta from "@/content/docs/getting-started/meta.json";

// Map section to allowed pages from meta.json
const allowedPages: Record<string, string[]> = {
  components: componentsMeta.pages,
  hooks: hooksMeta.pages,
  utils: utilsMeta.pages,
  "getting-started": gettingStartedMeta.pages,
};

// statically cached
export const revalidate = false;

// Check if a page should be indexed based on its section's meta.json
function isPageAllowed(slugs: string[]): boolean {
  const section = slugs[0];
  const pageSlug = slugs[slugs.length - 1];

  // If section has no allowedPages entry, allow all pages in that section
  if (!allowedPages[section]) return true;

  return allowedPages[section].includes(pageSlug);
}

export const { staticGET: GET } = createFromSource(source, {
  buildIndex(page) {
    // Skip pages not in meta.json by returning minimal non-searchable data
    if (!isPageAllowed(page.slugs)) {
      return {
        title: "",
        description: "",
        url: page.url,
        id: page.url,
        structuredData: { headings: [], contents: [] },
      };
    }

    // Generate breadcrumbs: "Documentation" + parent slugs (excluding the page itself)
    const breadcrumbs = [
      "Documentation",
      ...page.slugs.slice(0, -1).map(
        (slug) => slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
      ),
    ];

    return {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      breadcrumbs,
      structuredData: filterStructuredData(page.data.structuredData),
    };
  },
});

function filterStructuredData(
  structuredData: StructuredData | undefined,
): StructuredData {
  if (!structuredData) return { headings: [], contents: [] };

  return {
    headings: structuredData.headings,
    // Exclude all paragraph content, only index headings
    contents: [],
  };
}
