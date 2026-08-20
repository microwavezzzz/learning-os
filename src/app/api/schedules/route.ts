import { NextResponse } from "next/server";
import { schedulesRepo } from "@/db/repositories/schedules";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const schedules = schedulesRepo.getAll("demo-user-1", date);
    return NextResponse.json(schedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.date || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: "Date, Start Time, and End Time are required" },
        { status: 400 }
      );
    }

    const created = schedulesRepo.create({
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      subjectId: body.subjectId || null,
      topicId: body.topicId || null,
      taskId: body.taskId || null,
      status: body.status || "scheduled",
      notes: body.notes || "",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
