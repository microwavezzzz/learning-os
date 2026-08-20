const fs = require('fs');
const d = fs.readFileSync('drive_raw.html', 'utf8');
console.log('Total HTML length:', d.length);

// Extract all quoted strings that look like filenames or folder names
const items = new Set();
const keywords = ['Semester', 'semester', 'Kalkulus', 'Statistika', 'Pemrograman',
  'Basis Data', 'Machine Learning', 'Deep Learning', 'Jaringan', 'Aljabar',
  'Probabilitas', 'Ekonometrika', 'Data Mining', 'Visualisasi', 'Struktur Data',
  'Algoritma', 'Sistem Informasi', 'Analitik', 'Big Data', 'Rekayasa',
  'Matematika', 'Fisika', 'Kimia', 'UAS', 'UTS', 'Pertemuan', 'Modul', 'Kuliah',
  'Wajib', '.pdf', '.pptx', '.docx', '.xlsx', 'Ganjil', 'Genap', 'Pengantar'];

// Simple string scan for quoted text
const quoteRe = /"([^"]{3,120})"/g;
let m;
while ((m = quoteRe.exec(d)) !== null) {
  const txt = m[1];
  for (let i = 0; i < keywords.length; i++) {
    if (txt.indexOf(keywords[i]) >= 0) {
      items.add(txt);
      break;
    }
  }
}

const arr = Array.from(items).sort();
console.log('\n=== Found', arr.length, 'items ===');
arr.forEach(function(x) { console.log(' >', x); });
