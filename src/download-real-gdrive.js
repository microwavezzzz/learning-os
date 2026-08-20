const https = require('https');
const fs = require('fs');

// Test downloading the folder page or querying public Drive endpoints
const folderId = '1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP';

async function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        ...headers
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(data) }));
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Fetching Google Drive folder page: ${folderId}...`);
  const res = await fetchUrl(`https://drive.google.com/drive/folders/${folderId}`);
  const html = res.body.toString('utf8');
  console.log(`Status: ${res.statusCode}, HTML length: ${html.length}`);
  
  // Extract all file IDs and names from the Drive JS initial data
  // Look for patterns like ["id",["name",...]] or [["id","name",...]]
  // In Google Drive SSR, the data is in _DRIVE_ivd or window['_INITIAL_DATA_']
  fs.writeFileSync('gdrive_debug.html', html);
  
  // Find all file IDs (alphanumeric + _ - with 25-45 chars)
  const idRegex = /"([a-zA-Z0-9_-]{28,45})"/g;
  const ids = new Set();
  let m;
  while ((m = idRegex.exec(html)) !== null) {
    ids.add(m[1]);
  }
  console.log(`Found ${ids.size} potential Google Drive IDs in HTML.`);
  console.log('Sample IDs:', Array.from(ids).slice(0, 20));
}

run().catch(console.error);
