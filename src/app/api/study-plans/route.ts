import { NextResponse } from "next/server";
import { studyPlansRepo } from "@/db/repositories/study-plans";

export async function GET() {
  try {
    const plans = studyPlansRepo.getAll("demo-user-1");
    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
