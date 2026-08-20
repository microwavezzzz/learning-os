"use client";

import * as React from "react";
import {
  TrendingUp,
  Clock,
  Flame,
  Award,
  Calendar,
  Zap,
  BookOpen,
  AlertCircle,
  Activity,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatMinutes } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

export default function AnalyticsPage() {
  const { t, lang } = useLanguage();
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load analytics:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("analytics.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("analytics.subtitle")}
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-500" /> {lang === "id" ? "Total Waktu Fokus" : "Total Focus Time"}
          </span>
          <span className="text-2xl font-bold font-mono block mt-1">
            {formatMinutes(data?.totalStudyMinutes || 0)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            {lang === "id" ? `Dari ${data?.totalSessionsCount || 0} sesi selesai` : `Across ${data?.totalSessionsCount || 0} completed sessions`}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-amber-500" /> {lang === "id" ? "Rata-rata Sesi" : "Avg Session"}
          </span>
          <span className="text-2xl font-bold font-mono block mt-1">
            {data?.averageSessionDuration || 0}m
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            {lang === "id" ? "Interval belajar terfokus" : "Optimal deep work interval"}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-500" /> {lang === "id" ? "Penyelesaian Kesalahan" : "Mistake Resolution"}
          </span>
          <span className="text-2xl font-bold font-mono block mt-1">
            {data?.mistakeStats?.resolutionRatePercentage || 100}%
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            {lang === "id" ? `${data?.mistakeStats?.resolvedCount || 0}/${data?.mistakeStats?.totalMistakes || 0} kesalahan tuntas` : `${data?.mistakeStats?.resolvedCount || 0}/${data?.mistakeStats?.totalMistakes || 0} mistakes resolved`}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-purple-500" /> {lang === "id" ? "Kesehatan Retensi" : "Retention Health"}
          </span>
          <span className="text-2xl font-bold font-mono block mt-1">
            92%
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            {lang === "id" ? "Status stabilitas memori FSRS" : "FSRS memory stability status"}
          </span>
        </Card>
      </div>

      {/* 14-Day Study Activity Heatmap */}
      <Card className="border-border/80 p-5">
        <CardHeader className="p-0 pb-3 border-b mb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">{t("analytics.heatmap_title")}</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{lang === "id" ? "Menit belajar per hari" : "Daily minutes studied"}</span>
        </CardHeader>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2.5">
          {data?.heatmap?.map((day: any) => {
            const intensity =
              day.minutes >= 90
                ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-[0_4px_16px_rgba(16,185,129,0.4)] border-emerald-300/40"
                : day.minutes >= 45
                ? "bg-gradient-to-tr from-cyan-500/80 to-blue-500/80 text-white shadow-[0_4px_14px_rgba(6,182,212,0.3)] border-cyan-300/30"
                : day.minutes > 0
                ? "bg-primary/20 text-foreground border-primary/30 shadow-sm"
                : "bg-white/30 dark:bg-slate-800/30 text-foreground/40 border-white/40 dark:border-white/10";
            return (
              <div
                key={day.date}
                className={`p-2.5 rounded-2xl border text-center text-xs flex flex-col justify-between h-20 transition-all hover:scale-105 backdrop-blur-md ${intensity}`}
              >
                <span className="text-[10px] font-bold opacity-80">{day.date.slice(5)}</span>
                <span className="font-mono font-black text-xs">{day.minutes}m</span>
                <span className="text-[9px] opacity-75">{day.sessionCount} {lang === "id" ? "sesi" : "sess"}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two-Column Subject Mastery & Retention Curve */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject Mastery Radar */}
        <Card className="border-border/80 p-5 space-y-4">
          <CardHeader className="p-0 pb-2 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>{lang === "id" ? "Kecepatan Penguasaan Mata Kuliah" : "Subject Mastery Velocity"}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 space-y-3">
            {data?.subjectMastery?.map((sub: any) => (
              <div key={sub.id} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">{sub.title}</span>
                  <span className="font-mono font-bold">{sub.averageMastery}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${sub.averageMastery}%`, backgroundColor: sub.color }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {sub.topicsCount} {lang === "id" ? "topik dipantau" : "topics tracked"} • {sub.atRiskCount} {lang === "id" ? "peringatan penurunan retensi" : "retention decay warnings"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FSRS Retention Curve */}
        <Card className="border-border/80 p-5 space-y-4">
          <CardHeader className="p-0 pb-2 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>{t("analytics.retention_curve")}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 space-y-2.5 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              {lang === "id"
                ? "Memodelkan daya ingat terhadap waktu berjalan untuk menjadwalkan ulasan berkala sebelum daya ingat turun di bawah ambang 90%."
                : "Models memory retrievability over elapsed time to schedule reviews before retrievability falls below 90%."}
            </p>

            <div className="space-y-2 pt-2">
              {data?.retentionCurve?.map((pt: any) => (
                <div key={pt.day} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground font-mono">{lang === "id" ? `Hari ${pt.day}` : `Day ${pt.day}`}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={pt.retrievability} className="w-24 sm:w-36 h-1.5" />
                    <span className="font-mono font-bold text-[11px] w-10 text-right">{pt.retrievability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
