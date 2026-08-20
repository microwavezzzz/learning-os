import { NextResponse } from "next/server";
import { masteryRepo } from "@/db/repositories/mastery";

export async function GET() {
  try {
    const records = masteryRepo.getAll("demo-user-1");
    const subjects = masteryRepo.getSubjectMasteryOverview("demo-user-1");
    return NextResponse.json({ records, subjects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
