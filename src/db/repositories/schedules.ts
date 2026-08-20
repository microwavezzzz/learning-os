import { db } from "../sqlite";

export interface ScheduleRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  subjectId: string | null;
  subjectTitle?: string;
  subjectColor?: string;
  topicId: string | null;
  topicTitle?: string;
  taskId: string | null;
  taskTitle?: string;
  status: "scheduled" | "in_progress" | "completed" | "skipped";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const schedulesRepo = {
  getAll(userId: string = "demo-user-1", date?: string): ScheduleRecord[] {
    let query = `
      SELECT 
        sc.*,
        s.title as subject_title,
        s.color as subject_color,
        tp.title as topic_title,
        tk.title as task_title
      FROM schedules sc
      LEFT JOIN subjects s ON s.id = sc.subject_id
      LEFT JOIN topics tp ON tp.id = sc.topic_id
      LEFT JOIN tasks tk ON tk.id = sc.task_id
      WHERE sc.user_id = ?
    `;
    const params: any[] = [userId];

    if (date) {
      query += ` AND sc.date = ?`;
      params.push(date);
    }

    query += ` ORDER BY sc.date ASC, sc.start_time ASC`;

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      taskId: r.task_id,
      taskTitle: r.task_title,
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  getById(id: string): ScheduleRecord | null {
    const r = db.prepare(`
      SELECT 
        sc.*,
        s.title as subject_title,
        s.color as subject_color,
        tp.title as topic_title,
        tk.title as task_title
      FROM schedules sc
      LEFT JOIN subjects s ON s.id = sc.subject_id
      LEFT JOIN topics tp ON tp.id = sc.topic_id
      LEFT JOIN tasks tk ON tk.id = sc.task_id
      WHERE sc.id = ?
    `).get(id) as any;

    if (!r) return null;

    return {
      id: r.id,
      userId: r.user_id,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      taskId: r.task_id,
      taskTitle: r.task_title,
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  create(data: {
    userId?: string;
    date: string;
    startTime: string;
    endTime: string;
    subjectId?: string | null;
    topicId?: string | null;
    taskId?: string | null;
    status?: "scheduled" | "in_progress" | "completed" | "skipped";
    notes?: string;
  }): ScheduleRecord {
    const id = "sched-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();
    const subjectId = data.subjectId || null;
    const topicId = data.topicId || null;
    const taskId = data.taskId || null;
    const status = data.status || "scheduled";
    const notes = data.notes || "";

    db.prepare(`
      INSERT INTO schedules (
        id, user_id, date, start_time, end_time, subject_id, topic_id,
        task_id, status, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.date,
      data.startTime,
      data.endTime,
      subjectId,
      topicId,
      taskId,
      status,
      notes,
      now,
      now
    );

    return this.getById(id)!;
  },

  update(
    id: string,
    data: {
      date?: string;
      startTime?: string;
      endTime?: string;
      subjectId?: string | null;
      topicId?: string | null;
      taskId?: string | null;
      status?: "scheduled" | "in_progress" | "completed" | "skipped";
      notes?: string;
    }
  ): ScheduleRecord | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const date = data.date !== undefined ? data.date : existing.date;
    const startTime = data.startTime !== undefined ? data.startTime : existing.startTime;
    const endTime = data.endTime !== undefined ? data.endTime : existing.endTime;
    const subjectId = data.subjectId !== undefined ? data.subjectId : existing.subjectId;
    const topicId = data.topicId !== undefined ? data.topicId : existing.topicId;
    const taskId = data.taskId !== undefined ? data.taskId : existing.taskId;
    const status = data.status !== undefined ? data.status : existing.status;
    const notes = data.notes !== undefined ? data.notes : existing.notes;

    db.prepare(`
      UPDATE schedules
      SET date = ?, start_time = ?, end_time = ?, subject_id = ?, topic_id = ?,
          task_id = ?, status = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(
      date,
      startTime,
      endTime,
      subjectId,
      topicId,
      taskId,
      status,
      notes,
      now,
      id
    );

    return this.getById(id);
  },

  delete(id: string): boolean {
    const res = db.prepare(`DELETE FROM schedules WHERE id = ?`).run(id);
    return res.changes > 0;
  },
};
