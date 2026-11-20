import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import {
  TINA_BRANCH_COOKIE,
  tinaBranchCookieOptions,
} from "@/lib/tina-preview-mode";

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();
  const jar = await cookies();
  // Matching Path / Secure / SameSite is required to clear the cookie the
  // enter handler set with SameSite=None in production.
  jar.set(TINA_BRANCH_COOKIE, "", {
    ...tinaBranchCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
  const next = new URL(request.url).searchParams.get("slug");
  redirect(next && next.startsWith("/") ? next : "/");
}

export async function POST(request: NextRequest) {
  return GET(request);
}
