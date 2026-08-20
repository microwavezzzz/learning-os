const https = require('https');

const folderIds = [
  '1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP',
  '1AH4zLyn5TmAcQBXx1tEMLS9T9Ei6Ol0l',
  '1z4QI7JbDdwoy1A5dgmCRRufDgrxB41BQ',
  '1jyAPpiE9UtxerhSMD02BYD6y4Wr3lS4M',
  '11kC-pGzw-tqXqtcZW0q0QEYbiw9EFhKJ',
  '1MpsJpn9l_SD0PHMpmKYtEAVKhHJF18iI',
  '1CCVMcuWQrs8h0Xpqx33KGDPL5K1SQKaZ',
  '1DT15z265OnvyIn5vw-KyUrPnlcYiFd2t',
  '18sjzJQGwyYu19RFkRjIgIbjlARA2cF2j',
  '196hz3DbkZoOnzrpB14RyPtaacczwsg0z',
  '1AVP-aGM4u_4tP31KnY7XunSP9N5xBHaV',
  '1k0O_ouF-AbnCYpXrn7j8If6jf8xXiu-s',
];

async function inspectFolder(id) {
  return new Promise((resolve) => {
    https.get(`https://drive.google.com/drive/folders/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(' - Google Drive', '') : 'Unknown';
        resolve({ id, title, statusCode: res.statusCode, length: data.length });
      });
    }).on('error', e => resolve({ id, error: e.message }));
  });
}

async function run() {
  console.log("Inspecting folder titles...\n");
  for (const fid of folderIds) {
    const res = await inspectFolder(fid);
    console.log(`[${res.id}] -> Title: "${res.title}" (Status: ${res.statusCode})`);
  }
}

run();
