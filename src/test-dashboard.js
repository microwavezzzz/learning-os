const BASE_URL = "http://localhost:3000";

async function testDashboard() {
  console.log("=== TESTING LEARNING OS DASHBOARD API & DATA INTEGRITY ===\n");
  let passed = 0;
  let failed = 0;

  async function assert(desc, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${desc}`);
      passed++;
    } catch (e) {
      console.error(`✗ FAIL: ${desc} -> ${e.message}`);
      failed++;
    }
  }

  let dashboardData = null;

  await assert("GET /api/dashboard returns HTTP 200 with structured JSON", async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dashboardData = await res.json();
    if (!dashboardData || typeof dashboardData !== "object") throw new Error("Expected dashboard data object");
  });

  await assert("Dashboard contains 'What Should I Study?' recommendation service interface", async () => {
    if (!dashboardData.recommendation) {
      console.log("  (Recommendation is null if no topics exist)");
    } else {
      const rec = dashboardData.recommendation;
      if (!rec.topicTitle || !rec.subjectTitle || !rec.reason || !rec.recommendedDuration) {
        throw new Error("Invalid recommendation object structure");
      }
      console.log(`  -> Recommended: [${rec.subjectTitle}] ${rec.topicTitle} (${rec.recommendedDuration}m)`);
      console.log(`  -> Reason: ${rec.reason}`);
    }
  });

  await assert("Dashboard contains Real Study Streak and Study Time metrics", async () => {
    const stats = dashboardData.stats;
    if (typeof stats.streakDays !== "number") throw new Error("streakDays missing");
    if (typeof stats.todayStudyMinutes !== "number") throw new Error("todayStudyMinutes missing");
    console.log(`  -> Streak: ${stats.streakDays} days | Study Time Today: ${stats.todayStudyMinutes} mins`);
  });

  await assert("Dashboard contains Today's Study Schedule array", async () => {
    if (!Array.isArray(dashboardData.todaySchedules)) throw new Error("todaySchedules not an array");
    console.log(`  -> Today's Scheduled Blocks: ${dashboardData.todaySchedules.length}`);
  });

  await assert("Dashboard contains Today's Tasks and Overdue Tasks", async () => {
    if (!Array.isArray(dashboardData.todayTasks)) throw new Error("todayTasks not an array");
    if (!Array.isArray(dashboardData.overdueTasks)) throw new Error("overdueTasks not an array");
    console.log(`  -> Today's Tasks: ${dashboardData.todayTasks.length} | Overdue Tasks: ${dashboardData.overdueTasks.length}`);
  });

  await assert("Dashboard contains Subject Progress & Mastery breakdown", async () => {
    if (!Array.isArray(dashboardData.subjectProgress) || dashboardData.subjectProgress.length === 0) {
      throw new Error("subjectProgress empty");
    }
    dashboardData.subjectProgress.forEach((sub) => {
      console.log(`  -> Subject: ${sub.title} | ${sub.completedTopicsCount}/${sub.topicsCount} topics (${sub.completionPercentage}%) | Mastery: ${sub.averageMastery}%`);
    });
  });

  await assert("Dashboard contains Upcoming Exams and Goals with Progress", async () => {
    if (!Array.isArray(dashboardData.upcomingExams)) throw new Error("upcomingExams not an array");
    console.log(`  -> Upcoming Goals/Exams: ${dashboardData.upcomingExams.length} items`);
    dashboardData.upcomingExams.forEach((exam) => {
      console.log(`     • ${exam.title} (Due ${exam.deadline}, ${exam.daysRemaining} days remaining)`);
    });
  });

  await assert("Dashboard contains Upcoming Deadlines list", async () => {
    if (!Array.isArray(dashboardData.upcomingDeadlines)) throw new Error("upcomingDeadlines not an array");
    console.log(`  -> Upcoming Deadlines: ${dashboardData.upcomingDeadlines.length} items in next 14d`);
  });

  await assert("Dashboard contains Recent Learning Activity audit trail", async () => {
    if (!Array.isArray(dashboardData.recentActivity)) throw new Error("recentActivity not an array");
    console.log(`  -> Recent Activities Logged: ${dashboardData.recentActivity.length}`);
  });

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

testDashboard();
