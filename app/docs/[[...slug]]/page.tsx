import { source, getPageImage } from "@/lib/source";
import type { Metadata } from "next";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/layouts/notebook/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { createRelativeLink } from "fumadocs-ui/mdx";
// import { FillTOC } from "@/components/docs/toc-fill-css";
// import { FillTOC as FillTOCJavaScript } from "@/components/docs/toc-fill-javascript";
// import { DefaultTOC } from "@/components/docs/toc";
// import { FillTOCServer } from "@/components/docs/toc-fill-server";

import { DashedTOC } from "@/components/docs/toc-dashed";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { ComponentTypeBadge } from "@/components/docs/component-type-badge";

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
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        component: <DashedTOC toc={page.data.toc} />,
      }}
    >
      {componentType && (
        <div className="mb-4">
          <ComponentTypeBadge
            type={componentType}
            builtOn={page.data.builtOn}
          />
        </div>
      )}
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="mt-5 flex flex-row items-center gap-2 border-b pb-5">
        <LLMCopyButton markdownUrl={markdownUrl} />
        <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
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
