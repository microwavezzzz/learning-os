import { NextResponse } from "next/server";
import { dashboardRepo } from "@/db/repositories/dashboard";

export async function GET() {
  try {
    const data = dashboardRepo.getDashboardData("demo-user-1");
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
