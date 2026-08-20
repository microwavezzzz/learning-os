import { db } from "../sqlite";

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  targetDate?: string;
}

export interface GoalRecord {
  id: string;
  userId: string;
  title: string;
  target: string;
  deadline: string;
  progress: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export const goalsRepo = {
  getAll(userId: string = "demo-user-1"): GoalRecord[] {
    const rows = db.prepare(`
      SELECT * FROM goals
      WHERE user_id = ?
      ORDER BY deadline ASC, created_at DESC
    `).all(userId) as any[];

    return rows.map((r) => {
      let milestones: Milestone[] = [];
      try {
        milestones = JSON.parse(r.milestones || "[]");
      } catch (e) {
        milestones = [];
      }

      return {
        id: r.id,
        userId: r.user_id,
        title: r.title,
        target: r.target,
        deadline: r.deadline,
        progress: Number(r.progress) || 0,
        milestones,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });
  },

  getById(id: string): GoalRecord | null {
    const r = db.prepare(`SELECT * FROM goals WHERE id = ?`).get(id) as any;
    if (!r) return null;

    let milestones: Milestone[] = [];
    try {
      milestones = JSON.parse(r.milestones || "[]");
    } catch (e) {
      milestones = [];
    }

    return {
      id: r.id,
      userId: r.user_id,
      title: r.title,
      target: r.target,
      deadline: r.deadline,
      progress: Number(r.progress) || 0,
      milestones,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  create(data: {
    userId?: string;
    title: string;
    target: string;
    deadline: string;
    progress?: number;
    milestones?: Milestone[];
  }): GoalRecord {
    const id = "goal-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();
    const milestones = data.milestones || [];
    
    // Compute progress from milestones if provided
    let progress = data.progress !== undefined ? Number(data.progress) : 0;
    if (milestones.length > 0) {
      const completed = milestones.filter((m) => m.isCompleted).length;
      progress = Math.round((completed / milestones.length) * 100);
    }

    db.prepare(`
      INSERT INTO goals (id, user_id, title, target, deadline, progress, milestones, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.title,
      data.target,
      data.deadline,
      progress,
      JSON.stringify(milestones),
      now,
      now
    );

    return this.getById(id)!;
  },

  update(
    id: string,
    data: {
      title?: string;
      target?: string;
      deadline?: string;
      progress?: number;
      milestones?: Milestone[];
    }
  ): GoalRecord | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title : existing.title;
    const target = data.target !== undefined ? data.target : existing.target;
    const deadline = data.deadline !== undefined ? data.deadline : existing.deadline;
    const milestones = data.milestones !== undefined ? data.milestones : existing.milestones;

    let progress = data.progress !== undefined ? Number(data.progress) : existing.progress;
    if (data.milestones !== undefined && milestones.length > 0) {
      const completed = milestones.filter((m) => m.isCompleted).length;
      progress = Math.round((completed / milestones.length) * 100);
    }

    db.prepare(`
      UPDATE goals
      SET title = ?, target = ?, deadline = ?, progress = ?, milestones = ?, updated_at = ?
      WHERE id = ?
    `).run(
      title,
      target,
      deadline,
      progress,
      JSON.stringify(milestones),
      now,
      id
    );

    return this.getById(id);
  },

  toggleMilestone(goalId: string, milestoneId: string): GoalRecord | null {
    const goal = this.getById(goalId);
    if (!goal) return null;

    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );

    const completed = updatedMilestones.filter((m) => m.isCompleted).length;
    const newProgress = Math.round((completed / updatedMilestones.length) * 100);

    return this.update(goalId, {
      milestones: updatedMilestones,
      progress: newProgress,
    });
  },

  delete(id: string): boolean {
    const res = db.prepare(`DELETE FROM goals WHERE id = ?`).run(id);
    return res.changes > 0;
  },
};
