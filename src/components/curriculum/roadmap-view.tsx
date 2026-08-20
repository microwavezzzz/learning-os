"use client";

import * as React from "react";
import { CheckCircle2, Circle, ArrowDown, ArrowRight, AlertCircle, Sparkles, Layers, BookOpen } from "lucide-react";
import { TopicRecord } from "@/db/repositories/topics";
import { SubjectRecord } from "@/db/repositories/subjects";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function RoadmapView({
  subjects,
  topics,
  onSelectTopic,
}: {
  subjects: SubjectRecord[];
  topics: TopicRecord[];
  onSelectTopic: (topic: TopicRecord) => void;
}) {
  return (
    <div className="space-y-8 py-2">
      {subjects.map((subject) => {
        const subjectTopics = topics.filter((t) => t.subjectId === subject.id && !t.parentId);
        if (subjectTopics.length === 0) return null;

        return (
          <div key={subject.id} className="space-y-4">
            {/* Subject Roadmap Header */}
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <h3 className="text-lg font-bold tracking-tight">{subject.title}</h3>
              <Badge variant="outline" className="text-xs">
                {subjectTopics.length} Milestones
              </Badge>
            </div>

            {/* Sequential Roadmap Nodes */}
            <div className="relative pl-6 border-l-2 border-border/80 space-y-6 ml-2">
              {subjectTopics.map((topic, idx) => {
                const subtopics = topics.filter((t) => t.parentId === topic.id);
                const isCompleted = topic.status === "completed";
                const isInProgress = topic.status === "in_progress";
                const needsReview = topic.status === "needs_review";

                return (
                  <div key={topic.id} className="relative group">
                    {/* Node Dot on Timeline */}
                    <div
                      className={`absolute -left-[31px] top-4 h-6 w-6 rounded-full border-2 bg-background flex items-center justify-center transition-transform group-hover:scale-125 ${
                        isCompleted
                          ? "border-emerald-500 text-emerald-500"
                          : isInProgress
                          ? "border-blue-500 text-blue-500"
                          : needsReview
                          ? "border-amber-500 text-amber-500"
                          : "border-muted-foreground/40 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 fill-emerald-500 text-background" />
                      ) : (
                        <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                      )}
                    </div>

                    {/* Topic Roadmap Card */}
                    <Card
                      onClick={() => onSelectTopic(topic)}
                      className={`cursor-pointer transition-all hover:shadow-md border ${
                        isInProgress ? "border-primary/50 shadow-sm" : "hover:border-primary/30"
                      }`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge
                                variant={
                                  isCompleted
                                    ? "success"
                                    : isInProgress
                                    ? "info"
                                    : needsReview
                                    ? "warning"
                                    : "secondary"
                                }
                                className="text-[11px] capitalize"
                              >
                                {topic.status.replace("_", " ")}
                              </Badge>
                              <Badge variant="outline" className="text-[11px] capitalize">
                                {topic.difficulty}
                              </Badge>
                              {topic.prerequisiteTopics && topic.prerequisiteTopics.length > 0 && (
                                <Badge variant="purple" className="text-[10px]">
                                  Requires: {topic.prerequisiteTopics.map((p) => p.title).join(", ")}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-base font-semibold">{topic.title}</CardTitle>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-primary">
                              {Math.round(topic.mastery)}%
                            </span>
                            <span className="text-[10px] text-muted-foreground block">Mastery</span>
                          </div>
                        </div>

                        {topic.description && (
                          <CardDescription className="text-xs line-clamp-2 mt-1">
                            {topic.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="p-4 pt-1">
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-2">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${topic.mastery}%` }}
                          />
                        </div>

                        {/* Nested Subtopics */}
                        {subtopics.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-1.5">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Subtopics ({subtopics.length})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {subtopics.map((sub) => (
                                <div
                                  key={sub.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectTopic(sub);
                                  }}
                                  className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted text-xs transition-colors border"
                                >
                                  <span className="font-medium truncate mr-2">{sub.title}</span>
                                  <Badge
                                    variant={sub.status === "completed" ? "success" : "secondary"}
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {sub.status === "completed" ? "Done" : `${Math.round(sub.mastery)}%`}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
