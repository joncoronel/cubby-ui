import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import type { ShikiTransformer } from "shiki";
import { z } from "zod";

// Custom transformer to add data-language attribute for our MdxPreServer
const transformerDataLanguage: ShikiTransformer = {
  name: "data-language",
  pre(pre) {
    const lang = this.options.lang;
    if (lang) {
      pre.properties["data-language"] = lang;
    }
    return pre;
  },
};

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      /**
       * Component classification, surfaced in the sidebar and page header.
       * - `primitive`  — a styled wrapper around a single Base UI primitive.
       * - `composable` — a higher-level pattern built from primitives, or an
       *   original component with no Base UI counterpart.
       * Omit on non-component docs (guides, hooks, utilities).
       */
      type: z.enum(["primitive", "composable"]).optional(),
      /**
       * For composables, the component slug(s) this is built on top of
       * (e.g. `["dialog"]` for Command). Rendered as linked "Built on" chips.
       * Leave empty for fully original composables (e.g. Circular Slider) —
       * those are labelled "Original" instead.
       */
      builtOn: z.array(z.string()).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerDataLanguage,
      ],
    },
  },
});
