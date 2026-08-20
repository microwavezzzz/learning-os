import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "learning_os.db");
const db = new Database(dbPath);

// Enable WAL mode for high concurrency and performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/**
 * Initialize all database tables and indexes
 */
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      preferences_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS google_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      access_token_enc TEXT,
      refresh_token_enc TEXT,
      scope TEXT,
      expires_at TEXT,
      folder_id TEXT DEFAULT '1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP',
      folder_name TEXT DEFAULT 'Bank Materi Sains Data (BMSD)',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#3b82f6',
      icon TEXT NOT NULL DEFAULT 'book',
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      parent_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'not_started',
      difficulty TEXT NOT NULL DEFAULT 'intermediate',
      mastery REAL NOT NULL DEFAULT 0.0,
      bloom_level TEXT NOT NULL DEFAULT 'understand',
      estimated_minutes INTEGER NOT NULL DEFAULT 60,
      prerequisites TEXT NOT NULL DEFAULT '[]',
      related_materials TEXT NOT NULL DEFAULT '[]',
      order_index INTEGER NOT NULL DEFAULT 0,
      last_studied_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES topics (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS concepts (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      title TEXT NOT NULL,
      definition TEXT NOT NULL,
      key_formula TEXT,
      bloom_level TEXT NOT NULL DEFAULT 'understand',
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS material_files (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject_id TEXT,
      topic_id TEXT,
      name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      drive_file_id TEXT,
      drive_url TEXT,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      processing_error TEXT,
      raw_text TEXT,
      page_count INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS material_chunks (
      id TEXT PRIMARY KEY,
      material_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      page_number INTEGER NOT NULL DEFAULT 1,
      section_heading TEXT,
      content TEXT NOT NULL,
      token_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (material_id) REFERENCES material_files (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS material_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      page_number INTEGER,
      highlight_text TEXT,
      note_markdown TEXT NOT NULL,
      color TEXT DEFAULT '#fef08a',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (material_id) REFERENCES material_files (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject_id TEXT,
      topic_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      deadline TEXT,
      estimated_duration INTEGER NOT NULL DEFAULT 30,
      status TEXT NOT NULL DEFAULT 'todo',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target TEXT NOT NULL,
      deadline TEXT NOT NULL,
      progress REAL NOT NULL DEFAULT 0.0,
      milestones TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target_date TEXT NOT NULL,
      daily_capacity_minutes INTEGER NOT NULL DEFAULT 90,
      strategy TEXT NOT NULL DEFAULT 'adaptive_spaced',
      status TEXT NOT NULL DEFAULT 'active',
      subject_ids TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_plan_items (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 45,
      item_type TEXT NOT NULL DEFAULT 'study',
      status TEXT NOT NULL DEFAULT 'pending',
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (plan_id) REFERENCES study_plans (id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      subject_id TEXT,
      topic_id TEXT,
      task_id TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE SET NULL,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject_id TEXT,
      topic_id TEXT,
      planned_duration INTEGER NOT NULL DEFAULT 25,
      actual_duration INTEGER NOT NULL DEFAULT 0,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      completion_status TEXT NOT NULL DEFAULT 'completed',
      technique TEXT NOT NULL DEFAULT 'pomodoro',
      focus_rating INTEGER NOT NULL DEFAULT 4,
      confidence INTEGER NOT NULL DEFAULT 4,
      difficulty INTEGER NOT NULL DEFAULT 3,
      learning_outcome TEXT,
      difficult_aspects TEXT,
      review_items TEXT,
      notes_markdown TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      concept_id TEXT,
      material_chunk_id TEXT,
      type TEXT NOT NULL DEFAULT 'multiple_choice',
      difficulty INTEGER NOT NULL DEFAULT 3,
      prompt TEXT NOT NULL,
      options_json TEXT NOT NULL DEFAULT '[]',
      correct_answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      source_reference TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE,
      FOREIGN KEY (concept_id) REFERENCES concepts (id) ON DELETE SET NULL,
      FOREIGN KEY (material_chunk_id) REFERENCES material_chunks (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_sets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      topic_id TEXT,
      mode TEXT NOT NULL DEFAULT 'standard',
      total_questions INTEGER NOT NULL DEFAULT 5,
      created_at TEXT NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_set_id TEXT,
      topic_id TEXT,
      score_percentage REAL NOT NULL DEFAULT 0.0,
      total_questions INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER NOT NULL DEFAULT 0,
      time_spent_seconds INTEGER NOT NULL DEFAULT 0,
      answers_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets (id) ON DELETE SET NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS mistake_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      user_answer TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      root_cause TEXT NOT NULL DEFAULT 'conceptual_gap',
      diagnosis TEXT NOT NULL,
      suggested_remedy TEXT NOT NULL,
      repetition_count INTEGER NOT NULL DEFAULT 1,
      is_resolved INTEGER NOT NULL DEFAULT 0,
      next_review_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mastery_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      concept_id TEXT,
      stability REAL NOT NULL DEFAULT 1.0,
      difficulty REAL NOT NULL DEFAULT 5.0,
      retrievability REAL NOT NULL DEFAULT 1.0,
      repetitions INTEGER NOT NULL DEFAULT 0,
      lapses INTEGER NOT NULL DEFAULT 0,
      state TEXT NOT NULL DEFAULT 'learning',
      last_review_at TEXT,
      next_review_at TEXT,
      calculated_mastery REAL NOT NULL DEFAULT 0.0,
      decay_risk TEXT NOT NULL DEFAULT 'low',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE,
      FOREIGN KEY (concept_id) REFERENCES concepts (id) ON DELETE SET NULL
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects (user_id);
    CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics (subject_id);
    CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics (parent_id);
    CREATE INDEX IF NOT EXISTS idx_concepts_topic ON concepts (topic_id);
    CREATE INDEX IF NOT EXISTS idx_materials_user ON material_files (user_id);
    CREATE INDEX IF NOT EXISTS idx_chunks_material ON material_chunks (material_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks (user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks (deadline);
    CREATE INDEX IF NOT EXISTS idx_goals_user ON goals (user_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON schedules (user_id, date);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions (user_id);
    CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions (topic_id);
    CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistake_logs (user_id);
    CREATE INDEX IF NOT EXISTS idx_mistakes_topic ON mistake_logs (topic_id);
    CREATE INDEX IF NOT EXISTS idx_mastery_topic ON mastery_records (topic_id);
  `);

  // Seed default curriculum, materials, concepts, and questions if empty
  seedInitialData();
}

/**
 * Helper to safely add column if not exists
 */
function safeAddColumn(table: string, column: string, definition: string) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  } catch (e: any) {
    if (!e.message?.includes("duplicate column name")) throw e;
  }
}

/**
 * Seed starter data for Bank Materi Sains Data (BMSD) and Computer Systems
 */
function seedInitialData() {
  const userCount = db.prepare(`SELECT count(*) as count FROM users`).get() as { count: number };
  const userId = "demo-user-1";
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  if (userCount.count === 0) {
    db.prepare(`
      INSERT INTO users (id, email, name, preferences_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      "alex.learner@learningos.dev",
      "Alex Rivera",
      JSON.stringify({
        dailyTargetMinutes: 90,
        pomodoroWorkMinutes: 25,
        pomodoroBreakMinutes: 5,
        longBreakMinutes: 15,
        theme: "system",
        notificationsEnabled: true,
        soundEnabled: true,
      }),
      now,
      now
    );

    // Initial Google Account integration record (Bank Materi Sains Data)
    db.prepare(`
      INSERT INTO google_accounts (id, user_id, email, folder_id, folder_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      "gacc-1",
      userId,
      "alex.learner@gmail.com",
      "1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP",
      "Bank Materi Sains Data (BMSD)",
      now,
      now
    );
  }

  const subjectCount = db.prepare(`SELECT count(*) as count FROM subjects`).get() as { count: number };
  if (subjectCount.count === 0) {
    const sub1Id = "sub-os-1";
    const sub2Id = "sub-dist-2";
    const sub3Id = "sub-ds-3";

    // 1. Subjects
    db.prepare(`
      INSERT INTO subjects (id, user_id, title, description, color, icon, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sub1Id,
      userId,
      "Computer Systems & OS",
      "Core principles of virtual memory, CPU concurrency, file systems, and hardware abstractions.",
      "#3b82f6",
      "cpu",
      0,
      now,
      now
    );

    db.prepare(`
      INSERT INTO subjects (id, user_id, title, description, color, icon, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sub2Id,
      userId,
      "Distributed Systems",
      "Consensus protocols, CAP theorem, Paxos/Raft, fault tolerance, and replication models.",
      "#8b5cf6",
      "network",
      1,
      now,
      now
    );

    db.prepare(`
      INSERT INTO subjects (id, user_id, title, description, color, icon, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sub3Id,
      userId,
      "Data Science & Statistical Learning",
      "High-dimensional statistics, optimization, regression models, and deep probabilistic models from BMSD repository.",
      "#10b981",
      "bar-chart-2",
      2,
      now,
      now
    );

    // 2. Topics
    const top1Id = "top-proc-1";
    const top2Id = "top-mem-2";
    const top3Id = "top-raft-3";
    const top4Id = "top-prob-4";

    db.prepare(`
      INSERT INTO topics (id, subject_id, parent_id, title, description, status, difficulty, mastery, bloom_level, estimated_minutes, prerequisites, related_materials, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      top1Id,
      sub1Id,
      null,
      "Process Virtualization & CPU Scheduling",
      "Mechanisms of time-sharing, context switching, multi-level feedback queues (MLFQ), and CFS scheduler.",
      "completed",
      "intermediate",
      90.0,
      "analyze",
      75,
      JSON.stringify([]),
      JSON.stringify([{ title: "OSTEP Chapter 4-6", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", type: "book" }]),
      0,
      now,
      now
    );

    db.prepare(`
      INSERT INTO topics (id, subject_id, parent_id, title, description, status, difficulty, mastery, bloom_level, estimated_minutes, prerequisites, related_materials, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      top2Id,
      sub1Id,
      null,
      "Concurrency & Synchronization Locks",
      "Race conditions, mutual exclusion, semaphores, condition variables, and deadlock detection graphs.",
      "completed",
      "advanced",
      70.0,
      "apply",
      90,
      JSON.stringify(["top-proc-1"]),
      JSON.stringify([{ title: "Dijkstra Semaphores Paper", url: "https://dl.acm.org/", type: "paper" }]),
      1,
      now,
      now
    );

    db.prepare(`
      INSERT INTO topics (id, subject_id, parent_id, title, description, status, difficulty, mastery, bloom_level, estimated_minutes, prerequisites, related_materials, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      top3Id,
      sub2Id,
      null,
      "Raft Consensus Protocol",
      "Leader election quorums, log replication safety proofs, term numbers, and split-brain mitigation.",
      "in_progress",
      "advanced",
      50.0,
      "evaluate",
      120,
      JSON.stringify(["top-mem-2"]),
      JSON.stringify([{ title: "In Search of an Understandable Consensus Protocol (Ongaro & Ousterhout)", url: "https://raft.github.io/raft.pdf", type: "pdf" }]),
      0,
      now,
      now
    );

    db.prepare(`
      INSERT INTO topics (id, subject_id, parent_id, title, description, status, difficulty, mastery, bloom_level, estimated_minutes, prerequisites, related_materials, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      top4Id,
      sub3Id,
      null,
      "Probabilistic Inference & Maximum Likelihood Estimation",
      "Bayesian decision theory, likelihood formulations, Expectation-Maximization algorithm, and Gaussian mixture models.",
      "in_progress",
      "advanced",
      65.0,
      "evaluate",
      100,
      JSON.stringify([]),
      JSON.stringify([{ title: "BMSD Module 04: Statistical Inference", url: "https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP", type: "gdrive" }]),
      0,
      now,
      now
    );

    // 3. Concepts
    db.prepare(`
      INSERT INTO concepts (id, topic_id, title, definition, key_formula, bloom_level, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "c-mlfq-1",
      top1Id,
      "Multi-Level Feedback Queue (MLFQ)",
      "Priority-based scheduler that dynamically adjusts task priority based on observed CPU-burst length to optimize turnaround and response time.",
      "Priority = f(allotted_time_slice, I/O_frequency)",
      "analyze",
      0,
      now,
      now
    );

    db.prepare(`
      INSERT INTO concepts (id, topic_id, title, definition, key_formula, bloom_level, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "c-raft-quorum",
      top3Id,
      "Quorum Majority",
      "A condition where any election or commit decision requires acknowledgement from at least floor(N/2) + 1 nodes, ensuring any two quorums overlap by at least one node.",
      "Quorum >= floor(N/2) + 1",
      "evaluate",
      0,
      now,
      now
    );

    // 4. Material Files & Chunks (Bank Materi Sains Data)
    const mat1Id = "mat-bmsd-01";
    const mat2Id = "mat-raft-02";

    db.prepare(`
      INSERT INTO material_files (id, user_id, subject_id, topic_id, name, mime_type, drive_file_id, drive_url, size_bytes, status, page_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mat1Id,
      userId,
      sub3Id,
      top4Id,
      "BMSD_Modul_04_Statistical_Inference.pdf",
      "application/pdf",
      "1p5n-bmsd-m04-pdf",
      "https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP",
      2458000,
      "completed",
      18,
      now,
      now
    );

    db.prepare(`
      INSERT INTO material_chunks (id, material_id, chunk_index, page_number, section_heading, content, token_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "chk-bmsd-1",
      mat1Id,
      0,
      1,
      "1. Introduction to Parameter Estimation",
      "Parameter estimation is the discipline of estimating unknown parameters theta of a probability distribution based on observed sample data X = {x1, ..., xn}. Maximum Likelihood Estimation (MLE) seeks the parameter value that maximizes the likelihood function L(theta|X) = prod p(xi|theta).",
      54,
      now
    );

    db.prepare(`
      INSERT INTO material_files (id, user_id, subject_id, topic_id, name, mime_type, drive_file_id, drive_url, size_bytes, status, page_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mat2Id,
      userId,
      sub2Id,
      top3Id,
      "Raft_Consensus_Protocol_Paper.pdf",
      "application/pdf",
      "1p5n-raft-paper-pdf",
      "https://raft.github.io/raft.pdf",
      650000,
      "completed",
      12,
      now,
      now
    );

    db.prepare(`
      INSERT INTO material_chunks (id, material_id, chunk_index, page_number, section_heading, content, token_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "chk-raft-1",
      mat2Id,
      0,
      3,
      "5.2 Leader Election",
      "Raft uses a heartbeat mechanism to trigger leader election. When servers start up, they begin as followers. A server remains in follower state as long as it receives valid RPCs from a leader or candidate. Leaders send periodic heartbeats (AppendEntries RPCs with no log entries) to all followers to maintain authority.",
      58,
      now
    );

    // 5. Questions (Active Recall & Quiz Engine)
    db.prepare(`
      INSERT INTO questions (id, topic_id, concept_id, material_chunk_id, type, difficulty, prompt, options_json, correct_answer, explanation, source_reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "q-raft-1",
      top3Id,
      "c-raft-quorum",
      "chk-raft-1",
      "multiple_choice",
      3,
      "In the Raft consensus protocol, what condition must be met for a candidate to be elected as the new leader?",
      JSON.stringify([
        "It must receive votes from every single active node in the cluster",
        "It must receive votes from a strict majority of nodes (floor(N/2) + 1) for the same term",
        "It must have the smallest node ID and longest uptime",
        "It must execute a 2-Phase Commit across all followers"
      ]),
      "It must receive votes from a strict majority of nodes (floor(N/2) + 1) for the same term",
      "Raft requires a majority quorum (floor(N/2) + 1) to ensure that at most one candidate can win the election for a given term, preventing split-brain states.",
      "Raft Protocol Paper, Section 5.2 (chk-raft-1)",
      now
    );

    db.prepare(`
      INSERT INTO questions (id, topic_id, concept_id, material_chunk_id, type, difficulty, prompt, options_json, correct_answer, explanation, source_reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "q-raft-2",
      top3Id,
      "c-raft-quorum",
      "chk-raft-1",
      "short_answer",
      4,
      "Explain why Raft rejects a candidate's RequestVote RPC if the candidate's log is less up-to-date than the voter's own log.",
      JSON.stringify([]),
      "To ensure the Leader Completeness property: a leader must already contain all committed entries from past terms so committed logs are never overwritten.",
      "The Leader Completeness safety invariant states that if a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.",
      "Raft Protocol Paper, Section 5.4.1 (chk-raft-1)",
      now
    );

    db.prepare(`
      INSERT INTO questions (id, topic_id, concept_id, material_chunk_id, type, difficulty, prompt, options_json, correct_answer, explanation, source_reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "q-mle-1",
      top4Id,
      null,
      "chk-bmsd-1",
      "multiple_choice",
      3,
      "What mathematical transformation is conventionally applied to the likelihood function L(theta|X) to simplify Maximum Likelihood Estimation?",
      JSON.stringify([
        "Natural logarithm (Log-Likelihood) to transform products of probabilities into sums",
        "Fourier transform to extract frequency components",
        "Square root to normalize variance",
        "Laplace smoothing"
      ]),
      "Natural logarithm (Log-Likelihood) to transform products of probabilities into sums",
      "The natural logarithm is monotonically increasing, so maximizing ln L(theta) yields identical parameters to maximizing L(theta), while converting products into algebraically simpler sums.",
      "BMSD Module 04: Parameter Estimation (chk-bmsd-1)",
      now
    );

    // 6. Mastery Records (FSRS States)
    db.prepare(`
      INSERT INTO mastery_records (id, user_id, topic_id, stability, difficulty, retrievability, repetitions, lapses, state, last_review_at, next_review_at, calculated_mastery, decay_risk, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "mst-raft-1",
      userId,
      top3Id,
      3.2,
      5.5,
      0.82,
      2,
      0,
      "review",
      now,
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      50.0,
      "low",
      now
    );

    db.prepare(`
      INSERT INTO mastery_records (id, user_id, topic_id, stability, difficulty, retrievability, repetitions, lapses, state, last_review_at, next_review_at, calculated_mastery, decay_risk, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "mst-proc-1",
      userId,
      top1Id,
      14.5,
      3.0,
      0.95,
      5,
      0,
      "mastered",
      now,
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      90.0,
      "none",
      now
    );

    // 7. Goals and Tasks
    db.prepare(`
      INSERT INTO goals (id, user_id, title, target, deadline, progress, milestones, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "goal-1",
      userId,
      "Master Systems & Distributed Concurrency",
      "Achieve >= 85% mastery across all OS and Distributed Systems topics",
      "2026-11-30",
      50.0,
      JSON.stringify([
        { id: "m1", title: "Complete OSTEP Process & Memory chapters", isCompleted: true, targetDate: "2026-09-01" },
        { id: "m2", title: "Implement Raft consensus algorithm from scratch", isCompleted: false, targetDate: "2026-10-15" },
        { id: "m3", title: "Pass full active recall evaluation with zero conceptual lapses", isCompleted: false, targetDate: "2026-11-30" }
      ]),
      now,
      now
    );

    db.prepare(`
      INSERT INTO tasks (id, user_id, subject_id, topic_id, title, description, priority, deadline, estimated_duration, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "task-1",
      userId,
      sub1Id,
      top2Id,
      "Complete Concurrency Practice Problem Set",
      "Implement bounded buffer problem with condition variables and verify deadlocks with tsan.",
      "urgent",
      today,
      45,
      "todo",
      now,
      now
    );

    db.prepare(`
      INSERT INTO schedules (id, user_id, date, start_time, end_time, subject_id, topic_id, task_id, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "sched-1",
      userId,
      today,
      "09:00",
      "09:50",
      sub1Id,
      top2Id,
      "task-1",
      "completed",
      "Deep focus on locks and semaphores",
      now,
      now
    );
  }
}

// Auto-run initialization
initDatabase();

export { db };
