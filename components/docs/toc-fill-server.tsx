import type { TOCItemType } from "fumadocs-core/toc";
import { FillTOC } from "./toc-fill-javascript";
// import { FillTOC } from "./toc-fill-css";
import { DefaultTOC } from "./toc";
import { computeTocSvgData, computeDefaultTocSvgData } from "./toc-utils";

interface FillTOCServerProps {
  toc: TOCItemType[];
  /** Enable stepped/indented line for depth 3+ headings */
  stepped?: boolean;
}

/**
 * Server component that pre-computes the TOC SVG path
 * for immediate rendering without client-side flash.
 */
export function FillTOCServer({ toc, stepped = false }: FillTOCServerProps) {
  const initialSvg = computeTocSvgData(toc, stepped);

  return <FillTOC toc={toc} stepped={stepped} initialSvg={initialSvg} />;
}

interface DefaultTOCServerProps {
  toc: TOCItemType[];
  /**
   * When true, only a single anchor is active at a time.
   * When false, multiple anchors can be active simultaneously.
   * @default true
   */
  single?: boolean;
  /** Enable stepped/indented line for depth 3+ headings */
  stepped?: boolean;
}

/**
 * Server component that pre-computes the DefaultTOC SVG path
 * for immediate rendering without client-side flash.
 */
export function DefaultTOCServer({
  toc,
  single = true,
  stepped = false,
}: DefaultTOCServerProps) {
  const initialSvg = computeDefaultTocSvgData(toc, stepped);

  return (
    <DefaultTOC toc={toc} single={single} stepped={stepped} initialSvg={initialSvg} />
  );
}
