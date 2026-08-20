const https = require('https');

const apiKey = 'AIzaSyD_InbmSFufIEps5UAt2NmB_3LvBH3Sz_8';
const folderId = '1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP';

async function listFiles(parentFolderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q=%27${parentFolderId}%27+in+parents+and+trashed=false&key=${apiKey}&fields=files(id,name,mimeType,size,webContentLink,webViewLink)&pageSize=100`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Querying root folder: ${folderId}...`);
  const root = await listFiles(folderId);
  console.log('Root files response:', JSON.stringify(root, null, 2));

  if (root.files) {
    for (const f of root.files) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        console.log(`\nExploring subfolder [${f.name}] (${f.id})...`);
        const sub = await listFiles(f.id);
        console.log(`  Subfolder files (${sub.files?.length || 0}):`, sub.files?.map(x => `[${x.mimeType.split('.').pop()}] ${x.name}`).join('\n  '));
        
        // Explore 1 more level if folders exist
        if (sub.files) {
          for (const sf of sub.files) {
            if (sf.mimeType === 'application/vnd.google-apps.folder') {
              console.log(`    Exploring nested folder [${sf.name}] (${sf.id})...`);
              const subsub = await listFiles(sf.id);
              console.log(`      Nested files (${subsub.files?.length || 0}):`, subsub.files?.map(x => `[${x.mimeType.split('.').pop()}] ${x.name}`).join('\n      '));
            }
          }
        }
      }
    }
  }
}

run().catch(console.error);
