import { db } from "../sqlite";
import { fsrsEngine } from "@/lib/fsrs/fsrs-engine";

export interface MasteryRecordItem {
  id: string;
  userId: string;
  topicId: string;
  topicTitle: string;
  subjectId: string;
  subjectTitle: string;
  subjectColor: string;
  stability: number;
  difficulty: number;
  retrievability: number;
  repetitions: number;
  lapses: number;
  state: string;
  lastReviewAt: string | null;
  nextReviewAt: string;
  calculatedMastery: number;
  decayRisk: "none" | "low" | "moderate" | "critical";
  updatedAt: string;
}

export const masteryRepo = {
  getAll(userId: string = "demo-user-1"): MasteryRecordItem[] {
    const rows = db.prepare(`
      SELECT 
        m.*,
        tp.title as topic_title,
        tp.subject_id,
        s.title as subject_title,
        s.color as subject_color
      FROM mastery_records m
      JOIN topics tp ON tp.id = m.topic_id
      JOIN subjects s ON s.id = tp.subject_id
      WHERE m.user_id = ?
      ORDER BY m.calculated_mastery ASC
    `).all(userId) as any[];

    const now = new Date();

    return rows.map((r) => {
      let elapsedDays = 0;
      if (r.last_review_at) {
        const last = new Date(r.last_review_at);
        elapsedDays = Math.max(0, (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Live calculate retrievability
      const liveR = fsrsEngine.calculateRetrievability(Number(r.stability) || 2.0, elapsedDays);

      return {
        id: r.id,
        userId: r.user_id,
        topicId: r.topic_id,
        topicTitle: r.topic_title,
        subjectId: r.subject_id,
        subjectTitle: r.subject_title,
        subjectColor: r.subject_color || "#3b82f6",
        stability: Number(r.stability) || 1.0,
        difficulty: Number(r.difficulty) || 5.0,
        retrievability: liveR,
        repetitions: Number(r.repetitions) || 0,
        lapses: Number(r.lapses) || 0,
        state: r.state,
        lastReviewAt: r.last_review_at,
        nextReviewAt: r.next_review_at,
        calculatedMastery: Number(r.calculated_mastery) || 0,
        decayRisk: liveR < 0.5 ? "critical" : liveR < 0.7 ? "moderate" : liveR < 0.85 ? "low" : "none",
        updatedAt: r.updated_at,
      };
    });
  },

  getSubjectMasteryOverview(userId: string = "demo-user-1") {
    const records = this.getAll(userId);
    const subjects = db.prepare(`SELECT * FROM subjects WHERE user_id = ?`).all(userId) as any[];

    return subjects.map((sub) => {
      const subRecords = records.filter((r) => r.subjectId === sub.id);
      const avgMastery = subRecords.length > 0
        ? Math.round(subRecords.reduce((acc, r) => acc + r.calculatedMastery, 0) / subRecords.length)
        : 0;
      const atRiskCount = subRecords.filter((r) => r.decayRisk === "critical" || r.decayRisk === "moderate").length;

      return {
        id: sub.id,
        title: sub.title,
        color: sub.color,
        topicsCount: subRecords.length,
        averageMastery: avgMastery,
        atRiskCount,
      };
    });
  },
};
