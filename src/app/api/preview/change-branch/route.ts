import { cookies, draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  TINA_BRANCH_COOKIE,
  tinaBranchCookieOptions,
} from "@/lib/tina-preview-mode";

/**
 * Official Tina editorial-workflow branch switch: only updates the x-branch
 * cookie when draft mode is already enabled.
 */
export async function GET(request: NextRequest) {
  const { isEnabled } = await draftMode();
  if (!isEnabled) {
    return NextResponse.json(
      { message: "Draft mode is not enabled" },
      { status: 401 },
    );
  }
  const branch = new URL(request.url).searchParams.get("branch")?.trim();
  if (!branch) {
    return NextResponse.json({ message: "Missing branch" }, { status: 400 });
  }
  const jar = await cookies();
  jar.set(TINA_BRANCH_COOKIE, branch, tinaBranchCookieOptions());
  return NextResponse.json({ ok: true, branch });
}
