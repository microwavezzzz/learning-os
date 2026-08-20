"use client";

import * as React from "react";
import { Star, CheckCircle2, Award, Clock, BookOpen, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimerSeconds } from "@/lib/utils";

export interface SessionCompletionData {
  subjectId: string | null;
  subjectTitle?: string;
  topicId: string | null;
  topicTitle?: string;
  plannedDurationMinutes: number;
  actualElapsedSeconds: number;
  startTime: string;
  endTime: string;
  technique: "pomodoro" | "deep_work" | "stopwatch";
  notesMarkdown: string;
}

export function PostSessionModal({
  open,
  onOpenChange,
  sessionData,
  onSessionSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: SessionCompletionData | null;
  onSessionSaved: () => void;
}) {
  const [learningOutcome, setLearningOutcome] = React.useState("");
  const [difficultAspects, setDifficultAspects] = React.useState("");
  const [reviewItems, setReviewItems] = React.useState("");
  const [confidence, setConfidence] = React.useState<number>(4);
  const [focusRating, setFocusRating] = React.useState<number>(4);
  const [difficulty, setDifficulty] = React.useState<number>(3);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setLearningOutcome("");
      setDifficultAspects("");
      setReviewItems("");
      setConfidence(4);
      setFocusRating(4);
      setDifficulty(3);
      setError("");
    }
  }, [open]);

  if (!sessionData) return null;

  const actualMinutes = Math.max(1, Math.round(sessionData.actualElapsedSeconds / 60));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: sessionData.subjectId,
          topicId: sessionData.topicId,
          plannedDuration: sessionData.plannedDurationMinutes,
          actualDuration: sessionData.actualElapsedSeconds,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          completionStatus: "completed",
          technique: sessionData.technique,
          focusRating,
          confidence,
          difficulty,
          learningOutcome: learningOutcome.trim(),
          difficultAspects: difficultAspects.trim(),
          reviewItems: reviewItems.trim(),
          notesMarkdown: sessionData.notesMarkdown,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save study session");
      }

      onSessionSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Study Session Complete!</DialogTitle>
              <DialogDescription className="text-xs">
                Reflect on what you studied to consolidate memory and log your progress.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {/* Session Overview Stats Banner */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg border bg-muted/20 text-center text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">Actual Study Time</span>
              <span className="font-mono font-bold text-sm text-primary">
                {formatTimerSeconds(sessionData.actualElapsedSeconds)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Planned Duration</span>
              <span className="font-mono font-bold text-sm text-foreground">
                {sessionData.plannedDurationMinutes}m
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Topic</span>
              <span className="font-semibold text-xs text-foreground truncate block">
                {sessionData.topicTitle || "General Focus"}
              </span>
            </div>
          </div>

          {/* Question 1: What did you learn? */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>1. What did you learn?</span>
              <span className="text-muted-foreground text-[10px] font-normal">(Learning Outcome)</span>
            </label>
            <textarea
              className="w-full h-18 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Key concepts, breakthroughs, theorems, or skills mastered..."
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Question 2: What was difficult? */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              2. What was difficult or challenging?
            </label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Edge cases, tricky equations, confusing abstractions..."
              value={difficultAspects}
              onChange={(e) => setDifficultAspects(e.target.value)}
            />
          </div>

          {/* Question 3: What should be reviewed? */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              3. What should be reviewed next time?
            </label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Formulas to memorize, proofs to re-derive, code exercises to practice..."
              value={reviewItems}
              onChange={(e) => setReviewItems(e.target.value)}
            />
          </div>

          {/* Ratings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20">
            {/* Confidence */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground block">
                How confident are you?
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidence(star)}
                    className="p-1 text-muted-foreground hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= confidence
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {confidence === 5 ? "Very confident" : confidence >= 3 ? "Moderate" : "Needs work"}
              </span>
            </div>

            {/* Focus Rating */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground block">
                Focus & Flow Quality
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFocusRating(level)}
                    className={`h-6 w-6 rounded text-xs font-bold transition-all ${
                      level === focusRating
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {focusRating === 5 ? "Deep flow state" : focusRating >= 3 ? "Productive" : "Distracted"}
              </span>
            </div>

            {/* Perceived Difficulty */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground block">
                Subject Difficulty
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`h-6 w-6 rounded text-xs font-bold transition-all ${
                      d === difficulty
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {difficulty >= 4 ? "Hard / Complex" : difficulty === 3 ? "Medium" : "Easy"}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? "Logging..." : "Save to Study Journal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
