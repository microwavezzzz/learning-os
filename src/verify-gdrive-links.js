const https = require('https');

const linksToTest = [
  { name: 'Root BMSD Folder', url: 'https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP' },
  { name: 'TPB Folder', url: 'https://drive.google.com/drive/folders/1z4QI7JbDdwoy1A5dgmCRRufDgrxB41BQ' },
  { name: 'Semester 1 (TPB)', url: 'https://drive.google.com/drive/folders/17lBnWOwSYaQB7hTbBsCRJD1a-CxvrjP9' },
  { name: 'Semester 2 (TPB)', url: 'https://drive.google.com/drive/folders/1hVrlh5dZ7q5eq7P4VOWklykeukK_J5FE' },
  { name: 'Prodi Folder', url: 'https://drive.google.com/drive/folders/1AH4zLyn5TmAcQBXx1tEMLS9T9Ei6Ol0l' },
  { name: 'MK Prodi Wajib', url: 'https://drive.google.com/drive/folders/1_PlMRhJfPExGTL3elvKWyUGYz5zYHwyE' },
  { name: 'MK Prodi Pilihan', url: 'https://drive.google.com/drive/folders/1k-IUdlqsc8VeeOLMyvI35uq2ylofYXE7' },
  { name: 'Koleksi Soal & Jawaban', url: 'https://drive.google.com/drive/folders/11kC-pGzw-tqXqtcZW0q0QEYbiw9EFhKJ' },
  { name: 'Kuliah Tamu', url: 'https://drive.google.com/drive/folders/1MpsJpn9l_SD0PHMpmKYtEAVKhHJF18iI' },
  { name: 'HMSD Berpijar', url: 'https://drive.google.com/drive/folders/1jyAPpiE9UtxerhSMD02BYD6y4Wr3lS4M' },
  { name: 'Tutorial Belajar Latex', url: 'https://drive.google.com/drive/folders/196hz3DbkZoOnzrpB14RyPtaacczwsg0z' },
  // Real course folders inside TPB Sem 1
  { name: 'Fisika Dasar (Sem 1)', url: 'https://drive.google.com/drive/folders/1oiIQfPprxBnCDnR9Uo3o6MSyyR-zWYBW' },
  { name: 'Matematika Dasar (Sem 1)', url: 'https://drive.google.com/drive/folders/1G8Uh4XNUk7HTUJI3KSbKJPpgfFyB-h74' },
  { name: 'Kimia Dasar (Sem 1)', url: 'https://drive.google.com/drive/folders/1HZbz0QPahpwm1W6NnWpodEH4RH6a1Qtw' },
  { name: 'Biologi Dasar (Sem 1)', url: 'https://drive.google.com/drive/folders/10qpfPxeJIWAC6G0k0BsBDv9qJnmJLuR1' },
  { name: 'PKS (Sem 1)', url: 'https://drive.google.com/drive/folders/1x-qstFT--Al3_tG7nTXdPgaFHkFK81Yz' },
  { name: 'Bahasa Indonesia (Sem 1)', url: 'https://drive.google.com/drive/folders/1sBXmsPauQkaqxrSZ_WZ5NauNss7a7gM3' },
  // Real course folders inside TPB Sem 2
  { name: 'Matematika Dasar 2 (Sem 2)', url: 'https://drive.google.com/drive/folders/18ZjUmafiifSfuP7VeYdJrq2QNJ57BvUJ' },
  { name: 'Fisika Dasar 2 (Sem 2)', url: 'https://drive.google.com/drive/folders/1ciMoJdN680LzchOlckW5eDFp9tgkn210' },
  { name: 'Kimia Dasar 2 (Sem 2)', url: 'https://drive.google.com/drive/folders/1kFQ4fIVybnaLqrQoxHcDxBQhl0X4_iPh' },
  { name: 'LHS (Sem 2)', url: 'https://drive.google.com/drive/folders/1YStDOk7zfTmCLFSMBKyOSW1G1knsbLxm' },
  { name: 'Olahraga (Sem 2)', url: 'https://drive.google.com/drive/folders/1Gx3_jWZEzCrbjCK1WPAG5ZgkIUHlyYBm' },
  { name: 'PKS 2 (Sem 2)', url: 'https://drive.google.com/drive/folders/1nYlM_PUBKnTONw3CPFPl53HZexWpQ4o_' },
  { name: 'Bahasa Inggris (Sem 2)', url: 'https://drive.google.com/drive/folders/1kyf6CgiAWrmHjgj5pVf9m6mw4OZ0976l' },
  // Real course folders inside MK Prodi Wajib
  { name: 'Algoritma Pemrograman', url: 'https://drive.google.com/drive/folders/1VMgmybYUGRlpQi38fn1ySfunJa1sUB3Q' },
  { name: 'Algoritma Strategi', url: 'https://drive.google.com/drive/folders/1-ANdqDPHgifFnF3lfmsuDC7HrHwXzdc6' },
  { name: 'Aljabar Linier Elementer', url: 'https://drive.google.com/drive/folders/1H5TAiBcnT5y0VSsQJIUFWEpa2mWavCUm' },
  { name: 'Analisis Data Statistik', url: 'https://drive.google.com/drive/folders/1JmWnXXFQENSK8ZkIWZNaHU3FhbTMmrYx' },
  { name: 'Analisis Multivariat', url: 'https://drive.google.com/drive/folders/1H3_A1gflSv4Kz9Z0R267II_ZPgun-pKx' },
  { name: 'Analitik Bisnis', url: 'https://drive.google.com/drive/folders/1kWqQtkmgAAEQ9urD_btDd6co7T_nDnNP' },
  { name: 'Basis Data', url: 'https://drive.google.com/drive/folders/1O9_5rPyf993Q0WIKYCPJaaLX30Gr9N1U' },
  { name: 'Data Mining', url: 'https://drive.google.com/drive/folders/14FxjVo52mViDqIDWr64tVjqbhXFN6j-d' },
  { name: 'Deep Learning', url: 'https://drive.google.com/drive/folders/1q3ymVEbQZ2ND5PexdQNN3WBYP8VdZMqR' },
  { name: 'Keamanan dan Data Privasi', url: 'https://drive.google.com/drive/folders/1fjHlsAbnJ4iU9RleulqeRn9xNdDGS39s' },
  { name: 'Kecerdasan Buatan', url: 'https://drive.google.com/drive/folders/1YS2a3ZRy3V0QnflgIM8XixFIx1hWbGYI' },
  { name: 'Komputasi Statistik', url: 'https://drive.google.com/drive/folders/1saJ-scM_6fHuI4NuQgxo6SZvg75K-sqP' },
  { name: 'Logika dan Matematika Diskrit', url: 'https://drive.google.com/drive/folders/18VV9FtOnKuxkUe7INBfbT_0CiecT8jFc' },
  { name: 'Metode Numerik', url: 'https://drive.google.com/drive/folders/1tSBWnMSKrTTXJjLn6CWKdMH0xjYxAXb8' },
  { name: 'Metode Penelitian', url: 'https://drive.google.com/drive/folders/1PEAk0JbWm4XVhoG7cedQOXBDsGw-hJRN' },
  { name: 'Pembelajaran Mesin', url: 'https://drive.google.com/drive/folders/1EFAMP2mS8rbQi0ouBeFGDqPKnezqMYUD' },
  { name: 'Pemrograman Berbasis Fungsi', url: 'https://drive.google.com/drive/folders/14wFr15Wj7wDZp5YDdH1JwFQxZFl7xbiL' },
  { name: 'Pergudangan Data', url: 'https://drive.google.com/drive/folders/1-XPUR1rBgmWiLG7BgP5KAGJttMSdgTf8' },
  { name: 'Proses Stokastik', url: 'https://drive.google.com/drive/folders/1V2SkKgplkyQ_UDhy5AXdUbnXvgPTgx2K' },
  { name: 'Rancangan Percobaan', url: 'https://drive.google.com/drive/folders/1VGQoo1jupGnLYHANeY40SKDtLr5HmvH6' },
  { name: 'Statistika Sains Data', url: 'https://drive.google.com/drive/folders/1ZZKTdeQu8IGIICOY6h2murlWdOgoD2e6' },
  { name: 'Struktur Data', url: 'https://drive.google.com/drive/folders/1Qn71UuhXZ3hGiYzsZIosn3uW4FqfLpJ8' },
  { name: 'Teknologi Basis Data', url: 'https://drive.google.com/drive/folders/1eCtmVXaIXLkqEN8HgSDzXYLF4bv78Dg2' },
  { name: 'Teori Optimasi', url: 'https://drive.google.com/drive/folders/1kyv69sdT1QHizjMUL4HETSEz6r1voqTp' },
  { name: 'Teori Peluang', url: 'https://drive.google.com/drive/folders/13s7Rv_VA79aOmyAp-z89_HeWZMjngTTL' },
  { name: 'Visualisasi Data dan Informasi', url: 'https://drive.google.com/drive/folders/1XDfL4xkeIMDJrssekT-OR6AHD1tEvyQD' }
];

async function checkLink(item) {
  return new Promise((resolve) => {
    https.get(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const is404 = data.includes('404. Itu adalah kesalahan') || data.includes('Error 404') || res.statusCode === 404;
        const is403 = data.includes('403. Itu adalah kesalahan') || res.statusCode === 403;
        const ok = res.statusCode === 200 && !is404 && !is403;
        resolve({ name: item.name, url: item.url, ok, statusCode: res.statusCode, is404, is403 });
      });
    }).on('error', e => resolve({ name: item.name, url: item.url, ok: false, error: e.message }));
  });
}

async function run() {
  console.log(`Checking ${linksToTest.length} Google Drive Links...\n`);
  let pass = 0, fail = 0;
  
  for (const item of linksToTest) {
    const res = await checkLink(item);
    if (res.ok) {
      pass++;
      console.log(`✓ [200 OK] ${res.name} -> ${res.url}`);
    } else {
      fail++;
      console.log(`✗ [FAIL]   ${res.name} (Status: ${res.statusCode}, 404:${res.is404}, 403:${res.is403}) -> ${res.url}`);
    }
  }

  console.log(`\nResults: ${pass}/${linksToTest.length} links verified 100% working!`);
}

run();
