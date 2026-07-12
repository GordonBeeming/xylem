import { AnchorHeading } from "@/components/prose/AnchorHeading";
import { TableWrapper } from "@/components/prose/TableWrapper";
import { CodeBlock } from "@/components/prose/CodeBlock";
import { MermaidDiagram } from "@/components/prose/MermaidDiagram";

// Shared HTML-tag component map for rendered markdown prose — used by both
// the blog (via MDXRemote) and project READMEs (via rehype-react). Both
// renderers build elements through hast-util-to-jsx-runtime, so these
// handlers see identical prop shapes (data-meta/dataMeta, className) in
// either pipeline; no per-renderer branching needed.
export const proseComponents = {
  h2: (props: React.ComponentProps<"h2">) => {
    const id = props.id ?? "";
    return <AnchorHeading level={2} id={id}>{props.children}</AnchorHeading>;
  },
  h3: (props: React.ComponentProps<"h3">) => {
    const id = props.id ?? "";
    return <AnchorHeading level={3} id={id}>{props.children}</AnchorHeading>;
  },
  h4: (props: React.ComponentProps<"h4">) => {
    const id = props.id ?? "";
    return <AnchorHeading level={4} id={id}>{props.children}</AnchorHeading>;
  },
  table: (props: React.ComponentProps<"table">) => (
    <TableWrapper>{props.children}</TableWrapper>
  ),
  img: (props: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className="mx-auto max-w-full rounded-lg"
      loading="lazy"
      alt={props.alt ?? ""}
    />
  ),
  a: (props: React.ComponentProps<"a">) => {
    const isExternal =
      typeof props.href === "string" &&
      (props.href.startsWith("http://") || props.href.startsWith("https://"));
    return (
      <a
        {...props}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      />
    );
  },
  pre: (props: Record<string, unknown>) => {
    // Shiki + our rehype plugins set dataMeta and dataLanguage on <pre>
    const child = props.children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;

    // Try multiple sources for language
    const codeClassName = child?.props?.className ?? "";
    const language =
      (props.dataLanguage as string) ??
      (props["data-language"] as string) ??
      (codeClassName.includes("language-")
        ? codeClassName.replace(/.*language-(\S+).*/, "$1")
        : undefined);

    // Extract title from the meta string: title="filename.go"
    const meta = (props.dataMeta as string) ?? (props["data-meta"] as string) ?? "";
    const titleMatch = meta.match(/title=["']([^"']+)["']/);
    const filename = titleMatch?.[1] ?? undefined;

    // Extract raw text from React children tree (for copy button)
    function extractText(node: React.ReactNode): string {
      if (node == null || typeof node === "boolean") return "";
      if (typeof node === "string") return node;
      if (typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (typeof node === "object" && node !== null) {
        const n = node as unknown as { props?: { children?: React.ReactNode; className?: string } };
        // Shiki uses <span class="line"> - add newline between lines
        if (n.props?.className === "line") {
          return extractText(n.props.children) + "\n";
        }
        if (n.props?.children != null) return extractText(n.props.children);
      }
      return "";
    }
    const code = extractText(child?.props?.children).replace(/\n$/, "");

    // Render mermaid code blocks as interactive diagrams instead of syntax-highlighted code
    if (language === "mermaid") {
      return <MermaidDiagram chart={code} title={filename} />;
    }

    return (
      <CodeBlock code={code} language={language} filename={filename}>
        {child}
      </CodeBlock>
    );
  },
};
