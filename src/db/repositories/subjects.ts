import { db } from "../sqlite";

export interface SubjectRecord {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  color: string;
  icon: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  semester?: number | null;
  courseType?: string | null;
  sks?: number | null;
  topicsCount?: number;
  completedTopicsCount?: number;
  averageMastery?: number;
}

export const subjectsRepo = {
  getAll(userId: string = "demo-user-1"): SubjectRecord[] {
    const rows = db.prepare(`
      SELECT 
        s.*,
        COUNT(t.id) as topicsCount,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTopicsCount,
        AVG(COALESCE(t.mastery, 0)) as averageMastery
      FROM subjects s
      LEFT JOIN topics t ON t.subject_id = s.id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.semester ASC, s.order_index ASC, s.created_at ASC
    `).all(userId) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description,
      color: r.color,
      icon: r.icon,
      orderIndex: r.order_index,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      semester: r.semester != null ? Number(r.semester) : null,
      courseType: r.course_type ?? null,
      sks: r.sks != null ? Number(r.sks) : null,
      topicsCount: Number(r.topicsCount) || 0,
      completedTopicsCount: Number(r.completedTopicsCount) || 0,
      averageMastery: Math.round(Number(r.averageMastery) || 0),
    }));
  },

  getById(id: string): SubjectRecord | null {
    const r = db.prepare(`
      SELECT 
        s.*,
        COUNT(t.id) as topicsCount,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTopicsCount,
        AVG(COALESCE(t.mastery, 0)) as averageMastery
      FROM subjects s
      LEFT JOIN topics t ON t.subject_id = s.id
      WHERE s.id = ?
      GROUP BY s.id
    `).get(id) as any;

    if (!r) return null;
    return {
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description,
      color: r.color,
      icon: r.icon,
      orderIndex: r.order_index,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      semester: r.semester != null ? Number(r.semester) : null,
      courseType: r.course_type ?? null,
      sks: r.sks != null ? Number(r.sks) : null,
      topicsCount: Number(r.topicsCount) || 0,
      completedTopicsCount: Number(r.completedTopicsCount) || 0,
      averageMastery: Math.round(Number(r.averageMastery) || 0),
    };
  },

  create(data: {
    userId?: string;
    title: string;
    description?: string;
    color?: string;
    icon?: string;
  }): SubjectRecord {
    const id = "sub-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();
    const color = data.color || "#3b82f6";
    const icon = data.icon || "book";
    const description = data.description || "";

    const maxOrder = db.prepare(`SELECT MAX(order_index) as maxOrder FROM subjects WHERE user_id = ?`).get(userId) as any;
    const orderIndex = (maxOrder?.maxOrder || 0) + 1;

    db.prepare(`
      INSERT INTO subjects (id, user_id, title, description, color, icon, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, data.title, description, color, icon, orderIndex, now, now);

    return this.getById(id)!;
  },

  update(
    id: string,
    data: {
      title?: string;
      description?: string;
      color?: string;
      icon?: string;
      orderIndex?: number;
    }
  ): SubjectRecord | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title : existing.title;
    const description = data.description !== undefined ? data.description : existing.description;
    const color = data.color !== undefined ? data.color : existing.color;
    const icon = data.icon !== undefined ? data.icon : existing.icon;
    const orderIndex = data.orderIndex !== undefined ? data.orderIndex : existing.orderIndex;

    db.prepare(`
      UPDATE subjects
      SET title = ?, description = ?, color = ?, icon = ?, order_index = ?, updated_at = ?
      WHERE id = ?
    `).run(title, description, color, icon, orderIndex, now, id);

    return this.getById(id);
  },

  delete(id: string): boolean {
    const res = db.prepare(`DELETE FROM subjects WHERE id = ?`).run(id);
    return res.changes > 0;
  },
};
