const https = require('https');
const fs = require('fs');

const foldersToExplore = [
  { id: '17lBnWOwSYaQB7hTbBsCRJD1a-CxvrjP9', name: 'Semester 1 (TPB)' },
  { id: '1hVrlh5dZ7q5eq7P4VOWklykeukK_J5FE', name: 'Semester 2 (TPB)' },
  { id: '1_PlMRhJfPExGTL3elvKWyUGYz5zYHwyE', name: 'MK Prodi Wajib' },
  { id: '1zVf1xwYKpLLUd6mHdGaCz2cnninYIOiB', name: 'MK Prodi Wajib 2026' },
];

async function fetchFolder(id) {
  return new Promise((resolve) => {
    https.get(`https://drive.google.com/drive/folders/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const idRegex = /"([a-zA-Z0-9_-]{28,45})"/g;
  const allSubIds = [];

  for (const f of foldersToExplore) {
    console.log(`\nExploring ${f.name} (${f.id})...`);
    const html = await fetchFolder(f.id);
    const subIds = new Set();
    let m;
    while ((m = idRegex.exec(html)) !== null) {
      if (!m[1].startsWith('AIza') && !m[1].startsWith('AA2Y') && m[1] !== f.id) {
        subIds.add(m[1]);
      }
    }
    console.log(`  Found ${subIds.size} items:`, Array.from(subIds));
    subIds.forEach(sid => allSubIds.push({ parent: f.name, id: sid }));
  }

  fs.writeFileSync('all_sub_items.json', JSON.stringify(allSubIds, null, 2));
}

run();
