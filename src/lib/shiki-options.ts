import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/**
 * Shared @shikijs/rehype options for post MDX and project READMEs.
 *
 * workerd cannot instantiate Shiki's default Oniguruma WASM engine, which
 * 500s every request-time markdown render on the preview Worker. The
 * JavaScript regex engine is the supported Cloudflare/Shiki path.
 */
export const shikiRehypeOptions = {
  engine: createJavaScriptRegexEngine(),
  themes: { light: "github-light", dark: "github-dark" },
  defaultColor: false,
  addLanguageClass: true,
  parseMetaString: (metaString: string) => ({ __raw: metaString }),
  transformers: [
    {
      pre(node: { properties: Record<string, unknown> }) {
        const meta = (
          this as unknown as { options: { meta?: { __raw?: string } } }
        ).options?.meta?.__raw;
        if (meta) {
          node.properties["data-meta"] = meta;
        }
      },
    },
  ],
};
