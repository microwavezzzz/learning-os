"use client";

import * as React from "react";

export type Language = "id" | "en";

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = React.createContext<LanguageContextValue>({
  lang: "id",
  setLang: () => {},
  t: (key) => key,
});

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  id: {
    // App Brand
    "app.name": "Learan OS",
    "app.subtitle": "Personal LMS",

    // Sidebar Groups
    "nav.group.overview": "Ikhtisar",
    "nav.group.knowledge": "Pusat Pengetahuan",
    "nav.group.execution": "Loop Belajar",
    "nav.group.mastery": "Penguasaan & Ulasan",
    "nav.group.system": "Sistem",

    // Sidebar Nav Items
    "nav.dashboard": "Dashboard",
    "nav.curriculum": "Kurikulum & Topik",
    "nav.materials": "Bank Materi",
    "nav.planner": "Perencana Belajar",
    "nav.session": "Sesi Fokus Belajar",
    "nav.quizzes": "Active Recall",
    "nav.mistakes": "Bank Kesalahan",
    "nav.analytics": "Analitik Progres",
    "nav.settings": "Pengaturan",
    "nav.profile": "Profil",

    // Sidebar bottom badge
    "nav.learning_cycle": "Siklus Belajar",
    "nav.learning_cycle_desc": "Belajar → Ingat → Catat Kesalahan → Penguasaan",

    // Header Breadcrumbs
    "breadcrumb.dashboard": "Dashboard",
    "breadcrumb.curriculum": "Kurikulum & Topik",
    "breadcrumb.materials": "Bank Materi",
    "breadcrumb.planner": "Perencana Belajar",
    "breadcrumb.session": "Sesi Fokus",
    "breadcrumb.quizzes": "Active Recall",
    "breadcrumb.mistakes": "Bank Kesalahan",
    "breadcrumb.analytics": "Analitik Progres",
    "breadcrumb.settings": "Pengaturan",
    "breadcrumb.profile": "Profil Pengguna",

    // Header search
    "header.search_placeholder": "Cari atau lompat ke...",
    "header.badge.mistakes": "Ulasan",

    // User Nav
    "user.logged_in_as": "Masuk sebagai",
    "user.profile": "Profil Pengguna",
    "user.settings": "Pengaturan Akun",
    "user.logout": "Keluar",

    // Dashboard
    "dashboard.welcome": "Selamat datang kembali, {name}",
    "dashboard.subtitle": "Pusat kendali pembelajaran terpersonalisasi dan ikhtisar belajar aktif.",
    "dashboard.curriculum_btn": "Kurikulum",
    "dashboard.start_focus_btn": "Mulai Sesi Fokus",
    "dashboard.rec_badge": "Layanan Rekomendasi Belajar",
    "dashboard.rec_title": "Apa yang Harus Saya Pelajari Selanjutnya?",
    "dashboard.rec_subtitle": "Rekomendasi adaptif dibuat dari kurikulum aktif, tingkat penguasaan, dan tenggat waktu mendatang.",
    "dashboard.rec_high_priority": "Prioritas Tinggi",
    "dashboard.rec_recommended": "Direkomendasikan",
    "dashboard.rec_est_time": "Est. {mins} menit",
    "dashboard.rec_study_btn": "Pelajari Topik Ini",
    "dashboard.rec_schedule_btn": "Jadwalkan",
    "dashboard.rec_empty_title": "Belum ada mata kuliah atau topik.",
    "dashboard.rec_empty_desc": "Tambahkan mata kuliah di menu Kurikulum untuk menerima rekomendasi belajar AI.",
    "dashboard.rec_create_btn": "Buat Mata Kuliah",
    "dashboard.streak_title": "Streak Belajar",
    "dashboard.streak_days": "{days} Hari",
    "dashboard.streak_active": "Streak aktif! Konsisten belajar harian.",
    "dashboard.streak_inactive": "Selesaikan sesi belajar untuk memulai streak.",
    "dashboard.today_time_title": "Waktu Belajar Hari Ini",
    "dashboard.today_target": "Target: 90 mnt / hari ({percent}% tercapai)",
    "dashboard.pending_tasks_title": "Tugas Tertunda",
    "dashboard.pending_tasks_due": "{count} Jatuh Tempo",
    "dashboard.overdue_tasks": "{count} tugas terlambat",
    "dashboard.no_overdue": "0 tugas terlambat",
    "dashboard.goals_progress_title": "Progres Target",
    "dashboard.goals_avg": "{percent}% Rata-rata Selesai",
    "dashboard.active_goals_count": "{count} Target Aktif",
    "dashboard.today_schedule_title": "Jadwal Belajar Hari Ini",
    "dashboard.view_planner": "Lihat Perencana",
    "dashboard.no_schedule_today": "Tidak ada sesi belajar terjadwal hari ini.",
    "dashboard.schedule_session": "Jadwalkan Sesi",
    "dashboard.tasks_title": "Tugas & Aksi Pembelajaran",
    "dashboard.manage_tasks": "Kelola Tugas",
    "dashboard.no_tasks": "Semua tugas telah diselesaikan!",
    "dashboard.add_task": "Tambah Tugas",
    "dashboard.active_goals_card": "Target Belajar Aktif",
    "dashboard.manage_goals": "Kelola Target",
    "dashboard.no_active_goals": "Belum ada target aktif.",
    "dashboard.create_goal": "Buat Target Belajar",
    "dashboard.recent_sessions": "Sesi Belajar Terbaru",
    "dashboard.no_sessions": "Belum ada sesi belajar yang tercatat.",
    "dashboard.mastery_advanced": "Lanjutan",
    "dashboard.mastery_intermediate": "Menengah",
    "dashboard.mastery_fundamental": "Dasar",
    "dashboard.mastery_not_started": "Belum Dimulai",
    "dashboard.lessons_left": "materi tersisa",
    "dashboard.topics_mastered": "topik tuntas",

    // Materials
    "materials.title": "Bank Materi Sains Data (BMSD) — Google Drive Asli",
    "materials.badge_count": "39 Mata Kuliah Wajib",
    "materials.subtitle": "Terhubung langsung ke folder Google Drive Bank Materi Sains Data (HMSD) per semester.",
    "materials.sync_btn": "Sinkronkan Google Drive",
    "materials.syncing": "Menyinkronkan...",
    "materials.sync_success": "Sinkronisasi 39 Folder Mata Kuliah Google Drive BMSD berhasil!",
    "materials.all_semesters": "Semua Semester",
    "materials.search_placeholder": "Cari mata kuliah (misal: Deep Learning, Kalkulus)...",
    "materials.wajib_filter": "Mata Kuliah Wajib",
    "materials.open_gdrive": "Buka di GDrive",
    "materials.dual_reader": "Dual Reader",
    "materials.quiz": "Latihan Kuis",
    "materials.no_results": "Tidak ada mata kuliah yang ditemukan",
    "materials.no_results_desc": "Periksa kembali kata kunci pencarian Anda atau reset tab semester.",
    "materials.reset_filter": "Reset Filter",
    "materials.files_count": "Berkas GDrive",
    "materials.course_type": "Mata Kuliah Wajib",
    "materials.footer_label": "Kurikulum Sains Data Terintegrasi:",
    "materials.footer_count": "39 Folder Mata Kuliah Wajib Terdaftar dari BMSD",
    "materials.open_root_gdrive": "Buka Root GDrive",
    "materials.total_courses": "Mata Kuliah",
    "materials.total_files": "Berkas GDrive",
    "materials.total_semesters": "Semester",

    // Semesters
    "sem.1.title": "Semester 1",
    "sem.1.subtitle": "Tahap Persiapan Bersama (TPB)",
    "sem.2.title": "Semester 2",
    "sem.2.subtitle": "Tahap Persiapan Bersama (TPB)",
    "sem.3.title": "Semester 3",
    "sem.3.subtitle": "Program Studi Sains Data",
    "sem.4.title": "Semester 4",
    "sem.4.subtitle": "Program Studi Sains Data",
    "sem.5.title": "Semester 5",
    "sem.5.subtitle": "Program Studi Sains Data",
    "sem.6.title": "Semester 6",
    "sem.6.subtitle": "Program Studi Sains Data",

    // Curriculum
    "curriculum.title": "Kurikulum & Hierarki Pengetahuan",
    "curriculum.subtitle": "Kelola mata kuliah, topik belajar, dan pantau tingkat penguasaan konsep.",
    "curriculum.add_subject": "Tambah Mata Kuliah",
    "curriculum.add_topic": "Tambah Topik",
    "curriculum.search": "Cari topik atau mata kuliah...",
    "curriculum.no_subjects": "Belum ada mata kuliah yang terdaftar",
    "curriculum.topics_count": "{count} Topik",
    "curriculum.mastery": "Tingkat Penguasaan",
    "curriculum.edit_subject": "Edit Mata Kuliah",
    "curriculum.delete_subject": "Hapus Mata Kuliah",
    "curriculum.view_materials": "Buka Materi",

    // Planner
    "planner.title": "Perencana Belajar & Penjadwal Adaptif",
    "planner.subtitle": "Kelola rencana belajar bertarget dan integrasikan jadwal sesi harian.",
    "planner.add_plan": "Buat Rencana Baru",
    "planner.generate_ai": "Generate Rencana AI",
    "planner.active_plans": "Rencana Aktif",
    "planner.calendar_view": "Tampilan Kalender",
    "planner.schedule_session": "Jadwalkan Sesi",

    // Session (Focus Study Hub)
    "session.title": "Sesi Fokus Belajar & Timer Pomodoro",
    "session.subtitle": "Ruang belajar terfokus dengan teknik interval Pomodoro, pencatatan jurnal, dan kuis ulasan.",
    "session.start": "Mulai Sesi",
    "session.pause": "Jeda",
    "session.resume": "Lanjutkan",
    "session.stop": "Selesai",
    "session.work_mode": "Fokus Belajar",
    "session.break_mode": "Istirahat Sejenak",
    "session.select_topic": "Pilih Topik Belajar",
    "session.notes_placeholder": "Tulis catatan dan pemahaman penting dari sesi ini...",

    // Quizzes (Active Recall)
    "quizzes.title": "Active Recall & Generator Kuis AI",
    "quizzes.subtitle": "Uji retensi memori dengan kuis terarah berdasarkan materi kurikulum.",
    "quizzes.generate": "Generate Kuis Baru",
    "quizzes.start": "Mulai Kuis",
    "quizzes.submit": "Kirim Jawaban",
    "quizzes.score": "Skor Kuis",
    "quizzes.explanation": "Penjelasan & Solusi",
    "quizzes.next_question": "Pertanyaan Berikutnya",
    "quizzes.finish": "Selesaikan Kuis",
    "quizzes.past_attempts": "Riwayat Percobaan Kuis",

    // Mistakes
    "mistakes.title": "Bank Kesalahan & Analisis Akar Masalah",
    "mistakes.subtitle": "Lacak kesalahan jawaban kuis, analisis penyebab kesenjangan konsep, dan lakukan remedial.",
    "mistakes.add": "Catat Kesalahan Manual",
    "mistakes.no_mistakes": "Tidak ada kesalahan aktif! Penguasaan materi Anda sangat baik.",
    "mistakes.resolve": "Tandai Selesai",
    "mistakes.root_cause": "Akar Penyebab",
    "mistakes.remedy": "Saran Remedial",
    "mistakes.unresolved": "Belum Tuntas",
    "mistakes.resolved": "Sudah Dipahami",

    // Analytics
    "analytics.title": "Analitik Progres & Kurva Retensi FSRS",
    "analytics.subtitle": "Visualisasi waktu belajar 14 hari, retensi memori, dan kemajuan penguasaan silabus.",
    "analytics.total_study_time": "Total Waktu Belajar",
    "analytics.completed_sessions": "Sesi Selesai",
    "analytics.avg_quiz_score": "Rata-rata Skor Kuis",
    "analytics.fsrs_mastery": "Tingkat Penguasaan FSRS",
    "analytics.heatmap_title": "Aktivitas Belajar 14 Hari Terakhir",
    "analytics.retention_curve": "Kurva Retensi & Kesiapan Memori",

    // Settings
    "settings.title": "Pengaturan Sistem & Preferensi",
    "settings.subtitle": "Atur preferensi bahasa, sumber Google Drive, gateway AI, dan interval Pomodoro.",
    "settings.language": "Pengaturan Bahasa",
    "settings.theme": "Tema Tampilan",
    "settings.language_id": "Bahasa Indonesia",
    "settings.language_en": "English",
    "settings.save": "Simpan Preferensi",
    "settings.saved_success": "Preferensi berhasil disimpan!",
    "settings.system_title": "Pengaturan Sistem & Pembelajaran",
    "settings.system_subtitle": "Atur sumber Google Drive, model AI Gateway, dan interval sesi belajar.",
    "settings.active_id": "Aktif: Bahasa Indonesia",
    "settings.active_en": "Active: English",
    "settings.choose_language": "Pilih bahasa antarmuka aplikasi. Anda dapat mengganti bahasa kapan saja melalui ikon bola dunia di navigasi atas.",
    "settings.default_translation": "Bawaan • Terjemahan lengkap",
    "settings.international_translation": "Internasional • Terjemahan lengkap",
    "settings.drive_source": "Sumber Belajar Google Drive",
    "settings.connected_readonly": "Terhubung (Hanya Baca)",
    "settings.folder_id": "ID Folder:",
    "settings.drive_description": "Learan OS hanya menggunakan izin baca drive.file. Dokumen diproses dan diindeks secara lokal tanpa mengubah atau menghapus berkas di Google Drive Anda.",
    "settings.view_drive": "Lihat Folder Sumber di Drive",
    "settings.ai_router": "AI Gateway & Pengarah Model",
    "settings.prompt_guard": "Perlindungan Prompt Aktif",
    "settings.provider": "Penyedia",
    "settings.model_architecture": "Arsitektur Model",
    "settings.session_preferences": "Preferensi Sesi Belajar & Pomodoro",
    "settings.daily_target": "Target Belajar Harian (menit)",
    "settings.work_interval": "Interval Fokus Pomodoro (menit)",
    "settings.break_interval": "Interval Istirahat (menit)",

    // Common
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.edit": "Edit",
    "common.delete": "Hapus",
    "common.loading": "Memuat...",
    "common.no_data": "Tidak ada data",
    "common.view_all": "Lihat Semua",
    "common.back": "Kembali",
    "common.close": "Tutup",
    "common.date": "Tanggal",
    "common.start_time": "Waktu Mulai",
    "common.end_time": "Waktu Selesai",
    "common.subject": "Mata Kuliah",
    "common.topic": "Topik",
    "common.no_subject": "Tanpa Mata Kuliah",
    "common.no_topic": "Tanpa Topik",
    "common.optional": "Opsional",
    "common.status": "Status",
    "common.notes": "Catatan Sesi",
    "common.cancel_action": "Batal",
    "common.save_changes": "Simpan Perubahan",
    "common.saving": "Menyimpan...",
    "common.schedule": "Jadwalkan",
    "common.scheduled": "Terjadwal",
    "common.in_progress": "Sedang Berlangsung",
    "common.completed": "Selesai",
    "common.skipped": "Dilewati",
    "common.session_notes_placeholder": "Target atau fokus sesi...",
    "task.edit": "Edit Tugas",
    "task.create": "Buat Tugas Belajar",
    "task.title": "Judul Tugas",
    "task.description": "Deskripsi (Opsional)",
    "task.priority": "Prioritas",
    "task.duration": "Durasi (menit)",
    "task.deadline": "Tenggat Waktu",
    "task.low": "Rendah",
    "task.medium": "Sedang",
    "task.high": "Tinggi",
    "task.urgent": "Mendesak",
    "task.todo": "Belum Dikerjakan",
    "task.cancelled": "Dibatalkan",
  },

  en: {
    // App Brand
    "app.name": "Learan OS",
    "app.subtitle": "Personal LMS",

    // Sidebar Groups
    "nav.group.overview": "Overview",
    "nav.group.knowledge": "Knowledge Hub",
    "nav.group.execution": "Execution Loop",
    "nav.group.mastery": "Mastery & Review",
    "nav.group.system": "System",

    // Sidebar Nav Items
    "nav.dashboard": "Dashboard",
    "nav.curriculum": "Curriculum & Topics",
    "nav.materials": "Materials Hub",
    "nav.planner": "Study Planner",
    "nav.session": "Focus Study Hub",
    "nav.quizzes": "Active Recall",
    "nav.mistakes": "Mistake Bank",
    "nav.analytics": "Progress Analytics",
    "nav.settings": "Settings",
    "nav.profile": "Profile",

    // Sidebar bottom badge
    "nav.learning_cycle": "Learning Cycle",
    "nav.learning_cycle_desc": "Study → Recall → Mistake Log → Mastery",

    // Header Breadcrumbs
    "breadcrumb.dashboard": "Dashboard",
    "breadcrumb.curriculum": "Curriculum & Topics",
    "breadcrumb.materials": "Materials Hub",
    "breadcrumb.planner": "Study Planner",
    "breadcrumb.session": "Focus Session",
    "breadcrumb.quizzes": "Active Recall",
    "breadcrumb.mistakes": "Mistake Bank",
    "breadcrumb.analytics": "Progress Analytics",
    "breadcrumb.settings": "Settings",
    "breadcrumb.profile": "User Profile",

    // Header search
    "header.search_placeholder": "Search or jump to...",
    "header.badge.mistakes": "Review",

    // User Nav
    "user.logged_in_as": "Logged in as",
    "user.profile": "User Profile",
    "user.settings": "Account Settings",
    "user.logout": "Log out",

    // Dashboard
    "dashboard.welcome": "Welcome back, {name}",
    "dashboard.subtitle": "Your personalized learning cockpit and active study overview.",
    "dashboard.curriculum_btn": "Curriculum",
    "dashboard.start_focus_btn": "Start Focus Hub",
    "dashboard.rec_badge": "Study Recommendation Service",
    "dashboard.rec_title": "What Should I Study Next?",
    "dashboard.rec_subtitle": "Adaptive recommendation generated from your active curriculum, mastery levels, and upcoming deadlines.",
    "dashboard.rec_high_priority": "High Priority",
    "dashboard.rec_recommended": "Recommended",
    "dashboard.rec_est_time": "Est. {mins} mins",
    "dashboard.rec_study_btn": "Study This Topic",
    "dashboard.rec_schedule_btn": "Schedule",
    "dashboard.rec_empty_title": "No subjects or topics available yet.",
    "dashboard.rec_empty_desc": "Add subjects in the Curriculum to receive tailored study recommendations.",
    "dashboard.rec_create_btn": "Create Subject",
    "dashboard.streak_title": "Study Streak",
    "dashboard.streak_days": "{days} Days",
    "dashboard.streak_active": "Streak active! Consistent daily study.",
    "dashboard.streak_inactive": "Complete a scheduled session to start a streak.",
    "dashboard.today_time_title": "Today's Study Time",
    "dashboard.today_target": "Target: 90 min / day ({percent}% reached)",
    "dashboard.pending_tasks_title": "Pending Tasks",
    "dashboard.pending_tasks_due": "{count} Due",
    "dashboard.overdue_tasks": "{count} overdue tasks",
    "dashboard.no_overdue": "0 overdue tasks",
    "dashboard.goals_progress_title": "Goals Progress",
    "dashboard.goals_avg": "{percent}% Avg. Completion",
    "dashboard.active_goals_count": "{count} Active Goals",
    "dashboard.today_schedule_title": "Today's Study Schedule",
    "dashboard.view_planner": "View Planner",
    "dashboard.no_schedule_today": "No study sessions scheduled for today.",
    "dashboard.schedule_session": "Schedule Session",
    "dashboard.tasks_title": "Tasks & Action Items",
    "dashboard.manage_tasks": "Manage Tasks",
    "dashboard.no_tasks": "All tasks completed!",
    "dashboard.add_task": "Add Task",
    "dashboard.active_goals_card": "Active Goals",
    "dashboard.manage_goals": "Manage Goals",
    "dashboard.no_active_goals": "No active goals set yet.",
    "dashboard.create_goal": "Create Goal",
    "dashboard.recent_sessions": "Recent Study Sessions",
    "dashboard.no_sessions": "No completed sessions yet.",
    "dashboard.mastery_advanced": "Advanced",
    "dashboard.mastery_intermediate": "Intermediate",
    "dashboard.mastery_fundamental": "Fundamental",
    "dashboard.mastery_not_started": "Not Started",
    "dashboard.lessons_left": "lessons left",
    "dashboard.topics_mastered": "topics mastered",

    // Materials
    "materials.title": "Bank Materi Sains Data (BMSD) — Original Google Drive",
    "materials.badge_count": "39 Core Courses",
    "materials.subtitle": "Directly connected to Google Drive Bank Materi Sains Data (HMSD) by semester.",
    "materials.sync_btn": "Sync Google Drive",
    "materials.syncing": "Syncing...",
    "materials.sync_success": "Sync of 39 BMSD Google Drive course folders completed!",
    "materials.all_semesters": "All Semesters",
    "materials.search_placeholder": "Search courses (e.g. Deep Learning, Calculus)...",
    "materials.wajib_filter": "Core Courses Only",
    "materials.open_gdrive": "Open in GDrive",
    "materials.dual_reader": "Dual Reader",
    "materials.quiz": "Practice Quiz",
    "materials.no_results": "No courses found",
    "materials.no_results_desc": "Try a different search keyword or reset the semester filter.",
    "materials.reset_filter": "Reset Filters",
    "materials.files_count": "GDrive Files",
    "materials.course_type": "Core Course",
    "materials.footer_label": "Integrated Data Science Curriculum:",
    "materials.footer_count": "39 Core Course Folders Registered from BMSD",
    "materials.open_root_gdrive": "Open Root GDrive",
    "materials.total_courses": "Courses",
    "materials.total_files": "GDrive Files",
    "materials.total_semesters": "Semesters",

    // Semesters
    "sem.1.title": "Semester 1",
    "sem.1.subtitle": "Preparation Stage (TPB)",
    "sem.2.title": "Semester 2",
    "sem.2.subtitle": "Preparation Stage (TPB)",
    "sem.3.title": "Semester 3",
    "sem.3.subtitle": "Data Science Program",
    "sem.4.title": "Semester 4",
    "sem.4.subtitle": "Data Science Program",
    "sem.5.title": "Semester 5",
    "sem.5.subtitle": "Data Science Program",
    "sem.6.title": "Semester 6",
    "sem.6.subtitle": "Data Science Program",

    // Curriculum
    "curriculum.title": "Curriculum & Knowledge Hierarchy",
    "curriculum.subtitle": "Manage subjects, study topics, and track concept mastery levels.",
    "curriculum.add_subject": "Add Subject",
    "curriculum.add_topic": "Add Topic",
    "curriculum.search": "Search topics or subjects...",
    "curriculum.no_subjects": "No subjects registered yet",
    "curriculum.topics_count": "{count} Topics",
    "curriculum.mastery": "Mastery Level",
    "curriculum.edit_subject": "Edit Subject",
    "curriculum.delete_subject": "Delete Subject",
    "curriculum.view_materials": "Open Materials",

    // Planner
    "planner.title": "Study Planner & Adaptive Scheduler",
    "planner.subtitle": "Manage study plans and seamlessly integrate daily study schedules.",
    "planner.add_plan": "Create New Plan",
    "planner.generate_ai": "Generate AI Plan",
    "planner.active_plans": "Active Plans",
    "planner.calendar_view": "Calendar View",
    "planner.schedule_session": "Schedule Session",

    // Session (Focus Study Hub)
    "session.title": "Focus Study Hub & Pomodoro Timer",
    "session.subtitle": "Focused study session with Pomodoro intervals, study journal, and recall quizzes.",
    "session.start": "Start Session",
    "session.pause": "Pause",
    "session.resume": "Resume",
    "session.stop": "Complete",
    "session.work_mode": "Focus Study",
    "session.break_mode": "Short Break",
    "session.select_topic": "Select Study Topic",
    "session.notes_placeholder": "Write key notes and takeaways from this session...",

    // Quizzes (Active Recall)
    "quizzes.title": "Active Recall & AI Quiz Generator",
    "quizzes.subtitle": "Test your retention with targeted quizzes based on curriculum materials.",
    "quizzes.generate": "Generate New Quiz",
    "quizzes.start": "Start Quiz",
    "quizzes.submit": "Submit Answers",
    "quizzes.score": "Quiz Score",
    "quizzes.explanation": "Explanation & Solution",
    "quizzes.next_question": "Next Question",
    "quizzes.finish": "Finish Quiz",
    "quizzes.past_attempts": "Past Quiz Attempts",

    // Mistakes
    "mistakes.title": "Mistake Bank & Root Cause Analysis",
    "mistakes.subtitle": "Track quiz mistakes, analyze conceptual gaps, and execute remedial drills.",
    "mistakes.add": "Log Mistake Manually",
    "mistakes.no_mistakes": "No active mistakes! Your material mastery is outstanding.",
    "mistakes.resolve": "Mark Resolved",
    "mistakes.root_cause": "Root Cause",
    "mistakes.remedy": "Remedial Remedy",
    "mistakes.unresolved": "Unresolved",
    "mistakes.resolved": "Mastered",

    // Analytics
    "analytics.title": "Progress Analytics & FSRS Retention Curve",
    "analytics.subtitle": "Visualize 14-day study time, memory retention, and syllabus mastery progress.",
    "analytics.total_study_time": "Total Study Time",
    "analytics.completed_sessions": "Completed Sessions",
    "analytics.avg_quiz_score": "Average Quiz Score",
    "analytics.fsrs_mastery": "FSRS Mastery Level",
    "analytics.heatmap_title": "14-Day Study Activity",
    "analytics.retention_curve": "Memory Retention Curve",

    // Settings
    "settings.title": "System Settings & Preferences",
    "settings.subtitle": "Configure language preferences, Google Drive source, AI gateway, and Pomodoro intervals.",
    "settings.language": "Language Settings",
    "settings.theme": "Appearance Theme",
    "settings.language_id": "Bahasa Indonesia",
    "settings.language_en": "English",
    "settings.save": "Save Preferences",
    "settings.saved_success": "Preferences saved successfully!",
    "settings.system_title": "System & Learning Settings",
    "settings.system_subtitle": "Configure Google Drive sources, AI Gateway models, and study session intervals.",
    "settings.active_id": "Active: Bahasa Indonesia",
    "settings.active_en": "Active: English",
    "settings.choose_language": "Choose application display language. You can also switch language at any time via the globe icon in the top navigation bar.",
    "settings.default_translation": "Default • Full translation",
    "settings.international_translation": "International • Full translation",
    "settings.drive_source": "Google Drive Learning Source",
    "settings.connected_readonly": "Connected (Read-Only)",
    "settings.folder_id": "Folder ID:",
    "settings.drive_description": "Learan OS operates strictly with drive.file read-only permissions. Documents are parsed and indexed locally without modifying or deleting files in your Google Drive.",
    "settings.view_drive": "View Source Folder in Drive",
    "settings.ai_router": "AI Gateway & Model Router",
    "settings.prompt_guard": "Prompt Guard Active",
    "settings.provider": "Provider",
    "settings.model_architecture": "Model Architecture",
    "settings.session_preferences": "Study Session & Pomodoro Preferences",
    "settings.daily_target": "Daily Study Target (mins)",
    "settings.work_interval": "Pomodoro Work Interval (mins)",
    "settings.break_interval": "Short Break Interval (mins)",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    "common.no_data": "No data",
    "common.view_all": "View All",
    "common.back": "Back",
    "common.close": "Close",
    "common.date": "Date",
    "common.start_time": "Start Time",
    "common.end_time": "End Time",
    "common.subject": "Subject",
    "common.topic": "Topic",
    "common.no_subject": "No Subject",
    "common.no_topic": "No Topic",
    "common.optional": "Optional",
    "common.status": "Status",
    "common.notes": "Session Notes",
    "common.cancel_action": "Cancel",
    "common.save_changes": "Save Changes",
    "common.saving": "Saving...",
    "common.schedule": "Schedule",
    "common.scheduled": "Scheduled",
    "common.in_progress": "In Progress",
    "common.completed": "Completed",
    "common.skipped": "Skipped",
    "common.session_notes_placeholder": "Key goals or focus pointers...",
    "task.edit": "Edit Task",
    "task.create": "Create Learning Task",
    "task.title": "Task Title",
    "task.description": "Description (Optional)",
    "task.priority": "Priority",
    "task.duration": "Duration (mins)",
    "task.deadline": "Deadline",
    "task.low": "Low",
    "task.medium": "Medium",
    "task.high": "High",
    "task.urgent": "Urgent",
    "task.todo": "To Do",
    "task.cancelled": "Cancelled",
  },
};

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Language) || "id";
    }
    return "id";
  });

  const setLang = React.useCallback((l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", l);
    }
  }, []);

  const t = React.useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let str = translations[lang]?.[key] ?? translations["id"]?.[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return str;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useLanguage() {
  return React.useContext(LanguageContext);
}
