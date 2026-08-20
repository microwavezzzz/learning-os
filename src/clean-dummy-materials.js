const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/learning_os.db');
const db = new Database(dbPath);

console.log("=== REMOVING ARTIFICIAL / DUMMY MATERIALS & KEEPING REAL BMSD COURSES ===\n");

// 1. Find all subjects to delete
const deleteSubjectIds = [
  'sub-os-1',
  'sub-dist-2',
  'sub-ds-3',
  'sub-bmsd-sem1-ma1101',
  'sub-bmsd-sem1-fi1101',
  'sub-bmsd-sem1-sd1101',
  'sub-bmsd-sem2-ma1201',
  'sub-bmsd-sem2-ma1202',
  'sub-bmsd-sem2-if1201',
  'sub-bmsd-sem3-sd2101',
  'sub-bmsd-sem3-sd2102',
  'sub-bmsd-sem3-sd2103',
  'sub-bmsd-sem4-sd2201',
  'sub-bmsd-sem4-sd2202',
  'sub-bmsd-sem4-sd2203',
  'sub-bmsd-sem5-sd3101',
  'sub-bmsd-sem5-sd3102',
  'sub-bmsd-sem5-sd3103',
  'sub-bmsd-sem6-sd3201',
  'sub-bmsd-sem6-sd3202',
  'sub-bmsd-sem6-sd3203'
];

for (const sId of deleteSubjectIds) {
  // Delete related material files
  const deletedMats = db.prepare(`DELETE FROM material_files WHERE subject_id = ? OR id LIKE ?`).run(sId, `%${sId}%`);
  // Delete related topics
  const deletedTops = db.prepare(`DELETE FROM topics WHERE subject_id = ?`).run(sId);
  // Delete subject
  const deletedSub = db.prepare(`DELETE FROM subjects WHERE id = ?`).run(sId);
  console.log(`Deleted old subject: ${sId}`);
}

// 2. Delete any materials with dummy drive links (like 1p5n-bmsd-... or 1p5n-raft-...)
const deletedDummyFiles = db.prepare(`
  DELETE FROM material_files 
  WHERE drive_file_id LIKE '1p5n-bmsd%' 
     OR drive_file_id LIKE '1p5n-raft%' 
     OR id LIKE 'mat-bmsd-%' 
     OR id LIKE 'mat-raft-%'
     OR name LIKE 'BMSD_Modul_%'
     OR name LIKE 'BMSD_Sem%'
     OR name LIKE 'Raft_%'
`).run();

console.log(`Deleted ${deletedDummyFiles.changes} dummy material files.`);

// 3. Check remaining subjects and material files
const remainingSubs = db.prepare(`SELECT id, title, semester FROM subjects ORDER BY semester ASC, order_index ASC`).all();
console.log(`\nRemaining Real Subjects in Database: ${remainingSubs.length}`);
remainingSubs.forEach((s, idx) => console.log(`  ${idx + 1}. [Sem ${s.semester}] ${s.title} (${s.id})`));

const remainingMats = db.prepare(`SELECT id, name, subject_id, drive_url FROM material_files`).all();
console.log(`\nRemaining Real Material Files: ${remainingMats.length}`);

console.log("\n=== CLEANUP COMPLETED SUCCESSFULLY ===");
