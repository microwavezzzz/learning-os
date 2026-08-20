import { NextResponse } from "next/server";
import { mistakesRepo } from "@/db/repositories/mistakes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId") || undefined;
    const rootCause = searchParams.get("rootCause") || undefined;
    const isResolvedParam = searchParams.get("isResolved");
    const isResolved = isResolvedParam !== null ? isResolvedParam === "true" : undefined;

    const mistakes = mistakesRepo.getAll("demo-user-1", { topicId, rootCause, isResolved });
    const stats = mistakesRepo.getStats("demo-user-1");

    return NextResponse.json({ mistakes, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
