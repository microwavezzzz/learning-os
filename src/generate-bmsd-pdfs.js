const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "../data/learning_os.db");
const db = new Database(dbPath);

console.log("=== GENERATING PHYSICAL PDF FILES FOR BANK MATERI SAINS DATA (BMSD) ===\n");

// Ensure public directories exist
const baseDir = path.join(__dirname, "../public/materials");
const bmsdDir = path.join(baseDir, "bmsd");

const folders = [
  "01_Matematika_Dasar",
  "02_Data_Wrangling",
  "03_Machine_Learning",
  "04_Deep_Learning_AI",
  "05_Big_Data_Systems",
];

if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
if (!fs.existsSync(bmsdDir)) fs.mkdirSync(bmsdDir, { recursive: true });

folders.forEach((f) => {
  const fPath = path.join(bmsdDir, f);
  if (!fs.existsSync(fPath)) fs.mkdirSync(fPath, { recursive: true });
});

const pdfDefinitions = [
  {
    folder: "01_Matematika_Dasar",
    fileId: "mat-bmsd-01-linalg",
    fileName: "BMSD_Modul_01_Aljabar_Linear_dan_Matriks.pdf",
    title: "Modul 01: Aljabar Linear & Dekomposisi Matriks",
    subtitle: "Bank Materi Sains Data (BMSD) — Fondasi Komputasi & Reduksi Dimensi",
    pages: [
      {
        heading: "Bab 1: Ruang Vektor & Transformasi Linear",
        paragraphs: [
          "Aljabar linear merupakan fondasi matematis utama dalam sains data modern. Titik data multivariat direpresentasikan sebagai vektor x in R^n dalam ruang fitur.",
          "Transformasi linear T(x) = Ax memetakan fitur ke ruang koordinat baru yang mempertahankan operasi penjumlahan dan perkalian skalar.",
          "Matriks simetris dan definit positif memegang peranan krusial dalam pendefinisian jarak Mahalanobis dan matriks kovariansi data observasi.",
        ],
      },
      {
        heading: "Bab 2: Nilai Eigen & Vektor Eigen (Eigenvalues & Eigenvectors)",
        paragraphs: [
          "Untuk matriks persegi A in R^(n x n), vektor tak nol v disebut vektor eigen jika memenuhi persamaan Av = lambda * v, dengan lambda sebagai nilai eigen skalar.",
          "Nilai eigen menentukan magnitudo peregangan atau pemampatan sepanjang arah vektor eigen tanpa mengubah orientasi rotasi sumbu koordinat.",
          "Aplikasi utama mencakup penentuan sumbu utama dalam elipsoid sebaran data dan analisis kestabilan sistem linear dinamis.",
        ],
      },
      {
        heading: "Bab 3: Singular Value Decomposition (SVD) & PCA",
        paragraphs: [
          "SVD mendekomposisi sembarang matriks data X in R^(m x n) menjadi X = U * Sigma * V^T, di mana U dan V adalah matriks ortogonal dan Sigma memuat nilai singular terurut menurun.",
          "Principal Component Analysis (PCA) memanfaatkan kolom dari matriks V sebagai vektor bobot proyeksi untuk memaksimalkan variansi data terproyeksi.",
          "Formula PCA: Memaksimalkan w^T * S * w terhadap kendala w^T * w = 1 menghasilkan vektor eigen dominan dari matriks kovariansi sampel S.",
        ],
      },
    ],
  },
  {
    folder: "01_Matematika_Dasar",
    fileId: "mat-bmsd-02-prob",
    fileName: "BMSD_Modul_02_Teori_Probabilitas_dan_Distribusi.pdf",
    title: "Modul 02: Teori Probabilitas & Variabel Acak",
    subtitle: "Bank Materi Sains Data (BMSD) — Inferensi Bayesian & Teorema Limit Pusat",
    pages: [
      {
        heading: "Bab 1: Aksioma Probabilitas & Teorema Bayes",
        paragraphs: [
          "Teori probabilitas menguantifikasi ketidakpastian dalam proses stokastik dan pemodelan data empiris.",
          "Teorema Bayes: P(theta|D) = [P(D|theta) * P(theta)] / P(D). Ini memformulasikan proses updating posterior distribution berdasarkan prior belief dan likelihood observasi data D.",
          "Probabilitas bersyarat dan independensi stokastik adalah asumsi dasar dalam pengklasifikasi Naive Bayes dan Graphical Models.",
        ],
      },
      {
        heading: "Bab 2: Distribusi Gaussian Multivariat & CLT",
        paragraphs: [
          "Distribusi Gaussian multivariat N(mu, Sigma) dimodelkan dengan fungsi densitas f(x) = (2*pi)^(-k/2) * |Sigma|^(-1/2) * exp(-0.5 * (x-mu)^T * Sigma^(-1) * (x-mu)).",
          "Central Limit Theorem (CLT) membuktikan bahwa rata-rata dari n variabel acak independen akan berkonvergensi ke distribusi normal terlepas dari bentuk distribusi aslinya.",
        ],
      },
    ],
  },
  {
    folder: "02_Data_Wrangling",
    fileId: "mat-bmsd-03-eda",
    fileName: "BMSD_Modul_03_EDA_dan_Feature_Engineering.pdf",
    title: "Modul 03: Exploratory Data Analysis & Feature Engineering",
    subtitle: "Bank Materi Sains Data (BMSD) — Pembersihan Data, Outlier, & Normalisasi",
    pages: [
      {
        heading: "Bab 1: Penanganan Missing Values & Kategori",
        paragraphs: [
          "Tipe missing data: MCAR (Missing Completely at Random), MAR (Missing at Random), dan MNAR (Missing Not at Random).",
          "Metode imputasi: Mean/Median untuk data numerik simetris, KNN Imputer, dan MICE (Multivariate Imputation by Chained Equations).",
          "Encoding variabel kategorikal: One-Hot Encoding untuk nominal berfrekuensi rendah, dan Target/Frequency Encoding untuk kardinalitas tinggi.",
        ],
      },
      {
        heading: "Bab 2: Deteksi Outlier & Penskalaan Fitur",
        paragraphs: [
          "Deteksi outlier statistik menggunakan metode Interquartile Range (IQR): Batas Atas = Q3 + 1.5*IQR, Batas Bawah = Q1 - 1.5*IQR.",
          "Penskalaan fitur: StandardScaler z = (x - mu) / sigma menghasilkan mean 0 dan variansi 1, sangat krusial bagi model berbasis jarak (KNN, SVM, K-Means).",
        ],
      },
    ],
  },
  {
    folder: "02_Data_Wrangling",
    fileId: "mat-bmsd-04-mle",
    fileName: "BMSD_Modul_04_Statistical_Inference.pdf",
    title: "Modul 04: Inferensi Statistik & Parameter Estimation",
    subtitle: "Bank Materi Sains Data (BMSD) — Maximum Likelihood Estimation & Hypothesis Testing",
    pages: [
      {
        heading: "Bab 1: Maximum Likelihood Estimation (MLE)",
        paragraphs: [
          "MLE mengestimasi parameter model theta yang memaksimalkan fungsi likelihood data observasi L(theta|X) = prod p(xi|theta).",
          "Fungsi Log-Likelihood ln L(theta) mengubah perkalian menjadi penjumlahan untuk kestabilan floating-point numerik dan kemudahan kalkulasi gradien diferensial.",
        ],
      },
      {
        heading: "Bab 2: Pengujian Hipotesis & Signifikansi (p-value)",
        paragraphs: [
          "Uji hipotesis membandingkan H0 (nol) dan H1 (alternatif) menggunakan statistik uji seperti t-statistic atau F-statistic.",
          "Nilai p-value < alpha (0.05) menunjukkan bukti yang cukup kuat untuk menolak hipotesis nol demi hipotesis alternatif.",
        ],
      },
    ],
  },
  {
    folder: "03_Machine_Learning",
    fileId: "mat-bmsd-05-supervised",
    fileName: "BMSD_Modul_05_Supervised_Learning.pdf",
    title: "Modul 05: Supervised Learning — Regresi & Klasifikasi",
    subtitle: "Bank Materi Sains Data (BMSD) — Loss Functions, L1/L2 Regularization, Gradient Descent",
    pages: [
      {
        heading: "Bab 1: Regresi Linear & Mean Squared Error",
        paragraphs: [
          "Regresi linear memodelkan relasi f(x) = w^T * x + b. Model dioptimalkan dengan meminimalkan Mean Squared Error (MSE).",
          "Optimasi Gradient Descent: w := w - alpha * dMSE/dw memperbarui parameter sepanjang arah gradien negatif tercuram.",
        ],
      },
      {
        heading: "Bab 2: Regresi Logistik & Binary Cross-Entropy",
        paragraphs: [
          "Regresi logistik memetakan kombinasi linear ke probabilitas [0, 1] melalui aktivasi Sigmoid sigma(z) = 1 / (1 + exp(-z)).",
          "Fungsi kerugian Binary Cross-Entropy bersifat konveks, menjamin algoritma optimasi selalu menemukan global minimum.",
        ],
      },
      {
        heading: "Bab 3: Regularisasi L1 (Lasso) vs L2 (Ridge)",
        paragraphs: [
          "Ridge (L2) menambahkan penalti kuadrat lambda * ||w||_2^2 untuk mencegah bobot ekstrem.",
          "Lasso (L1) menambahkan penalti absolut lambda * ||w||_1 yang mendorong bobot yang tidak penting tepat menjadi nol (seleksi fitur otomatis).",
        ],
      },
    ],
  },
  {
    folder: "03_Machine_Learning",
    fileId: "mat-bmsd-06-ensemble",
    fileName: "BMSD_Modul_06_Tree_Models_dan_Ensemble.pdf",
    title: "Modul 06: Tree Models & Ensemble Learning",
    subtitle: "Bank Materi Sains Data (BMSD) — Random Forest, AdaBoost, Gradient Boosting, XGBoost",
    pages: [
      {
        heading: "Bab 1: Decision Trees & Kriteria Pemisahan",
        paragraphs: [
          "Pohon keputusan membagi ruang fitur secara rekursif menggunakan kriteria Gini Impurity G = 1 - sum p_i^2 atau Entropy.",
          "Information Gain mengukur penurunan ketidakmurnian setelah pemisahan node.",
        ],
      },
      {
        heading: "Bab 2: Bagging & Random Forest",
        paragraphs: [
          "Bagging (Bootstrap Aggregating) melatih sejumlah pohon keputusan secara paralel pada subset data yang disampel dengan pengembalian.",
          "Random Forest menambahkan feature bagging (pemilihan subset fitur acak) pada setiap split untuk mereduksi korelasi antar pohon dan memangkas variansi.",
        ],
      },
      {
        heading: "Bab 3: Gradient Boosting & XGBoost",
        paragraphs: [
          "Boosting melatih pohon secara sekuensial, di mana setiap model baru berfokus memprediksi pseudo-residuals (selisih error) dari ansambel sebelumnya.",
          "XGBoost memperkenalkan regularisasi pohon, komputasi gradien orde kedua (Hessian), dan paralelisasi split histogram.",
        ],
      },
    ],
  },
  {
    folder: "03_Machine_Learning",
    fileId: "mat-bmsd-07-clustering",
    fileName: "BMSD_Modul_07_Clustering_dan_Unsupervised.pdf",
    title: "Modul 07: Unsupervised Learning & Clustering",
    subtitle: "Bank Materi Sains Data (BMSD) — K-Means, Silhouette Score, DBSCAN",
    pages: [
      {
        heading: "Bab 1: K-Means Clustering & Evaluasi Klaster",
        paragraphs: [
          "K-Means mempartisi data menjadi K klaster dengan meminimalkan Within-Cluster Sum of Squares (WCSS).",
          "Silhouette Coefficient s = (b - a) / max(a, b) mengukur seberapa rapat titik terhadap klasternya sendiri dibandingkan klaster terdekat.",
        ],
      },
      {
        heading: "Bab 2: Density-Based Clustering (DBSCAN)",
        paragraphs: [
          "DBSCAN mengelompokkan titik berdasarkan kerapatan densitas spasial menggunakan parameter radius eps dan minPts.",
          "Keunggulan DBSCAN: Mampu menemukan klaster berbentuk non-linear tak beraturan dan otomatis menyaring outlier sebagai noise.",
        ],
      },
    ],
  },
  {
    folder: "04_Deep_Learning_AI",
    fileId: "mat-bmsd-08-deeplearning",
    fileName: "BMSD_Modul_08_Deep_Learning_dan_Transformers.pdf",
    title: "Modul 08: Deep Learning & Neural Network Architectures",
    subtitle: "Bank Materi Sains Data (BMSD) — MLP, Backpropagation, CNN, Transformers Self-Attention",
    pages: [
      {
        heading: "Bab 1: Multilayer Perceptron & Backpropagation",
        paragraphs: [
          "Jaringan saraf tiruan menghubungkan neuron berlapis dengan fungsi aktivasi non-linear seperti ReLU(z) = max(0, z).",
          "Algoritma Backpropagation menerapkan aturan rantai kalkulus untuk menghitung gradien parsial loss terhadap seluruh matriks bobot jaringan.",
        ],
      },
      {
        heading: "Bab 2: Arsitektur Transformer & Self-Attention",
        paragraphs: [
          "Transformer memproses token secara paralel menggunakan mekanisme Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V.",
          "Multi-Head Attention memungkinkan model menangkap relasi sintaktis dan semantis token dari berbagai subruang representasi berbeda.",
        ],
      },
    ],
  },
  {
    folder: "04_Deep_Learning_AI",
    fileId: "mat-bmsd-09-evaluation",
    fileName: "BMSD_Modul_09_Evaluasi_Model_dan_Validasi.pdf",
    title: "Modul 09: Evaluasi Model & Validasi Metrik",
    subtitle: "Bank Materi Sains Data (BMSD) — Confusion Matrix, Precision, Recall, ROC-AUC, K-Fold",
    pages: [
      {
        heading: "Bab 1: Confusion Matrix & F1-Score",
        paragraphs: [
          "Precision = TP / (TP + FP) mengukur akurasi prediksi positif. Recall = TP / (TP + FN) mengukur daya tangkap kasus positif riil.",
          "F1-Score adalah rata-rata harmonik Precision dan Recall, sangat krusial pada dataset dengan kelas timpang (imbalanced data).",
        ],
      },
      {
        heading: "Bab 2: Kurva ROC-AUC & K-Fold Cross Validation",
        paragraphs: [
          "Kurva ROC memplot True Positive Rate terhadap False Positive Rate pada seluruh spektrum threshold keputusan.",
          "K-Fold Cross-Validation membagi dataset menjadi K partisi untuk mengestimasi performa generalisasi model secara tidak bias.",
        ],
      },
    ],
  },
  {
    folder: "05_Big_Data_Systems",
    fileId: "mat-bmsd-10-bigdata",
    fileName: "BMSD_Modul_10_Big_Data_Analytics.pdf",
    title: "Modul 10: Big Data Processing & Distributed Analytics",
    subtitle: "Bank Materi Sains Data (BMSD) — Apache Spark RDD, Catalyst Optimizer, Stream Processing",
    pages: [
      {
        heading: "Bab 1: Paradigma Komputasi Terdistribusi & Spark RDD",
        paragraphs: [
          "Apache Spark menyediakan komputasi in-memory terdistribusi berbasis Resilient Distributed Datasets (RDD).",
          "Toleransi kesalahan dicapai melalui pencatatan Lineage Graph, memungkinkan partisi data yang hilang dihitung ulang tanpa replikasi disk penuh.",
        ],
      },
      {
        heading: "Bab 2: Spark SQL & Catalyst Optimizer",
        paragraphs: [
          "Catalyst Optimizer secara otomatis mengoptimalkan query logis menjadi rencana eksekusi fisik (predicate pushdown, column pruning).",
          "Pipeline Lambda dan Kappa mengintegrasikan batch analytics dengan streaming event berlatensi sub-detik.",
        ],
      },
    ],
  },
];

async function generateAllPdfs() {
  const fontDoc = await PDFDocument.create();
  const timesBold = await fontDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await fontDoc.embedFont(StandardFonts.Helvetica);
  const timesOblique = await fontDoc.embedFont(StandardFonts.HelveticaOblique);

  for (let i = 0; i < pdfDefinitions.length; i++) {
    const def = pdfDefinitions[i];
    console.log(`[${i + 1}/${pdfDefinitions.length}] Generating PDF: ${def.fileName}...`);

    const doc = await PDFDocument.create();
    const primaryColor = rgb(0.05, 0.35, 0.85); // Professional Navy Blue
    const textColor = rgb(0.12, 0.14, 0.17);
    const subColor = rgb(0.4, 0.45, 0.5);

    // Embed fonts into this document
    const hBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const hRegular = await doc.embedFont(StandardFonts.Helvetica);
    const hItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

    // Create pages based on definitions
    for (let pIdx = 0; pIdx < def.pages.length; pIdx++) {
      const pageDef = def.pages[pIdx];
      const page = doc.addPage([595.28, 841.89]); // A4 Size
      const { width, height } = page.getSize();

      // Page Header Bar
      page.drawRectangle({
        x: 40,
        y: height - 60,
        width: width - 80,
        height: 2,
        color: primaryColor,
      });

      // Title & Subtitle on first page
      if (pIdx === 0) {
        page.drawText(def.title, {
          x: 40,
          y: height - 100,
          size: 18,
          font: hBold,
          color: primaryColor,
        });

        page.drawText(def.subtitle, {
          x: 40,
          y: height - 122,
          size: 10,
          font: hItalic,
          color: subColor,
        });

        // Top metadata box
        page.drawRectangle({
          x: 40,
          y: height - 170,
          width: width - 80,
          height: 38,
          color: rgb(0.95, 0.97, 1.0),
          borderColor: rgb(0.8, 0.88, 0.98),
          borderWidth: 1,
        });

        page.drawText("Sumber: Bank Materi Sains Data (BMSD) • Terintegrasi Learning OS Dual Reader", {
          x: 52,
          y: height - 155,
          size: 9,
          font: hBold,
          color: primaryColor,
        });
      }

      // Chapter Heading
      const headingY = pIdx === 0 ? height - 210 : height - 100;
      page.drawText(pageDef.heading, {
        x: 40,
        y: headingY,
        size: 14,
        font: hBold,
        color: primaryColor,
      });

      // Paragraphs
      let currentY = headingY - 28;
      for (const p of pageDef.paragraphs) {
        // Simple word wrapping for A4 width
        const words = p.split(" ");
        let line = "";
        for (const w of words) {
          const testLine = line + (line ? " " : "") + w;
          if (testLine.length > 78) {
            page.drawText(line, {
              x: 40,
              y: currentY,
              size: 10.5,
              font: hRegular,
              color: textColor,
            });
            line = w;
            currentY -= 16;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page.drawText(line, {
            x: 40,
            y: currentY,
            size: 10.5,
            font: hRegular,
            color: textColor,
          });
          currentY -= 24;
        }
      }

      // Page Footer
      page.drawText(`Bank Materi Sains Data (BMSD) • Halaman ${pIdx + 1} dari ${def.pages.length}`, {
        x: 40,
        y: 40,
        size: 8.5,
        font: hRegular,
        color: subColor,
      });

      page.drawText("Learning OS Material Library", {
        x: width - 160,
        y: 40,
        size: 8.5,
        font: hItalic,
        color: primaryColor,
      });
    }

    const pdfBytes = await doc.save();

    // Save to folder category
    const categorizedPath = path.join(bmsdDir, def.folder, def.fileName);
    fs.writeFileSync(categorizedPath, pdfBytes);

    // Also save directly into public/materials/bmsd/ and public/materials/ for direct link access
    const directPath = path.join(bmsdDir, def.fileName);
    fs.writeFileSync(directPath, pdfBytes);

    const rootMaterialsPath = path.join(baseDir, def.fileName);
    fs.writeFileSync(rootMaterialsPath, pdfBytes);

    // Update database record with physical file path and URL
    const fileUrl = `/materials/bmsd/${def.fileName}`;
    const categoryUrl = `/materials/bmsd/${def.folder}/${def.fileName}`;

    db.prepare(`
      UPDATE material_files
      SET drive_url = ?, size_bytes = ?, page_count = ?, status = 'completed'
      WHERE id = ?
    `).run(fileUrl, pdfBytes.length, def.pages.length, def.fileId);

    console.log(`  -> Saved: ${categorizedPath} (${pdfBytes.length} bytes)`);
  }

  console.log("\n=== ALL PDF FILES GENERATED & LINKED TO DATABASE SUCCESSFULLY ===");
}

generateAllPdfs().catch((e) => console.error("Error generating PDFs:", e));
