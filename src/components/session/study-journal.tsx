"use client";

import * as React from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Star,
  Award,
  AlertCircle,
  Sparkles,
  Trash2,
  Filter,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { StudySessionRecord } from "@/db/repositories/study-sessions";
import { SubjectRecord } from "@/db/repositories/subjects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/utils";

export function StudyJournal({
  sessions,
  subjects,
  onSessionDeleted,
}: {
  sessions: StudySessionRecord[];
  subjects: SubjectRecord[];
  onSessionDeleted: () => void;
}) {
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("all");

  const filteredSessions = sessions.filter((s) => {
    if (selectedSubjectId !== "all" && s.subjectId !== selectedSubjectId) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study journal entry?")) return;
    try {
      await fetch(`/api/study-sessions/${id}`, { method: "DELETE" });
      onSessionDeleted();
    } catch (e) {
      console.error("Failed to delete session entry:", e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Subject Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="all">All Subjects ({sessions.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {filteredSessions.length} journal {filteredSessions.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {filteredSessions.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">No study journal entries recorded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete a study session in Focus Mode to log your learning reflections.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const startDate = new Date(session.startTime);
            return (
              <Card key={session.id} className="border-border/80 hover:border-primary/30 transition-all">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {session.subjectTitle && (
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{ borderColor: session.subjectColor }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full mr-1"
                            style={{ backgroundColor: session.subjectColor }}
                          />
                          {session.subjectTitle}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {session.technique.replace("_", " ")}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <CardTitle className="text-base font-semibold">
                      {session.topicTitle || "General Study Focus"}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Duration Badge */}
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-primary block">
                        {session.actualDurationMinutes}m studied
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        planned: {session.plannedDuration}m
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => handleDelete(session.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete Journal Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
                  {/* Ratings Bar */}
                  <div className="flex items-center gap-4 flex-wrap p-2.5 rounded-md bg-muted/20 border text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Focus:</span>
                      <span className="font-bold text-foreground">{session.focusRating}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-bold text-amber-500">{session.confidence}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-bold text-purple-500">{session.difficulty}/5</span>
                    </div>
                  </div>

                  {/* Reflection 1: What was learned */}
                  {session.learningOutcome && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground block">
                        What was learned:
                      </span>
                      <p className="text-muted-foreground leading-relaxed pl-2 border-l-2 border-primary/40">
                        {session.learningOutcome}
                      </p>
                    </div>
                  )}

                  {/* Reflection 2: Difficult Aspects */}
                  {session.difficultAspects && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground block">
                        Challenges & difficulties:
                      </span>
                      <p className="text-muted-foreground leading-relaxed pl-2 border-l-2 border-amber-500/40">
                        {session.difficultAspects}
                      </p>
                    </div>
                  )}

                  {/* Reflection 3: Review items */}
                  {session.reviewItems && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground block">
                        To review next:
                      </span>
                      <p className="text-muted-foreground leading-relaxed pl-2 border-l-2 border-rose-500/40">
                        {session.reviewItems}
                      </p>
                    </div>
                  )}

                  {/* In-Session Markdown Notes */}
                  {session.notesMarkdown && (
                    <div className="space-y-1 pt-2 border-t">
                      <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider block">
                        Session Notes
                      </span>
                      <pre className="p-2.5 rounded bg-muted/40 font-mono text-[11px] whitespace-pre-wrap text-foreground">
                        {session.notesMarkdown}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
