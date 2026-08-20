"use client";

import * as React from "react";
import { Plus, Trash2, CheckCircle2, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoalRecord, Milestone } from "@/db/repositories/goals";

export function GoalModal({
  open,
  onOpenChange,
  goal,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: GoalRecord | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  
  // Milestone draft
  const [msTitle, setMsTitle] = React.useState("");
  const [msDate, setMsDate] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTarget(goal.target);
      setDeadline(goal.deadline);
      setMilestones(goal.milestones || []);
    } else {
      setTitle("");
      setTarget("");
      const inTwoMonths = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];
      setDeadline(inTwoMonths);
      setMilestones([]);
    }
    setMsTitle("");
    setMsDate("");
    setError("");
  }, [goal, open]);

  const handleAddMilestone = () => {
    if (!msTitle.trim()) return;
    const newMs: Milestone = {
      id: "ms-" + Math.random().toString(36).substring(2, 9),
      title: msTitle.trim(),
      isCompleted: false,
      targetDate: msDate || undefined,
    };
    setMilestones([...milestones, newMs]);
    setMsTitle("");
    setMsDate("");
  };

  const handleToggleMilestone = (index: number) => {
    const updated = [...milestones];
    updated[index].isCompleted = !updated[index].isCompleted;
    setMilestones(updated);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Goal title is required");
      return;
    }
    if (!deadline) {
      setError("Target deadline is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const url = goal ? `/api/goals/${goal.id}` : `/api/goals`;
      const method = goal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          target: target.trim(),
          deadline,
          milestones,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save goal");
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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Learning Goal" : "Create Learning Goal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {/* Goal Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Goal Title</label>
            <Input
              placeholder="e.g. Master Distributed Systems & Raft Consensus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Target Metric / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Target / Success Criteria</label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Complete all 8 topics with >= 85% mastery score and pass assessment"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Target Deadline</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="h-9 text-xs"
            />
          </div>

          {/* Dynamic Milestones Section */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Key Milestones ({milestones.length})
              </label>
              {milestones.length > 0 && (
                <span className="text-[11px] font-mono text-primary font-bold">
                  {Math.round((milestones.filter((m) => m.isCompleted).length / milestones.length) * 100)}% Complete
                </span>
              )}
            </div>

            {milestones.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto p-1">
                {milestones.map((ms, idx) => (
                  <div
                    key={ms.id || idx}
                    className="flex items-center justify-between p-2 rounded-md border bg-muted/30 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={ms.isCompleted}
                        onChange={() => handleToggleMilestone(idx)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span className={`font-medium truncate ${ms.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {ms.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ms.targetDate && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {ms.targetDate}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Milestone Inline */}
            <div className="flex gap-2 items-center pt-1">
              <Input
                placeholder="New milestone (e.g. Read chapters 1-4)"
                value={msTitle}
                onChange={(e) => setMsTitle(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Input
                type="date"
                value={msDate}
                onChange={(e) => setMsDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMilestone}
                className="h-8 px-2.5 text-xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : goal ? "Save Changes" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
