const https = require('https');
const fs = require('fs');

const courses = JSON.parse(fs.readFileSync('real_gdrive_courses.json', 'utf8'));

async function getFolderFiles(folderId) {
  return new Promise((resolve) => {
    https.get(`https://drive.google.com/drive/folders/${folderId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Extract all file names that look like PDF/PPTX/DOCX/files
        const fileNames = new Set();
        const matches = data.match(/"([^"]+\.(?:pdf|pptx|ppt|docx|doc|xlsx|zip|rar|ipynb|py))"/gi) || [];
        matches.forEach(m => fileNames.add(m.replace(/"/g, '')));
        
        // Also look for nested folder IDs
        const idRegex = /"([a-zA-Z0-9_-]{28,45})"/g;
        const subIds = [];
        let im;
        while ((im = idRegex.exec(data)) !== null) {
          if (!im[1].startsWith('AIza') && !im[1].startsWith('AA2Y') && im[1] !== folderId) {
            subIds.push(im[1]);
          }
        }
        resolve({ files: Array.from(fileNames), subIdsCount: subIds.length });
      });
    }).on('error', e => resolve({ files: [], error: e.message }));
  });
}

async function run() {
  console.log(`Crawling ${courses.length} courses from Google Drive...\n`);
  const detailedCourses = [];

  for (const c of courses) {
    console.log(`Scanning [${c.parent}] ${c.title}...`);
    const res = await getFolderFiles(c.id);
    console.log(`  -> Found ${res.files.length} files:`, res.files.slice(0, 5));
    detailedCourses.push({
      ...c,
      gdriveUrl: `https://drive.google.com/drive/folders/${c.id}`,
      fileList: res.files
    });
  }

  fs.writeFileSync('detailed_gdrive_courses.json', JSON.stringify(detailedCourses, null, 2));
  console.log("\nFinished scanning all courses!");
}

run();
