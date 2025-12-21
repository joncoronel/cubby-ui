import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import type { ShikiTransformer } from "shiki";

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
    schema: frontmatterSchema,
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
