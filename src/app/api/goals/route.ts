import { NextResponse } from "next/server";
import { goalsRepo } from "@/db/repositories/goals";

export async function GET() {
  try {
    const goals = goalsRepo.getAll();
    return NextResponse.json(goals);
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
    if (!body.deadline) {
      return NextResponse.json({ error: "Deadline is required" }, { status: 400 });
    }

    const created = goalsRepo.create({
      title: body.title.trim(),
      target: body.target || "",
      deadline: body.deadline,
      milestones: body.milestones || [],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
