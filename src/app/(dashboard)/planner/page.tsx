"use client";

import * as React from "react";
import {
  CalendarDays,
  Target,
  ListTodo,
  Sparkles,
  Plus,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScheduleRecord } from "@/db/repositories/schedules";
import { TaskRecord } from "@/db/repositories/tasks";
import { GoalRecord } from "@/db/repositories/goals";
import { StudyPlanRecord } from "@/db/repositories/study-plans";
import { ScheduleModal } from "@/components/planner/schedule-modal";
import { TaskModal } from "@/components/tasks/task-modal";
import { GoalModal } from "@/components/goals/goal-modal";
import { formatMinutes } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

export default function PlannerPage() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<"schedule" | "tasks" | "goals" | "plans">("schedule");
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [schedules, setSchedules] = React.useState<ScheduleRecord[]>([]);
  const [tasks, setTasks] = React.useState<TaskRecord[]>([]);
  const [goals, setGoals] = React.useState<GoalRecord[]>([]);
  const [plans, setPlans] = React.useState<StudyPlanRecord[]>([]);
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [topics, setTopics] = React.useState<any[]>([]);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
  const [taskModalOpen, setTaskModalOpen] = React.useState(false);
  const [goalModalOpen, setGoalModalOpen] = React.useState(false);

  // New Goal Plan Form State
  const [planTitle, setPlanTitle] = React.useState("");
  const [planTargetDate, setPlanTargetDate] = React.useState("");
  const [planCapacity, setPlanCapacity] = React.useState(90);
  const [planStrategy, setPlanStrategy] = React.useState<"adaptive_spaced" | "linear" | "exam_preparation">("adaptive_spaced");
  const [isGeneratingPlan, setIsGeneratingPlan] = React.useState(false);

  const fetchData = async () => {
    try {
      const [schedRes, taskRes, goalRes, planRes, subRes, topRes] = await Promise.all([
        fetch(`/api/schedules?date=${selectedDate}`),
        fetch("/api/tasks"),
        fetch("/api/goals"),
        fetch("/api/study-plans"),
        fetch("/api/subjects"),
        fetch("/api/topics"),
      ]);

      const [schedData, taskData, goalData, planData, subData, topData] = await Promise.all([
        schedRes.json(),
        taskRes.json(),
        goalRes.json(),
        planRes.json(),
        subRes.json(),
        topRes.json(),
      ]);

      setSchedules(schedData);
      setTasks(taskData);
      setGoals(goalData);
      setPlans(planData);
      setSubjects(subData);
      setTopics(topData);
    } catch (e) {
      console.error("Failed to load planner data:", e);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle || !planTargetDate) return;

    try {
      setIsGeneratingPlan(true);
      const res = await fetch("/api/study-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: planTitle,
          targetDate: planTargetDate,
          dailyCapacityMinutes: planCapacity,
          strategy: planStrategy,
        }),
      });

      if (res.ok) {
        setPlanTitle("");
        setPlanTargetDate("");
        fetchData();
      }
    } catch (e) {
      console.error("Failed to generate plan:", e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed";
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (e) {
      console.error("Failed to update task:", e);
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId }),
      });
      fetchData();
    } catch (e) {
      console.error("Failed to toggle milestone:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("planner.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("planner.subtitle")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger value="schedule" className="text-xs">{lang === "id" ? "Jadwal" : "Schedule"}</TabsTrigger>
            <TabsTrigger value="plans" className="text-xs">{lang === "id" ? "Rencana Target" : "Goal Plans"}</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">{lang === "id" ? "Tugas" : "Tasks"}</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">{lang === "id" ? "Milestone" : "Milestones"}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* TAB 1: DAILY SCHEDULE TIMELINE */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          {/* Date Selector Ribbon */}
          <div className="p-3 rounded-lg border bg-card/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split("T")[0]);
                }}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="h-8 text-xs font-semibold"
              >
                {lang === "id" ? "Hari Ini" : "Today"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split("T")[0]);
                }}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono font-semibold px-2 text-foreground">
                {selectedDate}
              </span>
            </div>

            <Button size="sm" onClick={() => setScheduleModalOpen(true)} className="text-xs shadow-sm">
              <Plus className="h-3.5 w-3.5 mr-1" /> {lang === "id" ? "Tambah Blok Waktu" : "Add Time Block"}
            </Button>
          </div>

          {/* Schedule List */}
          {schedules.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">
                {lang === "id" ? "Tidak ada sesi belajar terjadwal untuk tanggal ini" : "No study sessions scheduled for this date"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                {lang === "id" ? "Jadwalkan blok waktu belajar untuk menjaga konsistensi progres." : "Time-block your day to maintain consistent learning velocity."}
              </p>
              <Button size="sm" variant="outline" onClick={() => setScheduleModalOpen(true)} className="text-xs">
                <Plus className="h-3 w-3 mr-1" /> {lang === "id" ? "Blok Waktu Belajar" : "Block Study Time"}
              </Button>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 px-2 rounded bg-primary/10 text-primary font-mono font-bold text-xs">
                      {s.startTime} - {s.endTime}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{s.topicTitle || s.taskTitle || (lang === "id" ? "Sesi Fokus" : "Focus Block")}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {s.subjectTitle || "General"} {s.notes ? `• ${s.notes}` : ""}
                      </p>
                    </div>
                  </div>

                  <Badge variant={s.status === "completed" ? "success" : "secondary"} className="capitalize">
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOAL-DRIVEN STUDY PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          {/* Plan Generator Form */}
          <Card className="border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold">
                {lang === "id" ? "Buat Rencana Belajar Adaptif AI" : "Create Adaptive Goal Plan"}
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === "id"
                ? "Tentukan tenggat target (misal: \"Kuasai Struktur Data dalam 3 minggu\") dan penjadwal adaptif AI akan menyusun antrean kurikulum harian optimal."
                : "Define your target deadline and our adaptive scheduler will build an optimal daily curriculum queue."}
            </p>

            <form onSubmit={handleGeneratePlan} className="grid sm:grid-cols-4 gap-3 pt-1">
              <Input
                placeholder={lang === "id" ? "Judul rencana (misal: Persiapan UTS)..." : "Plan title (e.g. Midterm Prep)..."}
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                className="h-8 text-xs"
                required
              />
              <Input
                type="date"
                value={planTargetDate}
                onChange={(e) => setPlanTargetDate(e.target.value)}
                className="h-8 text-xs"
                required
              />
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                value={planStrategy}
                onChange={(e) => setPlanStrategy(e.target.value as any)}
              >
                <option value="adaptive_spaced">{lang === "id" ? "Spaced Repetition (FSRS)" : "Adaptive Spaced (FSRS Balanced)"}</option>
                <option value="exam_preparation">{lang === "id" ? "Sprint Ujian (Fokus Deadline)" : "Exam Sprint (Deadline Focused)"}</option>
                <option value="linear">{lang === "id" ? "Sekuensial Linier" : "Linear Sequential"}</option>
              </select>
              <Button type="submit" size="sm" disabled={isGeneratingPlan} className="text-xs">
                {isGeneratingPlan ? (lang === "id" ? "Menjadwalkan..." : "Scheduling...") : t("planner.generate_ai")}
              </Button>
            </form>
          </Card>

          {/* Active Plans List */}
          <div className="space-y-3">
            {plans.map((p) => (
              <Card key={p.id} className="p-4 border-border/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {lang === "id" ? "Tenggat Target:" : "Target Deadline:"} {p.targetDate} • {lang === "id" ? "Strategi:" : "Strategy:"} {p.strategy.replace("_", " ")}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {p.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {lang === "id" ? "Alokasi Harian:" : "Daily Target Budget:"} {p.dailyCapacityMinutes} {lang === "id" ? "menit/hari" : "mins/day"}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">{lang === "id" ? "Antrean Tugas Aktif" : "Active Task Queue"}</span>
            <Button size="sm" onClick={() => setTaskModalOpen(true)} className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> {lang === "id" ? "Tambah Tugas" : "Add Task"}
            </Button>
          </div>

          <div className="space-y-2">
            {tasks.map((tItem) => (
              <div
                key={tItem.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-border text-xs gap-3"
              >
                <label className="flex items-center gap-2.5 min-w-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tItem.status === "completed"}
                    onChange={() => handleToggleTask(tItem.id, tItem.status)}
                    className="rounded border-input text-primary"
                  />
                  <span className={`font-semibold truncate ${tItem.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {tItem.title}
                  </span>
                </label>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">
                    {tItem.subjectTitle} • {tItem.estimatedDuration}m
                  </span>
                  <Badge variant={tItem.priority === "urgent" ? "destructive" : "secondary"} className="text-[9px] uppercase">
                    {tItem.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GOALS & MILESTONES */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">{lang === "id" ? "Target Jangka Panjang & Milestone" : "Long-Term Milestones"}</span>
            <Button size="sm" onClick={() => setGoalModalOpen(true)} className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> {lang === "id" ? "Atur Target" : "Set Goal"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((g) => (
              <Card key={g.id} className="p-4 border-border/80 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-foreground">{g.title}</h3>
                  <span className="font-mono text-xs font-bold text-primary">{Math.round(g.progress)}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{g.target}</p>

                {/* Milestones checklist */}
                <div className="space-y-1.5 pt-2 border-t text-xs">
                  {g.milestones.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.isCompleted}
                        onChange={() => handleToggleMilestone(g.id, m.id)}
                        className="rounded border-input text-primary"
                      />
                      <span className={m.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}>
                        {m.title}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        subjects={subjects}
        topics={topics}
        tasks={tasks}
        defaultDate={selectedDate}
        onSaved={fetchData}
      />
      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        subjects={subjects}
        topics={topics}
        onSaved={fetchData}
      />
      <GoalModal
        open={goalModalOpen}
        onOpenChange={setGoalModalOpen}
        onSaved={fetchData}
      />
    </div>
  );
}
