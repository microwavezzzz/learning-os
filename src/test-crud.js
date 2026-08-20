const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING LEARNING OS PHASE 2 CRUD TESTS ===\n");
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

  // 1. SUBJECTS CRUD
  let testSubjectId = "";
  await assert("GET /api/subjects returns seeded subjects", async () => {
    const res = await fetch(`${BASE_URL}/api/subjects`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Expected subjects array with items");
  });

  await assert("POST /api/subjects creates a new subject", async () => {
    const res = await fetch(`${BASE_URL}/api/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Database Systems",
        description: "B-Trees, Write-Ahead Logs, and ACID transactions.",
        color: "#10b981",
        icon: "database"
      })
    });
    if (res.status !== 201) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || data.title !== "Test Database Systems") throw new Error("Invalid created subject");
    testSubjectId = data.id;
  });

  await assert("PUT /api/subjects/:id updates the subject", async () => {
    const res = await fetch(`${BASE_URL}/api/subjects/${testSubjectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Database Systems Architecture" })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.title !== "Database Systems Architecture") throw new Error("Title not updated");
  });

  // 2. TOPICS CRUD (with subtopics, prerequisites, mastery, materials)
  let parentTopicId = "";
  let subtopicId = "";

  await assert("POST /api/topics creates a top-level topic", async () => {
    const res = await fetch(`${BASE_URL}/api/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: testSubjectId,
        title: "B+ Tree Indexing & Search",
        description: "Multi-way search trees for disk page storage.",
        status: "in_progress",
        difficulty: "advanced",
        mastery: 70,
        prerequisites: [],
        relatedMaterials: [{ title: "Database Internals Ch. 2", url: "https://example.com/btree.pdf", type: "PDF" }]
      })
    });
    if (res.status !== 201) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || data.mastery !== 70) throw new Error("Invalid created topic");
    parentTopicId = data.id;
  });

  await assert("POST /api/topics creates a subtopic under parent topic", async () => {
    const res = await fetch(`${BASE_URL}/api/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: testSubjectId,
        parentId: parentTopicId,
        title: "B+ Tree Page Splitting & Merging",
        description: "Algorithm for handling page overflows and rebalancing.",
        status: "not_started",
        difficulty: "advanced",
        mastery: 20,
        prerequisites: [parentTopicId]
      })
    });
    if (res.status !== 201) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || data.parentId !== parentTopicId) throw new Error("Subtopic parentId mismatch");
    subtopicId = data.id;
  });

  // 3. TASKS CRUD
  let testTaskId = "";
  await assert("POST /api/tasks creates a task linked to subject & topic", async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: testSubjectId,
        topicId: subtopicId,
        title: "Implement node split function in Python",
        description: "Ensure right child redistribution works correctly.",
        priority: "high",
        deadline: "2026-09-01",
        estimatedDuration: 45,
        status: "todo"
      })
    });
    if (res.status !== 201) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || data.priority !== "high") throw new Error("Task creation mismatch");
    testTaskId = data.id;
  });

  await assert("PUT /api/tasks/:id marks task as completed", async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${testTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "completed") throw new Error("Task status not updated to completed");
  });

  // 4. GOALS CRUD & MILESTONE TOGGLE
  let testGoalId = "";
  await assert("POST /api/goals creates a goal with milestones", async () => {
    const res = await fetch(`${BASE_URL}/api/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Master Database Storage Engines",
        target: "Complete B-Trees, LSM-Trees, and WAL",
        deadline: "2026-10-31",
        milestones: [
          { id: "m-test-1", title: "Read Chapter 1 & 2", isCompleted: false, targetDate: "2026-09-10" },
          { id: "m-test-2", title: "Implement Toy B-Tree", isCompleted: false, targetDate: "2026-10-01" }
        ]
      })
    });
    if (res.status !== 201) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || data.milestones.length !== 2) throw new Error("Goal creation mismatch");
    testGoalId = data.id;
  });

  await assert("PUT /api/goals/:id toggles milestone and recalculates progress", async () => {
    const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleMilestone", milestoneId: "m-test-1" })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.progress !== 50) throw new Error(`Expected progress 50%, got ${data.progress}%`);
  });

  // 5. SCHEDULES CRUD
  let testScheduleId = "";
  await assert("POST /api/schedules creates a time-blocked schedule", async () => {
    const res = await fetch(`${BASE_URL}/api/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-08-25",
        startTime: "14:00",
        endTime: "14:50",
        subjectId: testSubjectId,
        topicId: parentTopicId,
        taskId: testTaskId,
        status: "scheduled",
        notes: "Focus session on B+ Tree search logic"
      })
    });
    if (res.status !== 201) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || data.startTime !== "14:00") throw new Error("Schedule creation mismatch");
    testScheduleId = data.id;
  });

  await assert("PUT /api/schedules/:id updates schedule status to in_progress", async () => {
    const res = await fetch(`${BASE_URL}/api/schedules/${testScheduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "in_progress") throw new Error("Schedule status update failed");
  });

  // 6. CLEANUP / DELETE VERIFICATION
  await assert("DELETE /api/schedules/:id deletes the schedule", async () => {
    const res = await fetch(`${BASE_URL}/api/schedules/${testScheduleId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await assert("DELETE /api/tasks/:id deletes the task", async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${testTaskId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await assert("DELETE /api/goals/:id deletes the goal", async () => {
    const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await assert("DELETE /api/topics/:id cascades and deletes topic", async () => {
    const res = await fetch(`${BASE_URL}/api/topics/${parentTopicId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await assert("DELETE /api/subjects/:id deletes the test subject", async () => {
    const res = await fetch(`${BASE_URL}/api/subjects/${testSubjectId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests();
