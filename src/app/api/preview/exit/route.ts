import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { TINA_BRANCH_COOKIE } from "@/lib/tina-preview-mode";

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();
  const jar = await cookies();
  jar.delete(TINA_BRANCH_COOKIE);
  const next = new URL(request.url).searchParams.get("slug");
  redirect(next && next.startsWith("/") ? next : "/");
}

export async function POST(request: NextRequest) {
  return GET(request);
}
