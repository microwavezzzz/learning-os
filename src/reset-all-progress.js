const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../data/learning_os.db");
const db = new Database(dbPath);

console.log("Resetting all learning progress to 0% across database...");

// 1. Reset all topics mastery and status to not_started
const resetTopics = db.prepare(`
  UPDATE topics 
  SET mastery = 0.0, 
      status = 'not_started', 
      last_studied_at = NULL
`);
const topicResult = resetTopics.run();
console.log(`✓ Reset ${topicResult.changes} topics to 0% mastery and status 'not_started'`);

// 2. Clear all mastery records
const clearMastery = db.prepare(`DELETE FROM mastery_records`);
const masteryResult = clearMastery.run();
console.log(`✓ Cleared ${masteryResult.changes} mastery FSRS records`);

// 3. Clear all study sessions
const clearSessions = db.prepare(`DELETE FROM study_sessions`);
const sessionResult = clearSessions.run();
console.log(`✓ Cleared ${sessionResult.changes} study sessions (Total study time = 0m)`);

// 4. Clear all quiz attempts
const clearAttempts = db.prepare(`DELETE FROM quiz_attempts`);
const attemptResult = clearAttempts.run();
console.log(`✓ Cleared ${attemptResult.changes} quiz attempts`);

// 5. Clear all mistake logs
const clearMistakes = db.prepare(`DELETE FROM mistake_logs`);
const mistakeResult = clearMistakes.run();
console.log(`✓ Cleared ${mistakeResult.changes} mistake logs`);

// 6. Reset all tasks to 'todo'
const resetTasks = db.prepare(`UPDATE tasks SET status = 'todo'`);
const taskResult = resetTasks.run();
console.log(`✓ Reset ${taskResult.changes} tasks to 'todo'`);

// 7. Reset all goals progress to 0% and uncheck milestones
const goals = db.prepare(`SELECT id, milestones FROM goals`).all();
const updateGoal = db.prepare(`UPDATE goals SET progress = 0.0, milestones = ? WHERE id = ?`);
for (const g of goals) {
  let milestones = [];
  try {
    milestones = JSON.parse(g.milestones || "[]");
    milestones = milestones.map(m => ({ ...m, isCompleted: false, completedAt: null }));
  } catch (e) {
    milestones = [];
  }
  updateGoal.run(JSON.stringify(milestones), g.id);
}
console.log(`✓ Reset ${goals.length} goals progress to 0.0%`);

// 8. Reset all schedules to 'scheduled'
const resetSchedules = db.prepare(`UPDATE schedules SET status = 'scheduled'`);
const schedResult = resetSchedules.run();
console.log(`✓ Reset ${schedResult.changes} schedules to 'scheduled'`);

// 9. Reset study plan items
const resetPlanItems = db.prepare(`UPDATE study_plan_items SET status = 'pending'`);
const planItemResult = resetPlanItems.run();
console.log(`✓ Reset ${planItemResult.changes} study plan items to 'pending'`);

console.log("\n=========================================");
console.log("ALL LEARNING PROGRESS SUCCESSFULLY RESET TO 0!");
console.log("=========================================");
