"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  CheckSquare,
  Sparkles,
  Award,
  Clock,
  FileText,
  Coffee,
  CheckCircle2,
  ListCheck,
  Maximize2,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SubjectRecord } from "@/db/repositories/subjects";
import { TopicRecord } from "@/db/repositories/topics";
import { StudySessionRecord } from "@/db/repositories/study-sessions";
import { PostSessionModal, SessionCompletionData } from "@/components/session/post-session-modal";
import { StudyJournal } from "@/components/session/study-journal";
import { formatTimerSeconds, formatMinutes } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

type TimerState = "idle" | "running" | "paused" | "break";

function SessionContent() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const queryTopicId = searchParams.get("topicId");

  const [activeTab, setActiveTab] = React.useState<"focus" | "journal">("focus");

  // Data states
  const [subjects, setSubjects] = React.useState<SubjectRecord[]>([]);
  const [topics, setTopics] = React.useState<TopicRecord[]>([]);
  const [sessions, setSessions] = React.useState<StudySessionRecord[]>([]);

  // Session configuration
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>("");
  const [technique, setTechnique] = React.useState<"pomodoro" | "deep_work">("pomodoro");
  const [plannedMinutes, setPlannedMinutes] = React.useState<number>(25);

  // Timer states
  const [timerState, setTimerState] = React.useState<TimerState>("idle");
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = React.useState<string>("");

  // In-session Notes & Checkpoints
  const [sessionNotes, setSessionNotes] = React.useState<string>("");
  const [checkpoints, setCheckpoints] = React.useState<{ id: string; text: string; done: boolean }[]>([
    { id: "c1", text: lang === "id" ? "Pahami konsep dan definisi materi utama" : "Read core concept definitions", done: false },
    { id: "c2", text: lang === "id" ? "Kerjakan latihan kode / pembuktian soal" : "Work through primary code / proof example", done: false },
  ]);
  const [newCheckpointText, setNewCheckpointText] = React.useState("");

  // Reflection Modal State
  const [completionData, setCompletionData] = React.useState<SessionCompletionData | null>(null);
  const [reflectionModalOpen, setReflectionModalOpen] = React.useState(false);

  // Load subjects, topics, and past sessions
  const fetchData = async () => {
    try {
      const [subRes, topRes, sessRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/topics"),
        fetch("/api/study-sessions"),
      ]);

      const [subData, topData, sessData] = await Promise.all([
        subRes.json(),
        topRes.json(),
        sessRes.json(),
      ]);

      setSubjects(subData);
      setTopics(topData);
      setSessions(sessData);

      // Auto-select topic if passed via query
      if (queryTopicId) {
        const found = topData.find((tItem: TopicRecord) => tItem.id === queryTopicId);
        if (found) {
          setSelectedTopicId(found.id);
          setSelectedSubjectId(found.subjectId);
        }
      } else if (topData.length > 0 && !selectedTopicId) {
        setSelectedTopicId(topData[0].id);
        setSelectedSubjectId(topData[0].subjectId);
      }
    } catch (e) {
      console.error("Failed to load session prerequisites:", e);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [queryTopicId]);

  // Timer Tick Hook
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState === "running") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setTimerState("break");
            return 5 * 60; // 5 min break
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState]);

  // Handle Technique Change
  const handleTechniqueChange = (val: string) => {
    const tech = val as "pomodoro" | "deep_work";
    setTechnique(tech);
    const mins = tech === "pomodoro" ? 25 : 50;
    setPlannedMinutes(mins);
    if (timerState === "idle") {
      setSecondsRemaining(mins * 60);
    }
  };

  // Timer Actions
  const handleStartTimer = () => {
    if (timerState === "idle") {
      setSessionStartTime(new Date().toISOString());
    }
    setTimerState("running");
  };

  const handlePauseTimer = () => {
    setTimerState("paused");
  };

  const handleResetTimer = () => {
    setTimerState("idle");
    setSecondsRemaining(plannedMinutes * 60);
    setElapsedSeconds(0);
  };

  const handleFinishSession = () => {
    const endIso = new Date().toISOString();
    const activeSub = subjects.find((s) => s.id === selectedSubjectId);
    const activeTop = topics.find((tItem) => tItem.id === selectedTopicId);

    setCompletionData({
      subjectId: selectedSubjectId || null,
      subjectTitle: activeSub?.title,
      topicId: selectedTopicId || null,
      topicTitle: activeTop?.title,
      plannedDurationMinutes: plannedMinutes,
      actualElapsedSeconds: Math.max(elapsedSeconds, 60),
      startTime: sessionStartTime || new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endTime: endIso,
      technique,
      notesMarkdown: sessionNotes,
    });

    setTimerState("idle");
    setSecondsRemaining(plannedMinutes * 60);
    setElapsedSeconds(0);
    setReflectionModalOpen(true);
  };

  const handleAddCheckpoint = () => {
    if (!newCheckpointText.trim()) return;
    setCheckpoints([
      ...checkpoints,
      { id: "c-" + Date.now(), text: newCheckpointText.trim(), done: false },
    ]);
    setNewCheckpointText("");
  };

  const handleToggleCheckpoint = (id: string) => {
    setCheckpoints(
      checkpoints.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  const handleRemoveCheckpoint = (id: string) => {
    setCheckpoints(checkpoints.filter((c) => c.id !== id));
  };

  const activeTopic = topics.find((tItem) => tItem.id === selectedTopicId);
  const filteredTopics = topics.filter((tItem) => !selectedSubjectId || tItem.subjectId === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("session.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("session.subtitle")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="focus" className="flex items-center gap-1.5 text-xs">
              <Timer className="h-3.5 w-3.5" />
              <span>{lang === "id" ? "Mode Fokus" : "Focus Mode"}</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{lang === "id" ? `Jurnal Belajar (${sessions.length})` : `Study Journal (${sessions.length})`}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "focus" && (
        <div className="space-y-6">
          {/* Pre-Session Setup Bar */}
          <div className="p-4 rounded-xl border bg-card/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {lang === "id" ? "Mata Kuliah" : "Subject"}
                </label>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    const firstTopic = topics.find((tItem) => tItem.subjectId === e.target.value);
                    if (firstTopic) setSelectedTopicId(firstTopic.id);
                  }}
                  disabled={timerState === "running"}
                >
                  <option value="">{lang === "id" ? "Pilih Mata Kuliah" : "Select Subject"}</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {lang === "id" ? "Fokus Topik" : "Topic Focus"}
                </label>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm max-w-[220px]"
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  disabled={timerState === "running"}
                >
                  <option value="">{lang === "id" ? "Pilih Topik" : "Select Topic"}</option>
                  {filteredTopics.map((tItem) => (
                    <option key={tItem.id} value={tItem.id}>
                      {tItem.title} ({Math.round(tItem.mastery)}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {lang === "id" ? "Teknik" : "Technique"}
                </label>
                <Tabs value={technique} onValueChange={handleTechniqueChange}>
                  <TabsList className="h-8">
                    <TabsTrigger value="pomodoro" className="text-xs px-2.5" disabled={timerState === "running"}>
                      Pomodoro (25m)
                    </TabsTrigger>
                    <TabsTrigger value="deep_work" className="text-xs px-2.5" disabled={timerState === "running"}>
                      Deep Work (50m)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Topic Status Pill */}
            {activeTopic && (
              <div className="text-right hidden md:block">
                <span className="text-xs font-semibold text-foreground block">
                  {lang === "id" ? `Penguasaan: ${Math.round(activeTopic.mastery)}%` : `Current Mastery: ${Math.round(activeTopic.mastery)}%`}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize">
                  {activeTopic.difficulty} • {activeTopic.status.replace("_", " ")}
                </span>
              </div>
            )}
          </div>

          {/* MAIN FOCUS WORKSPACE (Two-Pane) */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Pane: Interactive Timer Canvas (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="glass-subcard rounded-3xl flex flex-col items-center justify-center p-8 text-center border-white/60 dark:border-white/10 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={
                      timerState === "break"
                        ? "warning"
                        : timerState === "running"
                        ? "success"
                        : "secondary"
                    }
                    className="text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-sm"
                  >
                    {timerState === "break"
                      ? (lang === "id" ? "☕ Istirahat Sejenak" : "☕ Short Break")
                      : timerState === "running"
                      ? (lang === "id" ? "🔥 Sesi Fokus" : "🔥 Focus Session")
                      : (lang === "id" ? "Siap" : "Ready")}
                  </Badge>

                  {activeTopic && (
                    <Badge variant="outline" className="text-xs rounded-full bg-white/40 dark:bg-slate-800/40">
                      {activeTopic.title}
                    </Badge>
                  )}
                </div>

                {/* Big Digital Timer Display with Amber Glow */}
                <div className="font-mono text-7xl sm:text-8xl font-black tracking-tighter text-amber-400 dark:text-amber-300 timer-digital-glow my-4 select-none">
                  {formatTimerSeconds(secondsRemaining)}
                </div>

                {/* Actual Elapsed Study Time Counter */}
                <div className="flex items-center gap-2 text-xs font-mono text-foreground/70 mb-6">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{lang === "id" ? `Waktu Berjalan: ${formatTimerSeconds(elapsedSeconds)}` : `Actual Time Elapsed: ${formatTimerSeconds(elapsedSeconds)}`}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {timerState !== "running" ? (
                    <Button
                      size="lg"
                      onClick={handleStartTimer}
                      className="px-8 shadow-md flex items-center gap-2"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>{timerState === "paused" ? (lang === "id" ? "Lanjutkan Fokus" : "Resume Focus") : (lang === "id" ? "Mulai Mode Fokus" : "Start Focus Mode")}</span>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={handlePauseTimer}
                      className="px-8 shadow-sm flex items-center gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      <span>{lang === "id" ? "Jeda" : "Pause"}</span>
                    </Button>
                  )}

                  {timerState !== "idle" && (
                    <Button
                      size="lg"
                      variant="default"
                      onClick={handleFinishSession}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{lang === "id" ? "Selesai & Refleksi" : "Finish & Reflect"}</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleResetTimer}
                    className="h-10 w-10"
                    title={lang === "id" ? "Reset Timer" : "Reset Timer"}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* In-Session Micro-Checkpoints */}
              <Card className="border-border/80">
                <CardHeader className="p-4 pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <ListCheck className="h-4 w-4 text-primary" />
                      <span>{lang === "id" ? "Checkpoint Target Sesi" : "Session Checkpoints"}</span>
                    </CardTitle>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {checkpoints.filter((c) => c.done).length}/{checkpoints.length} {lang === "id" ? "Selesai" : "Done"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-2">
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {checkpoints.map((cp) => (
                      <div
                        key={cp.id}
                        className="flex items-center justify-between p-2 rounded-md border bg-muted/30 text-xs"
                      >
                        <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cp.done}
                            onChange={() => handleToggleCheckpoint(cp.id)}
                            className="rounded border-input text-primary focus:ring-primary"
                          />
                          <span
                            className={`font-medium truncate ${
                              cp.done ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {cp.text}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveCheckpoint(cp.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center pt-2">
                    <Input
                      placeholder={lang === "id" ? "Tambah checkpoint (misal: Turunkan persamaan 3.2)..." : "Add micro-checkpoint (e.g. derive equation 3.2)..."}
                      value={newCheckpointText}
                      onChange={(e) => setNewCheckpointText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCheckpoint()}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCheckpoint}
                      className="h-8 px-2.5 text-xs shrink-0"
                    >
                      <Plus className="h-3 w-3 mr-1" /> {lang === "id" ? "Tambah" : "Add"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Pane: Live Study Scratchpad (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="h-full flex flex-col border-border/80">
                <CardHeader className="p-4 pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>{lang === "id" ? "Catatan Belajar Aktif" : "Live Study Scratchpad"}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {lang === "id" ? "Tersimpan ke Jurnal" : "Saved to Journal"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {lang === "id" ? "Tulis ringkasan rumus, kode, dan konsep penting selama sesi berlangsung." : "Write definitions, code snippets, and active notes as you study."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <textarea
                    className="w-full flex-1 min-h-[300px] p-3 rounded-lg border border-input bg-muted/20 font-mono text-xs shadow-inner focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none leading-relaxed"
                    placeholder={lang === "id" ? "# Catatan Belajar (Mendukung Markdown)\n\n## Konsep Utama\n- Definisi: ...\n- Rumus Penting: ...\n\n## Pertanyaan untuk Diulang\n- [ ] ..." : "# Study Notes (Markdown Supported)\n\n## Key Concept\n- Definition: ...\n- Important Formula: ...\n\n## Questions for Review\n- [ ] ..."}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDY JOURNAL */}
      {activeTab === "journal" && (
        <StudyJournal
          sessions={sessions}
          subjects={subjects}
          onSessionDeleted={fetchData}
        />
      )}

      {/* Post-Session Reflection Modal */}
      <PostSessionModal
        open={reflectionModalOpen}
        onOpenChange={setReflectionModalOpen}
        sessionData={completionData}
        onSessionSaved={() => {
          fetchData();
          setActiveTab("journal");
        }}
      />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat Sesi Belajar...</div>}>
      <SessionContent />
    </Suspense>
  );
}
