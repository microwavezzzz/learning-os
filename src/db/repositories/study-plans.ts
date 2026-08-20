import { db } from "../sqlite";
import { adaptiveScheduler, SchedulerTopic, GeneratedScheduleItem } from "@/lib/scheduler/adaptive-scheduler";
import { masteryRepo } from "./mastery";
import { mistakesRepo } from "./mistakes";

export interface StudyPlanRecord {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  dailyCapacityMinutes: number;
  strategy: "adaptive_spaced" | "linear" | "exam_preparation";
  status: "active" | "completed" | "archived";
  subjectIds: string[];
  items?: GeneratedScheduleItem[];
  createdAt: string;
  updatedAt: string;
}

export const studyPlansRepo = {
  getAll(userId: string = "demo-user-1"): StudyPlanRecord[] {
    const rows = db.prepare(`
      SELECT * FROM study_plans
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId) as any[];

    return rows.map((r) => {
      let subjectIds = [];
      try {
        subjectIds = JSON.parse(r.subject_ids || "[]");
      } catch (e) {
        subjectIds = [];
      }
      return {
        id: r.id,
        userId: r.user_id,
        title: r.title,
        targetDate: r.target_date,
        dailyCapacityMinutes: Number(r.daily_capacity_minutes) || 90,
        strategy: r.strategy,
        status: r.status,
        subjectIds,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });
  },

  createAndGenerate(data: {
    userId?: string;
    title: string;
    targetDate: string;
    dailyCapacityMinutes?: number;
    strategy?: "adaptive_spaced" | "linear" | "exam_preparation";
  }): StudyPlanRecord {
    const id = "plan-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();
    const dailyCapacity = data.dailyCapacityMinutes || 90;
    const strategy = data.strategy || "adaptive_spaced";

    // Gather topics with mastery & mistake context
    const topicsRows = db.prepare(`
      SELECT tp.*, s.title as subject_title, s.color as subject_color
      FROM topics tp
      JOIN subjects s ON s.id = tp.subject_id
      WHERE s.user_id = ?
    `).all(userId) as any[];

    const masteryList = masteryRepo.getAll(userId);
    const mistakesList = mistakesRepo.getAll(userId, { isResolved: false });

    const schedulerTopics: SchedulerTopic[] = topicsRows.map((t) => {
      const mst = masteryList.find((m) => m.topicId === t.id);
      const topicMistakes = mistakesList.filter((m) => m.topicId === t.id);

      let prereqs = [];
      try {
        prereqs = JSON.parse(t.prerequisites || "[]");
      } catch (e) {
        prereqs = [];
      }

      return {
        id: t.id,
        title: t.title,
        subjectTitle: t.subject_title,
        subjectColor: t.subject_color || "#3b82f6",
        estimatedMinutes: Number(t.estimated_minutes) || 60,
        mastery: Number(t.mastery) || 0,
        prerequisites: prereqs,
        status: t.status,
        decayRisk: mst ? mst.decayRisk : "none",
        unresolvedMistakesCount: topicMistakes.length,
      };
    });

    const generatedItems = adaptiveScheduler.generatePlan({
      planTitle: data.title,
      targetDate: data.targetDate,
      dailyCapacityMinutes: dailyCapacity,
      strategy,
      topics: schedulerTopics,
    });

    db.prepare(`
      INSERT INTO study_plans (id, user_id, title, target_date, daily_capacity_minutes, strategy, status, subject_ids, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.title,
      data.targetDate,
      dailyCapacity,
      strategy,
      "active",
      JSON.stringify([]),
      now,
      now
    );

    // Persist items
    const insertItem = db.prepare(`
      INSERT INTO study_plan_items (id, plan_id, topic_id, scheduled_date, duration_minutes, item_type, status, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    generatedItems.forEach((item, idx) => {
      insertItem.run(
        item.id,
        id,
        item.topicId,
        item.date,
        item.durationMinutes,
        item.type,
        "pending",
        idx,
        now,
        now
      );
    });

    return {
      id,
      userId,
      title: data.title,
      targetDate: data.targetDate,
      dailyCapacityMinutes: dailyCapacity,
      strategy,
      status: "active",
      subjectIds: [],
      items: generatedItems,
      createdAt: now,
      updatedAt: now,
    };
  },
};
