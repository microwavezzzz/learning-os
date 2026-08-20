import { db } from "../sqlite";

export interface TaskRecord {
  id: string;
  userId: string;
  subjectId: string | null;
  subjectTitle?: string;
  subjectColor?: string;
  topicId: string | null;
  topicTitle?: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  deadline: string | null;
  estimatedDuration: number; // in minutes
  status: "todo" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export const tasksRepo = {
  getAll(userId: string = "demo-user-1", filter?: { status?: string; subjectId?: string }): TaskRecord[] {
    let query = `
      SELECT 
        t.*,
        s.title as subject_title,
        s.color as subject_color,
        tp.title as topic_title
      FROM tasks t
      LEFT JOIN subjects s ON s.id = t.subject_id
      LEFT JOIN topics tp ON tp.id = t.topic_id
      WHERE t.user_id = ?
    `;
    const params: any[] = [userId];

    if (filter?.status) {
      query += ` AND t.status = ?`;
      params.push(filter.status);
    }
    if (filter?.subjectId) {
      query += ` AND t.subject_id = ?`;
      params.push(filter.subjectId);
    }

    query += ` ORDER BY 
      CASE t.status WHEN 'todo' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'completed' THEN 3 ELSE 4 END ASC,
      CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END ASC,
      t.deadline ASC,
      t.created_at DESC
    `;

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      title: r.title,
      description: r.description,
      priority: r.priority,
      deadline: r.deadline,
      estimatedDuration: Number(r.estimated_duration) || 30,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  getById(id: string): TaskRecord | null {
    const r = db.prepare(`
      SELECT 
        t.*,
        s.title as subject_title,
        s.color as subject_color,
        tp.title as topic_title
      FROM tasks t
      LEFT JOIN subjects s ON s.id = t.subject_id
      LEFT JOIN topics tp ON tp.id = t.topic_id
      WHERE t.id = ?
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
      title: r.title,
      description: r.description,
      priority: r.priority,
      deadline: r.deadline,
      estimatedDuration: Number(r.estimated_duration) || 30,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  create(data: {
    userId?: string;
    subjectId?: string | null;
    topicId?: string | null;
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    deadline?: string | null;
    estimatedDuration?: number;
    status?: "todo" | "in_progress" | "completed" | "cancelled";
  }): TaskRecord {
    const id = "task-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();
    const subjectId = data.subjectId || null;
    const topicId = data.topicId || null;
    const description = data.description || "";
    const priority = data.priority || "medium";
    const deadline = data.deadline || null;
    const estimatedDuration = data.estimatedDuration !== undefined ? Number(data.estimatedDuration) : 30;
    const status = data.status || "todo";

    db.prepare(`
      INSERT INTO tasks (
        id, user_id, subject_id, topic_id, title, description, priority,
        deadline, estimated_duration, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      subjectId,
      topicId,
      data.title,
      description,
      priority,
      deadline,
      estimatedDuration,
      status,
      now,
      now
    );

    return this.getById(id)!;
  },

  update(
    id: string,
    data: {
      subjectId?: string | null;
      topicId?: string | null;
      title?: string;
      description?: string;
      priority?: "low" | "medium" | "high" | "urgent";
      deadline?: string | null;
      estimatedDuration?: number;
      status?: "todo" | "in_progress" | "completed" | "cancelled";
    }
  ): TaskRecord | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const subjectId = data.subjectId !== undefined ? data.subjectId : existing.subjectId;
    const topicId = data.topicId !== undefined ? data.topicId : existing.topicId;
    const title = data.title !== undefined ? data.title : existing.title;
    const description = data.description !== undefined ? data.description : existing.description;
    const priority = data.priority !== undefined ? data.priority : existing.priority;
    const deadline = data.deadline !== undefined ? data.deadline : existing.deadline;
    const estimatedDuration = data.estimatedDuration !== undefined ? Number(data.estimatedDuration) : existing.estimatedDuration;
    const status = data.status !== undefined ? data.status : existing.status;

    db.prepare(`
      UPDATE tasks
      SET subject_id = ?, topic_id = ?, title = ?, description = ?, priority = ?,
          deadline = ?, estimated_duration = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(
      subjectId,
      topicId,
      title,
      description,
      priority,
      deadline,
      estimatedDuration,
      status,
      now,
      id
    );

    return this.getById(id);
  },

  delete(id: string): boolean {
    const res = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
    return res.changes > 0;
  },
};
