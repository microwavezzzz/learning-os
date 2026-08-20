import { NextResponse } from "next/server";
import { db } from "@/db/sqlite";
import { masteryRepo } from "@/db/repositories/mastery";
import { mistakesRepo } from "@/db/repositories/mistakes";
import { studySessionsRepo } from "@/db/repositories/study-sessions";

export async function GET() {
  try {
    const userId = "demo-user-1";
    const sessions = studySessionsRepo.getAll(userId);
    const masteryOverview = masteryRepo.getSubjectMasteryOverview(userId);
    const mistakeStats = mistakesRepo.getStats(userId);

    // Total Study Minutes
    const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);

    // 14-Day Study Activity Heatmap
    const now = new Date();
    const heatmap: { date: string; minutes: number; sessionCount: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const daySessions = sessions.filter((s) => s.startTime.startsWith(dateStr));
      const mins = daySessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);
      heatmap.push({
        date: dateStr,
        minutes: mins,
        sessionCount: daySessions.length,
      });
    }

    // Retention curve points for FSRS stability
    const retentionCurve = [
      { day: 0, retrievability: 100 },
      { day: 1, retrievability: 95 },
      { day: 3, retrievability: 88 },
      { day: 7, retrievability: 80 },
      { day: 14, retrievability: 72 },
      { day: 30, retrievability: 60 },
    ];

    return NextResponse.json({
      totalStudyMinutes,
      totalSessionsCount: sessions.length,
      averageSessionDuration: sessions.length > 0 ? Math.round(totalStudyMinutes / sessions.length) : 0,
      subjectMastery: masteryOverview,
      heatmap,
      retentionCurve,
      mistakeStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
