const http = require('http');

const files = [
  // Semester 1 (TPB)
  '/pdfs/bmsd/BMSD_Sem1_Kalkulus_1_Limit_Turunan_Integral.pdf',
  '/pdfs/bmsd/BMSD_Sem1_Fisika_Dasar_1_Mekanika_dan_Energi.pdf',
  '/pdfs/bmsd/BMSD_Sem1_Pengantar_Sains_Data_dan_Komputasi.pdf',
  // Semester 2 (TPB)
  '/pdfs/bmsd/BMSD_Sem2_Kalkulus_2_Deret_dan_Fungsi_Peubah_Banyak.pdf',
  '/pdfs/bmsd/BMSD_Sem2_Aljabar_Linear_Elementer_dan_Matriks.pdf',
  '/pdfs/bmsd/BMSD_Sem2_Dasar_Pemrograman_dan_Algoritma_Python.pdf',
  // Semester 3 (Prodi)
  '/pdfs/bmsd/BMSD_Sem3_Struktur_Data_dan_Algoritma.pdf',
  '/pdfs/bmsd/BMSD_Sem3_Teori_Probabilitas_dan_Statistika_Matematika.pdf',
  '/pdfs/bmsd/BMSD_Sem3_Sistem_Basis_Data_Relasional_dan_SQL.pdf',
  // Semester 4 (Prodi)
  '/pdfs/bmsd/BMSD_Sem4_Metode_Statistika_Inferensi_dan_Uji_Hipotesis.pdf',
  '/pdfs/bmsd/BMSD_Sem4_Aljabar_Linear_Terapan_dan_Optimasi.pdf',
  '/pdfs/bmsd/BMSD_Sem4_Analisis_Data_Eksploratif_dan_Visualisasi.pdf',
  // Semester 5 (Prodi)
  '/pdfs/bmsd/BMSD_Sem5_Pembelajaran_Mesin_Supervised_dan_Unsupervised.pdf',
  '/pdfs/bmsd/BMSD_Sem5_Komputasi_Paralel_dan_Sistem_Big_Data.pdf',
  '/pdfs/bmsd/BMSD_Sem5_Penambangan_Data_dan_Analisis_Deret_Waktu.pdf',
  // Semester 6 (Prodi)
  '/pdfs/bmsd/BMSD_Sem6_Pembelajaran_Mendalam_dan_Arsitektur_Transformer.pdf',
  '/pdfs/bmsd/BMSD_Sem6_Rekayasa_Data_dan_MLOps_Pipelines.pdf',
  '/pdfs/bmsd/BMSD_Sem6_Tata_Kelola_Data_Privasi_dan_Etika_AI.pdf',
  // General
  '/pdfs/Raft_Consensus_Protocol_Paper.pdf',
];

let pass = 0, fail = 0;
console.log('=== VERIFYING ACCESSIBILITY OF ALL BMSD SEMESTER PDF FILES ===\n');

files.forEach(function(f) {
  http.get('http://localhost:3000' + f, function(r) {
    const ct = r.headers['content-type'] || '';
    const ok = r.statusCode === 200;
    if (ok) pass++; else fail++;
    console.log((ok ? '✓ [OK]  ' : '✗ [FAIL]'), r.statusCode, ct.substring(0, 20), f);
    if (pass + fail === files.length) {
      console.log(`\nResult: ${pass}/${files.length} PDFs verified and accessible via HTTP!`);
    }
  }).on('error', function(e) {
    fail++;
    console.error('✗ [ERR]', f, e.message);
  });
});
