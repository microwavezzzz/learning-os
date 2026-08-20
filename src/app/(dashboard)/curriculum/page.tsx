"use client";

import * as React from "react";
import {
  BookOpen,
  Plus,
  Search,
  Layers,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Map,
  ListTree,
  FileText,
  Clock,
  GraduationCap,
  CheckCircle2,
  FolderSync,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubjectRecord } from "@/db/repositories/subjects";
import { TopicRecord } from "@/db/repositories/topics";
import { SubjectModal } from "@/components/curriculum/subject-modal";
import { TopicModal } from "@/components/curriculum/topic-modal";
import { RoadmapView } from "@/components/curriculum/roadmap-view";
import { useLanguage } from "@/contexts/language-context";

// Semester Metadata Definitions matching the BMSD Curriculum structure
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

export default function CurriculumPage() {
  const { t, lang } = useLanguage();
  const [subjects, setSubjects] = React.useState<SubjectRecord[]>([]);
  const [topics, setTopics] = React.useState<TopicRecord[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = React.useState<number | "all">("all");
  const [activeTab, setActiveTab] = React.useState<"tree" | "roadmap">("tree");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedTopics, setExpandedTopics] = React.useState<Record<string, boolean>>({});

  // Modals state
  const [subjectModalOpen, setSubjectModalOpen] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState<SubjectRecord | null>(null);

  const [topicModalOpen, setTopicModalOpen] = React.useState(false);
  const [editingTopic, setEditingTopic] = React.useState<TopicRecord | null>(null);
  const [defaultParentId, setDefaultParentId] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subjectsRes, topicsRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/topics"),
      ]);
      const subjectsData = await subjectsRes.json();
      const topicsData = await topicsRes.json();

      setSubjects(subjectsData);
      setTopics(topicsData);

      if (!selectedSubjectId && subjectsData.length > 0) {
        setSelectedSubjectId(subjectsData[0].id);
      }
    } catch (e) {
      console.error("Failed to load curriculum:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject and all its topics?")) return;
    try {
      await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error("Failed to delete subject:", e);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await fetch(`/api/topics/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error("Failed to delete topic:", e);
    }
  };

  const handleOpenAddSubtopic = (parentTopic: TopicRecord) => {
    setEditingTopic(null);
    setDefaultParentId(parentTopic.id);
    setSelectedSubjectId(parentTopic.subjectId);
    setTopicModalOpen(true);
  };

  const handleOpenEditTopic = (topic: TopicRecord) => {
    setEditingTopic(topic);
    setDefaultParentId(topic.parentId || null);
    setSelectedSubjectId(topic.subjectId);
    setTopicModalOpen(true);
  };

  // Filter subjects by semester and search query
  const filteredSubjects = subjects.filter((s) => {
    const matchesSemester = selectedSemester === "all" || s.semester === selectedSemester;
    const matchesSearch =
      searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSemester && matchesSearch;
  });

  // Ensure activeSubject is selected correctly
  const activeSubject =
    subjects.find((s) => s.id === selectedSubjectId) ||
    filteredSubjects[0] ||
    subjects[0] ||
    null;

  // Topics under active subject
  const subjectTopics = topics.filter((tItem) => tItem.subjectId === activeSubject?.id);
  const rootTopics = subjectTopics.filter((tItem) => !tItem.parentId);
  const filteredTopics = rootTopics.filter(
    (tItem) =>
      searchQuery === "" ||
      tItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tItem.description && tItem.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up">
      {/* ── HEADER & ACTIONS ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/40 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            <span className="text-gradient-welcome">{t("curriculum.title")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground/70 font-medium mt-0.5">
            {lang === "id"
              ? "Pohon struktur kurikulum Sains Data & TPB dikelompokkan berdasarkan semester perkuliahan."
              : "Knowledge tree and curriculum structured by academic semester."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingSubject(null);
              setSubjectModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 text-xs font-bold shadow-sm hover:bg-white/70 dark:hover:bg-slate-800/70"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>{t("curriculum.add_subject")}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingTopic(null);
              setDefaultParentId(null);
              setTopicModalOpen(true);
            }}
            disabled={subjects.length === 0}
            className="flex items-center gap-1.5 btn-gradient-magenta text-white font-bold rounded-xl text-xs shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>{t("curriculum.add_topic")}</span>
          </Button>
        </div>
      </div>

      {/* ── SEMESTER SELECTOR PILLS (GROUPING) ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>{lang === "id" ? "Kelompok Semester" : "Semester Grouping"}</span>
          </span>
          <span className="text-xs text-foreground/60 font-mono">
            {filteredSubjects.length} {lang === "id" ? "Mata Kuliah" : "Courses"}
          </span>
        </div>

        {/* Semester Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedSemester("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedSemester === "all"
                ? "bg-gradient-to-r from-primary to-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] border-white/40 scale-105"
                : "bg-white/40 dark:bg-slate-800/40 text-foreground/80 hover:text-foreground hover:bg-white/70 dark:hover:bg-slate-800/70 border-white/60 dark:border-white/10 backdrop-blur-md"
            }`}
          >
            <Layers className="h-3.5 w-3.5 inline mr-1.5" />
            <span>{lang === "id" ? "Semua Semester" : "All Semesters"} ({subjects.length})</span>
          </button>

          {SEMESTER_METADATA.map((sem) => {
            const count = subjects.filter((s) => s.semester === sem.num).length;
            const isSelected = selectedSemester === sem.num;

            return (
              <button
                key={sem.num}
                onClick={() => setSelectedSemester(sem.num)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? `${sem.badgeColor} shadow-[0_4px_16px_rgba(31,38,135,0.2)] border-white/40 scale-105`
                    : "bg-white/40 dark:bg-slate-800/40 text-foreground/80 hover:text-foreground hover:bg-white/70 dark:hover:bg-slate-800/70 border-white/60 dark:border-white/10 backdrop-blur-md"
                }`}
              >
                <span>{t(`sem.${sem.num}.title`)}</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono ${isSelected ? "bg-white/25 text-white" : "bg-white/60 dark:bg-slate-700/60 text-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN VIEW MODE TABS (Tree vs Roadmap) & SEARCH ─────────────── */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="tree" className="flex items-center gap-2">
              <ListTree className="h-4 w-4" />
              <span>{lang === "id" ? "Pohon Topik & Materi" : "Curriculum Tree"}</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span>{lang === "id" ? "Roadmap Belajar" : "Learning Roadmap"}</span>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
            <Input
              placeholder={t("curriculum.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-white/10"
            />
          </div>
        </div>

        {/* ── TAB 1: CURRICULUM TREE VIEW (SEMESTER-GROUPED) ──────────── */}
        <TabsContent value="tree" className="space-y-6 mt-4">
          {/* Subjects Navigation Pills under Active Semester */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider block">
              {lang === "id" ? "Pilih Mata Kuliah:" : "Select Course:"}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {filteredSubjects.map((sub) => {
                const isSelected = sub.id === activeSubject?.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? "bg-gradient-to-r from-primary to-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] border-white/40 scale-105"
                        : "bg-white/40 dark:bg-slate-800/40 text-foreground/80 hover:text-foreground hover:bg-white/70 dark:hover:bg-slate-800/70 border-white/60 dark:border-white/10 backdrop-blur-md"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full shadow-sm"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span>{sub.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isSelected ? "bg-white/25 text-white" : "bg-white/60 dark:bg-slate-700/60 text-foreground"}`}>
                      {sub.sks || 3} SKS
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Course Details & Topics Hierarchy Canvas */}
          {activeSubject ? (
            <Card className="glass-subcard rounded-3xl border border-white/60 dark:border-white/10 shadow-xl overflow-hidden">
              {/* Course Header Banner */}
              <CardHeader className="p-5 sm:p-6 pb-4 border-b border-white/40 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className="h-4 w-4 rounded-full shadow-md"
                      style={{ backgroundColor: activeSubject.color }}
                    />
                    <CardTitle className="text-xl font-bold text-foreground">
                      {activeSubject.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                      Semester {activeSubject.semester || 1} • {activeSubject.courseType || "Wajib"} ({activeSubject.sks || 3} SKS)
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-mono">
                      Mastery: {activeSubject.averageMastery || 0}%
                    </Badge>
                  </div>
                  {activeSubject.description && (
                    <CardDescription className="text-xs text-foreground/70">
                      {activeSubject.description}
                    </CardDescription>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSubject(activeSubject);
                      setSubjectModalOpen(true);
                    }}
                    className="h-8 rounded-xl text-xs gap-1 border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-primary" />
                    <span>{lang === "id" ? "Edit MK" : "Edit"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => handleDeleteSubject(activeSubject.id)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl"
                    title="Delete Subject"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Topics Hierarchy List */}
              <CardContent className="p-5 sm:p-6 space-y-4">
                {filteredTopics.length === 0 ? (
                  <div className="p-10 text-center text-sm text-foreground/60 border border-dashed border-white/50 dark:border-white/10 rounded-3xl bg-white/20 dark:bg-slate-800/20">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 text-primary/40" />
                    <p className="font-bold text-foreground">
                      {lang === "id" ? "Belum ada topik dalam mata kuliah ini" : "No topics found in this subject"}
                    </p>
                    <p className="text-xs text-foreground/60 mt-1 max-w-sm mx-auto">
                      {lang === "id"
                        ? "Klik \"Tambah Topik\" untuk mulai menyusun pohon pengetahuan Anda."
                        : "Click \"New Topic\" to begin building your knowledge tree."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTopics.map((topic) => {
                      const subtopics = topics.filter((tItem) => tItem.parentId === topic.id);
                      const isExpanded = expandedTopics[topic.id] ?? true;

                      return (
                        <div
                          key={topic.id}
                          className="glass-subcard rounded-2xl border border-white/50 dark:border-white/10 overflow-hidden transition-all hover:border-primary/40 shadow-sm"
                        >
                          {/* Parent Topic Header */}
                          <div className="p-4 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              {subtopics.length > 0 && (
                                <button
                                  onClick={() => toggleExpand(topic.id)}
                                  className="mt-0.5 p-1 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 text-muted-foreground"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              )}

                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant={
                                      topic.status === "completed"
                                        ? "success"
                                        : topic.status === "in_progress"
                                        ? "info"
                                        : topic.status === "needs_review"
                                        ? "warning"
                                        : "secondary"
                                    }
                                    className="text-[10px] capitalize"
                                  >
                                    {topic.status.replace("_", " ")}
                                  </Badge>

                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {topic.difficulty}
                                  </Badge>

                                  {topic.prerequisiteTopics && topic.prerequisiteTopics.length > 0 && (
                                    <span className="text-[11px] text-foreground/60">
                                      {lang === "id" ? "Prasyarat" : "Prerequisites"}: {topic.prerequisiteTopics.map((p) => p.title).join(", ")}
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-base font-bold text-foreground leading-snug">
                                  {topic.title}
                                </h4>

                                {topic.description && (
                                  <p className="text-xs text-foreground/70 line-clamp-2">
                                    {topic.description}
                                  </p>
                                )}

                                {/* Related Materials Chips */}
                                {topic.relatedMaterials && topic.relatedMaterials.length > 0 && (
                                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    {topic.relatedMaterials.map((mat, idx) => (
                                      <a
                                        key={idx}
                                        href={mat.url || "#"}
                                        target={mat.url ? "_blank" : undefined}
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 text-[10px] font-semibold text-foreground transition-colors border border-white/40 dark:border-white/10"
                                      >
                                        <FileText className="h-3 w-3 text-primary" />
                                        <span className="truncate max-w-[150px]">{mat.title}</span>
                                        {mat.url && <ExternalLink className="h-2.5 w-2.5 opacity-60" />}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Side: Mastery & Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-sm font-mono font-black text-primary">
                                  {Math.round(topic.mastery)}%
                                </span>
                                <span className="text-[10px] text-foreground/60 block font-medium">
                                  {lang === "id" ? "Penguasaan" : "Mastery"}
                                </span>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAddSubtopic(topic)}
                                className="h-8 rounded-xl text-xs hidden sm:flex border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 font-semibold"
                              >
                                <Plus className="h-3 w-3 mr-1" /> {lang === "id" ? "Subtopik" : "Subtopic"}
                              </Button>

                              <Button
                                variant="ghost"
                                size="iconSm"
                                onClick={() => handleOpenEditTopic(topic)}
                                className="rounded-xl"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="iconSm"
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="text-rose-500 hover:text-rose-600 rounded-xl"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Nested Subtopics List */}
                          {subtopics.length > 0 && isExpanded && (
                            <div className="bg-white/20 dark:bg-slate-900/30 border-t border-white/40 dark:border-white/10 px-5 py-3 space-y-2">
                              {subtopics.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 text-xs hover:border-primary/40 transition-colors shadow-sm"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-primary font-mono text-[11px] font-bold">↳</span>
                                    <div className="min-w-0">
                                      <span className="font-bold text-foreground truncate block">
                                        {sub.title}
                                      </span>
                                      {sub.description && (
                                        <span className="text-[11px] text-foreground/60 truncate block">
                                          {sub.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge
                                      variant={sub.status === "completed" ? "success" : "secondary"}
                                      className="text-[10px] capitalize"
                                    >
                                      {sub.status.replace("_", " ")}
                                    </Badge>
                                    <span className="font-mono text-xs text-primary font-bold">
                                      {Math.round(sub.mastery)}%
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="iconSm"
                                      onClick={() => handleOpenEditTopic(sub)}
                                      className="rounded-lg"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="iconSm"
                                      onClick={() => handleDeleteTopic(sub.id)}
                                      className="text-rose-500 hover:text-rose-600 rounded-lg"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center glass-subcard rounded-3xl">
              <p className="text-foreground/70 text-sm">{lang === "id" ? "Tidak ada mata kuliah yang cocok dengan filter." : "No courses match the current filter."}</p>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB 2: LEARNING ROADMAP VIEW ────────────────────────────── */}
        <TabsContent value="roadmap" className="mt-4">
          <Card className="glass-subcard rounded-3xl border border-white/60 dark:border-white/10 p-6 shadow-xl">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Map className="h-5 w-5 text-primary" />
                <span>Visual Learning Roadmap</span>
              </CardTitle>
              <CardDescription>
                Sequential milestones with prerequisite dependencies and mastery progression across all semesters.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RoadmapView
                subjects={subjects}
                topics={topics}
                onSelectTopic={(tItem) => handleOpenEditTopic(tItem)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <SubjectModal
        open={subjectModalOpen}
        onOpenChange={setSubjectModalOpen}
        subject={editingSubject}
        onSaved={fetchData}
      />

      <TopicModal
        open={topicModalOpen}
        onOpenChange={setTopicModalOpen}
        topic={editingTopic}
        subjects={subjects}
        allTopics={topics}
        defaultSubjectId={selectedSubjectId || undefined}
        defaultParentId={defaultParentId}
        onSaved={fetchData}
      />
    </div>
  );
}
