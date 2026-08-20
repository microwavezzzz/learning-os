"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Brain,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MistakeRecord } from "@/db/repositories/mistakes";
import { useLanguage } from "@/contexts/language-context";

export default function MistakesPage() {
  const { t, lang } = useLanguage();
  const [mistakes, setMistakes] = React.useState<MistakeRecord[]>([]);
  const [stats, setStats] = React.useState<any>(null);
  const [filterResolved, setFilterResolved] = React.useState<string>("unresolved");
  const [filterCause, setFilterCause] = React.useState<string>("all");

  const fetchMistakes = async () => {
    try {
      const res = await fetch("/api/mistakes");
      if (res.ok) {
        const json = await res.json();
        setMistakes(json.mistakes || []);
        setStats(json.stats || null);
      }
    } catch (e) {
      console.error("Failed to load mistakes:", e);
    }
  };

  React.useEffect(() => {
    fetchMistakes();
  }, []);

  const handleToggleResolve = async (id: string, currentResolved: boolean) => {
    try {
      await fetch(`/api/mistakes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: !currentResolved }),
      });
      fetchMistakes();
    } catch (e) {
      console.error("Failed to update mistake:", e);
    }
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (filterResolved === "unresolved" && m.isResolved) return false;
    if (filterResolved === "resolved" && !m.isResolved) return false;
    if (filterCause !== "all" && m.rootCause !== filterCause) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("mistakes.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("mistakes.subtitle")}
          </p>
        </div>

        <Button size="sm" asChild className="text-xs">
          <Link href="/quizzes">
            <Zap className="h-3.5 w-3.5 mr-1.5" /> {lang === "id" ? "Mulai Latihan Remedial" : "Start Remediation Drill"}
          </Link>
        </Button>
      </div>

      {/* Root Cause Diagnostics Overview */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-rose-500/20 bg-rose-500/5">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">
            {lang === "id" ? "Kesenjangan Konsep" : "Conceptual Gaps"}
          </span>
          <span className="text-2xl font-mono font-bold text-foreground">
            {stats?.rootCauseCounts?.conceptual_gap || 0}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {lang === "id" ? "Teorema dasar kurang dipahami" : "Underlying theorem misunderstood"}
          </span>
        </Card>

        <Card className="p-4 border-amber-500/20 bg-amber-500/5">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">
            {lang === "id" ? "Penurunan Memori" : "Recall Lapses"}
          </span>
          <span className="text-2xl font-mono font-bold text-foreground">
            {stats?.rootCauseCounts?.recall_lapse || 0}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {lang === "id" ? "Lupa saat di bawah tekanan waktu" : "Memory decay under recall pressure"}
          </span>
        </Card>

        <Card className="p-4 border-blue-500/20 bg-blue-500/5">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
            {lang === "id" ? "Kekeliruan Eksekusi" : "Execution Slips"}
          </span>
          <span className="text-2xl font-mono font-bold text-foreground">
            {stats?.rootCauseCounts?.execution_slip || 0}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {lang === "id" ? "Salah sintaks atau kalkulasi" : "Syntax or arithmetic miscalculation"}
          </span>
        </Card>

        <Card className="p-4 border-purple-500/20 bg-purple-500/5">
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 block">
            {lang === "id" ? "Salah Baca Soal" : "Misread / Trick"}
          </span>
          <span className="text-2xl font-mono font-bold text-foreground">
            {stats?.rootCauseCounts?.misread_trick || 0}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {lang === "id" ? "Kurang teliti membaca premis" : "Prompt wording misunderstanding"}
          </span>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
          >
            <option value="unresolved">{lang === "id" ? `Belum Tuntas (${stats?.unresolvedCount || 0})` : `Unresolved (${stats?.unresolvedCount || 0})`}</option>
            <option value="resolved">{lang === "id" ? `Sudah Dipahami (${stats?.resolvedCount || 0})` : `Resolved (${stats?.resolvedCount || 0})`}</option>
            <option value="all">{lang === "id" ? `Semua Kesalahan (${stats?.totalMistakes || 0})` : `All Mistakes (${stats?.totalMistakes || 0})`}</option>
          </select>

          <select
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
            value={filterCause}
            onChange={(e) => setFilterCause(e.target.value)}
          >
            <option value="all">{lang === "id" ? "Semua Akar Penyebab" : "All Root Causes"}</option>
            <option value="conceptual_gap">{lang === "id" ? "Kesenjangan Konsep" : "Conceptual Gap"}</option>
            <option value="recall_lapse">{lang === "id" ? "Penurunan Memori" : "Recall Lapse"}</option>
            <option value="execution_slip">{lang === "id" ? "Kekeliruan Eksekusi" : "Execution Slip"}</option>
            <option value="misread_trick">{lang === "id" ? "Salah Baca Soal" : "Misread / Trick"}</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground">
          {lang === "id" ? `Menampilkan ${filteredMistakes.length} kesalahan` : `Showing ${filteredMistakes.length} mistakes`}
        </span>
      </div>

      {/* Mistakes List */}
      {filteredMistakes.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500/60" />
          <p className="font-semibold text-foreground">{t("mistakes.no_mistakes")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "id"
              ? "Terus kerjakan kuis! Setiap kesalahan akan otomatis dianalisis dan dicatat di sini untuk remedial bertarget."
              : "Keep taking quizzes! Any failed questions will be automatically categorized here for targeted remediation."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMistakes.map((m) => (
            <Card
              key={m.id}
              className={`border-border/80 transition-all ${
                m.isResolved ? "opacity-60 bg-muted/20" : "hover:border-primary/40 bg-card"
              }`}
            >
              <CardHeader className="p-4 pb-2 border-b flex flex-row items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{ borderColor: m.subjectColor }}
                    >
                      {m.subjectTitle} • {m.topicTitle}
                    </Badge>
                    <Badge
                      variant={
                        m.rootCause === "conceptual_gap"
                          ? "destructive"
                          : m.rootCause === "recall_lapse"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px] capitalize"
                    >
                      {m.rootCause.replace("_", " ")}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {lang === "id" ? `Ulasan jatuh tempo: ${m.nextReviewDate}` : `Review due: ${m.nextReviewDate}`}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-semibold pt-1">{m.prompt}</CardTitle>
                </div>

                <Button
                  variant={m.isResolved ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleToggleResolve(m.id, m.isResolved)}
                  className="text-xs shrink-0"
                >
                  {m.isResolved ? (lang === "id" ? "Buka Kembali" : "Mark Unresolved") : (lang === "id" ? "Tandai Dipahami" : "Mark Resolved")}
                </Button>
              </CardHeader>

              <CardContent className="p-4 space-y-2 text-xs">
                <div className="grid sm:grid-cols-2 gap-2 p-2.5 rounded bg-muted/20 border">
                  <div>
                    <span className="text-[10px] text-rose-500 font-semibold block">{lang === "id" ? "Jawaban Anda:" : "Your Answer:"}</span>
                    <p className="text-foreground">{m.userAnswer}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                      {lang === "id" ? "Jawaban Benar:" : "Correct Answer:"}
                    </span>
                    <p className="text-foreground">{m.correctAnswer}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="font-semibold text-primary block">{lang === "id" ? "Diagnosis AI & Saran Remedial:" : "AI Diagnosis & Suggested Remedy:"}</span>
                  <p className="text-muted-foreground leading-relaxed">{m.diagnosis}</p>
                  <p className="text-foreground/90 font-medium pl-2 border-l-2 border-primary/50">
                    {m.suggestedRemedy}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
