// source.config.ts
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema
} from "fumadocs-mdx/config";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
var transformerDataLanguage = {
  name: "data-language",
  pre(pre) {
    const lang = this.options.lang;
    if (lang) {
      pre.properties["data-language"] = lang;
    }
    return pre;
  }
};
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true
    }
  },
  meta: {
    schema: metaSchema
  }
});
var source_config_default = defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [
        ...rehypeCodeDefaultOptions.transformers ?? [],
        transformerDataLanguage
      ]
    }
  }
});
export {
  source_config_default as default,
  docs
};
