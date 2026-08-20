import { NextResponse } from "next/server";
import { topicsRepo } from "@/db/repositories/topics";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId") || undefined;
    const topics = topicsRepo.getAll("demo-user-1", subjectId);
    return NextResponse.json(topics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!body.subjectId) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const created = topicsRepo.create({
      subjectId: body.subjectId,
      parentId: body.parentId || null,
      title: body.title.trim(),
      description: body.description,
      status: body.status || "not_started",
      difficulty: body.difficulty || "intermediate",
      mastery: body.mastery !== undefined ? Number(body.mastery) : 0,
      prerequisites: body.prerequisites || [],
      relatedMaterials: body.relatedMaterials || [],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
