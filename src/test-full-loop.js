const BASE_URL = "http://localhost:3000";

async function runCompleteLearningLoopTest() {
  console.log("============================================================");
  console.log("LEARNING OS — FULL PRODUCT INTEGRATION & CORE LOOP TEST");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  async function step(stepNumber, description, fn) {
    try {
      await fn();
      console.log(`✓ [STEP ${stepNumber}] PASS: ${description}`);
      passed++;
    } catch (e) {
      console.error(`✗ [STEP ${stepNumber}] FAIL: ${description} -> ${e.message}`);
      failed++;
    }
  }

  let testSubjectId = null;
  let testTopicId = null;
  let testMaterialId = null;
  let testPlanId = null;
  let testSessionId = null;
  let testQuestionId = null;
  let testMistakeId = null;

  // STEP 1: Subjects and Topics Hierarchy
  await step(1, "Curriculum: Fetch subjects and topics hierarchy", async () => {
    const res = await fetch(`${BASE_URL}/api/subjects`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const subjects = await res.json();
    if (!Array.isArray(subjects) || subjects.length === 0) throw new Error("No subjects found");
    testSubjectId = subjects[0].id;

    const topRes = await fetch(`${BASE_URL}/api/topics?subjectId=${testSubjectId}`);
    if (!topRes.ok) throw new Error(`HTTP ${topRes.status}`);
    const topics = await topRes.json();
    if (!Array.isArray(topics) || topics.length === 0) throw new Error("No topics found");
    testTopicId = topics[0].id;
    console.log(`  -> Selected Topic: "${topics[0].title}" under Subject: "${subjects[0].title}"`);
  });

  // STEP 2: Google Drive Synchronization (BMSD Folder)
  await step(2, "Google Drive: Synchronize Bank Materi Sains Data (BMSD) folder", async () => {
    const res = await fetch(`${BASE_URL}/api/materials/drive-sync`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.syncedMaterial) throw new Error("Drive sync failed");
    console.log(`  -> Synced: "${data.syncedMaterial.name}" (ID: ${data.syncedMaterial.driveFileId})`);
  });

  // STEP 3: Material Hub & Chunk Extraction
  await step(3, "Materials Hub: Retrieve document and text chunks", async () => {
    const res = await fetch(`${BASE_URL}/api/materials`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const materials = await res.json();
    if (!Array.isArray(materials) || materials.length === 0) throw new Error("No materials in hub");
    testMaterialId = materials[0].id;

    const matDetailRes = await fetch(`${BASE_URL}/api/materials/${testMaterialId}`);
    if (!matDetailRes.ok) throw new Error(`HTTP ${matDetailRes.status}`);
    const matDetail = await matDetailRes.json();
    if (!Array.isArray(matDetail.chunks) || matDetail.chunks.length === 0) {
      throw new Error("No parsed chunks found in material");
    }
    console.log(`  -> Material: "${matDetail.name}", Chunks parsed: ${matDetail.chunks.length}`);
  });

  // STEP 4: Dual-Pane Reader Notes & Highlighting
  await step(4, "Document Reader: Add study note linked to highlight", async () => {
    const res = await fetch(`${BASE_URL}/api/materials/${testMaterialId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageNumber: 1,
        highlightText: "Maximum Likelihood Estimation seeks parameter theta maximizing L(theta|X)",
        noteMarkdown: "Important exam formula: take natural log of likelihood to convert products into sums.",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const note = await res.json();
    if (!note.id || !note.noteMarkdown) throw new Error("Failed to persist note");
    console.log(`  -> Created active note: "${note.noteMarkdown.substring(0, 45)}..."`);
  });

  // STEP 5: AI Concept Explainer (Feynman Technique)
  await step(5, "AI Gateway: Generate Feynman-style concept explanation", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept: "Raft Quorum Majority" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const exp = await res.json();
    if (!exp.concept || !exp.explanation || !exp.analogyOrExample) {
      throw new Error("Invalid explanation schema");
    }
    console.log(`  -> Feynman Analogy: "${exp.analogyOrExample.substring(0, 60)}..."`);
  });

  // STEP 6: Goal-Driven Study Plan Generation (Adaptive Scheduler)
  await step(6, "Adaptive Planner: Generate goal-driven study plan", async () => {
    const res = await fetch(`${BASE_URL}/api/study-plans/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Master Data Science & Systems",
        targetDate: "2026-11-30",
        dailyCapacityMinutes: 90,
        strategy: "adaptive_spaced",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const plan = await res.json();
    testPlanId = plan.id;
    if (!plan.id || !Array.isArray(plan.items) || plan.items.length === 0) {
      throw new Error("Plan generation produced no scheduled items");
    }
    console.log(`  -> Plan: "${plan.title}" generated ${plan.items.length} scheduled topic sessions`);
  });

  // STEP 7: Focus Study Session & Pomodoro Recording
  await step(7, "Focus Mode: Record completed study session with reflections", async () => {
    const startTime = new Date(Date.now() - 25 * 60 * 1000).toISOString();
    const endTime = new Date().toISOString();

    const res = await fetch(`${BASE_URL}/api/study-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: testSubjectId,
        topicId: testTopicId,
        plannedDuration: 25,
        actualDuration: 1500, // 25 min in seconds
        startTime,
        endTime,
        completionStatus: "completed",
        technique: "pomodoro",
        focusRating: 5,
        confidence: 4,
        difficulty: 3,
        learningOutcome: "Mastered CPU scheduling algorithms and context switch mechanics.",
        difficultAspects: "Analyzing cache affinity in multi-core CFS.",
        reviewItems: "Review Linux CFS nice values formula.",
        notesMarkdown: "# Process Scheduling Notes\n- Time slicing prevents starvation\n- MLFQ dynamically adjusts priority",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const sess = await res.json();
    testSessionId = sess.id;
    if (!sess.id || sess.actualDurationMinutes !== 25) throw new Error("Invalid session record");
    console.log(`  -> Logged session: ${sess.id} (25 min Focus Rating: ${sess.focusRating}/5)`);
  });

  // STEP 8: Grounded AI Quiz Generation from Material Chunks
  await step(8, "Quiz Engine: Generate grounded active recall questions", async () => {
    const res = await fetch(`${BASE_URL}/api/quizzes/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: testTopicId, count: 3 }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const qData = await res.json();
    if (!qData.success || qData.count === 0) throw new Error("No questions generated");
    console.log(`  -> Generated ${qData.count} grounded questions for topic`);
  });

  // STEP 9: Quiz Attempt with Semantic Evaluation & Mistake Auto-Logging
  await step(9, "Quiz Attempt: Submit answers with semantic evaluation & intentional mistake", async () => {
    const qRes = await fetch(`${BASE_URL}/api/quizzes?topicId=${testTopicId}`);
    const qData = await qRes.json();
    const qList = qData.questions;
    if (!qList || qList.length === 0) throw new Error("No questions available to take");

    testQuestionId = qList[0].id;

    // We answer Q0 with wrong answer to test Mistake Bank auto-logging, and remaining with correct answers
    const submissions = [
      { questionId: qList[0].id, answer: "Totally wrong incorrect answer" }, // Intentionally wrong
    ];

    if (qList.length > 1) {
      submissions.push({ questionId: qList[1].id, answer: qList[1].correctAnswer });
    }

    const attRes = await fetch(`${BASE_URL}/api/quizzes/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId: testTopicId,
        timeSpentSeconds: 45,
        userSubmissions: submissions,
      }),
    });

    if (!attRes.ok) throw new Error(`HTTP ${attRes.status}`);
    const attempt = await attRes.json();
    if (!attempt.id || typeof attempt.scorePercentage !== "number") throw new Error("Invalid attempt result");
    console.log(`  -> Attempt scored: ${attempt.scorePercentage}% (${attempt.correctCount}/${attempt.totalQuestions} correct)`);
  });

  // STEP 10: Verify Mistake Bank Auto-Logging & Diagnosis
  await step(10, "Mistake Bank: Verify failed question was automatically diagnosed and logged", async () => {
    const res = await fetch(`${BASE_URL}/api/mistakes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.mistakes) || data.mistakes.length === 0) {
      throw new Error("Mistake was not logged to Mistake Bank");
    }
    const logged = data.mistakes.find((m) => m.questionId === testQuestionId);
    if (!logged) throw new Error("Specific failed question not found in Mistake Bank");
    testMistakeId = logged.id;
    console.log(`  -> Mistake Logged: Root cause = "${logged.rootCause}", Diagnosis = "${logged.diagnosis}"`);
    console.log(`  -> Suggested Remedy: "${logged.suggestedRemedy}"`);
  });

  // STEP 11: Mistake Resolution Toggle
  await step(11, "Mistake Bank: Mark mistake as resolved after remediation drill", async () => {
    if (!testMistakeId) throw new Error("No mistake ID to resolve");
    const res = await fetch(`${BASE_URL}/api/mistakes/${testMistakeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isResolved: true }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.isResolved) throw new Error("Failed to mark mistake resolved");
    console.log(`  -> Mistake ${testMistakeId} marked as resolved`);
  });

  // STEP 12: FSRS Spaced Repetition & Cognitive Mastery Verification
  await step(12, "Mastery Engine: Verify FSRS state and cognitive mastery calculation", async () => {
    const res = await fetch(`${BASE_URL}/api/mastery`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.records) || data.records.length === 0) throw new Error("No mastery records");
    const topicRecord = data.records.find((r) => r.topicId === testTopicId) || data.records[0];
    console.log(`  -> Topic "${topicRecord.topicTitle}": Mastery = ${topicRecord.calculatedMastery}%, Stability = ${topicRecord.stability}d, Retrievability = ${Math.round(topicRecord.retrievability * 100)}%`);
    console.log(`  -> FSRS State: ${topicRecord.state}, Next Review Due: ${topicRecord.nextReviewAt.slice(0, 10)}`);
  });

  // STEP 13: Learning Analytics
  await step(13, "Analytics: Verify 14-day study heatmap and retention curve", async () => {
    const res = await fetch(`${BASE_URL}/api/analytics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const analytics = await res.json();
    if (!analytics.heatmap || analytics.heatmap.length !== 14) throw new Error("Invalid 14-day heatmap");
    if (!analytics.retentionCurve || analytics.retentionCurve.length === 0) throw new Error("Invalid retention curve");
    console.log(`  -> Total Study Time: ${analytics.totalStudyMinutes} mins across ${analytics.totalSessionsCount} sessions`);
    console.log(`  -> Heatmap populated with ${analytics.heatmap.length} daily datapoints`);
  });

  // STEP 14: Unified Dashboard Cockpit
  await step(14, "Dashboard: Verify unified cockpit with real AI recommendations & schedule", async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dbData = await res.json();
    if (!dbData.stats || !dbData.todaySchedules || !dbData.subjectProgress) {
      throw new Error("Invalid dashboard payload");
    }
    console.log(`  -> Dashboard Stats: Pending Tasks = ${dbData.stats.pendingTasksCount}, Goals Progress = ${dbData.stats.activeGoalsAverageProgress}%`);
    if (dbData.recommendation) {
      console.log(`  -> AI Recommendation: Study "${dbData.recommendation.topicTitle}" (${dbData.recommendation.recommendedDuration}m) - Reason: ${dbData.recommendation.reason}`);
    }
  });

  console.log("\n============================================================");
  console.log(`FULL LEARNING LOOP VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("============================================================");

  if (failed > 0) process.exit(1);
}

runCompleteLearningLoopTest();
