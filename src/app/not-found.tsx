import type { Metadata } from "next";
import { Button } from "@/components/ds/Button";
import { Tag } from "@/components/ds/Tag";
import { CodeBlock } from "@/components/prose/CodeBlock";

export const metadata: Metadata = {
  title: "Page Not Found",
};

const session = `~/gordonbeeming $ cat ./blog/the-page-you-wanted
cat: no such file or directory

~/gordonbeeming $ whereis it
it: not in the vascular system 🌱

~/gordonbeeming $ suggest --next
→ press ⌘K to search everything
→ or head back to the homepage`;

const suggestions = [
  { label: "Latest posts", href: "/blog" },
  { label: "Projects", href: "/projects" },
  { label: "Nuggets", href: "/nuggets" },
  { label: "About", href: "/about" },
];

export default function NotFound() {
  return (
    <div className="page-narrow text-center">
      <div className="eyebrow" style={{ letterSpacing: "var(--ls-wider)" }}>
        Error 404
      </div>
      <h1
        className="mt-4"
        style={{
          fontSize: "var(--text-4xl)",
          fontWeight: "var(--fw-bold)",
          letterSpacing: "var(--ls-tighter)",
          lineHeight: 1,
          color: "var(--text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        4<span style={{ color: "var(--accent)" }}>0</span>4
      </h1>
      <p
        className="mx-auto mt-[18px]"
        style={{ maxWidth: "46ch", fontSize: "var(--text-md)", lineHeight: "var(--lh-relaxed)", color: "var(--text-muted)" }}
      >
        This route doesn&rsquo;t exist — the xylem couldn&rsquo;t transport you there. It was
        either moved, renamed, or never planted.
      </p>

      <div className="mt-[var(--space-8)] text-left">
        <CodeBlock filename="404: page not found" language="sh" code={session} />
      </div>

      <div className="mt-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-3)]">
        <Button variant="primary" as="a" href="/">
          ← Back to home
        </Button>
        <Button variant="secondary" as="a" href="/blog">
          Browse all posts
        </Button>
      </div>

      <div className="mt-[var(--space-10)]">
        <div
          className="mb-[var(--space-4)]"
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wider)", textTransform: "uppercase", color: "var(--text-subtle)" }}
        >
          Try one of these
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <Tag key={s.label} as="a" href={s.href}>
              {s.label}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
