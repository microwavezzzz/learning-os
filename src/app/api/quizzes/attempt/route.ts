import { NextResponse } from "next/server";
import { quizzesRepo } from "@/db/repositories/quizzes";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.topicId || !Array.isArray(body.userSubmissions)) {
      return NextResponse.json({ error: "topicId and userSubmissions array are required" }, { status: 400 });
    }

    const attempt = await quizzesRepo.submitAttempt({
      topicId: body.topicId,
      timeSpentSeconds: body.timeSpentSeconds || 60,
      userSubmissions: body.userSubmissions,
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
