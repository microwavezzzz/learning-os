const https = require('https');
const fs = require('fs');

const items = [
  // Semester 1 (TPB)
  { parent: 'Semester 1 (TPB)', id: '1sBXmsPauQkaqxrSZ_WZ5NauNss7a7gM3' },
  { parent: 'Semester 1 (TPB)', id: '10qpfPxeJIWAC6G0k0BsBDv9qJnmJLuR1' },
  { parent: 'Semester 1 (TPB)', id: '1oiIQfPprxBnCDnR9Uo3o6MSyyR-zWYBW' },
  { parent: 'Semester 1 (TPB)', id: '1HZbz0QPahpwm1W6NnWpodEH4RH6a1Qtw' },
  { parent: 'Semester 1 (TPB)', id: '1G8Uh4XNUk7HTUJI3KSbKJPpgfFyB-h74' },
  { parent: 'Semester 1 (TPB)', id: '1x-qstFT--Al3_tG7nTXdPgaFHkFK81Yz' },

  // Semester 2 (TPB)
  { parent: 'Semester 2 (TPB)', id: '1kyf6CgiAWrmHjgj5pVf9m6mw4OZ0976l' },
  { parent: 'Semester 2 (TPB)', id: '1ciMoJdN680LzchOlckW5eDFp9tgkn210' },
  { parent: 'Semester 2 (TPB)', id: '1kFQ4fIVybnaLqrQoxHcDxBQhl0X4_iPh' },
  { parent: 'Semester 2 (TPB)', id: '1YStDOk7zfTmCLFSMBKyOSW1G1knsbLxm' },
  { parent: 'Semester 2 (TPB)', id: '18ZjUmafiifSfuP7VeYdJrq2QNJ57BvUJ' },
  { parent: 'Semester 2 (TPB)', id: '1Gx3_jWZEzCrbjCK1WPAG5ZgkIUHlyYBm' },
  { parent: 'Semester 2 (TPB)', id: '1nYlM_PUBKnTONw3CPFPl53HZexWpQ4o_' },

  // MK Prodi Wajib
  { parent: 'MK Prodi Wajib', id: '1VMgmybYUGRlpQi38fn1ySfunJa1sUB3Q' },
  { parent: 'MK Prodi Wajib', id: '1-ANdqDPHgifFnF3lfmsuDC7HrHwXzdc6' },
  { parent: 'MK Prodi Wajib', id: '1H5TAiBcnT5y0VSsQJIUFWEpa2mWavCUm' },
  { parent: 'MK Prodi Wajib', id: '1JmWnXXFQENSK8ZkIWZNaHU3FhbTMmrYx' },
  { parent: 'MK Prodi Wajib', id: '1H3_A1gflSv4Kz9Z0R267II_ZPgun-pKx' },
  { parent: 'MK Prodi Wajib', id: '1kWqQtkmgAAEQ9urD_btDd6co7T_nDnNP' },
  { parent: 'MK Prodi Wajib', id: '1O9_5rPyf993Q0WIKYCPJaaLX30Gr9N1U' },
  { parent: 'MK Prodi Wajib', id: '14FxjVo52mViDqIDWr64tVjqbhXFN6j-d' },
  { parent: 'MK Prodi Wajib', id: '1q3ymVEbQZ2ND5PexdQNN3WBYP8VdZMqR' },
  { parent: 'MK Prodi Wajib', id: '1fjHlsAbnJ4iU9RleulqeRn9xNdDGS39s' },
  { parent: 'MK Prodi Wajib', id: '1YS2a3ZRy3V0QnflgIM8XixFIx1hWbGYI' },
  { parent: 'MK Prodi Wajib', id: '1saJ-scM_6fHuI4NuQgxo6SZvg75K-sqP' },
  { parent: 'MK Prodi Wajib', id: '18VV9FtOnKuxkUe7INBfbT_0CiecT8jFc' },
  { parent: 'MK Prodi Wajib', id: '1tSBWnMSKrTTXJjLn6CWKdMH0xjYxAXb8' },
  { parent: 'MK Prodi Wajib', id: '1PEAk0JbWm4XVhoG7cedQOXBDsGw-hJRN' },
  { parent: 'MK Prodi Wajib', id: '1EFAMP2mS8rbQi0ouBeFGDqPKnezqMYUD' },
  { parent: 'MK Prodi Wajib', id: '14wFr15Wj7wDZp5YDdH1JwFQxZFl7xbiL' },
  { parent: 'MK Prodi Wajib', id: '1-XPUR1rBgmWiLG7BgP5KAGJttMSdgTf8' },
  { parent: 'MK Prodi Wajib', id: '1V2SkKgplkyQ_UDhy5AXdUbnXvgPTgx2K' },
  { parent: 'MK Prodi Wajib', id: '1VGQoo1jupGnLYHANeY40SKDtLr5HmvH6' },
  { parent: 'MK Prodi Wajib', id: '1ZZKTdeQu8IGIICOY6h2murlWdOgoD2e6' },
  { parent: 'MK Prodi Wajib', id: '1Qn71UuhXZ3hGiYzsZIosn3uW4FqfLpJ8' },
  { parent: 'MK Prodi Wajib', id: '1eCtmVXaIXLkqEN8HgSDzXYLF4bv78Dg2' },
  { parent: 'MK Prodi Wajib', id: '1kyv69sdT1QHizjMUL4HETSEz6r1voqTp' },
  { parent: 'MK Prodi Wajib', id: '13s7Rv_VA79aOmyAp-z89_HeWZMjngTTL' },
  { parent: 'MK Prodi Wajib', id: '1XDfL4xkeIMDJrssekT-OR6AHD1tEvyQD' },
];

async function inspect(item) {
  return new Promise((resolve) => {
    https.get(`https://drive.google.com/drive/folders/${item.id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(' - Google Drive', '') : 'Unknown';
        resolve({ parent: item.parent, id: item.id, title, status: res.statusCode });
      });
    }).on('error', e => resolve({ parent: item.parent, id: item.id, title: 'Error: ' + e.message }));
  });
}

async function run() {
  console.log("Fetching all real course titles from Google Drive...\n");
  const results = [];
  for (const it of items) {
    const res = await inspect(it);
    console.log(`[${res.parent}] ${res.title} (ID: ${res.id})`);
    results.push(res);
  }
  fs.writeFileSync('real_gdrive_courses.json', JSON.stringify(results, null, 2));
}

run();
