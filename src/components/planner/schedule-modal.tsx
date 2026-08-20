"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScheduleRecord } from "@/db/repositories/schedules";
import { SubjectRecord } from "@/db/repositories/subjects";
import { TopicRecord } from "@/db/repositories/topics";
import { TaskRecord } from "@/db/repositories/tasks";
import { useLanguage } from "@/contexts/language-context";

export function ScheduleModal({
  open,
  onOpenChange,
  schedule,
  subjects,
  topics,
  tasks,
  defaultDate,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: ScheduleRecord | null;
  subjects: SubjectRecord[];
  topics: TopicRecord[];
  tasks: TaskRecord[];
  defaultDate?: string;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("09:50");
  const [subjectId, setSubjectId] = React.useState("");
  const [topicId, setTopicId] = React.useState("");
  const [taskId, setTaskId] = React.useState("");
  const [status, setStatus] = React.useState<"scheduled" | "in_progress" | "completed" | "skipped">("scheduled");
  const [notes, setNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (schedule) {
      setDate(schedule.date);
      setStartTime(schedule.startTime);
      setEndTime(schedule.endTime);
      setSubjectId(schedule.subjectId || "");
      setTopicId(schedule.topicId || "");
      setTaskId(schedule.taskId || "");
      setStatus(schedule.status);
      setNotes(schedule.notes || "");
    } else {
      const today = defaultDate || new Date().toISOString().split("T")[0];
      setDate(today);
      setStartTime("09:00");
      setEndTime("09:50");
      setSubjectId(subjects[0]?.id || "");
      setTopicId("");
      setTaskId("");
      setStatus("scheduled");
      setNotes("");
    }
    setError("");
  }, [schedule, open, defaultDate, subjects]);

  const filteredTopics = topics.filter((t) => !subjectId || t.subjectId === subjectId);
  const filteredTasks = tasks.filter((t) => (!subjectId || t.subjectId === subjectId) && t.status !== "completed");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError(`${t("common.date")} wajib diisi`);
      return;
    }
    if (!startTime || !endTime) {
      setError(`${t("common.start_time")} dan ${t("common.end_time")} wajib diisi`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const url = schedule ? `/api/schedules/${schedule.id}` : `/api/schedules`;
      const method = schedule ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          startTime,
          endTime,
          subjectId: subjectId || null,
          topicId: topicId || null,
          taskId: taskId || null,
          status,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan jadwal");
      }

      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{schedule ? t("common.save_changes") : `${t("common.schedule")} Sesi Belajar`}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("common.date")}</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("common.start_time")}</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("common.end_time")}</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Subject & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("common.subject")}</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopicId("");
                  setTaskId("");
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

          {/* Linked Task */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tugas Terkait ({t("common.optional")})</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
            >
              <option value="">Tidak Ada Tugas Tertentu</option>
              {filteredTasks.map((tk) => (
                <option key={tk.id} value={tk.id}>
                  {tk.title} ({tk.estimatedDuration}m)
                </option>
              ))}
            </select>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground">{t("common.status")}</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="scheduled">⚪ {t("common.scheduled")}</option>
                <option value="in_progress">🔵 {t("common.in_progress")}</option>
                <option value="completed">🟢 {t("common.completed")}</option>
                <option value="skipped">🟠 {t("common.skipped")}</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">{t("common.notes")}</label>
              <Input
                placeholder={t("common.session_notes_placeholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel_action")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.saving") : schedule ? t("common.save_changes") : `${t("common.schedule")} Sesi`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
