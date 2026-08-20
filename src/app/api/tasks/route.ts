import { NextResponse } from "next/server";
import { tasksRepo } from "@/db/repositories/tasks";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;
    const tasks = tasksRepo.getAll("demo-user-1", { status, subjectId });
    return NextResponse.json(tasks);
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

    const created = tasksRepo.create({
      title: body.title.trim(),
      description: body.description,
      subjectId: body.subjectId || null,
      topicId: body.topicId || null,
      priority: body.priority || "medium",
      deadline: body.deadline || null,
      estimatedDuration: body.estimatedDuration ? Number(body.estimatedDuration) : 30,
      status: body.status || "todo",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
