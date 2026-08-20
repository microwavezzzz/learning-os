import { NextResponse } from "next/server";
import { goalsRepo } from "@/db/repositories/goals";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goal = goalsRepo.getById(id);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if toggle milestone action
    if (body.action === "toggleMilestone" && body.milestoneId) {
      const updated = goalsRepo.toggleMilestone(id, body.milestoneId);
      if (!updated) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    const updated = goalsRepo.update(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = goalsRepo.delete(id);
    if (!success) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
