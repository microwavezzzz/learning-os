const fs = require('fs');
const d = fs.readFileSync('drive_raw.html', 'utf8');

// Find all occurrences of strings between tags or in javascript
const clean = d.replace(/<[^>]+>/g, '\n');
const lines = clean.split('\n')
  .map(l => l.trim())
  .filter(l => l.length > 2 && !l.startsWith('var ') && !l.startsWith('function') && !l.includes('{') && !l.includes('}') && !l.includes(';'));

const unique = Array.from(new Set(lines));
console.log('Total text lines:', unique.length);
console.log('Sample text lines:');
console.log(unique.slice(0, 50).join('\n'));

// Let's also look for semester patterns
const sem = unique.filter(l => /semester|mata kuliah|sains data|bmsd|kurikulum|tingkat|ganjil|genap/i.test(l));
console.log('\nSemester/MK matches:', sem);
