import { NextResponse } from "next/server";
import { materialsRepo } from "@/db/repositories/materials";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = materialsRepo.getById(id);
    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }
    const chunks = materialsRepo.getChunks(id);
    const notes = materialsRepo.getNotes(id);
    return NextResponse.json({ ...material, chunks, notes });
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
    const success = materialsRepo.delete(id);
    if (!success) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
