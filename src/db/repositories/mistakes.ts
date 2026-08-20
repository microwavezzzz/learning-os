import { db } from "../sqlite";

export interface MistakeRecord {
  id: string;
  userId: string;
  questionId: string;
  prompt: string;
  topicId: string;
  topicTitle?: string;
  subjectTitle?: string;
  subjectColor?: string;
  userAnswer: string;
  correctAnswer: string;
  rootCause: "conceptual_gap" | "recall_lapse" | "execution_slip" | "misread_trick";
  diagnosis: string;
  suggestedRemedy: string;
  repetitionCount: number;
  isResolved: boolean;
  nextReviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export const mistakesRepo = {
  getAll(
    userId: string = "demo-user-1",
    filter?: { topicId?: string; isResolved?: boolean; rootCause?: string }
  ): MistakeRecord[] {
    let query = `
      SELECT 
        m.*,
        q.prompt,
        tp.title as topic_title,
        s.title as subject_title,
        s.color as subject_color
      FROM mistake_logs m
      JOIN questions q ON q.id = m.question_id
      JOIN topics tp ON tp.id = m.topic_id
      LEFT JOIN subjects s ON s.id = tp.subject_id
      WHERE m.user_id = ?
    `;
    const params: any[] = [userId];

    if (filter?.topicId) {
      query += ` AND m.topic_id = ?`;
      params.push(filter.topicId);
    }
    if (filter?.isResolved !== undefined) {
      query += ` AND m.is_resolved = ?`;
      params.push(filter.isResolved ? 1 : 0);
    }
    if (filter?.rootCause) {
      query += ` AND m.root_cause = ?`;
      params.push(filter.rootCause);
    }

    query += ` ORDER BY m.is_resolved ASC, m.created_at DESC`;

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      questionId: r.question_id,
      prompt: r.prompt,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color || "#3b82f6",
      userAnswer: r.user_answer,
      correctAnswer: r.correct_answer,
      rootCause: r.root_cause,
      diagnosis: r.diagnosis,
      suggestedRemedy: r.suggested_remedy,
      repetitionCount: Number(r.repetition_count) || 1,
      isResolved: Boolean(r.is_resolved),
      nextReviewDate: r.next_review_date,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  getStats(userId: string = "demo-user-1") {
    const all = this.getAll(userId);
    const unresolved = all.filter((m) => !m.isResolved);
    const resolved = all.filter((m) => m.isResolved);

    const rootCauseCounts = {
      conceptual_gap: unresolved.filter((m) => m.rootCause === "conceptual_gap").length,
      recall_lapse: unresolved.filter((m) => m.rootCause === "recall_lapse").length,
      execution_slip: unresolved.filter((m) => m.rootCause === "execution_slip").length,
      misread_trick: unresolved.filter((m) => m.rootCause === "misread_trick").length,
    };

    return {
      totalMistakes: all.length,
      unresolvedCount: unresolved.length,
      resolvedCount: resolved.length,
      resolutionRatePercentage: all.length > 0 ? Math.round((resolved.length / all.length) * 100) : 100,
      rootCauseCounts,
    };
  },

  resolve(id: string): boolean {
    const now = new Date().toISOString();
    const res = db.prepare(`
      UPDATE mistake_logs
      SET is_resolved = 1, updated_at = ?
      WHERE id = ?
    `).run(now, id);
    return res.changes > 0;
  },

  unresolve(id: string): boolean {
    const now = new Date().toISOString();
    const res = db.prepare(`
      UPDATE mistake_logs
      SET is_resolved = 0, updated_at = ?
      WHERE id = ?
    `).run(now, id);
    return res.changes > 0;
  },
};
