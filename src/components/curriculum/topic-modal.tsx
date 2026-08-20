"use client";

import * as React from "react";
import { Plus, Trash2, Link as LinkIcon, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopicRecord, RelatedMaterial } from "@/db/repositories/topics";
import { SubjectRecord } from "@/db/repositories/subjects";

export function TopicModal({
  open,
  onOpenChange,
  topic,
  subjects,
  allTopics,
  defaultSubjectId,
  defaultParentId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic?: TopicRecord | null;
  subjects: SubjectRecord[];
  allTopics: TopicRecord[];
  defaultSubjectId?: string;
  defaultParentId?: string | null;
  onSaved: () => void;
}) {
  const [subjectId, setSubjectId] = React.useState("");
  const [parentId, setParentId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<"not_started" | "in_progress" | "completed" | "needs_review">("not_started");
  const [difficulty, setDifficulty] = React.useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [mastery, setMastery] = React.useState<number>(0);
  const [prerequisites, setPrerequisites] = React.useState<string[]>([]);
  const [relatedMaterials, setRelatedMaterials] = React.useState<RelatedMaterial[]>([]);
  
  // Material input draft
  const [matTitle, setMatTitle] = React.useState("");
  const [matUrl, setMatUrl] = React.useState("");
  const [matType, setMatType] = React.useState("PDF");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (topic) {
      setSubjectId(topic.subjectId);
      setParentId(topic.parentId || null);
      setTitle(topic.title);
      setDescription(topic.description || "");
      setStatus(topic.status);
      setDifficulty(topic.difficulty);
      setMastery(topic.mastery);
      setPrerequisites(topic.prerequisites || []);
      setRelatedMaterials(topic.relatedMaterials || []);
    } else {
      setSubjectId(defaultSubjectId || subjects[0]?.id || "");
      setParentId(defaultParentId || null);
      setTitle("");
      setDescription("");
      setStatus("not_started");
      setDifficulty("intermediate");
      setMastery(0);
      setPrerequisites([]);
      setRelatedMaterials([]);
    }
    setMatTitle("");
    setMatUrl("");
    setMatType("PDF");
    setError("");
  }, [topic, open, defaultSubjectId, defaultParentId, subjects]);

  const handleAddMaterial = () => {
    if (!matTitle.trim()) return;
    setRelatedMaterials([
      ...relatedMaterials,
      { title: matTitle.trim(), url: matUrl.trim() || undefined, type: matType },
    ]);
    setMatTitle("");
    setMatUrl("");
  };

  const handleRemoveMaterial = (index: number) => {
    setRelatedMaterials(relatedMaterials.filter((_, i) => i !== index));
  };

  const togglePrerequisite = (id: string) => {
    if (prerequisites.includes(id)) {
      setPrerequisites(prerequisites.filter((p) => p !== id));
    } else {
      setPrerequisites([...prerequisites, id]);
    }
  };

  // Eligible parent topics (same subject, not itself)
  const eligibleParents = allTopics.filter(
    (t) => t.subjectId === subjectId && (!topic || t.id !== topic.id) && !t.parentId
  );

  // Eligible prerequisites (not itself)
  const eligiblePrereqs = allTopics.filter((t) => !topic || t.id !== topic.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Topic title is required");
      return;
    }
    if (!subjectId) {
      setError("Subject is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const url = topic ? `/api/topics/${topic.id}` : `/api/topics`;
      const method = topic ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          parentId: parentId || null,
          title: title.trim(),
          description: description.trim(),
          status,
          difficulty,
          mastery,
          prerequisites,
          relatedMaterials,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save topic");
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
          <DialogTitle>
            {topic ? (topic.parentId ? "Edit Subtopic" : "Edit Topic") : parentId ? "Create Subtopic" : "Create Topic"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {/* Subject & Parent Hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Subject</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setParentId(null);
                }}
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Hierarchy / Parent Topic</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={parentId || ""}
                onChange={(e) => setParentId(e.target.value || null)}
              >
                <option value="">None (Top-level Topic)</option>
                {eligibleParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    Subtopic under: {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Topic Title</label>
            <Input
              placeholder="e.g. Concurrency & Synchronization Locks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description & Objectives</label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Key concepts, principles, and notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status & Difficulty & Mastery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Status</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="not_started">⚪ Not Started</option>
                <option value="in_progress">🔵 In Progress</option>
                <option value="completed">🟢 Completed</option>
                <option value="needs_review">🟠 Needs Review</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Difficulty</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground">Mastery</label>
                <span className="font-mono text-xs font-bold text-primary">{mastery}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={mastery}
                onChange={(e) => setMastery(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Prerequisite Topics</label>
            {eligiblePrereqs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No other topics available to select.</p>
            ) : (
              <div className="max-h-28 overflow-y-auto p-2 rounded-md border bg-background space-y-1">
                {eligiblePrereqs.map((p) => {
                  const isChecked = prerequisites.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePrerequisite(p.id)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="font-medium">{p.title}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        ({p.subjectTitle || "Subject"})
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Related Materials */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Related Materials & Links</label>
            
            {relatedMaterials.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {relatedMaterials.map((mat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded border bg-muted/40 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">
                        {mat.type}
                      </span>
                      <span className="font-medium truncate">{mat.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(i)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={matType}
                onChange={(e) => setMatType(e.target.value)}
              >
                <option value="PDF">PDF</option>
                <option value="Doc">Doc</option>
                <option value="Video">Video</option>
                <option value="Link">Link</option>
                <option value="Paper">Paper</option>
              </select>
              <Input
                placeholder="Material title (e.g. Chapter 4 Notes)"
                value={matTitle}
                onChange={(e) => setMatTitle(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Input
                placeholder="URL (optional)"
                value={matUrl}
                onChange={(e) => setMatUrl(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMaterial}
                className="h-8 px-2.5 text-xs"
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
              {isSubmitting ? "Saving..." : topic ? "Save Changes" : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
