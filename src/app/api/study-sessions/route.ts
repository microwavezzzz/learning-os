import { NextResponse } from "next/server";
import { studySessionsRepo } from "@/db/repositories/study-sessions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId") || undefined;
    const topicId = searchParams.get("topicId") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const sessions = studySessionsRepo.getAll("demo-user-1", { subjectId, topicId, limit });
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: "Start time and End time are required" },
        { status: 400 }
      );
    }

    const created = studySessionsRepo.create({
      subjectId: body.subjectId || null,
      topicId: body.topicId || null,
      plannedDuration: body.plannedDuration ? Number(body.plannedDuration) : 25,
      actualDuration: Number(body.actualDuration) || 0,
      startTime: body.startTime,
      endTime: body.endTime,
      completionStatus: body.completionStatus || "completed",
      technique: body.technique || "pomodoro",
      focusRating: body.focusRating ? Number(body.focusRating) : 4,
      confidence: body.confidence ? Number(body.confidence) : 4,
      difficulty: body.difficulty ? Number(body.difficulty) : 3,
      learningOutcome: body.learningOutcome || "",
      difficultAspects: body.difficultAspects || "",
      reviewItems: body.reviewItems || "",
      notesMarkdown: body.notesMarkdown || "",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
