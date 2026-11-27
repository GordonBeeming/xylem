import { Suspense } from "react";
import { getPreviewContext, isPreviewServer } from "@/lib/tina-preview-mode";
import { PreviewModeBannerClient } from "./PreviewModeBannerClient";

/**
 * Official draft-mode banner for leftover top-level preview sessions.
 * The client half stays hidden until it confirms it is not in an iframe.
 */
export async function PreviewModeBanner() {
  if (!isPreviewServer()) return null;
  const preview = await getPreviewContext();
  if (!preview.enabled) return null;
  return (
    <Suspense fallback={null}>
      <PreviewModeBannerClient />
    </Suspense>
  );
}
