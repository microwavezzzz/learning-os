import { NextResponse } from "next/server";
import { subjectsRepo } from "@/db/repositories/subjects";

export async function GET() {
  try {
    const subjects = subjectsRepo.getAll();
    return NextResponse.json(subjects);
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

    const created = subjectsRepo.create({
      title: body.title.trim(),
      description: body.description,
      color: body.color,
      icon: body.icon,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
