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

  const markdownUrl = `${page.url}.mdx`;
  const githubUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/content/docs/${page.slugs.join("/")}.mdx`;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        component: <DashedTOC toc={page.data.toc} />,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pt-2 pb-6">
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
