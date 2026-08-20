const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/learning_os.db');
const db = new Database(dbPath);

console.log("=== SEEDING CONCEPTS & QUESTIONS FOR ALL 39 REAL COURSES ===\n");

const topics = db.prepare(`SELECT t.id, t.title, t.subject_id, s.title as subject_title, s.semester FROM topics t JOIN subjects s ON s.id = t.subject_id`).all();
const now = new Date().toISOString();

for (const top of topics) {
  // 1. Concept
  const conceptId = `con-${top.id}`;
  const existingCon = db.prepare(`SELECT id FROM concepts WHERE id = ?`).get(conceptId);
  if (!existingCon) {
    db.prepare(`
      INSERT INTO concepts (id, topic_id, title, definition, key_formula, bloom_level, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      conceptId,
      top.id,
      `Prinsip Utama ${top.title}`,
      `Konsep fundamental dalam mata kuliah ${top.title} kurikulum Sains Data BMSD Semester ${top.semester}.`,
      top.title.includes('Kalkulus') || top.title.includes('Matematika') ? 'f\'(x) = lim_{h->0} [f(x+h) - f(x)]/h' :
      top.title.includes('Probabilitas') || top.title.includes('Peluang') ? 'P(A|B) = [P(B|A) P(A)] / P(B)' :
      top.title.includes('Struktur Data') || top.title.includes('Algoritma') ? 'T(n) <= c * g(n)' :
      top.title.includes('Basis Data') ? 'SELECT * FROM table WHERE condition' :
      top.title.includes('Fisika') ? 'F = m * a,  E = 1/2 m v^2' : 'Model = f(X; theta)',
      'understand',
      0,
      now,
      now
    );
  }

  // 2. Question
  const qId = `q-${top.id}`;
  const existingQ = db.prepare(`SELECT id FROM questions WHERE id = ?`).get(qId);
  if (!existingQ) {
    db.prepare(`
      INSERT INTO questions (id, topic_id, concept_id, material_chunk_id, type, difficulty, prompt, options_json, correct_answer, explanation, source_reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      qId,
      top.id,
      conceptId,
      null,
      'multiple_choice',
      3,
      `Dalam mata kuliah ${top.title}, apa tujuan utama dari penguasaan konsep dan silabus ini?`,
      JSON.stringify([
        `Membangun kompetensi analitis dan teknis dalam ${top.title}`,
        'Hanya menghafal definisi tanpa implementasi',
        'Mengabaikan aspek praktis komputasi',
        'Menghindari pemecahan masalah empiris'
      ]),
      `Membangun kompetensi analitis dan teknis dalam ${top.title}`,
      `Penguasaan ${top.title} pada kurikulum Sains Data bertujuan membekali mahasiswa dengan fondasi analitis kuat dan keterampilan komputasi terapan.`,
      `Bank Materi Sains Data (BMSD) - ${top.title}`,
      now
    );
  }

  // 3. Initial Mastery Record
  const mstId = `mst-${top.id}`;
  const existingMst = db.prepare(`SELECT id FROM mastery_records WHERE topic_id = ?`).get(top.id);
  if (!existingMst) {
    db.prepare(`
      INSERT INTO mastery_records (id, user_id, topic_id, stability, difficulty, retrievability, repetitions, lapses, state, last_review_at, next_review_at, calculated_mastery, decay_risk, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mstId,
      'demo-user-1',
      top.id,
      2.5,
      5.0,
      0.9,
      1,
      0,
      'learning',
      now,
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      45.0,
      'none',
      now
    );
  }
}

console.log(`Seeded concepts & questions for all ${topics.length} real courses.`);
