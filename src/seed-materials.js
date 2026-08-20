const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../data/learning_os.db");
const db = new Database(dbPath);

const userId = "demo-user-1";
const now = new Date().toISOString();

const firstSubject = db.prepare(`SELECT id FROM subjects LIMIT 1`).get();
const firstTopic = db.prepare(`SELECT id FROM topics LIMIT 1`).get();

const subId = firstSubject ? firstSubject.id : null;
const topId = firstTopic ? firstTopic.id : null;

// Add initial materials if empty
const count = db.prepare(`SELECT count(*) as count FROM material_files`).get();
if (count.count === 0) {
  const mat1Id = "mat-bmsd-01";
  const mat2Id = "mat-raft-02";

  db.prepare(`
    INSERT INTO material_files (id, user_id, subject_id, topic_id, name, mime_type, drive_file_id, drive_url, size_bytes, status, page_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mat1Id,
    userId,
    subId,
    topId,
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
    subId,
    topId,
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

  console.log("Seeded initial materials successfully.");
} else {
  console.log(`Already has ${count.count} materials.`);
}
