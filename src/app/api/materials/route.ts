import { NextResponse } from "next/server";
import { materialsRepo } from "@/db/repositories/materials";

export async function GET() {
  try {
    const materials = materialsRepo.getAll("demo-user-1");
    return NextResponse.json(materials);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.mimeType) {
      return NextResponse.json({ error: "name and mimeType are required" }, { status: 400 });
    }

    const created = materialsRepo.create({
      subjectId: body.subjectId || null,
      topicId: body.topicId || null,
      name: body.name,
      mimeType: body.mimeType,
      driveFileId: body.driveFileId || null,
      driveUrl: body.driveUrl || null,
      sizeBytes: body.sizeBytes || 0,
      pageCount: body.pageCount || 1,
      rawText: body.rawText || null,
      chunks: body.chunks || [],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
