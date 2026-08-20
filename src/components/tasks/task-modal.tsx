"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskRecord } from "@/db/repositories/tasks";
import { SubjectRecord } from "@/db/repositories/subjects";
import { TopicRecord } from "@/db/repositories/topics";
import { useLanguage } from "@/contexts/language-context";

export function TaskModal({
  open,
  onOpenChange,
  task,
  subjects,
  topics,
  defaultSubjectId,
  defaultTopicId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskRecord | null;
  subjects: SubjectRecord[];
  topics: TopicRecord[];
  defaultSubjectId?: string;
  defaultTopicId?: string;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [topicId, setTopicId] = React.useState("");
  const [priority, setPriority] = React.useState<"low" | "medium" | "high" | "urgent">("medium");
  const [deadline, setDeadline] = React.useState("");
  const [estimatedDuration, setEstimatedDuration] = React.useState("30");
  const [status, setStatus] = React.useState<"todo" | "in_progress" | "completed" | "cancelled">("todo");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setSubjectId(task.subjectId || "");
      setTopicId(task.topicId || "");
      setPriority(task.priority);
      setDeadline(task.deadline || "");
      setEstimatedDuration(task.estimatedDuration.toString());
      setStatus(task.status);
    } else {
      setTitle("");
      setDescription("");
      setSubjectId(defaultSubjectId || subjects[0]?.id || "");
      setTopicId(defaultTopicId || "");
      setPriority("medium");
      setDeadline(new Date().toISOString().split("T")[0]);
      setEstimatedDuration("30");
      setStatus("todo");
    }
    setError("");
  }, [task, open, defaultSubjectId, defaultTopicId, subjects]);

  const filteredTopics = topics.filter((t) => !subjectId || t.subjectId === subjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const url = task ? `/api/tasks/${task.id}` : `/api/tasks`;
      const method = task ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          subjectId: subjectId || null,
          topicId: topicId || null,
          priority,
          deadline: deadline || null,
          estimatedDuration: parseInt(estimatedDuration) || 30,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save task");
      }

      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? t("task.edit") : t("task.create")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{t("task.title")}</label>
            <Input
              placeholder="e.g. Implement mutex lock in C using test-and-set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{t("task.description")}</label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Details, steps, or reference pointers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Subject & Topic Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("common.subject")}</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopicId("");
                }}
              >
                <option value="">{t("common.no_subject")}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("common.topic")}</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">{t("common.no_topic")}</option>
                {filteredTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority, Duration, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("task.priority")}</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="low">🟢 {t("task.low")}</option>
                <option value="medium">🔵 {t("task.medium")}</option>
                <option value="high">🟠 {t("task.high")}</option>
                <option value="urgent">🔴 {t("task.urgent")}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("task.duration")}</label>
              <Input
                type="number"
                min="5"
                max="600"
                step="5"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("task.deadline")}</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Status (if editing) */}
          {task && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("common.status")}</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="todo">⚪ {t("task.todo")}</option>
                <option value="in_progress">🔵 {t("common.in_progress")}</option>
                <option value="completed">🟢 {t("common.completed")}</option>
                <option value="cancelled">⚫ {t("task.cancelled")}</option>
              </select>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
