const https = require('https');
const fs = require('fs');

async function fetchFolderPage(id) {
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
    }).on('error', e => resolve(''));
  });
}

async function explore() {
  console.log("Exploring TPB and Prodi folders...\n");

  // TPB
  const tpbHtml = await fetchFolderPage('1z4QI7JbDdwoy1A5dgmCRRufDgrxB41BQ');
  fs.writeFileSync('tpb_page.html', tpbHtml);
  
  // Extract IDs from TPB
  const idRegex = /"([a-zA-Z0-9_-]{28,45})"/g;
  const tpbIds = new Set();
  let m;
  while ((m = idRegex.exec(tpbHtml)) !== null) {
    if (!m[1].startsWith('AIza') && !m[1].startsWith('AA2Y')) tpbIds.add(m[1]);
  }
  console.log(`TPB Sub-IDs (${tpbIds.size}):`, Array.from(tpbIds));

  // Prodi
  const prodiHtml = await fetchFolderPage('1AH4zLyn5TmAcQBXx1tEMLS9T9Ei6Ol0l');
  fs.writeFileSync('prodi_page.html', prodiHtml);
  const prodiIds = new Set();
  while ((m = idRegex.exec(prodiHtml)) !== null) {
    if (!m[1].startsWith('AIza') && !m[1].startsWith('AA2Y')) prodiIds.add(m[1]);
  }
  console.log(`\nProdi Sub-IDs (${prodiIds.size}):`, Array.from(prodiIds));
}

explore();
