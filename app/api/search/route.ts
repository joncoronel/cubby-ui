import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import type { StructuredData } from "fumadocs-core/mdx-plugins";

// statically cached
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  buildIndex(page) {
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
