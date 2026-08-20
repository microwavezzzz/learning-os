const https = require('https');
const fs = require('fs');

const url = 'https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP';
const opts = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
    'Cache-Control': 'no-cache',
  }
};

https.get(url, opts, function(r) {
  let d = '';
  r.on('data', function(c) { d += c; });
  r.on('end', function() {
    fs.writeFileSync('drive_raw.html', d);
    console.log('Saved. Length:', d.length, 'Status:', r.statusCode);

    // Try to extract file/folder names — Drive embeds data as JSON arrays
    // Pattern: ["filename","file-id",...]
    const namePattern = /"([^"]+(?:Semester|semester|SEMESTER|Mata Kuliah|UAS|UTS|Modul|modul|\.pdf|\.pptx|\.docx)[^"]*?)"/gi;
    const found = new Set();
    let m;
    while ((m = namePattern.exec(d)) !== null) {
      found.add(m[1]);
    }
    console.log('\n=== FOUND NAMES ===');
    Array.from(found).slice(0, 50).forEach(function(n) { console.log(' -', n); });
  });
}).on('error', function(e) { console.error(e.message); });
