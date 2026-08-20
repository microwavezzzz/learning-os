export interface SchedulerTopic {
  id: string;
  title: string;
  subjectTitle: string;
  subjectColor: string;
  estimatedMinutes: number;
  mastery: number;
  prerequisites: string[];
  status: string;
  decayRisk: "none" | "low" | "moderate" | "critical";
  dueReviewDate?: string;
  unresolvedMistakesCount: number;
}

export interface GeneratedScheduleItem {
  id: string;
  topicId: string;
  topicTitle: string;
  subjectTitle: string;
  subjectColor: string;
  date: string;
  durationMinutes: number;
  type: "study" | "fsrs_review" | "mistake_remediation" | "exam_sprint";
  reason: string;
  priorityScore: number;
}

export interface AdaptivePlanConfig {
  planTitle: string;
  targetDate: string; // ISO date YYYY-MM-DD
  dailyCapacityMinutes: number;
  strategy: "adaptive_spaced" | "linear" | "exam_preparation";
  topics: SchedulerTopic[];
}

export const adaptiveScheduler = {
  /**
   * Generate an optimized study queue balancing prerequisites, due FSRS reviews, mistakes, and deadlines
   */
  generatePlan(config: AdaptivePlanConfig): GeneratedScheduleItem[] {
    const items: GeneratedScheduleItem[] = [];
    const now = new Date();
    const target = new Date(config.targetDate);
    const totalDays = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate priority scores for each topic
    const scoredTopics = config.topics.map((t) => {
      let score = 50;

      // 1. Mastery deficit
      score += (100 - t.mastery) * 0.5;

      // 2. High decay risk
      if (t.decayRisk === "critical") score += 40;
      else if (t.decayRisk === "moderate") score += 20;

      // 3. Unresolved mistakes needing remediation
      score += Math.min(30, t.unresolvedMistakesCount * 10);

      // 4. Prerequisite blocking weight
      const isPrereqForOthers = config.topics.some((other) => other.prerequisites.includes(t.id));
      if (isPrereqForOthers && t.mastery < 70) score += 25;

      return { ...t, priorityScore: score };
    });

    // Sort topics based on strategy
    if (config.strategy === "linear") {
      scoredTopics.sort((a, b) => a.id.localeCompare(b.id));
    } else {
      scoredTopics.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    // Schedule items across available days
    let dayOffset = 0;
    let currentDayMinutes = 0;

    for (const topic of scoredTopics) {
      if (dayOffset >= totalDays) dayOffset = totalDays - 1;

      const schedDate = new Date();
      schedDate.setDate(schedDate.getDate() + dayOffset);
      const dateStr = schedDate.toISOString().split("T")[0];

      let itemType: GeneratedScheduleItem["type"] = "study";
      let reason = `Targeting mastery increase for ${topic.title}.`;

      if (topic.unresolvedMistakesCount > 0) {
        itemType = "mistake_remediation";
        reason = `Active mistake remediation drill (${topic.unresolvedMistakesCount} unresolved errors).`;
      } else if (topic.decayRisk === "critical" || topic.decayRisk === "moderate") {
        itemType = "fsrs_review";
        reason = `FSRS spaced review required due to high retention decay risk.`;
      } else if (config.strategy === "exam_preparation") {
        itemType = "exam_sprint";
        reason = `Exam sprint coverage before target deadline (${config.targetDate}).`;
      }

      const duration = Math.min(topic.estimatedMinutes || 45, config.dailyCapacityMinutes);

      items.push({
        id: `plan-item-${Math.random().toString(36).substring(2, 9)}`,
        topicId: topic.id,
        topicTitle: topic.title,
        subjectTitle: topic.subjectTitle,
        subjectColor: topic.subjectColor,
        date: dateStr,
        durationMinutes: duration,
        type: itemType,
        reason,
        priorityScore: topic.priorityScore,
      });

      currentDayMinutes += duration;
      if (currentDayMinutes >= config.dailyCapacityMinutes) {
        dayOffset++;
        currentDayMinutes = 0;
      }
    }

    return items;
  },

  /**
   * Dynamically reschedule missed sessions to today and future days
   */
  rescheduleMissed(
    missedItems: GeneratedScheduleItem[],
    dailyCapacityMinutes: number = 90
  ): GeneratedScheduleItem[] {
    const todayStr = new Date().toISOString().split("T")[0];
    return missedItems.map((item, idx) => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + Math.floor(idx / 2));
      return {
        ...item,
        date: newDate.toISOString().split("T")[0],
        reason: `[Rescheduled] ${item.reason}`,
      };
    });
  },
};
