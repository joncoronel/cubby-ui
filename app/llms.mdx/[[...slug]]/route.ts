import { getLLMText } from "@/lib/source";
import { source } from "@/lib/source";
import { notFound } from "next/navigation";

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms.mdx/[[...slug]]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams();
}
