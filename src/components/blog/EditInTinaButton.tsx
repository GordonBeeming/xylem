interface EditInTinaButtonProps {
  relativePath: string;
}

// A faint, desktop-only "edit this post in Tina" affordance stuck to the
// bottom-right corner. It's just for Gordon — visible to anyone, but kept
// low-attention (muted until hover) so it doesn't compete with the content.
// Renders on Tina-driven blog posts; the deep link opens that post in the
// Tina admin. No auth gate here — /admin handles that.
export function EditInTinaButton({ relativePath }: EditInTinaButtonProps) {
  const slug = relativePath.replace(/\.mdx?$/, "");
  const editUrl = `/admin/index.html#/~/blog/${slug}`;

  return (
    <a
      href={editUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Edit in Tina"
      className="fixed right-4 bottom-4 z-40 hidden h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--text-subtle)] opacity-40 transition hover:bg-[var(--surface-2)] hover:text-[color:var(--accent)] hover:opacity-100 md:inline-flex"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
      <span className="sr-only">Edit in Tina</span>
    </a>
  );
}
