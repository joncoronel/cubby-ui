import { source } from "@/lib/source";

export const dynamic = "force-static";

const CATEGORIES = [
  { slug: "getting-started", title: "Getting Started" },
  { slug: "components", title: "Components" },
  { slug: "hooks", title: "Hooks" },
  { slug: "utils", title: "Utilities" },
] as const;

// Components are split the same way as the sidebar: styled Base UI primitives
// vs. higher-level patterns / originals.
const COMPONENT_GROUPS = [
  { type: "primitive", title: "Primitives" },
  { type: "composable", title: "Composables" },
] as const;

/** `dropdown-menu` → `Dropdown Menu`, for "built on" annotations. */
function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function GET() {
  const pages = source.getPages();
  const baseUrl = "https://cubby-ui.dev";

  const lines: string[] = [];

  // H1 - Project name
  lines.push("# Cubby UI");
  lines.push("");

  // Blockquote - Project summary
  lines.push(
    "> A component library built with React 19, TypeScript, Tailwind CSS 4, and Base UI. Copy, paste, and customize accessible components for your Next.js projects."
  );
  lines.push("");

  const bySlug = (a: (typeof pages)[number], b: (typeof pages)[number]) =>
    a.slugs[a.slugs.length - 1].localeCompare(b.slugs[b.slugs.length - 1]);

  const entry = (page: (typeof pages)[number]): string => {
    const llmsUrl = `${baseUrl}${page.url}.md`;
    const description = page.data.description || "";
    const builtOn = page.data.builtOn?.length
      ? ` (built on ${page.data.builtOn.map(formatSlug).join(", ")})`
      : "";
    return description
      ? `- [${page.data.title}](${llmsUrl}): ${description}${builtOn}`
      : `- [${page.data.title}](${llmsUrl})${builtOn}`;
  };

  // Group pages by category with H2 sections
  for (const category of CATEGORIES) {
    const categoryPages = pages.filter(
      (page) => page.slugs[0] === category.slug
    );
    if (categoryPages.length === 0) continue;

    lines.push(`## ${category.title}`);
    lines.push("");

    // Components get an extra Primitives / Composables split (H3), mirroring
    // the docs sidebar so LLMs see each component's classification.
    if (category.slug === "components") {
      for (const group of COMPONENT_GROUPS) {
        const groupPages = categoryPages
          .filter((page) => page.data.type === group.type)
          .sort(bySlug);
        if (groupPages.length === 0) continue;

        lines.push(`### ${group.title}`);
        lines.push("");
        for (const page of groupPages) lines.push(entry(page));
        lines.push("");
      }
      continue;
    }

    for (const page of categoryPages) lines.push(entry(page));
    lines.push("");
  }

  // Optional section for complete documentation
  lines.push("## Optional");
  lines.push("");
  lines.push(
    `- [Complete Documentation](${baseUrl}/llms-full.txt): Full documentation content for all pages combined`
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
