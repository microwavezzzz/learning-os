"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderSync,
  FileText,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Folder,
  Download,
  Eye,
  GraduationCap,
  Sparkles,
  BookMarked,
  BrainCircuit,
  FileCode,
  FileSpreadsheet,
  FileDown,
  Layers,
  File,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MaterialFileRecord } from "@/db/repositories/materials";
import { useLanguage } from "@/contexts/language-context";

// Semester Metadata Definitions
const SEMESTER_METADATA = [
  {
    num: 1,
    title: "Semester 1",
    subtitle: "Tahap Persiapan Bersama (TPB)",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-500 text-white",
    description: "Matematika Dasar, Fisika Dasar, Kimia Dasar, Biologi Dasar, PKS, dan Bahasa Indonesia.",
    totalSks: 18,
  },
  {
    num: 2,
    title: "Semester 2",
    subtitle: "Tahap Persiapan Bersama (TPB)",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    badgeColor: "bg-sky-500 text-white",
    description: "Matematika Dasar 2, Fisika Dasar 2, Kimia Dasar 2, PKS 2, Bahasa Inggris, LHS, dan Olahraga.",
    totalSks: 18,
  },
  {
    num: 3,
    title: "Semester 3",
    subtitle: "Program Studi Sains Data",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    badgeColor: "bg-emerald-500 text-white",
    description: "Struktur Data, Algoritma Pemrograman, Teori Peluang, Basis Data, Logika Diskrit, dan Aljabar Linier Elementer.",
    totalSks: 19,
  },
  {
    num: 4,
    title: "Semester 4",
    subtitle: "Program Studi Sains Data",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    badgeColor: "bg-indigo-500 text-white",
    description: "Statistika Sains Data, Metode Numerik, Analisis Data Statistik, Teknologi Basis Data, Pemrograman Berbasis Fungsi, Algoritma Strategi.",
    totalSks: 18,
  },
  {
    num: 5,
    title: "Semester 5",
    subtitle: "Program Studi Sains Data",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500 text-white",
    description: "Pembelajaran Mesin, Data Mining, Teori Optimasi, Komputasi Statistik, Proses Stokastik, Pergudangan Data.",
    totalSks: 19,
  },
  {
    num: 6,
    title: "Semester 6",
    subtitle: "Program Studi Sains Data",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    badgeColor: "bg-purple-500 text-white",
    description: "Deep Learning, Kecerdasan Buatan, Visualisasi Data dan Informasi, Analitik Bisnis, Keamanan & Privasi Data, Metode Penelitian.",
    totalSks: 18,
  },
];

function formatBytes(bytes: number) {
  if (!bytes) return "1.5 MB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(fileName: string) {
  if (fileName.endsWith(".pdf")) return <FileText className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />;
  if (fileName.endsWith(".pptx") || fileName.endsWith(".ppt")) return <FileSpreadsheet className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />;
  if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) return <FileCode className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />;
  return <File className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />;
}

export default function MaterialsPage() {
  const { t } = useLanguage();
  const [materials, setMaterials] = React.useState<MaterialFileRecord[]>([]);
  const [activeSemesterTab, setActiveSemesterTab] = React.useState<number | "all">("all");
  const [filterWajibOnly, setFilterWajibOnly] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncMessage, setSyncMessage] = React.useState("");

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const json = await res.json();
        setMaterials(json);
      }
    } catch (e) {
      console.error("Failed to load materials:", e);
    }
  };

  React.useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDriveSync = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage("");
      const res = await fetch("/api/materials/drive-sync", { method: "POST" });
      if (res.ok) {
        setSyncMessage(t("materials.sync_success"));
        fetchMaterials();
      }
    } catch (e) {
      console.error("Drive sync failed:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Group materials by subject (Mata Kuliah)
  const coursesMap = React.useMemo(() => {
    const map = new Map<string, {
      subjectId: string;
      subjectTitle: string;
      semester: number;
      courseType: string;
      sks: number;
      driveFileId?: string;
      driveUrl?: string;
      files: MaterialFileRecord[];
    }>();

    materials.forEach((m) => {
      const subId = m.subjectId || m.id;
      const subTitle = m.subjectTitle || m.name.replace("BMSD_", "").replace(".pdf", "");
      const sem = m.semester || 1;

      if (!map.has(subId)) {
        map.set(subId, {
          subjectId: subId,
          subjectTitle: subTitle,
          semester: sem,
          courseType: m.courseType || "wajib",
          sks: m.sks || 3,
          driveFileId: m.driveFileId || undefined,
          driveUrl: m.driveUrl || undefined,
          files: [],
        });
      }

      map.get(subId)!.files.push(m);
    });

    return Array.from(map.values());
  }, [materials]);

  // Filter courses based on active search & semester
  const filteredCourses = coursesMap.filter((c) => {
    const matchesSearch =
      c.subjectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.files.some((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSemester =
      activeSemesterTab === "all" || c.semester === activeSemesterTab;

    const matchesWajib = !filterWajibOnly || c.courseType === "wajib";

    return matchesSearch && matchesSemester && matchesWajib;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("materials.title")}
            </h1>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              {t("materials.badge_count")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("materials.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDriveSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? t("materials.syncing") : t("materials.sync_btn")}</span>
          </Button>
          <Button size="sm" asChild>
            <Link href="/quizzes" className="flex items-center gap-1.5 text-xs">
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>{t("nav.quizzes")}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Sync Success Notification */}
      {syncMessage && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {syncMessage}
          </span>
          <button onClick={() => setSyncMessage("")} className="text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>
      )}

      {/* Google Drive Source Info Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm sm:text-base">
                  Bank Materi Sains Data (BMSD)
                </span>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                  Google Drive Live
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground block mt-0.5">
                Sumber: Folder ID <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP</code> • TPB (Sem 1-2) & Prodi (Sem 3-6)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t lg:border-t-0 pt-3 lg:pt-0">
            <div className="text-center px-2">
              <p className="font-bold text-foreground text-base">{coursesMap.length}</p>
              <p className="text-[11px]">{t("materials.total_courses")}</p>
            </div>
            <div className="text-center px-2 border-x border-border/60">
              <p className="font-bold text-foreground text-base">{materials.length}</p>
              <p className="text-[11px]">{t("materials.total_files")}</p>
            </div>
            <div className="text-center px-2">
              <p className="font-bold text-foreground text-base">6</p>
              <p className="text-[11px]">{t("materials.total_semesters")}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs ml-2">
              <a
                href="https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                <span>{t("materials.open_root_gdrive")}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Semester Selection Tabs & Search Controls */}
      <div className="space-y-3">
        {/* Semester Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 text-xs scrollbar-none">
          <button
            onClick={() => setActiveSemesterTab("all")}
            className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSemesterTab === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{t("materials.all_semesters")} ({coursesMap.length})</span>
          </button>

          {SEMESTER_METADATA.map((sem) => {
            const count = coursesMap.filter((c) => c.semester === sem.num).length;
            const isActive = activeSemesterTab === sem.num;
            return (
              <button
                key={sem.num}
                onClick={() => setActiveSemesterTab(sem.num)}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? `${sem.badgeColor} shadow-sm font-semibold`
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{t(`sem.${sem.num}.title`)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20" : "bg-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("materials.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterWajibOnly(!filterWajibOnly)}
              className={`px-3 py-1.5 rounded-md text-xs border flex items-center gap-1.5 transition-colors ${
                filterWajibOnly
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-medium"
                  : "bg-background border-input text-muted-foreground"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("materials.wajib_filter")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── SEMESTER-GROUPED CONTENT ── */}
      <div className="space-y-6">
        {SEMESTER_METADATA.filter(
          (sem) => activeSemesterTab === "all" || activeSemesterTab === sem.num
        ).map((sem) => {
          const semCourses = filteredCourses.filter((c) => c.semester === sem.num);
          if (semCourses.length === 0 && activeSemesterTab !== "all") {
            return (
              <Card key={sem.num} className="p-8 text-center border-dashed">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">{t("materials.no_results")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("materials.no_results_desc")}</p>
              </Card>
            );
          }
          if (semCourses.length === 0) return null;

          return (
            <div key={sem.num} className="glass-subcard rounded-3xl overflow-hidden shadow-lg border border-white/60 dark:border-white/10">
              {/* Semester Header Banner with soft glass tint */}
              <div className={`px-6 py-4.5 ${sem.bgColor} border-b border-white/50 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md`}>
                <div className="flex items-center gap-3.5">
                  <div className={`px-3 py-1 rounded-xl text-xs font-black shadow-sm ${sem.badgeColor}`}>
                    {t(`sem.${sem.num}.title`)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {t(`sem.${sem.num}.subtitle`)}
                    </h2>
                    <p className="text-xs text-foreground/70 mt-0.5">
                      {sem.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs flex-shrink-0">
                  <Badge variant="outline" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md font-bold text-[11px] px-3 py-1 rounded-full">
                    {semCourses.length} {t("materials.course_type")}
                  </Badge>
                </div>
              </div>

              {/* Course Cards Grid */}
              <div className="p-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {semCourses.map((course) => {
                  const gdriveFolderUrl = course.driveUrl && course.driveUrl.startsWith("http")
                    ? course.driveUrl
                    : (course.driveFileId ? `https://drive.google.com/drive/folders/${course.driveFileId}` : "https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP");

                  const primaryMat = course.files[0];

                  return (
                    <Card
                      key={course.subjectId}
                      className="glass-subcard rounded-2xl flex flex-col justify-between"
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              {t("materials.course_type")}
                            </Badge>
                          </div>

                          <Badge variant="secondary" className="text-[10px] text-muted-foreground font-mono">
                            {course.files.length} {t("materials.files_count")}
                          </Badge>
                        </div>

                        <CardTitle className="text-sm font-bold mt-2.5 line-clamp-2 text-foreground" title={course.subjectTitle}>
                          {course.subjectTitle}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-1 mt-0.5">
                          Bank Materi Sains Data (BMSD)
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-1 space-y-3">
                        {/* List of real files inside this Google Drive folder */}
                        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                          {course.files.map((file, fIdx) => {
                            const fileDirectUrl = file.driveUrl && file.driveUrl.startsWith("http")
                              ? file.driveUrl
                              : gdriveFolderUrl;

                            return (
                              <div
                                key={fIdx}
                                className="p-1.5 rounded-md bg-muted/40 hover:bg-muted/80 transition-colors flex items-center justify-between text-xs gap-2"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {getFileIcon(file.name)}
                                  <span className="truncate text-[11px] font-medium" title={file.name}>
                                    {file.name}
                                  </span>
                                </div>

                                <a
                                  href={fileDirectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 text-[10px] flex items-center gap-0.5 flex-shrink-0"
                                >
                                  <span>GDrive</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            );
                          })}
                        </div>

                        {/* Direct Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                          {/* Open Real GDrive Folder */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-medium"
                            asChild
                          >
                            <a href={gdriveFolderUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>{t("materials.open_gdrive")}</span>
                            </a>
                          </Button>

                          {/* Open Dual Reader */}
                          {primaryMat ? (
                            <Button size="sm" className="h-8 text-xs gap-1.5 shadow-sm" asChild>
                              <Link href={`/materials/${primaryMat.id}`}>
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>{t("materials.dual_reader")}</span>
                              </Link>
                            </Button>
                          ) : (
                            <Button size="sm" className="h-8 text-xs gap-1.5 shadow-sm" asChild>
                              <Link href={`/quizzes`}>
                                <BrainCircuit className="h-3.5 w-3.5" />
                                <span>{t("materials.quiz")}</span>
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty state for search */}
        {filteredCourses.length === 0 && (
          <Card className="p-10 text-center border-dashed">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-semibold text-foreground text-base">{t("materials.no_results")}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              {t("materials.no_results_desc")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-xs"
              onClick={() => {
                setSearchQuery("");
                setActiveSemesterTab("all");
                setFilterWajibOnly(false);
              }}
            >
              {t("materials.reset_filter")}
            </Button>
          </Card>
        )}
      </div>

      {/* Footer info */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div>
          <span>🎓 {t("materials.footer_label")} </span>
          <span className="font-medium text-foreground">{t("materials.footer_count")}</span>
        </div>
        <div>
          <a
            href="https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Bank Materi Sains Data (BMSD)
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
