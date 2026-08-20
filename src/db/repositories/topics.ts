import { db } from "../sqlite";

export interface RelatedMaterial {
  title: string;
  url?: string;
  type: string;
}

export interface TopicRecord {
  id: string;
  subjectId: string;
  subjectTitle?: string;
  subjectColor?: string;
  parentId: string | null;
  parentTitle?: string;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "completed" | "needs_review";
  difficulty: "beginner" | "intermediate" | "advanced";
  mastery: number; // 0 to 100
  prerequisites: string[]; // array of topic IDs
  prerequisiteTopics?: { id: string; title: string; status: string }[];
  relatedMaterials: RelatedMaterial[];
  subtopics?: TopicRecord[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export const topicsRepo = {
  getAll(userId: string = "demo-user-1", subjectId?: string): TopicRecord[] {
    let query = `
      SELECT 
        t.*,
        s.title as subject_title,
        s.color as subject_color,
        p.title as parent_title
      FROM topics t
      JOIN subjects s ON s.id = t.subject_id
      LEFT JOIN topics p ON p.id = t.parent_id
      WHERE s.user_id = ?
    `;
    const params: any[] = [userId];

    if (subjectId) {
      query += ` AND t.subject_id = ?`;
      params.push(subjectId);
    }

    query += ` ORDER BY t.order_index ASC, t.created_at ASC`;

    const rows = db.prepare(query).all(...params) as any[];

    // Fetch all topics map for prerequisite resolution
    const allTopicsMap = new Map<string, { id: string; title: string; status: string }>();
    rows.forEach((r) => {
      allTopicsMap.set(r.id, { id: r.id, title: r.title, status: r.status });
    });

    const parsed: TopicRecord[] = rows.map((r) => {
      let prerequisites: string[] = [];
      try {
        prerequisites = JSON.parse(r.prerequisites || "[]");
      } catch (e) {
        prerequisites = [];
      }

      let relatedMaterials: RelatedMaterial[] = [];
      try {
        relatedMaterials = JSON.parse(r.related_materials || "[]");
      } catch (e) {
        relatedMaterials = [];
      }

      const prerequisiteTopics = prerequisites
        .map((pId) => allTopicsMap.get(pId))
        .filter(Boolean) as { id: string; title: string; status: string }[];

      return {
        id: r.id,
        subjectId: r.subject_id,
        subjectTitle: r.subject_title,
        subjectColor: r.subject_color,
        parentId: r.parent_id,
        parentTitle: r.parent_title,
        title: r.title,
        description: r.description,
        status: r.status,
        difficulty: r.difficulty,
        mastery: Number(r.mastery) || 0,
        prerequisites,
        prerequisiteTopics,
        relatedMaterials,
        orderIndex: r.order_index,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    return parsed;
  },

  getById(id: string): TopicRecord | null {
    const r = db.prepare(`
      SELECT 
        t.*,
        s.title as subject_title,
        s.color as subject_color,
        p.title as parent_title
      FROM topics t
      JOIN subjects s ON s.id = t.subject_id
      LEFT JOIN topics p ON p.id = t.parent_id
      WHERE t.id = ?
    `).get(id) as any;

    if (!r) return null;

    let prerequisites: string[] = [];
    try {
      prerequisites = JSON.parse(r.prerequisites || "[]");
    } catch (e) {
      prerequisites = [];
    }

    let relatedMaterials: RelatedMaterial[] = [];
    try {
      relatedMaterials = JSON.parse(r.related_materials || "[]");
    } catch (e) {
      relatedMaterials = [];
    }

    // Resolve prerequisite topics
    const prerequisiteTopics: { id: string; title: string; status: string }[] = [];
    if (prerequisites.length > 0) {
      const placeholders = prerequisites.map(() => "?").join(",");
      const prereqRows = db.prepare(`
        SELECT id, title, status FROM topics WHERE id IN (${placeholders})
      `).all(...prerequisites) as any[];
      prerequisiteTopics.push(...prereqRows);
    }

    return {
      id: r.id,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color,
      parentId: r.parent_id,
      parentTitle: r.parent_title,
      title: r.title,
      description: r.description,
      status: r.status,
      difficulty: r.difficulty,
      mastery: Number(r.mastery) || 0,
      prerequisites,
      prerequisiteTopics,
      relatedMaterials,
      orderIndex: r.order_index,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  create(data: {
    subjectId: string;
    parentId?: string | null;
    title: string;
    description?: string;
    status?: "not_started" | "in_progress" | "completed" | "needs_review";
    difficulty?: "beginner" | "intermediate" | "advanced";
    mastery?: number;
    prerequisites?: string[];
    relatedMaterials?: RelatedMaterial[];
  }): TopicRecord {
    const id = "top-" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const parentId = data.parentId || null;
    const description = data.description || "";
    const status = data.status || "not_started";
    const difficulty = data.difficulty || "intermediate";
    const mastery = data.mastery !== undefined ? Number(data.mastery) : 0;
    const prerequisites = JSON.stringify(data.prerequisites || []);
    const relatedMaterials = JSON.stringify(data.relatedMaterials || []);

    const maxOrder = db.prepare(`
      SELECT MAX(order_index) as maxOrder FROM topics WHERE subject_id = ?
    `).get(data.subjectId) as any;
    const orderIndex = (maxOrder?.maxOrder || 0) + 1;

    db.prepare(`
      INSERT INTO topics (
        id, subject_id, parent_id, title, description, status, difficulty, mastery,
        prerequisites, related_materials, order_index, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.subjectId,
      parentId,
      data.title,
      description,
      status,
      difficulty,
      mastery,
      prerequisites,
      relatedMaterials,
      orderIndex,
      now,
      now
    );

    return this.getById(id)!;
  },

  update(
    id: string,
    data: {
      subjectId?: string;
      parentId?: string | null;
      title?: string;
      description?: string;
      status?: "not_started" | "in_progress" | "completed" | "needs_review";
      difficulty?: "beginner" | "intermediate" | "advanced";
      mastery?: number;
      prerequisites?: string[];
      relatedMaterials?: RelatedMaterial[];
      orderIndex?: number;
    }
  ): TopicRecord | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const subjectId = data.subjectId !== undefined ? data.subjectId : existing.subjectId;
    const parentId = data.parentId !== undefined ? data.parentId : existing.parentId;
    const title = data.title !== undefined ? data.title : existing.title;
    const description = data.description !== undefined ? data.description : existing.description;
    const status = data.status !== undefined ? data.status : existing.status;
    const difficulty = data.difficulty !== undefined ? data.difficulty : existing.difficulty;
    const mastery = data.mastery !== undefined ? Number(data.mastery) : existing.mastery;
    const prerequisites = data.prerequisites !== undefined ? JSON.stringify(data.prerequisites) : JSON.stringify(existing.prerequisites);
    const relatedMaterials = data.relatedMaterials !== undefined ? JSON.stringify(data.relatedMaterials) : JSON.stringify(existing.relatedMaterials);
    const orderIndex = data.orderIndex !== undefined ? data.orderIndex : existing.orderIndex;

    db.prepare(`
      UPDATE topics
      SET subject_id = ?, parent_id = ?, title = ?, description = ?, status = ?, difficulty = ?,
          mastery = ?, prerequisites = ?, related_materials = ?, order_index = ?, updated_at = ?
      WHERE id = ?
    `).run(
      subjectId,
      parentId,
      title,
      description,
      status,
      difficulty,
      mastery,
      prerequisites,
      relatedMaterials,
      orderIndex,
      now,
      id
    );

    return this.getById(id);
  },

  delete(id: string): boolean {
    const res = db.prepare(`DELETE FROM topics WHERE id = ?`).run(id);
    return res.changes > 0;
  },
};
