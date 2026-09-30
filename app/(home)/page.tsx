import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";
import { solidSurface } from "@/registry/default/lib/elevated";
import { source } from "@/lib/source";
import type { RegistryItemJson } from "@/lib/registry-json";
import { cn } from "@/lib/utils";
import { LandingNav } from "@/components/home/landing-nav";
import { Showcase } from "@/components/home/showcase";
import { QrDemo } from "@/components/home/qr-demo";
import { QrLogoDemo } from "@/components/home/qr-logo-demo";
import { TreeDemo } from "@/components/home/tree-demo";
import { CubbyUILogo } from "@/components/cubbyui-logo";
import TextMorphNumbers from "@/registry/examples/text-morph/text-morph-numbers";
import TextMorphModes from "@/registry/examples/text-morph/text-morph-modes";
import CircularSliderWithValue from "@/registry/examples/circular-slider/circular-slider-with-value";
import CircularSliderWithMarkers from "@/registry/examples/circular-slider/circular-slider-with-markers";
import CodeBlockWithFilename from "@/registry/examples/code-block/code-block-with-filename";
import FiltersBasic from "@/registry/examples/filters/filters-basic";
import TransitionPanelBasic from "@/registry/examples/transition-panel/transition-panel-basic";
import MarchingBorderBasic from "@/registry/examples/marching-border/marching-border-basic";

const GET_STARTED = "/docs/getting-started/introduction";
const BROWSE = "/docs/components/text-morph";
const GITHUB = "https://github.com/joncoronel/cubby-ui";

/** Primary action on the slab: the light pill. */
const SLAB_PRIMARY =
  "inline-flex h-11 items-center gap-1.5 rounded-full bg-(--land-on-field) pr-4 pl-5 text-[0.9375rem] font-medium text-(--land-field) outline-0 outline-offset-2 outline-transparent outline-solid hover:opacity-90 focus-visible:outline-2 focus-visible:outline-(--land-on-field) active:scale-[0.97]";
/** Secondary action on the slab: a ringed ghost pill. */
const SLAB_SECONDARY =
  "inline-flex h-11 items-center rounded-full px-5 text-[0.9375rem] font-medium text-(--land-on-field) ring-1 ring-(--land-field-line) ring-inset outline-0 outline-offset-2 outline-transparent outline-solid hover:bg-(--land-field-line) focus-visible:outline-2 focus-visible:outline-(--land-on-field) active:scale-[0.97]";

const SECTION_TITLE =
  "text-foreground font-(family-name:--font-display) text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-5xl";

/** A component's one-line description, from its docs page. */
function describe(slug: string): string {
  return source.getPage(["components", slug])?.data.description ?? "";
}

/** The first lines of a component as it lands in your project. */
async function installedSource(
  slug: string,
  lines: number,
): Promise<{ target: string; code: string; highlighted: ReactElement }> {
  const json = JSON.parse(
    await fs.readFile(
      path.join(process.cwd(), "public/r", `${slug}.json`),
      "utf-8",
    ),
  ) as RegistryItemJson;
  const file = json.files![0];
  const code = file.content.split("\n").slice(0, lines).join("\n").trimEnd();
  return {
    target: file.target ?? file.path,
    code,
    highlighted: await highlight(code, "tsx"),
  };
}

export default async function Home() {
  const owned = await installedSource("marching-border", 40);

  return (
    <>
      {/* Nav and hero share the slab. */}
      <section className="land-slab relative mx-2 mt-2 overflow-hidden sm:mx-3 sm:mt-3">
        <LandingNav />

        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 pt-10 pb-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-16 lg:pt-16 lg:pb-20 xl:gap-20">
          <div className="flex flex-col items-start">
            <h1 className="land-rise font-(family-name:--font-display) text-[2.625rem] leading-[0.98] font-semibold tracking-[-0.04em] text-balance sm:text-[3.5rem] lg:text-[3.75rem] xl:text-[4.5rem]">
              <span className="block">The details are done.</span>
              <span className="block text-(--land-on-field-muted)">
                The code is yours.
              </span>
            </h1>
            <p
              className="land-rise mt-6 max-w-[60ch] text-lg leading-relaxed text-pretty text-(--land-on-field-muted) sm:text-xl"
              style={{ ["--rise-delay" as string]: "60ms" }}
            >
              React components on Base UI, finished down to the motion.
            </p>
            <div
              className="land-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ ["--rise-delay" as string]: "120ms" }}
            >
              <Link href={GET_STARTED} className={SLAB_PRIMARY}>
                Get started
                <HugeiconsIcon
                  icon={ChevronRightIcon}
                  strokeWidth={2}
                  className="size-4"
                />
              </Link>
              <Link href={BROWSE} className={SLAB_SECONDARY}>
                Browse components
              </Link>
            </div>
          </div>

          <div
            className="land-rise w-full"
            style={{ ["--rise-delay" as string]: "180ms" }}
          >
            <Showcase
              items={[
                {
                  slug: "text-morph",
                  name: "Text Morph",
                  demo: <TextMorphNumbers />,
                },
                {
                  slug: "circular-slider",
                  name: "Circular Slider",
                  demo: <CircularSliderWithValue />,
                },
                { slug: "tree", name: "Tree", demo: <TreeDemo /> },
                { slug: "qr-code", name: "QR Code", demo: <QrDemo /> },
              ]}
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 sm:px-10">
        {/* The gallery: every card is the real component. */}
        <section aria-labelledby="gallery" className="pt-24 sm:pt-32">
          <div className="max-w-2xl">
            <h2 id="gallery" className={SECTION_TITLE}>
              The ones worth showing off.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">
              Every card below is the real component. Play with it, then install
              just that one.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-6">
            <GalleryCard
              slug="text-morph"
              name="Text Morph"
              span="md:col-span-4"
            >
              <TextMorphModes />
            </GalleryCard>
            <GalleryCard
              slug="circular-slider"
              name="Circular Slider"
              span="md:col-span-2"
            >
              <CircularSliderWithMarkers />
            </GalleryCard>
            <GalleryCard slug="qr-code" name="QR Code" span="md:col-span-2">
              <QrLogoDemo />
            </GalleryCard>
            <GalleryCard
              slug="transition-panel"
              name="Transition Panel"
              span="md:col-span-4"
            >
              <TransitionPanelBasic />
            </GalleryCard>
            <GalleryCard slug="filters" name="Filters" span="md:col-span-3">
              <FiltersBasic />
            </GalleryCard>
            <GalleryCard
              slug="code-block"
              name="Code Block"
              span="md:col-span-3"
            >
              <div className="w-full max-w-md">
                <CodeBlockWithFilename />
              </div>
            </GalleryCard>
            <GalleryCard
              slug="marching-border"
              name="Marching Border"
              span="md:col-span-3"
            >
              <MarchingBorderBasic />
            </GalleryCard>
            <Link
              href={BROWSE}
              className="group flex min-h-[12rem] flex-col justify-between rounded-[1.25rem] bg-(--land-field) p-6 text-(--land-on-field) outline-0 outline-offset-2 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-(--land-field) md:col-span-3"
            >
              <p className="font-(family-name:--font-display) text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
                And every piece you&apos;d expect, from Accordion to Tooltip.
              </p>
              <span className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-(--land-on-field-muted) group-hover:text-(--land-on-field)">
                Browse all components
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </div>
        </section>

        {/* Ownership: the file you get. */}
        <section
          aria-labelledby="ownership"
          className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 pt-24 sm:pt-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
        >
          <div>
            <h2 id="ownership" className={SECTION_TITLE}>
              You get the file, not a dependency.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">
              The CLI copies the source into your project. Rename it, restyle
              it, cut what you don&apos;t need. Nothing changes under you unless
              you pull it in.
            </p>
            <ul className="mt-8 flex flex-col gap-5">
              {[
                [
                  "Install one component",
                  "One command per piece, not a bundle of seventy.",
                ],
                [
                  "Read it like your own code",
                  "Plain React and Tailwind, commented where it matters.",
                ],
                [
                  "Change anything",
                  "Tokens, motion, markup: it's all in the file.",
                ],
              ].map(([title, body]) => (
                <li key={title}>
                  <div>
                    <p className="text-foreground font-medium">{title}</p>
                    <p className="text-muted-foreground text-[0.9375rem]">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <CodeBlock
            code={owned.code}
            language="tsx"
            initial={owned.highlighted}
          >
            <CodeBlockHeader filename={owned.target} />
            <CodeBlockPre className="max-h-[26rem]">
              <CodeBlockCode />
            </CodeBlockPre>
          </CodeBlock>
        </section>
      </main>

      {/* The close shares the hero's slab. */}
      <section className="land-slab mx-2 mt-24 px-5 py-16 text-center sm:mx-3 sm:mt-32 sm:px-10 sm:py-24">
        <h2 className="mx-auto max-w-[18ch] font-(family-name:--font-display) text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
          Start with one component.
        </h2>
        <p className="mx-auto mt-5 max-w-[42ch] text-lg text-pretty text-(--land-on-field-muted)">
          Pick the piece you need today. The rest will be here when you do.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={GET_STARTED} className={SLAB_PRIMARY}>
            Get started
            <HugeiconsIcon
              icon={ChevronRightIcon}
              strokeWidth={2}
              className="size-4"
            />
          </Link>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer noopener"
            className={SLAB_SECONDARY}
          >
            Star on GitHub
          </a>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-10 px-5 pt-16 pb-12 sm:flex-row sm:justify-between sm:px-10">
        <div className="max-w-xs">
          <Link
            href="/"
            className="text-foreground flex items-center gap-2.5"
            aria-label="Cubby UI home"
          >
            <CubbyUILogo className="h-5 w-auto" />
            <span className="font-(family-name:--font-display) text-[1.05rem] leading-none font-semibold tracking-tight">
              Cubby UI
            </span>
          </Link>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            React components with the details done. MIT licensed.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <FooterColumn
            title="Docs"
            links={[
              ["Introduction", GET_STARTED],
              ["Installation", "/docs/getting-started/installation"],
              ["Hooks", "/docs/hooks/use-fuzzy-filter"],
            ]}
          />
          <FooterColumn
            title="Components"
            links={[
              ["Text Morph", "/docs/components/text-morph"],
              ["Circular Slider", "/docs/components/circular-slider"],
              ["Tree", "/docs/components/tree"],
            ]}
          />
          <FooterColumn
            title="Project"
            links={[
              ["GitHub", GITHUB],
              ["License", `${GITHUB}/blob/main/LICENSE`],
            ]}
          />
        </div>
      </footer>
    </>
  );
}

function GalleryCard({
  slug,
  name,
  span,
  children,
}: {
  slug: string;
  name: string;
  span: string;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        "text-foreground flex flex-col rounded-[1.25rem] p-1",
        solidSurface(3, 1),
        "bg-muted",
        span,
      )}
    >
      {/* The live piece on its own card, set in the tray like a docs
          example; the name and link sit on the tray beneath it. */}
      <div className="bg-background flex min-h-[16rem] flex-1 items-center justify-center rounded-2xl px-6 py-10">
        {children}
      </div>
      <div className="flex items-end justify-between gap-4 px-4 pt-3.5 pb-3">
        <div className="min-w-0">
          <h3 className="font-(family-name:--font-display) text-[1.1875rem] leading-tight font-semibold tracking-[-0.01em]">
            {name}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-3 text-sm md:line-clamp-2">
            {describe(slug)}
          </p>
        </div>
        <Link
          href={`/docs/components/${slug}`}
          aria-label={`${name} docs`}
          className="text-muted-foreground hover:text-foreground hover:bg-surface-hover focus-visible:outline-ring/50 inline-flex size-9 shrink-0 items-center justify-center rounded-full outline-0 outline-offset-2 outline-transparent outline-solid focus-visible:outline-2"
        >
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Link>
      </div>
    </article>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <p className="text-foreground font-medium">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("http") ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-foreground"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
