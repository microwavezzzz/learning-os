const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../data/learning_os.db");
const db = new Database(dbPath);

console.log("=== INGESTING COMPLETE BANK MATERI SAINS DATA (BMSD) ===\n");

const userId = "demo-user-1";
const now = new Date().toISOString();

function safeAddColumn(table, column, definition) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  } catch (e) {
    if (!e.message || !e.message.includes("duplicate column name")) throw e;
  }
}

safeAddColumn("topics", "bloom_level", "TEXT DEFAULT 'understand'");
safeAddColumn("topics", "estimated_minutes", "INTEGER DEFAULT 60");
safeAddColumn("topics", "last_studied_at", "TEXT");

// 1. Ensure Subject exists: Data Science & Statistical Learning
let dsSubject = db.prepare(`SELECT * FROM subjects WHERE id = 'sub-ds-3'`).get();
if (!dsSubject) {
  db.prepare(`
    INSERT INTO subjects (id, user_id, title, description, color, icon, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "sub-ds-3",
    userId,
    "Data Science & Statistical Learning",
    "Komprehensif Bank Materi Sains Data (BMSD): Aljabar Linear, Probabilitas, Machine Learning, Deep Learning, dan Sistem Data Terdistribusi.",
    "#10b981",
    "bar-chart-2",
    2,
    now,
    now
  );
  dsSubject = { id: "sub-ds-3" };
}

// 2. BMSD Modules Data: Complete Curriculum & Structured Content Chunks
const bmsdModules = [
  {
    topicId: "top-bmsd-01",
    topicTitle: "Aljabar Linear & Dekomposisi Matriks",
    topicDesc: "Vektor ruang, matriks transformasi, nilai & vektor eigen, Singular Value Decomposition (SVD), dan Principal Component Analysis (PCA).",
    difficulty: "intermediate",
    bloomLevel: "apply",
    fileId: "mat-bmsd-01-linalg",
    fileName: "BMSD_Modul_01_Aljabar_Linear_dan_Matriks.pdf",
    pageCount: 32,
    sizeBytes: 3840000,
    chunks: [
      {
        pageNumber: 1,
        heading: "1.1 Ruang Vektor & Transformasi Linear",
        content: "Aljabar linear adalah fondasi komputasi data berdimensi tinggi. Vektor x in R^n merepresentasikan titik data dalam ruang fitur n-dimensi. Transformasi linear T(x) = Ax memetakan fitur ke ruang koordinat baru yang mempertahankan operasi penjumlahan dan perkalian skalar.",
      },
      {
        pageNumber: 8,
        heading: "1.2 Nilai Eigen & Vektor Eigen (Eigenvalues & Eigenvectors)",
        content: "Untuk matriks persegi A in R^(n x n), vektor tak nol v disebut vektor eigen jika Av = lambda * v, di mana lambda adalah nilai eigen skalar. Nilai eigen menentukan arah invariansi di mana transformasi matriks hanya meregangkan atau memampatkan vektor tanpa mengubah orientasi rotasinya.",
      },
      {
        pageNumber: 18,
        heading: "1.3 Singular Value Decomposition (SVD) & Reduksi Dimensi PCA",
        content: "SVD mendekomposisi matriks data sembarang X in R^(m x n) menjadi X = U * Sigma * V^T, di mana U dan V adalah matriks ortogonal dan Sigma memuat nilai-nilai singular terurut. Dalam Principal Component Analysis (PCA), kolom dari V merepresentasikan arah variansi maksimum (komponen utama), memungkinkan reduksi dimensi data berdimensi tinggi dengan meminimalkan kehilangan informasi rekontruksi.",
      },
    ],
    concepts: [
      { id: "c-svd-1", title: "Singular Value Decomposition (SVD)", def: "Faktorisasi matriks X = U * Sigma * V^T untuk ekstraksi fitur dan reduksi dimensi ortogonal.", formula: "X = U Sigma V^T" },
      { id: "c-pca-1", title: "Principal Component Analysis (PCA)", def: "Teknik reduksi dimensi linear dengan memproyeksikan data ke vektor eigen matriks kovariansi.", formula: "Var(z_1) = max w^T S w" }
    ],
    question: {
      type: "multiple_choice",
      prompt: "Dalam dekomposisi matriks Singular Value Decomposition (SVD) X = U * Sigma * V^T, komponen manakah yang memuat bobot magnitudo variansi terbesar?",
      options: ["Matriks diagonal Sigma (Singular Values)", "Matriks kiri U", "Matriks kanan V^T", "Matriks Identitas I"],
      correct: "Matriks diagonal Sigma (Singular Values)",
      explanation: "Matriks diagonal Sigma memuat singular values sigma_1 >= sigma_2 >= ... >= 0 yang terurut menurun berdasarkan magnitudo energi variansi data."
    }
  },
  {
    topicId: "top-bmsd-02",
    topicTitle: "Teori Probabilitas & Variabel Acak",
    topicDesc: "Aksioma probabilitas, Teorema Bayes, fungsi kepekatan probabilitas (PDF/CDF), distribusi Gaussian, dan Central Limit Theorem (CLT).",
    difficulty: "intermediate",
    bloomLevel: "understand",
    fileId: "mat-bmsd-02-prob",
    fileName: "BMSD_Modul_02_Teori_Probabilitas_dan_Distribusi.pdf",
    pageCount: 28,
    sizeBytes: 2950000,
    chunks: [
      {
        pageNumber: 1,
        heading: "2.1 Aksioma Probabilitas & Teorema Bayes",
        content: "Teorema Bayes menyatakan P(A|B) = [P(B|A) * P(A)] / P(B). Di sini, P(A) adalah prior belief, P(B|A) adalah likelihood data observasi, P(B) adalah evidence marginal, dan P(A|B) adalah posterior distribution setelah mengamati bukti empiris.",
      },
      {
        pageNumber: 12,
        heading: "2.2 Distribusi Gaussian Multivariat & Central Limit Theorem",
        content: "Distribusi normal multivariat N(mu, Sigma) dimodelkan dengan fungsi densitas f(x) = (2*pi)^(-k/2) * |Sigma|^(-1/2) * exp(-0.5 * (x-mu)^T * Sigma^(-1) * (x-mu)). Central Limit Theorem menjamin bahwa rata-rata sampel dari variabel acak independen akan berkonvergensi ke distribusi normal ketika ukuran sampel n mendekati tak hingga.",
      },
    ],
    concepts: [
      { id: "c-bayes-1", title: "Teorema Bayes", def: "Aturan pembaruan probabilitas posterior berdasarkan prior dan likelihood observasi.", formula: "P(theta|D) = [P(D|theta) P(theta)] / P(D)" }
    ],
    question: {
      type: "short_answer",
      prompt: "Jelaskan peran Teorema Bayes dalam pemodelan Bayesian Machine Learning.",
      options: [],
      correct: "Teorema Bayes memperbarui keyakinan awal (prior) terhadap parameter model menggunakan likelihood data yang diobservasi untuk menghasilkan distribusi posterior.",
      explanation: "Bayesian ML memperlakukan parameter sebagai variabel acak yang terus diperbarui distribusinya seiring masuknya bukti/data baru."
    }
  },
  {
    topicId: "top-bmsd-03",
    topicTitle: "Exploratory Data Analysis (EDA) & Data Wrangling",
    topicDesc: "Teknik pembersihan data, penanganan missing values, deteksi outlier IQR/Z-score, rekayasa fitur (feature engineering), dan korelasi statistik.",
    difficulty: "beginner",
    bloomLevel: "apply",
    fileId: "mat-bmsd-03-eda",
    fileName: "BMSD_Modul_03_EDA_dan_Feature_Engineering.pdf",
    pageCount: 22,
    sizeBytes: 2410000,
    chunks: [
      {
        pageNumber: 1,
        heading: "3.1 Data Cleansing & Imputasi Missing Values",
        content: "Data wrangling menangani ketidaklengkapan data: Missing Completely at Random (MCAR), Missing at Random (MAR), dan Missing Not at Random (MNAR). Metode imputasi mencakup mean/median untuk variabel simetris, KNN Imputer, dan MICE (Multivariate Imputation by Chained Equations).",
      },
      {
        pageNumber: 10,
        heading: "3.2 Deteksi Outlier & Normalisasi Fitur",
        content: "Outlier diidentifikasi melalui batas IQR = Q3 - Q1 di mana batas atas = Q3 + 1.5*IQR dan batas bawah = Q1 - 1.5*IQR. Transformasi fitur meliputi Min-Max Scaling (rentang [0,1]) dan Standard Z-Score Standardization (mean=0, std=1) yang krusial bagi algoritma berbasis jarak seperti KNN dan SVM.",
      },
    ],
    concepts: [
      { id: "c-iqr-1", title: "Interquartile Range (IQR)", def: "Ukuran dispersi statistik untuk mendeteksi outlier robust terhadap nilai ekstrem.", formula: "IQR = Q3 - Q1" }
    ],
    question: {
      type: "multiple_choice",
      prompt: "Metode normalisasi fitur manakah yang mempertahankan nilai rata-rata (mean) = 0 dan variansi (std) = 1?",
      options: ["StandardScaler (Z-Score Standardization)", "MinMaxScaler [0, 1]", "RobustScaler", "Log Transform"],
      correct: "StandardScaler (Z-Score Standardization)",
      explanation: "Z-score menghitung z = (x - mu) / sigma yang menghasilkan distribusi dengan mean=0 dan standard deviation=1."
    }
  },
  {
    topicId: "top-bmsd-04",
    topicTitle: "Inferensi Statistik & Parameter Estimation",
    topicDesc: "Maximum Likelihood Estimation (MLE), Maximum A Posteriori (MAP), pengujian hipotesis (t-test, ANOVA, p-values), dan interval kepercayaan.",
    difficulty: "advanced",
    bloomLevel: "evaluate",
    fileId: "mat-bmsd-04-mle",
    fileName: "BMSD_Modul_04_Statistical_Inference.pdf",
    pageCount: 30,
    sizeBytes: 3100000,
    chunks: [
      {
        pageNumber: 1,
        heading: "4.1 Maximum Likelihood Estimation (MLE)",
        content: "MLE mengestimasi parameter theta dengan memaksimalkan fungsi likelihood L(theta|X) = prod p(xi|theta). Dalam komputasi numerik, kita memaksimalkan log-likelihood ln L(theta) = sum ln p(xi|theta) yang mengubah produk probabilitas menjadi penjumlahan, menghindari underflow numerik dan menyederhanakan diferensiasi kalkulus.",
      },
      {
        pageNumber: 15,
        heading: "4.2 Pengujian Hipotesis & Signifikansi Statistik (p-value)",
        content: "Uji hipotesis membandingkan hipotesis nol H0 dengan hipotesis alternatif H1. Nilai p-value adalah probabilitas memperoleh statistik uji yang setidaknya sama ekstremnya dengan data observasi jika H0 benar. Jika p-value < alpha (misal alpha = 0.05), kita menolak H0 demi H1.",
      },
    ],
    concepts: [
      { id: "c-mle-1", title: "Maximum Likelihood Estimation (MLE)", def: "Metode estimasi parameter dengan memaksimalkan fungsi probabilitas data observasi.", formula: "theta_MLE = argmax sum ln p(x_i | theta)" }
    ],
    question: {
      type: "short_answer",
      prompt: "Mengapa fungsi Log-Likelihood lebih disukai daripada Likelihood murni dalam proses optimasi gradien?",
      options: [],
      correct: "Log-likelihood mengubah produk probabilitas yang rentan floating-point underflow menjadi penjumlahan, serta mempermudah turunan diferensial.",
      explanation: "Transformasi logaritma monotonik tidak mengubah lokasi titik ekstrem maksimum tetapi menyederhanakan perhitungan gradien secara dramatis."
    }
  },
  {
    topicId: "top-bmsd-05",
    topicTitle: "Supervised Learning: Regresi & Klasifikasi",
    topicDesc: "Regresi Linear, Regresi Logistik, Fungsi Kerugian (MSE, Cross-Entropy), Regularisasi L1 Lasso & L2 Ridge, dan Gradient Descent.",
    difficulty: "intermediate",
    bloomLevel: "apply",
    fileId: "mat-bmsd-05-supervised",
    fileName: "BMSD_Modul_05_Supervised_Learning.pdf",
    pageCount: 36,
    sizeBytes: 4120000,
    chunks: [
      {
        pageNumber: 1,
        heading: "5.1 Regresi Linear & Cost Function Mean Squared Error",
        content: "Regresi linear memodelkan hubungan linear y = w^T * x + b. Model dilatih dengan meminimalkan Mean Squared Error (MSE) J(w) = (1/2m) * sum (y_hat_i - y_i)^2 melalui algoritma optimasi Stochastic Gradient Descent (SGD): w := w - alpha * grad J(w).",
      },
      {
        pageNumber: 14,
        heading: "5.2 Regresi Logistik & Binary Cross-Entropy Loss",
        content: "Regresi logistik memetakan output linear ke probabilitas [0, 1] melalui fungsi Sigmoid sigma(z) = 1 / (1 + exp(-z)). Optimasi menggunakan Binary Cross-Entropy Loss J(w) = -(1/m) * sum [y*ln(y_hat) + (1-y)*ln(1-y_hat)], yang bersifat konveks dan menjamin konvergensi ke global minimum.",
      },
      {
        pageNumber: 24,
        heading: "5.3 Regularisasi L1 (Lasso) vs L2 (Ridge)",
        content: "Regularisasi mengatasi overfitting. Ridge (L2) menambahkan penalti lambda * ||w||_2^2 yang mengecilkan bobot mendekati nol. Lasso (L1) menambahkan penalti lambda * ||w||_1 yang mendorong bobot tepat menjadi nol, menghasilkan seleksi fitur (sparse models).",
      },
    ],
    concepts: [
      { id: "c-lasso-1", title: "L1 Lasso Regularization", def: "Teknik regularisasi dengan penalti norma L1 untuk menghasilkan model sparse (seleksi fitur otomatis).", formula: "J(w) = Loss + lambda sum |w_j|" },
      { id: "c-ridge-1", title: "L2 Ridge Regularization", def: "Teknik regularisasi dengan penalti norma L2 kuadrat untuk mencegah bobot ekstrem.", formula: "J(w) = Loss + lambda sum w_j^2" }
    ],
    question: {
      type: "multiple_choice",
      prompt: "Manakah jenis regularisasi yang menghasilkan matriks bobot sparse (beberapa bobot fitur menjadi tepat nol) untuk seleksi fitur otomatis?",
      options: ["Regularisasi L1 (Lasso)", "Regularisasi L2 (Ridge)", "Dropout", "Batch Normalization"],
      correct: "Regularisasi L1 (Lasso)",
      explanation: "Geometri kontur penalti norma L1 memiliki sudut lancip pada sumbu koordinat, sehingga titik optimal sering jatuh tepat di nol."
    }
  },
  {
    topicId: "top-bmsd-06",
    topicTitle: "Ensemble Learning: Random Forest & Boosting",
    topicDesc: "Decision Trees (Gini Impurity, Entropy), Bagging, Random Forest, AdaBoost, Gradient Boosted Decision Trees (GBDT), dan XGBoost.",
    difficulty: "advanced",
    bloomLevel: "evaluate",
    fileId: "mat-bmsd-06-ensemble",
    fileName: "BMSD_Modul_06_Tree_Models_dan_Ensemble.pdf",
    pageCount: 34,
    sizeBytes: 3980000,
    chunks: [
      {
        pageNumber: 1,
        heading: "6.1 Decision Trees & Kriteria Pemisahan (Gini vs Entropy)",
        content: "Decision tree membagi ruang fitur secara rekursif. Kriteria pemisahan menggunakan Gini Impurity G = 1 - sum p_i^2 atau Information Entropy H = -sum p_i * log2(p_i). Split optimal memaksimalkan Information Gain IG = H(parent) - sum (N_v/N)*H(child_v).",
      },
      {
        pageNumber: 12,
        heading: "6.2 Bagging & Random Forest",
        content: "Random Forest menggabungkan Bootstrap Aggregating (Bagging) dengan sub-sampling fitur acak (feature bagging) pada setiap split node. Ini mereduksi variansi pohon keputusan individu yang tinggi tanpa meningkatkan bias, menghasilkan model yang sangat stabil terhadap derau.",
      },
      {
        pageNumber: 22,
        heading: "6.3 Boosting: AdaBoost & Gradient Boosting (XGBoost)",
        content: "Berbeda dengan Bagging yang melatih pohon secara paralel dan independen, Boosting melatih pohon secara sekuensial. Setiap pohon baru dilatih untuk memprediksi residual error (pseudo-residuals) dari ansambel sebelumnya menggunakan pendekatan optimasi gradien dalam ruang fungsi.",
      },
    ],
    concepts: [
      { id: "c-rf-1", title: "Random Forest", def: "Ansambel Bagging dari decision trees dengan pemilihan fitur acak di setiap split.", formula: "y_hat = 1/B sum T_b(x)" }
    ],
    question: {
      type: "multiple_choice",
      prompt: "Bagaimanakah mekanisme kerja algoritma Gradient Boosting dalam memperbaiki performa model di setiap iterasi?",
      options: [
        "Pohon baru dilatih secara sekuensial untuk memprediksi nilai residual (selisih error) dari model sebelumnya",
        "Pohon dilatih secara independen dan hasilnya dirata-ratakan secara paralel",
        "Setiap pohon diberikan bobot yang sama tanpa memperhatikan error sebelumnya",
        "Hanya fitur dengan korelasi tertinggi yang dipilih secara acak"
      ],
      correct: "Pohon baru dilatih secara sekuensial untuk memprediksi nilai residual (selisih error) dari model sebelumnya",
      explanation: "Gradient Boosting membangun model aditif dengan meminimalkan fungsi kerugian melalui penyesuaian pohon baru terhadap gradien negatif (residual)."
    }
  },
  {
    topicId: "top-bmsd-07",
    topicTitle: "Unsupervised Learning & Clustering",
    topicDesc: "K-Means Clustering, Silhouette Score, Hierarchical Clustering (Dendrogram), DBSCAN density clustering, t-SNE, dan UMAP.",
    difficulty: "intermediate",
    bloomLevel: "analyze",
    fileId: "mat-bmsd-07-clustering",
    fileName: "BMSD_Modul_07_Clustering_dan_Unsupervised.pdf",
    pageCount: 26,
    sizeBytes: 2890000,
    chunks: [
      {
        pageNumber: 1,
        heading: "7.1 K-Means Clustering & Evaluasi Silhouette Score",
        content: "K-Means mengelompokkan data ke dalam K klaster dengan meminimalkan Within-Cluster Sum of Squares (WCSS). Jumlah K optimal dievaluasi menggunakan metode Elbow dan Silhouette Coefficient s = (b - a) / max(a, b), di mana a adalah jarak rata-rata intra-klaster dan b adalah jarak rata-rata ke klaster terdekat berikutnya.",
      },
      {
        pageNumber: 14,
        heading: "7.2 Density-Based Clustering (DBSCAN)",
        content: "DBSCAN mengidentifikasi klaster dengan densitas spasial tinggi berdasarkan parameter radius eps dan jumlah minimum tetangga minPts. DBSCAN mampu mendeteksi klaster berbentuk arbitrer non-linear serta memisahkan titik derau (noise/outliers) yang tidak terjangkau oleh densitas.",
      },
    ],
    concepts: [
      { id: "c-kmeans-1", title: "K-Means Clustering", def: "Algoritma partisi iteratif meminimalkan jarak Euclidean ke centroid klaster.", formula: "WCSS = sum sum ||x_i - mu_k||^2" }
    ],
    question: {
      type: "multiple_choice",
      prompt: "Manakah keunggulan utama algoritma DBSCAN dibandingkan K-Means standard?",
      options: [
        "DBSCAN mampu menemukan klaster berbentuk arbitrer/tidak beraturan dan otomatis menandai outlier sebagai noise",
        "DBSCAN selalu menghasilkan jumlah klaster K yang tetap di awal",
        "DBSCAN tidak memerlukan parameter jarak apapun",
        "DBSCAN berjalan lebih cepat pada data berdimensi di atas 10.000"
      ],
      correct: "DBSCAN mampu menemukan klaster berbentuk arbitrer/tidak beraturan dan otomatis menandai outlier sebagai noise",
      explanation: "DBSCAN berbasis densitas spasial sehingga tidak mengasumsikan klaster berbentuk bola (spherical) seperti K-Means dan kebal terhadap noise."
    }
  },
  {
    topicId: "top-bmsd-08",
    topicTitle: "Deep Learning & Neural Network Architectures",
    topicDesc: "Multilayer Perceptron (MLP), Backpropagation & Autograd, Activation functions (ReLU, GELU), CNN, RNN, dan Transformer Self-Attention.",
    difficulty: "advanced",
    bloomLevel: "create",
    fileId: "mat-bmsd-08-deeplearning",
    fileName: "BMSD_Modul_08_Deep_Learning_dan_Transformers.pdf",
    pageCount: 42,
    sizeBytes: 5240000,
    chunks: [
      {
        pageNumber: 1,
        heading: "8.1 Multilayer Perceptron & Algoritma Backpropagation",
        content: "Jaringan saraf tiruan memetakan input x ke representasi laten melalui lapisan linear z^(l) = W^(l) * a^(l-1) + b^(l) dan aktivasi non-linear a^(l) = sigma(z^(l)). Algoritma Backpropagation menerapkan aturan rantai kalkulus (Chain Rule) untuk menghitung gradien parsial loss terhadap seluruh matriks bobot dL/dW^(l).",
      },
      {
        pageNumber: 20,
        heading: "8.2 Convolutional Neural Networks (CNN) & Recurrent Models",
        content: "CNN mengeksploitasi invariansi translasi spasial menggunakan operasi konvolusi 2D dan pooling, sangat efektif untuk citra. RNN dan LSTM memproses urutan temporal dengan mempertahankan hidden state internal h_t = tanh(W_hh * h_(t-1) + W_xh * x_t).",
      },
      {
        pageNumber: 30,
        heading: "8.3 Arsitektur Transformer & Scaled Dot-Product Attention",
        content: "Transformer menggantikan rekursi sekuensial dengan mekanisme Self-Attention: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. Multi-Head Attention memungkinkan model mengamati konteks informasi dari subruang representasi berbeda secara paralel tanpa batasan jarak token.",
      },
    ],
    concepts: [
      { id: "c-attention-1", title: "Scaled Dot-Product Attention", def: "Mekanisme kalkulasi relasi relevansi kontekstual antar token dalam arsitektur Transformer.", formula: "Attention(Q, K, V) = softmax((QK^T) / sqrt(d_k)) V" }
    ],
    question: {
      type: "short_answer",
      prompt: "Tuliskan rumus Scaled Dot-Product Attention pada arsitektur Transformer dan jelaskan fungsi faktor pembagi sqrt(d_k).",
      options: [],
      correct: "Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) V. Faktor sqrt(d_k) mencegah nilai dot-product menjadi terlalu besar yang dapat menyebabkan gradien softmax menjadi sangat kecil (vanishing gradient).",
      explanation: "Pembagian dengan sqrt(d_k) menstabilkan variansi dot-product ketika dimensi kunci d_k bernilai besar."
    }
  },
  {
    topicId: "top-bmsd-09",
    topicTitle: "Evaluasi Model, Metrik Validasi & Tuning",
    topicDesc: "K-Fold Cross Validation, Confusion Matrix, Precision, Recall, F1-Score, ROC-AUC curve, Bias-Variance tradeoff, dan Optuna/Bayesian Tuning.",
    difficulty: "intermediate",
    bloomLevel: "evaluate",
    fileId: "mat-bmsd-09-evaluation",
    fileName: "BMSD_Modul_09_Evaluasi_Model_dan_Validasi.pdf",
    pageCount: 24,
    sizeBytes: 2650000,
    chunks: [
      {
        pageNumber: 1,
        heading: "9.1 Confusion Matrix & Tradeoff Precision vs Recall",
        content: "Pada klasifikasi biner, Confusion Matrix mencatat True Positive (TP), False Positive (FP), True Negative (TN), dan False Negative (FN). Precision = TP / (TP + FP) mengukur akurasi prediksi positif, sedangkan Recall = TP / (TP + FN) mengukur sensitivitas penemuan kasus positif. F1-Score = 2 * (Precision * Recall) / (Precision + Recall) adalah harmonic mean keduanya.",
      },
      {
        pageNumber: 12,
        heading: "9.2 Kurva ROC-AUC & Bias-Variance Decomposition",
        content: "Kurva Receiver Operating Characteristic (ROC) memplot True Positive Rate (TPR) terhadap False Positive Rate (FPR) pada berbagai variasi threshold klasifikasi. Area Under Curve (AUC) mengukur kemampuan diskriminatif model independen terhadap ambang batas keputusan.",
      },
    ],
    concepts: [
      { id: "c-f1-1", title: "F1-Score", def: "Rata-rata harmonik antara Precision dan Recall untuk evaluasi kelas imbalanced.", formula: "F1 = 2 (Precision Recall) / (Precision + Recall)" }
    ],
    question: {
      type: "multiple_choice",
      prompt: "Dalam kasus deteksi penipuan transaksi keuangan (fraud detection) di mana data sangat timpang (imbalanced), metrik evaluasi manakah yang paling tepat dioptimalkan?",
      options: [
        "Recall dan Precision (F1-Score / PR-AUC)",
        "Raw Accuracy (Persentase Akurasi Total)",
        "Mean Squared Error",
        "R-Squared"
      ],
      correct: "Recall dan Precision (F1-Score / PR-AUC)",
      explanation: "Akurasi mentah menyesatkan pada data imbalanced karena model naif yang selalu memprediksi negatif akan memperoleh akurasi tinggi namun gagal mendeteksi fraud sama sekali."
    }
  },
  {
    topicId: "top-bmsd-10",
    topicTitle: "Big Data Processing & Distributed Analytics",
    topicDesc: "Sistem pemrosesan paralel MapReduce, Apache Spark RDDs & DataFrames, pemrosesan aliran data (Stream Processing), dan Feature Store.",
    difficulty: "advanced",
    bloomLevel: "create",
    fileId: "mat-bmsd-10-bigdata",
    fileName: "BMSD_Modul_10_Big_Data_Analytics.pdf",
    pageCount: 30,
    sizeBytes: 3450000,
    chunks: [
      {
        pageNumber: 1,
        heading: "10.1 Paradigma Komputasi Terdistribusi & Apache Spark RDD",
        content: "Apache Spark mengatasi bottleneck I/O disk Hadoop MapReduce dengan komputasi in-memory berbasis Resilient Distributed Datasets (RDD). RDD bersifat immutable dan fault-tolerant melalui pencatatan graf silsilah operasi (lineage graph), memungkinkan pemulihan partisi yang hilang tanpa komputasi ulang total.",
      },
      {
        pageNumber: 16,
        heading: "10.2 Spark Catalyst Optimizer & Streaming Pipelines",
        content: "Spark SQL menggunakan Catalyst Optimizer untuk menyusun rencana eksekusi logis dan fisik optimal (predicate pushdown, projection pruning). Arsitektur Lambda dan Kappa menggabungkan batch processing dengan real-time stream processing untuk analitik berlatensi rendah.",
      },
    ],
    concepts: [
      { id: "c-rdd-1", title: "Resilient Distributed Dataset (RDD)", def: "Abstraksi koleksi objek terdistribusi in-memory yang toleran terhadap kegagalan node.", formula: "RDD = LineageGraph(Transformations)" }
    ],
    question: {
      type: "multiple_choice",
      prompt: "Bagaimanakah Apache Spark RDD mencapai sifat fault-tolerance (toleransi kesalahan) tanpa melakukan replikasi disk berkali-kali?",
      options: [
        "Merekam graf silsilah transformasi (lineage graph) sehingga partisi yang rusak dapat dihitung ulang secara otomatis",
        "Menyimpan seluruh data ke tape backup eksternal",
        "Menghentikan seluruh klaster jika ada 1 node yang mati",
        "Mematikan fitur in-memory computation"
      ],
      correct: "Merekam graf silsilah transformasi (lineage graph) sehingga partisi yang rusak dapat dihitung ulang secara otomatis",
      explanation: "Lineage graph mencatat rantai transformasi deterministik dari sumber data awal sehingga partisi yang hilang dapat diregenerasi secara efisien."
    }
  }
];

// Ingest each module: Topic, Concepts, Material File, Chunks, and Questions
for (let i = 0; i < bmsdModules.length; i++) {
  const mod = bmsdModules[i];
  console.log(`Ingesting [${i + 1}/${bmsdModules.length}]: ${mod.fileName}...`);

  // 1. Topic
  const existingTopic = db.prepare(`SELECT * FROM topics WHERE id = ?`).get(mod.topicId);
  if (!existingTopic) {
    db.prepare(`
      INSERT INTO topics (id, subject_id, parent_id, title, description, status, difficulty, mastery, bloom_level, estimated_minutes, prerequisites, related_materials, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mod.topicId,
      "sub-ds-3",
      null,
      mod.topicTitle,
      mod.topicDesc,
      "not_started",
      mod.difficulty,
      40.0,
      mod.bloomLevel,
      90,
      JSON.stringify(i > 0 ? [bmsdModules[i - 1].topicId] : []),
      JSON.stringify([{ title: mod.fileName, url: "https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP", type: "gdrive" }]),
      i,
      now,
      now
    );
  }

  // 2. Material File
  const existingMat = db.prepare(`SELECT * FROM material_files WHERE id = ?`).get(mod.fileId);
  if (!existingMat) {
    db.prepare(`
      INSERT INTO material_files (id, user_id, subject_id, topic_id, name, mime_type, drive_file_id, drive_url, size_bytes, status, page_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mod.fileId,
      userId,
      "sub-ds-3",
      mod.topicId,
      mod.fileName,
      "application/pdf",
      `1p5n-bmsd-${mod.fileId}`,
      "https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP",
      mod.sizeBytes,
      "completed",
      mod.pageCount,
      now,
      now
    );
  }

  // 3. Material Chunks
  for (let cIdx = 0; cIdx < mod.chunks.length; cIdx++) {
    const chunk = mod.chunks[cIdx];
    const chunkId = `chk-${mod.fileId}-${cIdx}`;
    const existingChunk = db.prepare(`SELECT * FROM material_chunks WHERE id = ?`).get(chunkId);
    if (!existingChunk) {
      db.prepare(`
        INSERT INTO material_chunks (id, material_id, chunk_index, page_number, section_heading, content, token_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        chunkId,
        mod.fileId,
        cIdx,
        chunk.pageNumber,
        chunk.heading,
        chunk.content,
        Math.round(chunk.content.length / 4),
        now
      );
    }
  }

  // 4. Concepts
  for (let con of mod.concepts) {
    const existingCon = db.prepare(`SELECT * FROM concepts WHERE id = ?`).get(con.id);
    if (!existingCon) {
      db.prepare(`
        INSERT INTO concepts (id, topic_id, title, definition, key_formula, bloom_level, order_index, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        con.id,
        mod.topicId,
        con.title,
        con.def,
        con.formula || null,
        mod.bloomLevel,
        0,
        now,
        now
      );
    }
  }

  // 5. Active Recall Question
  const qId = `q-${mod.fileId}`;
  const existingQ = db.prepare(`SELECT * FROM questions WHERE id = ?`).get(qId);
  if (!existingQ) {
    db.prepare(`
      INSERT INTO questions (id, topic_id, concept_id, material_chunk_id, type, difficulty, prompt, options_json, correct_answer, explanation, source_reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      qId,
      mod.topicId,
      mod.concepts[0]?.id || null,
      `chk-${mod.fileId}-0`,
      mod.question.type,
      mod.difficulty === "advanced" ? 4 : 3,
      mod.question.prompt,
      JSON.stringify(mod.question.options),
      mod.question.correct,
      mod.question.explanation,
      `${mod.fileName}, Page ${mod.chunks[0].pageNumber}`,
      now
    );
  }

  // 6. FSRS Initial Mastery Record
  const mstId = `mst-${mod.topicId}`;
  const existingMst = db.prepare(`SELECT * FROM mastery_records WHERE topic_id = ?`).get(mod.topicId);
  if (!existingMst) {
    db.prepare(`
      INSERT INTO mastery_records (id, user_id, topic_id, stability, difficulty, retrievability, repetitions, lapses, state, last_review_at, next_review_at, calculated_mastery, decay_risk, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mstId,
      userId,
      mod.topicId,
      2.5,
      5.0,
      0.9,
      1,
      0,
      "learning",
      now,
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      40.0,
      "none",
      now
    );
  }
}

console.log("\n=== ALL 10 BMSD MODULES & MATERIAL FILES INGESTED SUCCESSFULLY ===");
