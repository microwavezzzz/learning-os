import { NextResponse } from "next/server";
import { studyPlansRepo } from "@/db/repositories/study-plans";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.targetDate) {
      return NextResponse.json({ error: "title and targetDate are required" }, { status: 400 });
    }

    const created = studyPlansRepo.createAndGenerate({
      title: body.title,
      targetDate: body.targetDate,
      dailyCapacityMinutes: body.dailyCapacityMinutes || 90,
      strategy: body.strategy || "adaptive_spaced",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
