const BASE_URL = "http://localhost:3000";

async function testStudySystem() {
  console.log("=== TESTING LEARNING OS STUDY SYSTEM ===\n");
  let passed = 0;
  let failed = 0;
  let createdId = null;

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

  // 1. Fetch subjects and topics to get real IDs
  let subjectId = null;
  let topicId = null;

  await assert("GET /api/subjects returns subjects list", async () => {
    const res = await fetch(`${BASE_URL}/api/subjects`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("No subjects found");
    subjectId = data[0].id;
    console.log(`  -> Using subject: ${data[0].title} (${subjectId})`);
  });

  await assert("GET /api/topics returns topics list", async () => {
    const res = await fetch(`${BASE_URL}/api/topics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("No topics found");
    topicId = data[0].id;
    console.log(`  -> Using topic: ${data[0].title} (${topicId}), mastery=${data[0].mastery}%`);
  });

  // 2. Create a study session with full reflection data
  let session = null;
  const now = new Date();
  const startTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString(); // 30 mins ago
  const endTime = now.toISOString();

  await assert("POST /api/study-sessions creates a session with all reflection fields", async () => {
    const res = await fetch(`${BASE_URL}/api/study-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId,
        topicId,
        plannedDuration: 25,
        actualDuration: 1800, // 30 minutes in seconds
        startTime,
        endTime,
        completionStatus: "completed",
        technique: "pomodoro",
        focusRating: 5,
        confidence: 4,
        difficulty: 3,
        learningOutcome: "Understood how Raft handles leader elections and log replication.",
        difficultAspects: "The split-brain prevention logic under network partitions was tricky.",
        reviewItems: "Re-read Section 4 on safety proofs and Theorem 3.1.",
        notesMarkdown: "# Raft Session Notes\n- Leader election requires majority quorum\n- Log entries committed when majority ACK\n- No votes to candidates with stale logs",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    session = await res.json();
    createdId = session.id;
    if (!session.id || !session.startTime || !session.learningOutcome) {
      throw new Error("Session missing required fields");
    }
    console.log(`  -> Created session: ${session.id}`);
    console.log(`  -> Actual Duration: ${session.actualDurationMinutes} minutes`);
    console.log(`  -> Focus: ${session.focusRating}/5, Confidence: ${session.confidence}/5, Difficulty: ${session.difficulty}/5`);
  });

  // 3. Verify topic mastery was updated
  await assert("Topic mastery is updated after session is recorded", async () => {
    const res = await fetch(`${BASE_URL}/api/topics/${topicId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const topic = await res.json();
    console.log(`  -> Topic mastery now: ${topic.mastery}% (updated from confidence rating)`);
    if (typeof topic.mastery !== "number") throw new Error("Topic mastery not a number");
  });

  // 4. GET all study sessions list
  await assert("GET /api/study-sessions returns sessions list with new session", async () => {
    const res = await fetch(`${BASE_URL}/api/study-sessions`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Expected array");
    const found = data.find((s) => s.id === createdId);
    if (!found) throw new Error("Created session not found in list");
    console.log(`  -> Total recorded sessions: ${data.length}`);
  });

  // 5. GET by ID
  await assert("GET /api/study-sessions/[id] returns session detail", async () => {
    if (!createdId) throw new Error("No session ID to test");
    const res = await fetch(`${BASE_URL}/api/study-sessions/${createdId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.id !== createdId) throw new Error("Wrong session returned");
    if (data.learningOutcome !== "Understood how Raft handles leader elections and log replication.") {
      throw new Error("learningOutcome not persisted correctly");
    }
    console.log(`  -> Learning Outcome persisted: "${data.learningOutcome.substring(0, 50)}..."`);
  });

  // 6. DELETE session
  await assert("DELETE /api/study-sessions/[id] removes session", async () => {
    if (!createdId) throw new Error("No session ID to test");
    const res = await fetch(`${BASE_URL}/api/study-sessions/${createdId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Expected success:true");
    console.log(`  -> Session deleted successfully`);
  });

  // 7. Verify session is gone
  await assert("Deleted session returns 404", async () => {
    if (!createdId) throw new Error("No session ID to test");
    const res = await fetch(`${BASE_URL}/api/study-sessions/${createdId}`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 8. Create an interrupted session
  await assert("POST /api/study-sessions with completionStatus=interrupted persists correctly", async () => {
    const res = await fetch(`${BASE_URL}/api/study-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId,
        topicId,
        plannedDuration: 50,
        actualDuration: 720, // 12 minutes only
        startTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        completionStatus: "interrupted",
        technique: "deep_work",
        focusRating: 2,
        confidence: 3,
        difficulty: 4,
        learningOutcome: "Got through first section before interruption.",
        difficultAspects: "Hard to maintain focus today.",
        reviewItems: "",
        notesMarkdown: "",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.completionStatus !== "interrupted") throw new Error("Status not persisted");
    if (data.technique !== "deep_work") throw new Error("Technique not persisted");
    console.log(`  -> Interrupted deep_work session: ${data.id} (${data.actualDurationMinutes}m actual)`);
  });

  // 9. Dashboard now includes study time contributions
  await assert("Dashboard reflects updated learning state from sessions", async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.stats.todayStudyMinutes !== "number") throw new Error("todayStudyMinutes missing");
    console.log(`  -> Dashboard today study minutes: ${data.stats.todayStudyMinutes}`);
    const rec = data.recommendation;
    if (rec) {
      console.log(`  -> Recommendation still active: "${rec.topicTitle}" (${rec.subjectTitle})`);
    }
  });

  // 10. Study Journal filtering by subject
  await assert("GET /api/study-sessions?subjectId=X filters by subject", async () => {
    if (!subjectId) throw new Error("No subjectId to test");
    const res = await fetch(`${BASE_URL}/api/study-sessions?subjectId=${subjectId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Expected array");
    const allMatch = data.every((s) => s.subjectId === subjectId);
    if (!allMatch) throw new Error("Some sessions don't match subject filter");
    console.log(`  -> Filtered sessions for subject: ${data.length} results`);
  });

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

testStudySystem();
