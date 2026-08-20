const https = require('https');

const subIds = [
  // TPB
  '17lBnWOwSYaQB7hTbBsCRJD1a-CxvrjP9',
  '1hVrlh5dZ7q5eq7P4VOWklykeukK_J5FE',
  // Prodi
  '1k-IUdlqsc8VeeOLMyvI35uq2ylofYXE7',
  '1NtMolvVz5-XxPYy4zun5szRYvEbhMV_X',
  '1_PlMRhJfPExGTL3elvKWyUGYz5zYHwyE',
  '1zVf1xwYKpLLUd6mHdGaCz2cnninYIOiB',
];

async function inspect(id) {
  return new Promise((resolve) => {
    https.get(`https://drive.google.com/drive/folders/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(' - Google Drive', '') : 'Unknown';
        resolve({ id, title, statusCode: res.statusCode });
      });
    }).on('error', e => resolve({ id, error: e.message }));
  });
}

async function run() {
  console.log("Inspecting semester subfolders...\n");
  for (const id of subIds) {
    const res = await inspect(id);
    console.log(`[${res.id}] -> "${res.title}"`);
  }
}

run();
