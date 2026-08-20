import { NextResponse } from "next/server";
import { quizzesRepo } from "@/db/repositories/quizzes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 10;

    const questions = quizzesRepo.getQuestionsByTopic(topicId, limit);
    const attempts = quizzesRepo.getAttempts("demo-user-1");

    return NextResponse.json({ questions, attempts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
