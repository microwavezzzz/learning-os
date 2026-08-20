const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/learning_os.db');
const db = new Database(dbPath);

console.log("=== FIXING ALL MATERIAL URLS & REMOVING 403 CAUSES ===\n");

// 1. Remove duplicate/unmapped old records
db.prepare(`
  DELETE FROM material_files 
  WHERE drive_url LIKE 'https://drive.google.com%' 
     OR id IN ('mat-bmsd-01', 'mat-c7swtui', 'mat-s9a3iej')
`).run();

// 2. Ensure all remaining material files have correct /pdfs/ paths
const rows = db.prepare(`SELECT * FROM material_files`).all();

for (const r of rows) {
  let cleanPdfUrl = `/pdfs/bmsd/${r.name}`;
  
  if (r.name.includes('Raft')) {
    cleanPdfUrl = `/pdfs/Raft_Consensus_Protocol_Paper.pdf`;
  } else if (!r.name.endsWith('.pdf')) {
    cleanPdfUrl = `/pdfs/bmsd/${r.name}.pdf`;
  }

  // Check if file exists in public/pdfs/bmsd or public/pdfs/
  const p1 = path.join(__dirname, '../public/pdfs/bmsd', r.name);
  const p2 = path.join(__dirname, '../public/pdfs', r.name);
  
  let size = r.size_bytes || 5000;
  if (fs.existsSync(p1)) {
    size = fs.statSync(p1).size;
  } else if (fs.existsSync(p2)) {
    size = fs.statSync(p2).size;
  }

  db.prepare(`
    UPDATE material_files
    SET drive_url = ?, size_bytes = ?, status = 'completed'
    WHERE id = ?
  `).run(cleanPdfUrl, size, r.id);

  console.log(`✓ Fixed [${r.id}]: ${r.name} -> ${cleanPdfUrl}`);
}

console.log("\n=== DATABASE CLEANED & NORMALIZED SUCCESSFULLY ===");
