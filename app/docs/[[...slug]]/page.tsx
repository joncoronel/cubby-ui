import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { source, getPageImage } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { ComponentTypeBadge } from "@/components/docs/component-type-badge";
import { PageNavigation } from "@/components/docs/tick-rail";
import { PageFooter } from "@/components/docs/page-footer";

const GITHUB_OWNER = "joncoronel";
const GITHUB_REPO = "cubby-ui";
const GITHUB_BRANCH = "main";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = `${page.url}.md`;
  const githubUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/content/docs/${page.slugs.join("/")}.mdx`;
  const componentType = page.data.type;

  return (
    <>
      <PageNavigation
        toc={page.data.toc}
        className="fixed top-1/2 right-8 z-30 -translate-y-1/2"
      />

      <article className="docs-article px-5 pt-10 pb-28 sm:px-8 sm:pt-12 md:pb-16">
        <header className="docs-enter docs-col">
          <h1
            id="docs-title"
            className="font-display text-foreground text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-[2.75rem]"
          >
            {page.data.title}
          </h1>
          {page.data.description && (
            <p className="text-muted-foreground mt-3 max-w-[52ch] text-lg leading-relaxed text-pretty">
              {page.data.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            {componentType ? (
              <ComponentTypeBadge
                type={componentType}
                builtOn={page.data.builtOn}
              />
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1.5">
              <LLMCopyButton markdownUrl={markdownUrl} />
              <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
            </div>
          </div>
        </header>

        <div
          className="docs-enter-fade docs-prose mt-8"
          style={{ ["--enter-delay" as string]: "70ms" }}
        >
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </div>

        <div className="docs-col">
          <PageFooter url={page.url} githubUrl={githubUrl} />
        </div>
      </article>
    </>
  );
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
