import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { isUserAuthorized } from "@tinacms/auth";
import { TINA_BRANCH_COOKIE } from "@/lib/tina-preview-mode";

/**
 * Official Tina + Next draft-mode enter handler, as an App Router Route
 * Handler. Auth uses @tinacms/auth `isUserAuthorized` (the same check as
 * `isAuthorized(req)` on the Pages API). In development, TinaCloud is not
 * required — matching the contextual-drafts guide.
 *
 * `draftMode().enable()` plus `redirect()` is the official Next.js Draft Mode
 * pattern: the bypass cookie is set on the redirect response.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slugParam = url.searchParams.get("slug");
  const branch = url.searchParams.get("branch")?.trim() || "";
  const target = slugParam && slugParam.startsWith("/") ? slugParam : "/";
  const clientID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID?.trim();

  const draft = await draftMode();
  const alreadyInDraftMode = draft.isEnabled;

  if (process.env.NODE_ENV !== "development" && !alreadyInDraftMode) {
    const token = request.headers.get("authorization");
    if (!clientID || !token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await isUserAuthorized({ clientID, token });
    if (!user?.verified) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  draft.enable();

  if (branch) {
    const jar = await cookies();
    jar.set(TINA_BRANCH_COOKIE, branch, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  redirect(target);
}
