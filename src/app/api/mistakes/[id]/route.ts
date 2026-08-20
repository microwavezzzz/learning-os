import { NextResponse } from "next/server";
import { mistakesRepo } from "@/db/repositories/mistakes";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const isResolved = Boolean(body.isResolved);

    if (isResolved) {
      mistakesRepo.resolve(id);
    } else {
      mistakesRepo.unresolve(id);
    }

    return NextResponse.json({ success: true, isResolved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
