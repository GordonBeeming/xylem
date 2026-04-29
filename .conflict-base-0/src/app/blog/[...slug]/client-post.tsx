"use client";

import { useTina } from "tinacms/dist/react";
import type { ReactNode } from "react";

interface ClientPostProps {
  query: string;
  variables: Record<string, unknown>;
  data: Record<string, unknown>;
  children: ReactNode;
}

/**
 * Wraps blog post content with TinaCMS's useTina hook.
 * This enables the sidebar form fields in the TinaCMS admin.
 * The actual content rendering is still done server-side via MDXRemote,
 * but this hook connects the page to TinaCMS for field editing.
 */
export function ClientPost({ query, variables, data, children }: ClientPostProps) {
  // useTina provides live editing data when in the TinaCMS admin iframe
  const { data: tinaData } = useTina({ query, variables, data });

  // For now, we render the server-rendered children.
  // The tinaData can be used for live preview in the future.
  // The sidebar form fields will now appear in the admin.
  void tinaData;

  return <>{children}</>;
}
