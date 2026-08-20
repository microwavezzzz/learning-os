import { db } from "../sqlite";

// Ensure study_sessions table exists with all required columns
db.exec(`
  CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subject_id TEXT,
    topic_id TEXT,
    planned_duration INTEGER NOT NULL DEFAULT 25,
    actual_duration INTEGER NOT NULL DEFAULT 0,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    completion_status TEXT NOT NULL DEFAULT 'completed',
    technique TEXT NOT NULL DEFAULT 'pomodoro',
    focus_rating INTEGER NOT NULL DEFAULT 4,
    confidence INTEGER NOT NULL DEFAULT 4,
    difficulty INTEGER NOT NULL DEFAULT 3,
    learning_outcome TEXT,
    difficult_aspects TEXT,
    review_items TEXT,
    notes_markdown TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
    FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions (user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_topic ON study_sessions (topic_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_created ON study_sessions (created_at);
`);

export interface StudySessionRecord {
  id: string;
  userId: string;
  subjectId: string | null;
  subjectTitle?: string;
  subjectColor?: string;
  topicId: string | null;
  topicTitle?: string;
  plannedDuration: number; // in minutes
  actualDuration: number; // in seconds
  actualDurationMinutes: number;
  startTime: string; // ISO
  endTime: string; // ISO
  completionStatus: "completed" | "interrupted" | "in_progress";
  technique: "pomodoro" | "deep_work" | "stopwatch";
  focusRating: number; // 1-5
  confidence: number; // 1-5
  difficulty: number; // 1-5
  learningOutcome: string;
  difficultAspects: string;
  reviewItems: string;
  notesMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export const studySessionsRepo = {
  getAll(
    userId: string = "demo-user-1",
    filter?: { subjectId?: string; topicId?: string; limit?: number }
  ): StudySessionRecord[] {
    let query = `
      SELECT 
        ss.*,
        s.title as subject_title,
        s.color as subject_color,
        tp.title as topic_title
      FROM study_sessions ss
      LEFT JOIN subjects s ON s.id = ss.subject_id
      LEFT JOIN topics tp ON tp.id = ss.topic_id
      WHERE ss.user_id = ?
    `;
    const params: any[] = [userId];

    if (filter?.subjectId) {
      query += ` AND ss.subject_id = ?`;
      params.push(filter.subjectId);
    }
    if (filter?.topicId) {
      query += ` AND ss.topic_id = ?`;
      params.push(filter.topicId);
    }

    query += ` ORDER BY ss.created_at DESC`;

    if (filter?.limit) {
      query += ` LIMIT ?`;
      params.push(filter.limit);
    }

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      plannedDuration: Number(r.planned_duration) || 25,
      actualDuration: Number(r.actual_duration) || 0,
      actualDurationMinutes: Math.max(1, Math.round((Number(r.actual_duration) || 0) / 60)),
      startTime: r.start_time,
      endTime: r.end_time,
      completionStatus: r.completion_status,
      technique: r.technique,
      focusRating: Number(r.focus_rating) || 4,
      confidence: Number(r.confidence) || 4,
      difficulty: Number(r.difficulty) || 3,
      learningOutcome: r.learning_outcome || "",
      difficultAspects: r.difficult_aspects || "",
      reviewItems: r.review_items || "",
      notesMarkdown: r.notes_markdown || "",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  getById(id: string): StudySessionRecord | null {
    const r = db.prepare(`
      SELECT 
        ss.*,
        s.title as subject_title,
        s.color as subject_color,
        tp.title as topic_title
      FROM study_sessions ss
      LEFT JOIN subjects s ON s.id = ss.subject_id
      LEFT JOIN topics tp ON tp.id = ss.topic_id
      WHERE ss.id = ?
    `).get(id) as any;

    if (!r) return null;

    return {
      id: r.id,
      userId: r.user_id,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      plannedDuration: Number(r.planned_duration) || 25,
      actualDuration: Number(r.actual_duration) || 0,
      actualDurationMinutes: Math.max(1, Math.round((Number(r.actual_duration) || 0) / 60)),
      startTime: r.start_time,
      endTime: r.end_time,
      completionStatus: r.completion_status,
      technique: r.technique,
      focusRating: Number(r.focus_rating) || 4,
      confidence: Number(r.confidence) || 4,
      difficulty: Number(r.difficulty) || 3,
      learningOutcome: r.learning_outcome || "",
      difficultAspects: r.difficult_aspects || "",
      reviewItems: r.review_items || "",
      notesMarkdown: r.notes_markdown || "",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  create(data: {
    userId?: string;
    subjectId?: string | null;
    topicId?: string | null;
    plannedDuration?: number;
    actualDuration: number; // in seconds
    startTime: string; // ISO string
    endTime: string; // ISO string
    completionStatus?: "completed" | "interrupted" | "in_progress";
    technique?: "pomodoro" | "deep_work" | "stopwatch";
    focusRating?: number; // 1-5
    confidence?: number; // 1-5
    difficulty?: number; // 1-5
    learningOutcome?: string;
    difficultAspects?: string;
    reviewItems?: string;
    notesMarkdown?: string;
  }): StudySessionRecord {
    const id = "sess-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();
    const plannedDuration = data.plannedDuration !== undefined ? Number(data.plannedDuration) : 25;
    const actualDuration = Number(data.actualDuration) || 0;
    const completionStatus = data.completionStatus || "completed";
    const technique = data.technique || "pomodoro";
    const focusRating = data.focusRating !== undefined ? Number(data.focusRating) : 4;
    const confidence = data.confidence !== undefined ? Number(data.confidence) : 4;
    const difficulty = data.difficulty !== undefined ? Number(data.difficulty) : 3;
    const learningOutcome = data.learningOutcome || "";
    const difficultAspects = data.difficultAspects || "";
    const reviewItems = data.reviewItems || "";
    const notesMarkdown = data.notesMarkdown || "";

    db.prepare(`
      INSERT INTO study_sessions (
        id, user_id, subject_id, topic_id, planned_duration, actual_duration,
        start_time, end_time, completion_status, technique, focus_rating,
        confidence, difficulty, learning_outcome, difficult_aspects, review_items,
        notes_markdown, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.subjectId || null,
      data.topicId || null,
      plannedDuration,
      actualDuration,
      data.startTime,
      data.endTime,
      completionStatus,
      technique,
      focusRating,
      confidence,
      difficulty,
      learningOutcome,
      difficultAspects,
      reviewItems,
      notesMarkdown,
      now,
      now
    );

    // If a topic is linked, update its last_studied_at and adjust mastery score based on confidence
    if (data.topicId) {
      const topic = db.prepare(`SELECT * FROM topics WHERE id = ?`).get(data.topicId) as any;
      if (topic) {
        let currentMastery = Number(topic.mastery) || 0;
        // Confidence bonus: 5 stars = +6%, 4 stars = +4%, 3 stars = +2%, 2 stars = +0%, 1 star = -2%
        const bonus = (confidence - 3) * 2 + 2;
        const newMastery = Math.min(100, Math.max(0, currentMastery + bonus));
        const newStatus = topic.status === "not_started" ? "in_progress" : topic.status;

        db.prepare(`
          UPDATE topics
          SET last_studied_at = ?, mastery = ?, status = ?, updated_at = ?
          WHERE id = ?
        `).run(now, newMastery, newStatus, now, data.topicId);
      }
    }

    return this.getById(id)!;
  },

  delete(id: string): boolean {
    const res = db.prepare(`DELETE FROM study_sessions WHERE id = ?`).run(id);
    return res.changes > 0;
  },
};
