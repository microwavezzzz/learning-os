"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileQuestion,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  Award,
  BookOpen,
  Filter,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuestionRecord, QuizAttemptRecord } from "@/db/repositories/quizzes";
import { TopicRecord } from "@/db/repositories/topics";
import { useLanguage } from "@/contexts/language-context";

function QuizzesContent() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const queryTopicId = searchParams.get("topicId");

  const [topics, setTopics] = React.useState<TopicRecord[]>([]);
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>("");
  const [questions, setQuestions] = React.useState<QuestionRecord[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [userAnswers, setUserAnswers] = React.useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [attemptResult, setAttemptResult] = React.useState<QuizAttemptRecord | null>(null);

  const fetchTopicsAndQuestions = async () => {
    try {
      const topRes = await fetch("/api/topics");
      const topData = await topRes.json();
      setTopics(topData);

      const activeTopicId = queryTopicId || (topData.length > 0 ? topData[0].id : "");
      setSelectedTopicId(activeTopicId);

      if (activeTopicId) {
        fetchQuestions(activeTopicId);
      }
    } catch (e) {
      console.error("Failed to load topics:", e);
    }
  };

  const fetchQuestions = async (tId: string) => {
    try {
      const res = await fetch(`/api/quizzes?topicId=${tId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setCurrentIndex(0);
        setUserAnswers({});
        setAttemptResult(null);
      }
    } catch (e) {
      console.error("Failed to load questions:", e);
    }
  };

  React.useEffect(() => {
    fetchTopicsAndQuestions();
  }, [queryTopicId]);

  const handleGenerateQuestions = async () => {
    if (!selectedTopicId) return;
    try {
      setIsGenerating(true);
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedTopicId, count: 3 }),
      });
      if (res.ok) {
        fetchQuestions(selectedTopicId);
      }
    } catch (e) {
      console.error("Failed to generate quiz:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const q = questions[currentIndex];
    if (!q) return;
    setUserAnswers({ ...userAnswers, [q.id]: answer });
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      const submissions = questions.map((q) => ({
        questionId: q.id,
        answer: userAnswers[q.id] || "",
      }));

      const res = await fetch("/api/quizzes/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          timeSpentSeconds: 60,
          userSubmissions: submissions,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setAttemptResult(result);
      }
    } catch (e) {
      console.error("Failed to submit attempt:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const allAnswered = questions.length > 0 && questions.every((q) => !!userAnswers[q.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("quizzes.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("quizzes.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
            value={selectedTopicId}
            onChange={(e) => {
              setSelectedTopicId(e.target.value);
              fetchQuestions(e.target.value);
            }}
          >
            {topics.map((tItem) => (
              <option key={tItem.id} value={tItem.id}>
                {tItem.title}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className={`h-3.5 w-3.5 text-primary ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? (lang === "id" ? "Membuat Kuis..." : "Synthesizing...") : t("quizzes.generate")}</span>
          </Button>
        </div>
      </div>

      {/* QUIZ WORKSPACE */}
      {attemptResult ? (
        /* Result Screen */
        <Card className="max-w-2xl mx-auto border-border/80 shadow-md">
          <CardHeader className="p-6 text-center border-b space-y-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
              <Award className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">
              {lang === "id" ? "Percobaan Kuis Selesai!" : "Quiz Attempt Completed!"}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("quizzes.score")}: <span className="font-bold text-foreground">{attemptResult.scorePercentage}%</span> ({attemptResult.correctCount}/{attemptResult.totalQuestions} {lang === "id" ? "benar" : "correct"})
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {attemptResult.answers.map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    ans.isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-rose-500/30 bg-rose-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-foreground">
                      Q{idx + 1}: {ans.prompt}
                    </span>
                    <Badge variant={ans.isCorrect ? "success" : "destructive"} className="text-[10px]">
                      {ans.isCorrect ? (lang === "id" ? "Benar" : "Correct") : (lang === "id" ? "Dicatat di Bank Kesalahan" : "Mistake Logged")}
                    </Badge>
                  </div>

                  <div className="text-[11px] space-y-1">
                    <div className="text-muted-foreground">
                      <strong>{lang === "id" ? "Jawaban Anda:" : "Your answer:"}</strong> {ans.userAnswer || "(kosong)"}
                    </div>
                    {!ans.isCorrect && (
                      <div className="text-emerald-700 dark:text-emerald-300">
                        <strong>{lang === "id" ? "Jawaban Benar:" : "Expected:"}</strong> {ans.correctAnswer}
                      </div>
                    )}
                  </div>

                  {/* Semantic Feedback */}
                  {ans.semanticEval && (
                    <div className="p-2 rounded bg-background border text-[11px] space-y-1">
                      <span className="font-semibold text-primary block">{lang === "id" ? "Ulasan Semantik AI:" : "AI Semantic Feedback:"}</span>
                      <p className="text-muted-foreground">{ans.semanticEval.detailedFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAttemptResult(null);
                setUserAnswers({});
                setCurrentIndex(0);
              }}
              className="text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> {lang === "id" ? "Ulangi Kuis" : "Retake Quiz"}
            </Button>

            <Button size="sm" asChild className="text-xs">
              <Link href="/mistakes">{lang === "id" ? "Lihat di Bank Kesalahan" : "View in Mistake Bank"}</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FileQuestion className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">
            {lang === "id" ? "Belum ada soal kuis untuk topik ini" : "No quiz questions generated for this topic yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {lang === "id"
              ? "Klik \"Generate Kuis Baru\" untuk membuat latihan recall terarah dari berkas materi."
              : "Click \"Generate New Quiz\" to extract grounded recall drills from linked materials."}
          </p>
          <Button size="sm" onClick={handleGenerateQuestions} disabled={isGenerating} className="text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {t("quizzes.generate")}
          </Button>
        </Card>
      ) : (
        /* Active Question Card */
        <Card className="max-w-2xl mx-auto border-border/80 shadow-md">
          <CardHeader className="p-6 pb-3 border-b">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{lang === "id" ? `Pertanyaan ${currentIndex + 1} dari ${questions.length}` : `Question ${currentIndex + 1} of ${questions.length}`}</span>
              <Badge variant="outline" className="text-[10px] uppercase">
                {currentQ.type.replace("_", " ")}
              </Badge>
            </div>
            <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5" />
            <CardTitle className="text-base font-semibold pt-3 leading-relaxed">
              {currentQ.prompt}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-3">
            {/* Multiple Choice Options */}
            {currentQ.type === "multiple_choice" && currentQ.options.length > 0 && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQ.id] === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleAnswerSelect(opt)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all backdrop-blur-md ${
                        isSelected
                          ? "border-primary/80 bg-gradient-to-r from-primary/20 via-indigo-500/15 to-purple-500/10 text-primary shadow-[0_4px_16px_rgba(99,102,241,0.25)] scale-[1.01]"
                          : "border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 dark:hover:bg-slate-800/70 text-foreground"
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-xl font-mono text-xs font-bold mr-2.5 shadow-sm ${
                        isSelected ? "bg-primary text-white" : "bg-white/80 dark:bg-slate-700/80 text-foreground/80"
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cloze & Short Answer Input */}
            {currentQ.type !== "multiple_choice" && (
              <div className="space-y-2">
                <textarea
                  placeholder={lang === "id" ? "Ketik jawaban atau penjelasan konsep Anda di sini..." : "Type your answer or conceptual explanation here..."}
                  className="w-full h-24 p-3 rounded-lg border border-input bg-transparent text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none leading-relaxed"
                  value={userAnswers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="p-6 pt-0 flex justify-between border-t mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="text-xs"
            >
              {lang === "id" ? "Sebelumnya" : "Previous"}
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="text-xs"
              >
                {t("quizzes.next_question")} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-md"
              >
                {isSubmitting ? (lang === "id" ? "Menilai..." : "Evaluating...") : t("quizzes.submit")}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat Active Recall...</div>}>
      <QuizzesContent />
    </Suspense>
  );
}
