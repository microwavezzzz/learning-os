import { NextResponse } from "next/server";
import { aiGateway } from "@/lib/ai/ai-gateway";
import { materialsRepo } from "@/db/repositories/materials";
import { db } from "@/db/sqlite";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    const topic = db.prepare(`SELECT * FROM topics WHERE id = ?`).get(body.topicId) as any;
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Find linked materials & chunks
    const materials = materialsRepo.getAll("demo-user-1").filter((m) => m.topicId === body.topicId);
    let chunks: any[] = [];
    if (materials.length > 0) {
      chunks = materialsRepo.getChunks(materials[0].id);
    }

    const generated = await aiGateway.generateQuiz(
      topic.title,
      chunks.length > 0 ? chunks : [{ content: topic.description || topic.title, chunkIndex: 0, heading: topic.title }],
      body.count || 3
    );

    // Save newly generated questions to database
    const insertQ = db.prepare(`
      INSERT INTO questions (id, topic_id, type, difficulty, prompt, options_json, correct_answer, explanation, source_reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();

    generated.forEach((q) => {
      insertQ.run(
        "q-" + Math.random().toString(36).substring(2, 9),
        topic.id,
        q.type,
        q.difficulty,
        q.prompt,
        JSON.stringify(q.options),
        q.correctAnswer,
        q.explanation,
        q.sourceReference || "",
        now
      );
    });

    return NextResponse.json({ success: true, count: generated.length, questions: generated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
