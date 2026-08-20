"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  CalendarDays,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Target,
  Play,
  Pause,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Plus,
  Palette,
  LineChart,
  Terminal,
  Layers,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardData } from "@/db/repositories/dashboard";
import { CircularProgress } from "@/components/dashboard/circular-progress";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { useLanguage } from "@/contexts/language-context";
import { formatTimerSeconds, formatMinutes } from "@/lib/utils";

export function DashboardView({ initialData }: { initialData: DashboardData }) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [data, setData] = React.useState<DashboardData>(initialData);

  // Live Timer Widget State for "Current Session" card matching the reference image
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [secondsRemaining, setSecondsRemaining] = React.useState(25 * 60); // 25:00 focus block
  const [totalStudySeconds, setTotalStudySeconds] = React.useState((data?.stats?.todayStudyMinutes || 0) * 60);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
        setTotalStudySeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to refresh dashboard data:", e);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed";
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchDashboardData();
    } catch (e) {
      console.error("Failed to update task:", e);
    }
  };

  const rec = data.recommendation;
  const subjects = data.subjectProgress || [];

  // Icon mapping helper for cards
  const getSubjectIcon = (index: number) => {
    const icons = [
      { icon: Palette, bg: "from-pink-500 to-purple-600", text: "text-pink-300" },
      { icon: LineChart, bg: "from-cyan-400 to-teal-500", text: "text-cyan-300" },
      { icon: Terminal, bg: "from-blue-500 to-indigo-600", text: "text-blue-300" },
      { icon: BrainCircuit, bg: "from-amber-400 to-orange-500", text: "text-amber-300" },
    ];
    return icons[index % icons.length];
  };

  const colorVariants: Array<"purple" | "cyan" | "blue" | "amber"> = ["purple", "cyan", "blue", "amber"];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up">
      {/* ── TOP HEADER BAR (Search, User Badge, Settings, Theme & Lang) ──── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Large Gradient Welcome Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="text-gradient-welcome">
              {t("dashboard.welcome", { name: user?.name?.split(" ")[0] || "Alex" })}
            </span>{" "}
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground/70 font-medium mt-1">
            {lang === "id"
              ? "Lanjutkan progres belajarmu hari ini. Target dan fokus telah siap."
              : "Continue your learning journey today. Focus targets are ready."}
          </p>
        </div>

        {/* Right Action Cluster matching the image */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Glass Search Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-foreground/50 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === "id" ? "Cari materi atau topik..." : "Search courses..."}
              className="h-10 pl-9 pr-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-white/10 backdrop-blur-md text-xs font-medium text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 w-40 sm:w-56 shadow-sm transition-all"
            />
          </div>

          {/* User Profile Capsule Badge matching image */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-sm">
            <Avatar className="h-7 w-7 border border-white/80 dark:border-white/20">
              <AvatarImage src={user?.avatarUrl} alt={user?.name || "Alex"} />
              <AvatarFallback className="bg-gradient-to-tr from-pink-500 to-purple-600 text-white text-xs font-bold">
                {user?.name?.substring(0, 2).toUpperCase() || "AC"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-foreground hidden sm:inline-block">
              {user?.name || "Alex Chen"}
            </span>
            <Link href="/settings" className="text-foreground/60 hover:text-foreground transition-colors ml-1">
              <SettingsIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Language & Theme switches */}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* ── TOP ROW: ACTIVE COURSE CARDS (3-COLUMN GRID MATCHING MOCKUP) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.slice(0, 3).map((sub, idx) => {
          const iconObj = getSubjectIcon(idx);
          const IconComp = iconObj.icon;
          const colorVar = colorVariants[idx % colorVariants.length];
          const masteryVal = Math.round(sub.averageMastery || 0);

          return (
            <div
              key={sub.id}
              className="glass-subcard rounded-3xl p-5 md:p-6 flex flex-col justify-between space-y-5 relative overflow-hidden group"
            >
              {/* Top Row: Title + Subject Category Icon Box */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-base text-foreground leading-snug truncate group-hover:text-primary transition-colors">
                    {sub.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-foreground/60 block">
                    {sub.courseType ? `Semester ${sub.semester || 1} • ${sub.courseType}` : "Mata Kuliah BMSD"}
                  </span>
                </div>

                {/* Glass Icon Badge top-right */}
                <div className={`h-10 w-10 rounded-2xl bg-gradient-to-tr ${iconObj.bg} p-0.5 shadow-md shrink-0 flex items-center justify-center text-white`}>
                  <IconComp className="h-5 w-5" />
                </div>
              </div>

              {/* Middle Row: Glowing Circular Progress Gauge + Stats */}
              <div className="flex items-center gap-4">
                <CircularProgress
                  value={masteryVal}
                  size={68}
                  strokeWidth={6}
                  colorVariant={colorVar}
                />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-foreground block">
                    {masteryVal >= 80 ? t("dashboard.mastery_advanced") : masteryVal >= 50 ? t("dashboard.mastery_intermediate") : masteryVal > 0 ? t("dashboard.mastery_fundamental") : t("dashboard.mastery_not_started")}
                  </span>
                  <span className="text-[11px] text-foreground/60 block">
                    {sub.topicsCount - sub.completedTopicsCount > 0
                      ? `${sub.topicsCount - sub.completedTopicsCount} ${t("dashboard.lessons_left")}`
                      : `${sub.topicsCount} ${t("dashboard.topics_mastered")}`}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Vibrant Gradient Pill Button matching image */}
              <div>
                <Button
                  asChild
                  className={`w-full h-9 rounded-2xl text-xs font-bold text-white shadow-md ${
                    idx === 0
                      ? "btn-gradient-magenta"
                      : idx === 1
                      ? "btn-gradient-cyan"
                      : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
                  }`}
                >
                  <Link href={`/curriculum`}>
                    <span>{lang === "id" ? "Lanjutkan Belajar" : "Continue"}</span>
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM SECTION: 2-COLUMN SPLIT (MY STUDY PLAN & CURRENT SESSION) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN (7 COLS): MY STUDY PLAN MATCHING MOCKUP ──────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {lang === "id" ? "Rencana Belajar Saya" : "My Study Plan"}
            </h2>
            <Button variant="ghost" size="sm" asChild className="text-xs text-primary font-semibold hover:bg-white/40 dark:hover:bg-white/10 rounded-xl">
              <Link href="/planner" className="flex items-center gap-1">
                <span>{lang === "id" ? "Buka Planner" : "View All"}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Stacked Glass Pill Study Plan Items */}
          <div className="space-y-3">
            {subjects.slice(0, 4).map((sub, idx) => (
              <div
                key={sub.id}
                className="glass-subcard rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Calendar Box Icon with Number */}
                  <div className="h-10 w-10 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-white/10 flex flex-col items-center justify-center shadow-sm shrink-0 font-mono">
                    <span className="text-[9px] font-bold text-primary uppercase leading-none">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-black text-foreground leading-none mt-0.5">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {sub.title}
                    </h4>
                    <span className="text-[11px] text-foreground/60 flex items-center gap-2">
                      <span>{sub.sks || 3} SKS</span>
                      <span>•</span>
                      <span>{sub.completedTopicsCount}/{sub.topicsCount} {lang === "id" ? "Selesai" : "Done"}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="h-8 px-3 rounded-xl text-xs font-semibold border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <Link href={`/session`}>
                      <Play className="h-3 w-3 mr-1 fill-current" />
                      <span>{lang === "id" ? "Fokus" : "Focus"}</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 COLS): CURRENT SESSION & GLOWING TIMER ───── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {lang === "id" ? "Sesi Saat Ini" : "Current Session"}
            </h2>
            <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border-amber-500/20">
              {isTimerRunning ? (lang === "id" ? "🔥 Sedang Berjalan" : "🔥 Running") : (lang === "id" ? "Siap" : "Ready")}
            </Badge>
          </div>

          {/* Large Glowing Glass Timer Sub-Card matching the mockup */}
          <div className="glass-subcard rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              {lang === "id" ? "Study Timer" : "Study Timer"}
            </span>

            {/* Glowing Amber Digital Clock Readout */}
            <div className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-amber-400 dark:text-amber-300 timer-digital-glow select-none my-1">
              {formatTimerSeconds(secondsRemaining)}
            </div>

            {/* Total Time & Progress Subtitle */}
            <div className="text-xs text-foreground/70 font-medium">
              <span>{lang === "id" ? "Total Waktu:" : "Total Time:"} </span>
              <span className="font-bold text-foreground font-mono">
                {Math.floor(totalStudySeconds / 3600)}h {Math.floor((totalStudySeconds % 3600) / 60)}m
              </span>
            </div>

            {/* Action Buttons: Start/Pause and End Session */}
            <div className="flex items-center gap-3 w-full pt-2">
              <Button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex-1 h-10 rounded-2xl btn-gradient-amber text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>{lang === "id" ? "Jeda" : "Pause"}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{lang === "id" ? "Mulai Belajar" : "Start/Pause"}</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                asChild
                className="h-10 px-4 rounded-2xl border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 text-xs font-bold hover:bg-white/70 dark:hover:bg-slate-800/70"
              >
                <Link href="/session">
                  <span>{lang === "id" ? "Buka Sesi Penuh" : "End Session"}</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* AI Recommendation Quick Pill Banner */}
          {rec && (
            <div className="glass-subcard rounded-2xl p-3.5 flex items-center gap-3 text-xs">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-foreground block truncate">
                  {lang === "id" ? "Saran AI:" : "AI Focus:"} {rec.topicTitle}
                </span>
                <span className="text-[10px] text-foreground/60 truncate block">
                  {rec.reason}
                </span>
              </div>
              <Button size="iconSm" variant="ghost" asChild className="rounded-xl shrink-0">
                <Link href={`/session?topicId=${rec.topicId}`}>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
