const https = require('https');
const fs = require('fs');
const path = require('path');

const ids = [
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

async function checkDriveItem(id) {
  return new Promise((resolve) => {
    const url = `https://drive.google.com/uc?id=${id}&export=download`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      // Follow redirect if 302/303
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }, (res2) => {
          let cd = res2.headers['content-disposition'] || res.headers['content-disposition'] || '';
          let ct = res2.headers['content-type'] || res.headers['content-type'] || '';
          resolve({ id, statusCode: res2.statusCode, contentDisposition: cd, contentType: ct, size: res2.headers['content-length'] });
        }).on('error', (e) => resolve({ id, error: e.message }));
      } else {
        let cd = res.headers['content-disposition'] || '';
        let ct = res.headers['content-type'] || '';
        resolve({ id, statusCode: res.statusCode, contentDisposition: cd, contentType: ct, size: res.headers['content-length'] });
      }
    }).on('error', (e) => resolve({ id, error: e.message }));
  });
}

async function run() {
  console.log("Checking Google Drive file items...\n");
  for (const id of ids) {
    const info = await checkDriveItem(id);
    console.log(`ID: ${info.id}`, info);
  }
}

run();
