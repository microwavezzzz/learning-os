const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "../data/learning_os.db");
const db = new Database(dbPath);

console.log("=== INGESTING COMPLETE BMSD CURRICULUM BY SEMESTER (MATA KULIAH WAJIB) ===\n");

// Safe migrations
function safeAddColumn(table, column, definition) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  } catch (e) {
    if (!e.message || !e.message.includes("duplicate column name")) throw e;
  }
}

safeAddColumn("subjects", "semester", "INTEGER DEFAULT 1");
safeAddColumn("subjects", "course_type", "TEXT DEFAULT 'wajib'");
safeAddColumn("subjects", "sks", "INTEGER DEFAULT 3");
safeAddColumn("topics", "bloom_level", "TEXT DEFAULT 'understand'");
safeAddColumn("topics", "estimated_minutes", "INTEGER DEFAULT 60");
safeAddColumn("topics", "last_studied_at", "TEXT");

const userId = "demo-user-1";
const now = new Date().toISOString();

// 1. Definition of Semesters and Mandatory Courses (Mata Kuliah Wajib)
const semestersData = [
  {
    semesterNum: 1,
    semesterTitle: "Semester 1 (TPB)",
    level: "Tahap Persiapan Bersama",
    color: "#3b82f6", // Blue
    courses: [
      {
        code: "MA1101",
        title: "Kalkulus 1",
        sks: 4,
        desc: "Fungsi real, limit & kekontinuan, aturan rantai turunan, aplikasi optimasi ekstrim lokal, integral Riemann dan Teorema Dasar Kalkulus.",
        pdfName: "BMSD_Sem1_Kalkulus_1_Limit_Turunan_Integral.pdf",
        folder: "Semester_1_TPB",
        modules: [
          {
            heading: "Bab 1: Limit Fungsi & Kekontinuan",
            content: "Konsep limit mendefinisikan perilaku nilai f(x) saat x mendekati c. Teorema Apit (Squeeze Theorem) membuktikan limit fungsi trigonometri dasar lim_{x->0} sin(x)/x = 1. Kekontinuan di titik c mensyaratkan f(c) terdefinisi, limit ada, dan lim f(x) = f(c)."
          },
          {
            heading: "Bab 2: Turunan & Aplikasi Optimasi Ekstrem",
            content: "Turunan f'(x) merepresentasikan laju perubahan sesaat dan gradien garis singgung. Aplikasi optimasi menggunakan Uji Turunan Pertama dan Kedua untuk menemukan titik kritis, nilai maksimum/minimum global pada interval tertutup [a, b]."
          },
          {
            heading: "Bab 3: Integral Riemann & Teorema Dasar Kalkulus",
            content: "Integral tentu int_a^b f(x) dx didefinisikan sebagai limit jumlah Riemann. Teorema Dasar Kalkulus menghubungkan diferensiasi dan integrasi: jika F'(x) = f(x), maka int_a^b f(x) dx = F(b) - F(a)."
          }
        ],
        concept: { id: "c-calc1-tdk", title: "Teorema Dasar Kalkulus", def: "Teorema fundamental yang menyatakan bahwa integrasi adalah operasi invers dari diferensiasi.", formula: "d/dx [int_a^x f(t) dt] = f(x)" },
        question: {
          prompt: "Berdasarkan Teorema Dasar Kalkulus Bagian 1, jika g(x) = int_0^x (t^2 + 1) dt, berapakah nilai dari turunan g'(x)?",
          options: ["x^2 + 1", "2x", "(x^3)/3 + x", "2t"],
          correct: "x^2 + 1",
          explanation: "Teorema Dasar Kalkulus Bagian 1 menyatakan bahwa turunan dari fungsi akumulasi integral terhadap batas atas x adalah fungsi integran dievaluasi pada x, yaitu f(x) = x^2 + 1."
        }
      },
      {
        code: "FI1101",
        title: "Fisika Dasar 1",
        sks: 4,
        desc: "Kinematika partikel, dinamika gerak Hukum Newton, kerja dan energi, momentum linear, dinamika rotasi, dan hukum termodinamika.",
        pdfName: "BMSD_Sem1_Fisika_Dasar_1_Mekanika_dan_Energi.pdf",
        folder: "Semester_1_TPB",
        modules: [
          {
            heading: "Bab 1: Vektor & Kinematika Partikel",
            content: "Posisi r(t), kecepatan v(t) = dr/dt, dan percepatan a(t) = dv/dt dalam koordinat Cartesius. Gerak parabola memisahkan komponen horizontal berkecepatan konstan dan vertikal dengan percepatan gravitasi g."
          },
          {
            heading: "Bab 2: Hukum Newton & Konservasi Energi",
            content: "Hukum II Newton Sigma F = m*a mendasari analisis gaya. Hukum Kekekalan Energi Mekanik menyatakan E_mek = E_pot + E_kin konstan pada sistem terisolasi tanpa gaya disipatif non-konservatif."
          }
        ],
        concept: { id: "c-phys1-kons", title: "Hukum Kekekalan Energi Mekanik", def: "Jumlah energi kinetik dan potensial tetap konstan dalam medan gaya konservatif.", formula: "E_m = 1/2 m v^2 + m g h = text{konstan}" },
        question: {
          prompt: "Sebuah benda bermassa m jatuh bebas dari ketinggian h tanpa gesekan udara. Berapakah kecepatannya sesaat sebelum menyentuh tanah?",
          options: ["v = sqrt(2gh)", "v = 2gh", "v = mgh", "v = sqrt(gh)"],
          correct: "v = sqrt(2gh)",
          explanation: "Berdasarkan konservasi energi: m*g*h = 1/2*m*v^2, sehingga v = sqrt(2gh)."
        }
      },
      {
        code: "SD1101",
        title: "Pengantar Sains Data & Komputasi",
        sks: 3,
        desc: "Siklus hidup sains data, computational thinking, representasi data, etika data, dan pengenalan ekosistem Python ilmiah.",
        pdfName: "BMSD_Sem1_Pengantar_Sains_Data_dan_Komputasi.pdf",
        folder: "Semester_1_TPB",
        modules: [
          {
            heading: "Bab 1: Fondasi & Siklus Hidup Sains Data",
            content: "Sains data menggabungkan keahlian domain, matematika/statistika, dan ilmu komputer (Diagram Venn Conway). Siklus hidup data meliputi pengumpulan (acquisition), pembersihan (cleansing), eksplorasi (EDA), pemodelan, dan penyampaian wawasan (storytelling)."
          },
          {
            heading: "Bab 2: Ekosistem Python Ilmiah (NumPy & Pandas)",
            content: "NumPy menyediakan struktur array multidimensi ndarray teroptimasi C untuk komputasi vektorisasi cepat. Pandas menyediakan struktur data DataFrame dan Series yang memfasilitasi manipulasi data tabel tabular terstruktur."
          }
        ],
        concept: { id: "c-sd-dslifecycle", title: "Siklus Hidup Sains Data (CRISP-DM)", def: "Standar metodologi pemrosesan data sains dari pemahaman bisnis hingga deployment model.", formula: "Business -> Data -> Prep -> Model -> Eval -> Deploy" },
        question: {
          prompt: "Struktur data utama dalam pustaka Pandas yang merepresentasikan tabel dua dimensi dengan label baris dan kolom adalah?",
          options: ["DataFrame", "Series", "ndarray", "Dictionary"],
          correct: "DataFrame",
          explanation: "Pandas DataFrame adalah struktur data tabular 2 dimensi yang mutable dengan baris dan kolom berlabel."
        }
      }
    ]
  },
  {
    semesterNum: 2,
    semesterTitle: "Semester 2 (TPB)",
    level: "Tahap Persiapan Bersama",
    color: "#0ea5e9", // Sky
    courses: [
      {
        code: "MA1201",
        title: "Kalkulus 2",
        sks: 4,
        desc: "Teknik pengintegralan, bentuk tak tentu & integral tak wajar, deret tak hingga, deret Taylor, fungsi peubah banyak, dan turunan parsial.",
        pdfName: "BMSD_Sem2_Kalkulus_2_Deret_dan_Fungsi_Peubah_Banyak.pdf",
        folder: "Semester_2_TPB",
        modules: [
          {
            heading: "Bab 1: Teknik Integrasi & Deret Taylor",
            content: "Integrasi parsial int u dv = uv - int v du diturunkan dari aturan perkalian. Deret Taylor merepresentasikan fungsi f(x) di sekitar a sebagai deret pangkat: f(x) = sum_{n=0}^infty [f^(n)(a) / n!] * (x - a)^n."
          },
          {
            heading: "Bab 2: Turunan Parsial & Gradien",
            content: "Untuk fungsi peubah banyak f(x, y), turunan parsial df/dx mengukur laju perubahan terhadap x dengan menjaga y konstan. Vektor gradien grad f = [df/dx, df/dy]^T menunjuk ke arah kenaikan tercepat dari fungsi."
          }
        ],
        concept: { id: "c-calc2-taylor", title: "Deret Taylor", def: "Representasi aproksimasi fungsi analitik sebagai jumlahan suku polinomial tak hingga.", formula: "f(x) = sum_{n=0}^infty frac{f^{(n)}(a)}{n!} (x-a)^n" },
        question: {
          prompt: "Vektor gradien dari fungsi multivariat f(x, y) selalu menunjuk ke arah mana?",
          options: [
            "Arah laju kenaikan nilai fungsi yang paling curam (tercepat)",
            "Arah garis kontur bernilai konstan",
            "Arah di mana turunan parsial bernilai nol",
            "Arah berlawanan dengan titik stasioner"
          ],
          correct: "Arah laju kenaikan nilai fungsi yang paling curam (tercepat)",
          explanation: "Vektor gradien menunjuk ke arah laju pertumbuhan maksimum, sedangkan minus gradien menunjuk ke penurunan tercuram (prinsip gradient descent)."
        }
      },
      {
        code: "MA1202",
        title: "Aljabar Linear Elementer",
        sks: 3,
        desc: "Sistem persamaan linear, eliminasi Gauss-Jordan, determinan, ruang vektor R^n, basis & dimensi, nilai eigen dan vektor eigen.",
        pdfName: "BMSD_Sem2_Aljabar_Linear_Elementer_dan_Matriks.pdf",
        folder: "Semester_2_TPB",
        modules: [
          {
            heading: "Bab 1: Sistem Persamaan Linear & Eliminasi Gauss-Jordan",
            content: "Sistem Ax = b diselesaikan dengan operasi baris elementer (OBE) untuk mereduksi matriks augmented [A|b] menjadi bentuk eselon baris tereduksi (RREF). Sistem memiliki solusi tunggal jika rank(A) = rank([A|b]) = n."
          },
          {
            heading: "Bab 2: Ruang Vektor, Basis, & Nilai Eigen",
            content: "Himpunan vektor {v1, ..., vk} membentuk basis jika bebas linear dan merentang ruang vektor V. Nilai eigen lambda dan vektor eigen v memenuhi det(A - lambda*I) = 0 melalui persamaan karakteristik."
          }
        ],
        concept: { id: "c-ale-eigen", title: "Persamaan Karakteristik Nilai Eigen", def: "Persamaan determinan untuk menentukan nilai eigen suatu matriks persegi.", formula: "det(A - lambda I) = 0" },
        question: {
          prompt: "Sebuah matriks persegi A memiliki nilai determinan det(A) = 0. Manakah pernyataan yang BENAR?",
          options: [
            "Matriks A bersifat singular dan tidak memiliki invers (A^-1)",
            "Matriks A selalu bernilai simetris",
            "Matriks A memiliki rank penuh",
            "Sistem persamaan Ax = 0 hanya memiliki solusi trivial"
          ],
          correct: "Matriks A bersifat singular dan tidak memiliki invers (A^-1)",
          explanation: "Determinan nol berarti baris-baris matriks saling bergantung linear, sehingga matriks tidak invertible (singular)."
        }
      },
      {
        code: "IF1201",
        title: "Dasar Pemrograman & Algoritma",
        sks: 4,
        desc: "Logika pemrograman, tipe data, struktur kendali (percabangan & perulangan), fungsi & rekursi, serta kompleksitas algoritma Big-O.",
        pdfName: "BMSD_Sem2_Dasar_Pemrograman_dan_Algoritma_Python.pdf",
        folder: "Semester_2_TPB",
        modules: [
          {
            heading: "Bab 1: Logika Pemrograman & Struktur Kontrol",
            content: "Algoritma dirancang dengan pendekatan imperatif dan fungsional. Struktur percabangan if-elif-else dan perulangan for/while mengontrol alur eksekusi logika program secara deterministik."
          },
          {
            heading: "Bab 2: Fungsi, Rekursi, & Analisis Big-O",
            content: "Fungsi modular meningkatkan keterbacaan kode. Analisis kompleksitas waktu Big-O mengukur skalabilitas algoritma saat ukuran input n membesar: O(1) < O(log n) < O(n) < O(n log n) < O(n^2)."
          }
        ],
        concept: { id: "c-algo-bigo", title: "Notasi Asimtotik Big-O", def: "Notasi batas atas formal untuk kompleksitas waktu eksekusi algoritma.", formula: "T(n) <= c cdot g(n) quad text{untuk } n ge n_0" },
        question: {
          prompt: "Kompleksitas waktu rata-rata dari algoritma pencarian biner (Binary Search) pada array terurut adalah?",
          options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
          correct: "O(log n)",
          explanation: "Binary Search membagi ruang pencarian menjadi dua di setiap langkah perbandingan, menghasilkan kompleksitas logaritmik O(log n)."
        }
      }
    ]
  },
  {
    semesterNum: 3,
    semesterTitle: "Semester 3 (Prodi)",
    level: "Tahap Program Studi",
    color: "#10b981", // Emerald
    courses: [
      {
        code: "SD2101",
        title: "Struktur Data & Algoritma",
        sks: 4,
        desc: "Array, linked list, stack, queue, pohon biner pencarian (BST), heap, tabel hash, traversal graf (BFS/DFS), dan pemrograman dinamis.",
        pdfName: "BMSD_Sem3_Struktur_Data_dan_Algoritma.pdf",
        folder: "Semester_3_Prodi",
        modules: [
          {
            heading: "Bab 1: Struktur Data Linier & Tabel Hash",
            content: "Stack menerapkan prinsip LIFO (Last In First Out), sedangkan Queue menerapkan FIFO. Tabel hash memetakan kunci ke indeks memori melalui fungsi hash h(k) dengan resolusi tabrakan chaining atau open addressing (waktu akses O(1) amortized)."
          },
          {
            heading: "Bab 2: Pohon Biner & Graf Traversal",
            content: "Binary Search Tree (BST) mempertahankan invarian anak kiri < node < anak kanan. Traversal graf BFS (Breadth-First Search) menggunakan antrean (queue) untuk jalur terpendek tak berbobot, sedangkan DFS (Depth-First Search) memanfaatkan tumpukan rekursif."
          }
        ],
        concept: { id: "c-dsa-hash", title: "Tabel Hash & Collision Resolution", def: "Struktur data pencarian kunci-nilai cepat dengan kompleksitas rata-rata O(1).", formula: "Index = hash(key) bmod M" },
        question: {
          prompt: "Prinsip antrean manakah yang diterapkan oleh struktur data Stack?",
          options: ["LIFO (Last In, First Out)", "FIFO (First In, First Out)", "Priority Queue", "Random Access"],
          correct: "LIFO (Last In, First Out)",
          explanation: "Stack menyisipkan dan mengeluarkan elemen dari ujung yang sama (top) sehingga elemen terakhir yang masuk akan pertama kali keluar (LIFO)."
        }
      },
      {
        code: "SD2102",
        title: "Teori Probabilitas & Statistika Matematika",
        sks: 4,
        desc: "Ruang probabilitas Kolmogorov, Teorema Bayes, variabel acak diskrit & kontinu, momen & fungsi pembangkit momen (MGF), dan Hukum Bilangan Besar.",
        pdfName: "BMSD_Sem3_Teori_Probabilitas_dan_Statistika_Matematika.pdf",
        folder: "Semester_3_Prodi",
        modules: [
          {
            heading: "Bab 1: Variabel Acak & Distribusi Teoretis",
            content: "Variabel acak diskrit dimodelkan oleh Probability Mass Function (PMF) seperti Binomial dan Poisson. Variabel acak kontinu dimodelkan oleh Probability Density Function (PDF) f(x) >= 0 di mana int_{-infty}^infty f(x) dx = 1."
          },
          {
            heading: "Bab 2: Ekspektasi, Kovariansi, & Teorema Limit Pusat",
            content: "Ekspektasi E[X] dan Variansi Var(X) = E[X^2] - (E[X])^2 mengukur tendensi sentral dan dispersi. Kovariansi Cov(X, Y) = E[(X-mu_X)(Y-mu_Y)] mengukur relasi linear bersama antara dua variabel acak."
          }
        ],
        concept: { id: "c-prob-clt", title: "Central Limit Theorem (CLT)", def: "Teorema bahwa rata-rata sampel dari variabel acak i.i.d akan berdistribusi normal saat n mendekati tak hingga.", formula: "bar{X}_n stackrel{d}{to} mathcal{N}(mu, frac{sigma^2}{n})" },
        question: {
          prompt: "Jika variabel acak X dan Y saling bebas (independen), berapakah nilai kovariansi Cov(X, Y)?",
          options: ["0 (Nol)", "1", "E[X] * E[Y]", "Var(X) + Var(Y)"],
          correct: "0 (Nol)",
          explanation: "Dua variabel independen memiliki E[XY] = E[X]E[Y], sehingga Cov(X, Y) = E[XY] - E[X]E[Y] = 0."
        }
      },
      {
        code: "SD2103",
        title: "Sistem Basis Data & SQL",
        sks: 3,
        desc: "Model relasional data, normalisasi bentuk 1NF hingga BCNF, aljabar relasional, query SQL tingkat lanjut, indexing B-Tree, dan transaksi ACID.",
        pdfName: "BMSD_Sem3_Sistem_Basis_Data_Relasional_dan_SQL.pdf",
        folder: "Semester_3_Prodi",
        modules: [
          {
            heading: "Bab 1: Pemodelan Relasional & Normalisasi",
            content: "Normalisasi mereduksi redundansi dan anomali modifikasi data: 1NF (nilai atomik), 2NF (bebas ketergantungan parsial pada primary key), 3NF (bebas ketergantungan transitif), dan BCNF."
          },
          {
            heading: "Bab 2: Query SQL & Properti Transaksi ACID",
            content: "Perintah SQL menggabungkan SELECT, JOIN (INNER/LEFT), GROUP BY, dan window functions. Transaksi basis data menjamin prinsip ACID: Atomicity, Consistency, Isolation, dan Durability."
          }
        ],
        concept: { id: "c-db-acid", title: "Prinsip Transaksi ACID", def: "Empat pilar keandalan transaksi basis data: Atomisitas, Konsistensi, Isolasi, dan Durabilitas.", formula: "ACID = {Atomicity, Consistency, Isolation, Durability}" },
        question: {
          prompt: "Bentuk normalisasi basis data yang menghilangkan ketergantungan fungsional transitif (A -> B dan B -> C) adalah?",
          options: ["Third Normal Form (3NF)", "First Normal Form (1NF)", "Second Normal Form (2NF)", "Zero Normal Form"],
          correct: "Third Normal Form (3NF)",
          explanation: "3NF mensyaratkan relasi sudah berada dalam 2NF dan setiap atribut non-primer tidak bergantung secara transitif pada primary key."
        }
      }
    ]
  },
  {
    semesterNum: 4,
    semesterTitle: "Semester 4 (Prodi)",
    level: "Tahap Program Studi",
    color: "#6366f1", // Indigo
    courses: [
      {
        code: "SD2201",
        title: "Metode Statistika Inferensi",
        sks: 3,
        desc: "Estimasi titik dan interval kepercayaan, Maximum Likelihood Estimation (MLE), uji hipotesis parametrik (t-test, ANOVA) & non-parametrik, p-values.",
        pdfName: "BMSD_Sem4_Metode_Statistika_Inferensi_dan_Uji_Hipotesis.pdf",
        folder: "Semester_4_Prodi",
        modules: [
          {
            heading: "Bab 1: Estimasi Parameter & Maximum Likelihood",
            content: "Maximum Likelihood Estimation (MLE) mengestimasi parameter theta dengan memaksimumkan fungsi log-likelihood: theta_hat = argmax sum ln p(xi|theta). Estimator tak bias memiliki E[theta_hat] = theta."
          },
          {
            heading: "Bab 2: Uji Hipotesis & Signifikansi Statistik",
            content: "Uji hipotesis mengukur probabilitas p-value terhadap tingkat signifikansi alpha. Kesalahan Tipe I (False Positive) terjadi ketika menolak H0 padahal H0 benar; Kesalahan Tipe II (False Negative) terjadi ketika gagal menolak H0 yang salah."
          }
        ],
        concept: { id: "c-stat-mle", title: "Maximum Likelihood Estimator", def: "Metode estimasi parameter dengan mencari nilai yang memaksimalkan probabilitas data observasi.", formula: "hat{theta}_{MLE} = argmax sum_{i=1}^n ln p(x_i | theta)" },
        question: {
          prompt: "Situasi di mana uji statistik menolak hipotesis nol (H0) padahal hipotesis nol sebenarnya benar disebut sebagai?",
          options: ["Kesalahan Tipe I (Type I Error / False Positive)", "Kesalahan Tipe II (Type II Error)", "Standard Error", "Confidence Interval"],
          correct: "Kesalahan Tipe I (Type I Error / False Positive)",
          explanation: "Type I error terjadi jika kita menolak H0 yang benar, dengan probabilitas terjadinya sama dengan tingkat signifikansi alpha."
        }
      },
      {
        code: "SD2202",
        title: "Aljabar Linear Terapan & Optimasi",
        sks: 3,
        desc: "Singular Value Decomposition (SVD), Principal Component Analysis (PCA), optimasi konveks, kondisi KKT, algoritma Gradient Descent & Newton-Raphson.",
        pdfName: "BMSD_Sem4_Aljabar_Linear_Terapan_dan_Optimasi.pdf",
        folder: "Semester_4_Prodi",
        modules: [
          {
            heading: "Bab 1: SVD & Reduksi Dimensi PCA",
            content: "Faktorisasi matriks SVD X = U * Sigma * V^T memecah data ke dalam komponen variansi ortogonal. PCA memproyeksikan fitur ke vektor eigen matriks kovariansi untuk mereduksi dimensi data multivariat."
          },
          {
            heading: "Bab 2: Optimasi Konveks & Gradient Descent",
            content: "Fungsi konveks f menjamin setiap minimum lokal adalah minimum global. Algoritma Gradient Descent memperbarui bobot: w := w - eta * grad f(w). Metode Newton-Raphson memanfaatkan matriks Hessian orde kedua H^(-1) * grad f."
          }
        ],
        concept: { id: "c-opt-svd", title: "Singular Value Decomposition (SVD)", def: "Faktorisasi matriks data ke dalam matriks ortogonal dan nilai singular untuk kompresi dan reduksi dimensi.", formula: "X = U Sigma V^T" },
        question: {
          prompt: "Mengapa fungsi tujuan yang bersifat konveks sangat disukai dalam algoritma optimasi Machine Learning?",
          options: [
            "Karena setiap titik minimum lokal dijamin merupakan titik minimum global",
            "Karena tidak memerlukan turunan kalkulus sama sekali",
            "Karena fungsi konveks selalu bernilai konstan",
            "Karena matriks Hessian selalu bernilai nol"
          ],
          correct: "Karena setiap titik minimum lokal dijamin merupakan titik minimum global",
          explanation: "Sifat konveksitas menjamin tidak adanya jebakan local minima semu sehingga algoritma gradien pasti berkonvergensi ke solusi optimal global."
        }
      },
      {
        code: "SD2203",
        title: "Analisis Data Eksploratif & Visualisasi",
        sks: 3,
        desc: "Data wrangling, penanganan missing values, deteksi outlier IQR, visualisasi data univariat/bivariat/multivariat, dan narasi data interaktif.",
        pdfName: "BMSD_Sem4_Analisis_Data_Eksploratif_dan_Visualisasi.pdf",
        folder: "Semester_4_Prodi",
        modules: [
          {
            heading: "Bab 1: Data Cleansing & Deteksi Outlier",
            content: "Pembersihan data menangani duplikasi dan imputasi missing value. Metode IQR mendeteksi outlier di luar rentang [Q1 - 1.5*IQR, Q3 + 1.5*IQR]. Transformasi logaritma menormalkan distribusi data yang memiliki kemiringan positif (right-skewed)."
          },
          {
            heading: "Bab 2: Prinsip Visualisasi & Tata Letak Grafik",
            content: "Grammar of Graphics memisahkan data, estetika (aesthetic mapping), dan geometri. Boxplot memvisualisasikan ringkasan 5 angka statistik; Heatmap korelasi menampilkan koefisien Pearson antar pasangan fitur."
          }
        ],
        concept: { id: "c-eda-iqr", title: "Interquartile Range (IQR) Outlier Rule", def: "Metode deteksi data pencilan statistik berdasarkan jangkauan kuartil data.", formula: "text{IQR} = Q_3 - Q_1, quad text{Batas} = [Q_1 - 1.5 text{IQR}, Q_3 + 1.5 text{IQR}]" },
        question: {
          prompt: "Visualisasi grafik manakah yang paling efektif untuk membandingkan sebaran distribusi, median, dan deteksi outlier antar beberapa grup kategori data?",
          options: ["Boxplot (Box and Whisker Plot)", "Pie Chart", "Line Chart", "Scatter Plot"],
          correct: "Boxplot (Box and Whisker Plot)",
          explanation: "Boxplot secara padat menampilkan median, kuartil Q1/Q3, rentang IQR, serta titik-titik outlier yang melewati batas whisker."
        }
      }
    ]
  },
  {
    semesterNum: 5,
    semesterTitle: "Semester 5 (Prodi)",
    level: "Tahap Program Studi",
    color: "#f59e0b", // Amber
    courses: [
      {
        code: "SD3101",
        title: "Pembelajaran Mesin (Machine Learning)",
        sks: 4,
        desc: "Regresi linear & logistik, regularisasi L1/L2, Support Vector Machines (SVM), Decision Trees, Random Forest, XGBoost, K-Means, dan DBSCAN.",
        pdfName: "BMSD_Sem5_Pembelajaran_Mesin_Supervised_dan_Unsupervised.pdf",
        folder: "Semester_5_Prodi",
        modules: [
          {
            heading: "Bab 1: Supervised Learning & Regularisasi",
            content: "Model klasifikasi dan regresi dilatih dengan meminimalkan fungsi loss empiris. Regularisasi Ridge (L2) mencegah bobot ekstrem; Lasso (L1) menghasilkan bobot nol untuk seleksi fitur otomatis (model sparse)."
          },
          {
            heading: "Bab 2: Ensemble Learning & Algoritma Boosting",
            content: "Random Forest mereduksi variansi dengan bagging pohon keputusan acak. Gradient Boosting (XGBoost) melatih pohon secara sekuensial untuk memprediksi residual error dari model sebelumnya."
          },
          {
            heading: "Bab 3: Unsupervised Clustering (K-Means & DBSCAN)",
            content: "K-Means meminimalkan variansi intra-klaster (WCSS). DBSCAN mengelompokkan data berdasarkan kerapatan spasial (density-based) tanpa asumsi bentuk bola dan otomatis menyaring titik noise."
          }
        ],
        concept: { id: "c-ml-xgboost", title: "Gradient Boosted Trees", def: "Ansambel sekuensial pohon keputusan yang dioptimalkan terhadap gradien fungsi kerugian.", formula: "F_m(x) = F_{m-1}(x) + gamma_m h_m(x)" },
        question: {
          prompt: "Manakah perbedaan mendasar antara metode Bagging (Random Forest) dan Boosting (XGBoost)?",
          options: [
            "Bagging melatih pohon secara independen/paralel, sedangkan Boosting melatih pohon secara sekuensial memperbaiki residual error",
            "Bagging hanya untuk regresi, sedangkan Boosting hanya untuk klasifikasi",
            "Boosting tidak memerlukan hyperparameter apapun",
            "Bagging selalu menghasilkan akurasi 100%"
          ],
          correct: "Bagging melatih pohon secara independen/paralel, sedangkan Boosting melatih pohon secara sekuensial memperbaiki residual error",
          explanation: "Bagging mereduksi variansi dengan merata-ratakan model independen, sedangkan Boosting mereduksi bias dengan melatih model baru pada error model sebelumnya."
        }
      },
      {
        code: "SD3102",
        title: "Komputasi Paralel & Big Data",
        sks: 3,
        desc: "Paradigma MapReduce, ekosistem Apache Hadoop/Spark, Resilient Distributed Datasets (RDD), in-memory computing, dan streaming pipeline terdistribusi.",
        pdfName: "BMSD_Sem5_Komputasi_Paralel_dan_Sistem_Big_Data.pdf",
        folder: "Semester_5_Prodi",
        modules: [
          {
            heading: "Bab 1: Arsitektur Big Data & Apache Spark RDD",
            content: "Apache Spark menyediakan komputasi in-memory terdistribusi. RDD bersifat immutable dan fault-tolerant melalui pencatatan Lineage Graph, memungkinkan partisi yang hilang dihitung ulang tanpa replikasi disk berkali-kali."
          },
          {
            heading: "Bab 2: Spark Catalyst Optimizer & Streaming",
            content: "Spark SQL mengoptimalkan query logis ke rencana fisik melalui predicate pushdown dan projection pruning. Structured Streaming memproses data kontinu berlatensi sub-detik."
          }
        ],
        concept: { id: "c-bigdata-rdd", title: "Resilient Distributed Dataset (RDD)", def: "Koleksi data terdistribusi in-memory dengan toleransi kesalahan berbasis graf silsilah operasi.", formula: "RDD = Transformation(LineageGraph)" },
        question: {
          prompt: "Bagaimana mekanisme Apache Spark mencapai toleransi kegagalan (fault tolerance) pada partisi memori yang rusak?",
          options: [
            "Menghitung ulang partisi yang hilang menggunakan catatan graf silsilah (lineage graph)",
            "Menyimpan duplikasi data di seluruh hard disk komputer",
            "Menghentikan seluruh proses klaster komputasi",
            "Meminta pengguna memasukkan data ulang secara manual"
          ],
          correct: "Menghitung ulang partisi yang hilang menggunakan catatan graf silsilah (lineage graph)",
          explanation: "Lineage Graph merekam urutan transformasi deterministik sehingga Spark hanya perlu menghitung ulang partisi yang rusak dari data sumber."
        }
      },
      {
        code: "SD3103",
        title: "Analisis Deret Waktu & Penambangan Data",
        sks: 3,
        desc: "Stasioneritas deret waktu, uji Dickey-Fuller, model ARIMA/SARIMA, peramalan tren dan musiman, serta Association Rule Mining (Apriori).",
        pdfName: "BMSD_Sem5_Penambangan_Data_dan_Analisis_Deret_Waktu.pdf",
        folder: "Semester_5_Prodi",
        modules: [
          {
            heading: "Bab 1: Stasioneritas & Model ARIMA",
            content: "Deret waktu stasioner memiliki mean dan variansi konstan sepanjang waktu. Diferensiasi d menstabilkan tren; model ARIMA(p, d, q) menggabungkan komponen autoregressive (AR) dan moving average (MA)."
          },
          {
            heading: "Bab 2: Association Rule Mining & Algoritma Apriori",
            content: "Market Basket Analysis mengidentifikasi asosiasi item (X -> Y) menggunakan metrik Support = P(X cap Y), Confidence = P(Y|X), dan Lift = P(X cap Y) / [P(X)*P(Y)]. Nilai Lift > 1 menandakan asosiasi positif."
          }
        ],
        concept: { id: "c-ts-arima", title: "Model ARIMA Deret Waktu", def: "Model peramalan statistik menggabungkan autoregresi, diferensiasi stasioner, dan moving average.", formula: "Phi(B)(1-B)^d X_t = Theta(B) epsilon_t" },
        question: {
          prompt: "Dalam Market Basket Analysis, aturan asosiasi (X -> Y) memiliki nilai Lift = 2.5. Apa artinya?",
          options: [
            "Kemungkinan pembelian produk Y meningkat 2.5 kali lipat saat produk X dibeli bersamaan",
            "Produk X dan Y tidak memiliki hubungan sama sekali",
            "Produk Y selalu dibeli 2.5 kali lebih sedikit daripada produk X",
            "Nilai confidence dari aturan tersebut adalah 2.5%"
          ],
          correct: "Kemungkinan pembelian produk Y meningkat 2.5 kali lipat saat produk X dibeli bersamaan",
          explanation: "Lift > 1 mengindikasikan bahwa kehadiran item X secara signifikan meningkatkan kecenderungan pembelian item Y dibandingkan kejadian acak independen."
        }
      }
    ]
  },
  {
    semesterNum: 6,
    semesterTitle: "Semester 6 (Prodi)",
    level: "Tahap Program Studi",
    color: "#a855f7", // Purple
    courses: [
      {
        code: "SD3201",
        title: "Pembelajaran Mendalam (Deep Learning)",
        sks: 4,
        desc: "Multilayer Perceptron, Backpropagation & Autograd, Convolutional Neural Networks (CNN), Recurrent Neural Networks (LSTM), dan Arsitektur Transformer Self-Attention.",
        pdfName: "BMSD_Sem6_Pembelajaran_Mendalam_dan_Arsitektur_Transformer.pdf",
        folder: "Semester_6_Prodi",
        modules: [
          {
            heading: "Bab 1: Jaringan Saraf Tiruan & Backpropagation",
            content: "Neuron buatan menghitung kombinasi linear z = w^T*x + b yang dilanjutkan fungsi aktivasi non-linear (ReLU, GELU). Algoritma Backpropagation menghitung gradien parsial loss terhadap bobot menggunakan aturan rantai diferensial kalkulus."
          },
          {
            heading: "Bab 2: Arsitektur Transformer & Scaled Dot-Product Attention",
            content: "Transformer memproses seluruh urutan token secara paralel melalui mekanisme Self-Attention: Attention(Q, K, V) = softmax((Q*K^T)/sqrt(d_k))*V. Multi-Head Attention memungkinkan model menangkap dependensi sintaksis dan semantis dari berbagai representasi laten."
          }
        ],
        concept: { id: "c-dl-attention", title: "Scaled Dot-Product Self-Attention", def: "Mekanisme kalkulasi relasi relevansi kontekstual antar token dalam arsitektur Transformer.", formula: "Attention(Q, K, V) = text{softmax}left(frac{Q K^T}{sqrt{d_k}}right) V" },
        question: {
          prompt: "Mengapa perkalian matriks Query dan Key (Q * K^T) dalam rumus Attention Transformer dibagi dengan faktor skalar sqrt(d_k)?",
          options: [
            "Untuk mencegah nilai dot-product menjadi terlalu besar yang menyebabkan vanishing gradient pada fungsi softmax",
            "Untuk mengubah output menjadi bilangan bulat",
            "Untuk menghapus token yang bernilai negatif",
            "Agar ukuran matriks menjadi lebih kecil"
          ],
          correct: "Untuk mencegah nilai dot-product menjadi terlalu besar yang menyebabkan vanishing gradient pada fungsi softmax",
          explanation: "Pada dimensi kunci d_k yang besar, magnitude dot-product membesar sehingga gradien softmax mendekati nol (vanishing gradient). Pembagian dengan sqrt(d_k) menstabilkan variansi."
        }
      },
      {
        code: "SD3202",
        title: "Rekayasa Data & MLOps Pipelines",
        sks: 3,
        desc: "Orkestrasi pipeline data (Airflow), Feature Store, model tracking (MLflow), automated CI/CD for ML, drift detection, dan deployment model mikroservis.",
        pdfName: "BMSD_Sem6_Rekayasa_Data_dan_MLOps_Pipelines.pdf",
        folder: "Semester_6_Prodi",
        modules: [
          {
            heading: "Bab 1: Orkestrasi Pipeline Data & Feature Store",
            content: "Data pipeline diorkestrasi menggunakan Directed Acyclic Graph (DAG) untuk menjamin eksekusi tugas yang teratur dan idempoten. Feature Store menyatukan rekayasa fitur antara fase pelatihan (offline) dan inferensi produksi (online real-time)."
          },
          {
            heading: "Bab 2: Model Monitoring, Data Drift, & CI/CD",
            content: "Monitoring model mendeteksi Concept Drift (perubahan relasi P(Y|X)) dan Data Drift (perubahan distribusi fitur P(X)). Pipeline CI/CD mengotomatiskan pengujian unit, validasi metrik, dan deployment model tanpa downtime."
          }
        ],
        concept: { id: "c-mlops-drift", title: "Data Drift & Concept Drift", def: "Pergeseran distribusi data statistik atau fungsi target di lingkungan produksi yang menurunkan performa model.", formula: "text{Data Drift}: P_t(X) neq P_0(X), quad text{Concept Drift}: P_t(Y|X) neq P_0(Y|X)" },
        question: {
          prompt: "Kondisi di mana distribusi statistik input fitur berubah di lingkungan produksi P_t(X) != P_0(X) namun hubungan relasi fungsi target tetap sama disebut sebagai?",
          options: ["Data Drift (Covariate Shift)", "Concept Drift", "Model Overfitting", "Vanishing Gradient"],
          correct: "Data Drift (Covariate Shift)",
          explanation: "Data Drift merujuk pada perubahan distribusi probabilitas input fitur X dari waktu ke waktu meskipun fungsi pemetaan Y|X tidak berubah."
        }
      },
      {
        code: "SD3203",
        title: "Tata Kelola Data & Etika AI",
        sks: 3,
        desc: "Regulasi privasi data (GDPR & UU PDP), keadilan algoritma (fairness), Explainable AI (SHAP & LIME), differential privacy, dan mitigasi bias data.",
        pdfName: "BMSD_Sem6_Tata_Kelola_Data_Privasi_dan_Etika_AI.pdf",
        folder: "Semester_6_Prodi",
        modules: [
          {
            heading: "Bab 1: Regulasi Privasi Data & Differential Privacy",
            content: "Kepatuhan privasi data melindungi Personally Identifiable Information (PII) melalui teknik anonimisasi dan pseudonimisasi. Differential Privacy menambahkan noise terukur (mekanisme Laplace) untuk melindungi privasi individu pada agregasi dataset."
          },
          {
            heading: "Bab 2: Keadilan Algoritma & Explainable AI (XAI)",
            content: "Algoritma AI harus bebas dari bias diskriminatif terhadap kelompok rentan. Pustaka Explainable AI (XAI) seperti SHAP (Shapley Additive Explanations) mengukur kontribusi marginal setiap fitur terhadap keputusan prediksi akhir model."
          }
        ],
        concept: { id: "c-xai-shap", title: "Shapley Additive Explanations (SHAP)", def: "Metode pengukuran kontribusi marginal fitur terhadap output model berbasis teori permainan kooperatif.", formula: "phi_i(v) = sum_{S subseteq N setminus {i}} frac{|S|! (|N|-|S|-1)!}{|N|!} [v(S cup {i}) - v(S)]" },
        question: {
          prompt: "Metode Explainable AI yang mengukur kontribusi matematis setiap fitur terhadap hasil prediksi berdasarkan teori permainan kooperatif adalah?",
          options: ["SHAP (Shapley Additive Explanations)", "Grid Search", "Batch Normalization", "Dropout"],
          correct: "SHAP (Shapley Additive Explanations)",
          explanation: "SHAP mengadaptasi nilai Shapley dari teori permainan Nobel Prize untuk menghitung kontribusi aditif yang adil dari setiap fitur terhadap prediksi model."
        }
      }
    ]
  }
];

// 2. Generate PDF and ingest into database
async function ingestAll() {
  const baseDir = path.join(__dirname, "../public/pdfs/bmsd");
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  let totalFiles = 0;
  let totalChunks = 0;

  for (let sem of semestersData) {
    console.log(`\n======================================================`);
    console.log(`INGESTING ${sem.semesterTitle.toUpperCase()} (${sem.courses.length} MATA KULIAH WAJIB)`);
    console.log(`======================================================`);

    const semFolder = path.join(baseDir, sem.courses[0].folder);
    if (!fs.existsSync(semFolder)) fs.mkdirSync(semFolder, { recursive: true });

    for (let cIdx = 0; cIdx < sem.courses.length; cIdx++) {
      const course = sem.courses[cIdx];
      const subjectId = `sub-bmsd-sem${sem.semesterNum}-${course.code.toLowerCase()}`;
      const topicId = `top-bmsd-sem${sem.semesterNum}-${course.code.toLowerCase()}`;
      const fileId = `mat-bmsd-sem${sem.semesterNum}-${course.code.toLowerCase()}`;
      const pdfFilePath = path.join(semFolder, course.pdfName);
      const directPdfPath = path.join(baseDir, course.pdfName);

      console.log(`\n[${cIdx + 1}/${sem.courses.length}] Processing: ${course.code} - ${course.title}...`);

      // A. Create Real PDF Document
      const doc = await PDFDocument.create();
      const primaryColor = rgb(0.1, 0.35, 0.8);
      const darkColor = rgb(0.12, 0.14, 0.17);
      const subColor = rgb(0.4, 0.45, 0.5);

      const hBold = await doc.embedFont(StandardFonts.HelveticaBold);
      const hRegular = await doc.embedFont(StandardFonts.Helvetica);
      const hItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

      for (let pIdx = 0; pIdx < course.modules.length; pIdx++) {
        const mod = course.modules[pIdx];
        const page = doc.addPage([595.28, 841.89]); // A4 Size
        const { width, height } = page.getSize();

        // Top decorative bar
        page.drawRectangle({
          x: 40,
          y: height - 50,
          width: width - 80,
          height: 3,
          color: primaryColor,
        });

        // Header on first page
        if (pIdx === 0) {
          page.drawText(`${course.code} — ${course.title}`, {
            x: 40,
            y: height - 90,
            size: 16,
            font: hBold,
            color: primaryColor,
          });

          page.drawText(`Bank Materi Sains Data (BMSD) • ${sem.semesterTitle} • Mata Kuliah Wajib (${course.sks} SKS)`, {
            x: 40,
            y: height - 110,
            size: 9.5,
            font: hItalic,
            color: subColor,
          });

          // Metadata Callout Box
          page.drawRectangle({
            x: 40,
            y: height - 165,
            width: width - 80,
            height: 42,
            color: rgb(0.95, 0.97, 1.0),
            borderColor: rgb(0.8, 0.88, 0.98),
            borderWidth: 1,
          });

          page.drawText(`Deskripsi Mata Kuliah:`, {
            x: 50,
            y: height - 140,
            size: 8.5,
            font: hBold,
            color: primaryColor,
          });

          page.drawText(course.desc.substring(0, 95) + "...", {
            x: 50,
            y: height - 153,
            size: 8.5,
            font: hRegular,
            color: darkColor,
          });
        }

        // Section Heading
        const headingY = pIdx === 0 ? height - 195 : height - 85;
        page.drawText(mod.heading, {
          x: 40,
          y: headingY,
          size: 13,
          font: hBold,
          color: primaryColor,
        });

        // Content word wrapping
        let currentY = headingY - 24;
        const words = mod.content.split(" ");
        let line = "";
        for (const w of words) {
          const testLine = line + (line ? " " : "") + w;
          if (testLine.length > 76) {
            page.drawText(line, { x: 40, y: currentY, size: 10, font: hRegular, color: darkColor });
            line = w;
            currentY -= 15;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page.drawText(line, { x: 40, y: currentY, size: 10, font: hRegular, color: darkColor });
          currentY -= 20;
        }

        // Formula callout if present on first module
        if (pIdx === 0 && course.concept && course.concept.formula) {
          page.drawRectangle({
            x: 40,
            y: currentY - 35,
            width: width - 80,
            height: 32,
            color: rgb(0.98, 0.98, 0.98),
            borderColor: rgb(0.85, 0.85, 0.85),
            borderWidth: 1,
          });

          page.drawText(`Rumus Kunci (${course.concept.title}):`, {
            x: 50,
            y: currentY - 18,
            size: 8,
            font: hBold,
            color: primaryColor,
          });

          page.drawText(course.concept.formula, {
            x: 50,
            y: currentY - 30,
            size: 8.5,
            font: hItalic,
            color: darkColor,
          });
        }

        // Footer
        page.drawText(`Bank Materi Sains Data (BMSD) • Halaman ${pIdx + 1} dari ${course.modules.length}`, {
          x: 40,
          y: 35,
          size: 8,
          font: hRegular,
          color: subColor,
        });

        page.drawText(`Learning OS — ${sem.semesterTitle}`, {
          x: width - 180,
          y: 35,
          size: 8,
          font: hItalic,
          color: primaryColor,
        });
      }

      const pdfBytes = await doc.save();
      fs.writeFileSync(pdfFilePath, pdfBytes);
      fs.writeFileSync(directPdfPath, pdfBytes);

      const driveUrl = `/pdfs/bmsd/${course.pdfName}`;

      // B. Insert or Update Subject
      const existingSub = db.prepare(`SELECT * FROM subjects WHERE id = ?`).get(subjectId);
      if (!existingSub) {
        db.prepare(`
          INSERT INTO subjects (id, user_id, title, description, color, icon, order_index, semester, course_type, sks, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          subjectId,
          userId,
          `${course.code} - ${course.title}`,
          course.desc,
          sem.color,
          "book-open",
          sem.semesterNum * 10 + cIdx,
          sem.semesterNum,
          "wajib",
          course.sks,
          now,
          now
        );
      } else {
        db.prepare(`
          UPDATE subjects 
          SET semester = ?, course_type = 'wajib', sks = ?, title = ?, description = ?, color = ?
          WHERE id = ?
        `).run(sem.semesterNum, course.sks, `${course.code} - ${course.title}`, course.desc, sem.color, subjectId);
      }

      // C. Insert or Update Topic
      const existingTop = db.prepare(`SELECT * FROM topics WHERE id = ?`).get(topicId);
      if (!existingTop) {
        db.prepare(`
          INSERT INTO topics (id, subject_id, parent_id, title, description, status, difficulty, mastery, bloom_level, estimated_minutes, prerequisites, related_materials, order_index, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          topicId,
          subjectId,
          null,
          course.title,
          course.desc,
          "not_started",
          "intermediate",
          45.0,
          "apply",
          90,
          "[]",
          JSON.stringify([{ title: course.pdfName, url: driveUrl, type: "gdrive" }]),
          cIdx,
          now,
          now
        );
      }

      // D. Insert or Update Material File
      const existingMat = db.prepare(`SELECT * FROM material_files WHERE id = ?`).get(fileId);
      if (!existingMat) {
        db.prepare(`
          INSERT INTO material_files (id, user_id, subject_id, topic_id, name, mime_type, drive_file_id, drive_url, size_bytes, status, page_count, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          fileId,
          userId,
          subjectId,
          topicId,
          course.pdfName,
          "application/pdf",
          `1p5n-bmsd-sem${sem.semesterNum}-${course.code.toLowerCase()}`,
          driveUrl,
          pdfBytes.length,
          "completed",
          course.modules.length,
          now,
          now
        );
      } else {
        db.prepare(`
          UPDATE material_files
          SET drive_url = ?, size_bytes = ?, page_count = ?, status = 'completed', subject_id = ?, topic_id = ?
          WHERE id = ?
        `).run(driveUrl, pdfBytes.length, course.modules.length, subjectId, topicId, fileId);
      }

      // E. Insert Material Chunks
      for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
        const mod = course.modules[mIdx];
        const chunkId = `chk-${fileId}-${mIdx}`;
        const existingChunk = db.prepare(`SELECT * FROM material_chunks WHERE id = ?`).get(chunkId);
        if (!existingChunk) {
          db.prepare(`
            INSERT INTO material_chunks (id, material_id, chunk_index, page_number, section_heading, content, token_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            chunkId,
            fileId,
            mIdx,
            mIdx + 1,
            mod.heading,
            mod.content,
            Math.round(mod.content.length / 4),
            now
          );
        }
        totalChunks++;
      }

      // F. Concept
      if (course.concept) {
        const existingCon = db.prepare(`SELECT * FROM concepts WHERE id = ?`).get(course.concept.id);
        if (!existingCon) {
          db.prepare(`
            INSERT INTO concepts (id, topic_id, title, definition, key_formula, bloom_level, order_index, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            course.concept.id,
            topicId,
            course.concept.title,
            course.concept.def,
            course.concept.formula,
            "understand",
            0,
            now,
            now
          );
        }
      }

      // G. Active Recall Question
      const qId = `q-${fileId}`;
      const existingQ = db.prepare(`SELECT * FROM questions WHERE id = ?`).get(qId);
      if (!existingQ) {
        db.prepare(`
          INSERT INTO questions (id, topic_id, concept_id, material_chunk_id, type, difficulty, prompt, options_json, correct_answer, explanation, source_reference, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          qId,
          topicId,
          course.concept?.id || null,
          `chk-${fileId}-0`,
          "multiple_choice",
          3,
          course.question.prompt,
          JSON.stringify(course.question.options),
          course.question.correct,
          course.question.explanation,
          `${course.pdfName}, Page 1`,
          now
        );
      }

      totalFiles++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`INGESTION COMPLETE: ${totalFiles} PDF FILES & ${totalChunks} CHUNKS CREATED ACROSS 6 SEMESTERS`);
  console.log(`======================================================`);
}

ingestAll().catch(console.error);
