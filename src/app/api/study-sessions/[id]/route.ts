import { NextResponse } from "next/server";
import { studySessionsRepo } from "@/db/repositories/study-sessions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = studySessionsRepo.getById(id);
    if (!session) {
      return NextResponse.json({ error: "Study session not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = studySessionsRepo.delete(id);
    if (!success) {
      return NextResponse.json({ error: "Study session not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
