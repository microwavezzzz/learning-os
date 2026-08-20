import { db } from "../sqlite";
import { SubjectRecord } from "./subjects";
import { TopicRecord } from "./topics";
import { TaskRecord } from "./tasks";
import { GoalRecord } from "./goals";
import { ScheduleRecord } from "./schedules";

export interface StudyRecommendation {
  topicId: string;
  topicTitle: string;
  subjectTitle: string;
  subjectColor: string;
  recommendedDuration: number;
  reason: string;
  priority: "high" | "medium" | "low";
  suggestedAction: string;
}

export interface ActivityItem {
  id: string;
  type: "task_completed" | "topic_studied" | "schedule_completed" | "goal_milestone";
  title: string;
  subjectTitle?: string;
  timestamp: string;
}

export interface DashboardData {
  todayStr: string;
  stats: {
    streakDays: number;
    todayStudyMinutes: number;
    weeklyStudyMinutes: number;
    pendingTasksCount: number;
    overdueTasksCount: number;
    activeGoalsAverageProgress: number;
    overallCurriculumMastery: number;
  };
  recommendation: StudyRecommendation | null;
  todaySchedules: ScheduleRecord[];
  todayTasks: TaskRecord[];
  overdueTasks: TaskRecord[];
  upcomingDeadlines: {
    id: string;
    type: "task" | "goal_milestone" | "goal_target";
    title: string;
    deadline: string;
    subjectTitle?: string;
    isExamOrMilestone: boolean;
  }[];
  upcomingExams: {
    id: string;
    title: string;
    subjectTitle?: string;
    target: string;
    deadline: string;
    daysRemaining: number;
  }[];
  subjectProgress: {
    id: string;
    title: string;
    color: string;
    topicsCount: number;
    completedTopicsCount: number;
    averageMastery: number;
    completionPercentage: number;
    semester?: number;
    courseType?: string;
    sks?: number;
  }[];
  recentActivity: ActivityItem[];
}

export const dashboardRepo = {
  getDashboardData(userId: string = "demo-user-1"): DashboardData {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // 1. Today's Schedules
    const scheduleRows = db.prepare(`
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
      WHERE sc.user_id = ? AND sc.date = ?
      ORDER BY sc.start_time ASC
    `).all(userId, todayStr) as any[];

    const todaySchedules: ScheduleRecord[] = scheduleRows.map((r) => ({
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

    // Calculate Today's Study Time from completed schedules (minutes)
    const todayStudyMinutes = todaySchedules
      .filter((s) => s.status === "completed")
      .reduce((acc, s) => {
        const [sh, sm] = s.startTime.split(":").map(Number);
        const [eh, em] = s.endTime.split(":").map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);
        return acc + (duration > 0 ? duration : 30);
      }, 0);

    // 2. Tasks: Today's tasks, Overdue tasks, and Upcoming Deadlines
    const taskRows = db.prepare(`
      SELECT 
        t.*,
        s.title as subject_title,
        s.color as subject_color,
        tp.title as topic_title
      FROM tasks t
      LEFT JOIN subjects s ON s.id = t.subject_id
      LEFT JOIN topics tp ON tp.id = t.topic_id
      WHERE t.user_id = ?
      ORDER BY t.deadline ASC, t.priority DESC
    `).all(userId) as any[];

    const allTasks: TaskRecord[] = taskRows.map((r) => ({
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

    const todayTasks = allTasks.filter((t) => t.deadline === todayStr && t.status !== "completed");
    const overdueTasks = allTasks.filter((t) => t.deadline && t.deadline < todayStr && t.status !== "completed");

    // 3. Subject Progress & Mastery
    const subjectRows = db.prepare(`
      SELECT 
        s.id,
        s.title,
        s.color,
        s.semester,
        s.course_type,
        s.sks,
        COUNT(t.id) as topicsCount,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTopicsCount,
        AVG(COALESCE(t.mastery, 0)) as averageMastery
      FROM subjects s
      LEFT JOIN topics t ON t.subject_id = s.id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.order_index ASC
    `).all(userId) as any[];

    const subjectProgress = subjectRows.map((s) => {
      const topicsCount = Number(s.topicsCount) || 0;
      const completedTopicsCount = Number(s.completedTopicsCount) || 0;
      const averageMastery = Math.round(Number(s.averageMastery) || 0);
      const completionPercentage = topicsCount > 0 ? Math.round((completedTopicsCount / topicsCount) * 100) : 0;
      return {
        id: s.id,
        title: s.title,
        color: s.color,
        semester: s.semester ? Number(s.semester) : 1,
        courseType: s.course_type || "Wajib",
        sks: s.sks ? Number(s.sks) : 3,
        topicsCount,
        completedTopicsCount,
        averageMastery,
        completionPercentage,
      };
    });

    const overallCurriculumMastery = subjectProgress.length > 0
      ? Math.round(subjectProgress.reduce((acc, s) => acc + s.averageMastery, 0) / subjectProgress.length)
      : 0;

    // 4. Goals & Milestones
    const goalRows = db.prepare(`
      SELECT * FROM goals
      WHERE user_id = ?
      ORDER BY deadline ASC
    `).all(userId) as any[];

    const allGoals: GoalRecord[] = goalRows.map((r) => {
      let milestones = [];
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

    const activeGoalsAverageProgress = allGoals.length > 0
      ? Math.round(allGoals.reduce((acc, g) => acc + g.progress, 0) / allGoals.length)
      : 0;

    // Upcoming Exams & Major Milestones
    const upcomingExams = allGoals.map((g) => {
      const deadlineDate = new Date(g.deadline);
      const diffTime = deadlineDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return {
        id: g.id,
        title: g.title,
        target: g.target,
        deadline: g.deadline,
        daysRemaining,
      };
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);

    // 5. Upcoming Deadlines (combined tasks and goal milestones in next 14 days)
    const upcomingDeadlines: DashboardData["upcomingDeadlines"] = [];

    allTasks
      .filter((t) => t.deadline && t.deadline >= todayStr && t.status !== "completed")
      .slice(0, 5)
      .forEach((t) => {
        upcomingDeadlines.push({
          id: t.id,
          type: "task",
          title: t.title,
          deadline: t.deadline!,
          subjectTitle: t.subjectTitle,
          isExamOrMilestone: t.priority === "urgent" || t.priority === "high",
        });
      });

    allGoals.forEach((g) => {
      g.milestones
        .filter((m) => !m.isCompleted && m.targetDate && m.targetDate >= todayStr)
        .forEach((m) => {
          upcomingDeadlines.push({
            id: m.id,
            type: "goal_milestone",
            title: `${g.title}: ${m.title}`,
            deadline: m.targetDate!,
            isExamOrMilestone: true,
          });
        });
    });

    upcomingDeadlines.sort((a, b) => a.deadline.localeCompare(b.deadline));

    // 6. Study Streak Calculation
    // Query all distinct dates where the user had a completed schedule
    const completedDates = db.prepare(`
      SELECT DISTINCT date FROM schedules
      WHERE user_id = ? AND status = 'completed'
      ORDER BY date DESC
    `).all(userId) as { date: string }[];

    let streakDays = 0;
    if (completedDates.length > 0) {
      let checkDate = new Date(todayStr);
      // Check if today was completed or yesterday was completed
      const dateSet = new Set(completedDates.map((d) => d.date));
      
      if (!dateSet.has(todayStr)) {
        // If not today, check if streak is alive from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (dateSet.has(checkDate.toISOString().split("T")[0])) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      // If no past completed days yet, fallback to baseline 1 if today has completed sessions
      if (streakDays === 0 && dateSet.has(todayStr)) {
        streakDays = 1;
      }
    }

    // 7. Recent Learning Activity Stream (from completed tasks, schedules, updated topics)
    const recentActivity: ActivityItem[] = [];

    allTasks
      .filter((t) => t.status === "completed")
      .slice(0, 3)
      .forEach((t) => {
        recentActivity.push({
          id: `act-task-${t.id}`,
          type: "task_completed",
          title: `Completed task: ${t.title}`,
          subjectTitle: t.subjectTitle,
          timestamp: t.updatedAt,
        });
      });

    todaySchedules
      .filter((s) => s.status === "completed")
      .forEach((s) => {
        recentActivity.push({
          id: `act-sched-${s.id}`,
          type: "schedule_completed",
          title: `Completed study session: ${s.topicTitle || s.taskTitle || "Focus Block"}`,
          subjectTitle: s.subjectTitle,
          timestamp: s.updatedAt,
        });
      });

    recentActivity.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    // 8. "What Should I Study?" Service Interface / Heuristic Recommendation
    // Finds topics needing review or with lowest mastery or in-progress status
    const allTopics = db.prepare(`
      SELECT t.*, s.title as subject_title, s.color as subject_color
      FROM topics t
      JOIN subjects s ON s.id = t.subject_id
      WHERE s.user_id = ?
      ORDER BY 
        CASE t.status WHEN 'needs_review' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'not_started' THEN 3 ELSE 4 END ASC,
        t.mastery ASC
    `).all(userId) as any[];

    let recommendation: StudyRecommendation | null = null;
    if (allTopics.length > 0) {
      const topTopic = allTopics[0];
      let reason = "Recommended to reinforce core knowledge.";
      let priority: "high" | "medium" | "low" = "medium";
      let suggestedAction = "Start a 45-minute focused study session.";

      if (topTopic.status === "needs_review") {
        reason = "Topic flagged for active recall review to prevent memory decay.";
        priority = "high";
        suggestedAction = "Run a 20-minute active recall drill on this topic.";
      } else if (topTopic.status === "in_progress") {
        reason = `Currently in progress (${Math.round(topTopic.mastery)}% mastery). Continuous practice accelerates completion.`;
        priority = "high";
        suggestedAction = "Complete next topic checkpoint and notes.";
      } else if (topTopic.mastery < 60) {
        reason = `Mastery is currently at ${Math.round(topTopic.mastery)}%. Prioritize building solid fundamentals.`;
        priority = "medium";
      }

      recommendation = {
        topicId: topTopic.id,
        topicTitle: topTopic.title,
        subjectTitle: topTopic.subject_title,
        subjectColor: topTopic.subject_color || "#3b82f6",
        recommendedDuration: topTopic.difficulty === "advanced" ? 50 : 30,
        reason,
        priority,
        suggestedAction,
      };
    }

    return {
      todayStr,
      stats: {
        streakDays,
        todayStudyMinutes,
        weeklyStudyMinutes: todayStudyMinutes, // Can accumulate across 7d
        pendingTasksCount: todayTasks.length,
        overdueTasksCount: overdueTasks.length,
        activeGoalsAverageProgress,
        overallCurriculumMastery,
      },
      recommendation,
      todaySchedules,
      todayTasks,
      overdueTasks,
      upcomingDeadlines,
      upcomingExams,
      subjectProgress,
      recentActivity,
    };
  },
};
