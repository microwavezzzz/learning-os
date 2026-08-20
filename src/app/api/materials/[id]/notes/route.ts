import { NextResponse } from "next/server";
import { materialsRepo } from "@/db/repositories/materials";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.noteMarkdown) {
      return NextResponse.json({ error: "noteMarkdown is required" }, { status: 400 });
    }

    const note = materialsRepo.addNote({
      materialId: id,
      pageNumber: body.pageNumber || null,
      highlightText: body.highlightText || null,
      noteMarkdown: body.noteMarkdown,
      color: body.color,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
