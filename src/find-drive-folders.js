const fs = require('fs');
const d = fs.readFileSync('drive_raw.html', 'utf8');

// Find all data arrays or folder IDs in the HTML
// Google Drive typically puts item data in javascript objects or arrays
const regex = /\["([^"]+)",\["([^"]+)"\]/g;
let m;
const found = [];
while ((m = regex.exec(d)) !== null) {
  found.push({ id: m[1], name: m[2] });
}
console.log('Regex 1 matches:', found.slice(0, 30));

// Let's search for any strings mentioning "Semester" or "Mata Kuliah" or "TPB" or "Prodi"
const matches = d.match(/\["([0-9a-zA-Z_-]{20,})","([^"]+)"/g) || [];
console.log('Drive item entries:', matches);

// Let's dump all strings inside data payloads
const stringMatches = d.match(/"([^"]{4,60})"/g) || [];
const filtered = Array.from(new Set(stringMatches.map(s => s.replace(/"/g, '')))).filter(s => 
  /TPB|Prodi|Semester|Kalkulus|Fisika|Kimia|HMSD|Matematika|Statistika|Aljabar|Algoritma|Struktur Data|Basis Data|Machine Learning|Deep Learning|Kecerdasan|Data Mining|Visualisasi|Optimasi|Wajib/i.test(s)
);
console.log('Filtered domain strings:', filtered);
