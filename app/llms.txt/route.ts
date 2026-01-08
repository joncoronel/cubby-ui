import { source } from "@/lib/source";

export const revalidate = false;

const CATEGORIES = [
  { slug: "getting-started", title: "Getting Started" },
  { slug: "components", title: "Components" },
  { slug: "hooks", title: "Hooks" },
  { slug: "utils", title: "Utilities" },
] as const;

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

  // Group pages by category with H2 sections
  for (const category of CATEGORIES) {
    const categoryPages = pages.filter(
      (page) => page.slugs[0] === category.slug
    );
    if (categoryPages.length === 0) continue;

    lines.push(`## ${category.title}`);
    lines.push("");

    for (const page of categoryPages) {
      const llmsUrl = `${baseUrl}${page.url}.mdx`;
      const description = page.data.description || "";

      if (description) {
        lines.push(`- [${page.data.title}](${llmsUrl}): ${description}`);
      } else {
        lines.push(`- [${page.data.title}](${llmsUrl})`);
      }
    }
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
