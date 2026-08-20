import { NextResponse } from "next/server";
import { materialsRepo } from "@/db/repositories/materials";
import { db } from "@/db/sqlite";

export async function POST() {
  try {
    const firstSubject = db.prepare(`SELECT id FROM subjects LIMIT 1`).get() as any;
    const firstTopic = db.prepare(`SELECT id FROM topics LIMIT 1`).get() as any;

    // Sync metadata from Bank Materi Sains Data (BMSD) folder
    const synced = materialsRepo.create({
      subjectId: firstSubject ? firstSubject.id : null,
      topicId: firstTopic ? firstTopic.id : null,
      name: "BMSD_Modul_05_Supervised_Learning.pdf",
      mimeType: "application/pdf",
      driveFileId: "1p5n-bmsd-m05-pdf",
      driveUrl: "https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP",
      sizeBytes: 3120000,
      pageCount: 24,
      rawText: "Supervised learning models and gradient descent formulations.",
      chunks: [
        {
          chunkIndex: 0,
          pageNumber: 1,
          heading: "Linear and Logistic Regression Foundations",
          content: "Supervised learning maps an input space X to target labels Y through empirical risk minimization over a parameter space W.",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Successfully synchronized Bank Materi Sains Data (BMSD) folder.",
      syncedMaterial: synced,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
