"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Highlighter,
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle,
  Plus,
  CheckCircle2,
  ExternalLink,
  Download,
  Eye,
  FileDown,
  BrainCircuit,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MaterialFileRecord, MaterialChunkRecord, MaterialNoteRecord } from "@/db/repositories/materials";
import { ExplanationResponse } from "@/lib/ai/ai-gateway";
import { useLanguage } from "@/contexts/language-context";

export default function DocumentReaderPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const materialId = params.id as string;

  const [material, setMaterial] = React.useState<MaterialFileRecord | null>(null);
  const [chunks, setChunks] = React.useState<MaterialChunkRecord[]>([]);
  const [notes, setNotes] = React.useState<MaterialNoteRecord[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [readerView, setReaderView] = React.useState<"chunks" | "pdf">("chunks");

  // New Note state
  const [noteContent, setNoteContent] = React.useState("");
  const [highlightSelection, setHighlightSelection] = React.useState("");
  const [isSavingNote, setIsSavingNote] = React.useState(false);

  // AI Concept Explainer state
  const [explainingConcept, setExplainingConcept] = React.useState<string>("");
  const [aiExplanation, setAiExplanation] = React.useState<ExplanationResponse | null>(null);
  const [isExplaining, setIsExplaining] = React.useState(false);

  const fetchMaterialDetails = async () => {
    try {
      const res = await fetch(`/api/materials/${materialId}`);
      if (res.ok) {
        const json = await res.json();
        setMaterial(json);
        setChunks(json.chunks || []);
        setNotes(json.notes || []);
      }
    } catch (e) {
      console.error("Failed to load material:", e);
    }
  };

  React.useEffect(() => {
    if (materialId) fetchMaterialDetails();
  }, [materialId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      setIsSavingNote(true);
      const res = await fetch(`/api/materials/${materialId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageNumber: currentPage,
          highlightText: highlightSelection || null,
          noteMarkdown: noteContent,
        }),
      });

      if (res.ok) {
        const newNote = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        setNoteContent("");
        setHighlightSelection("");
      }
    } catch (e) {
      console.error("Failed to save note:", e);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleExplainText = async (selectedText: string) => {
    try {
      setIsExplaining(true);
      setExplainingConcept(selectedText);
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: selectedText,
          context: chunks.map((c) => c.content).join("\n"),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiExplanation(json);
      }
    } catch (e) {
      console.error("AI explain failed:", e);
    } finally {
      setIsExplaining(false);
    }
  };

  const currentChunk = chunks.find((c) => c.pageNumber === currentPage) || chunks[currentPage - 1] || chunks[0];
  const pdfUrl = material?.driveUrl && material.driveUrl.startsWith("/pdfs/")
    ? material.driveUrl
    : (material?.name ? `/pdfs/bmsd/${material.name}` : "");

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="h-8 px-2 text-xs">
            <Link href="/materials">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>{lang === "id" ? "Semua Materi" : "All Materials"}</span>
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground truncate max-w-lg">
                {material?.subjectTitle || material?.name}
              </h1>
              {material?.semester && (
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  Semester {material.semester}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {lang === "id" ? `Wajib (${material?.sks || 3} SKS)` : `Core (${material?.sks || 3} SKS)`}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bank Materi Sains Data (BMSD) • {material?.pageCount || 1} {lang === "id" ? "Halaman" : "Pages"} • {chunks.length} {lang === "id" ? "Sub-Bab" : "Sections"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Reader View Switch: Chunks vs PDF */}
          <div className="flex items-center border rounded-lg p-0.5 bg-muted/40 text-xs">
            <button
              onClick={() => setReaderView("chunks")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium ${
                readerView === "chunks" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3 w-3" />
              <span>{lang === "id" ? "Teks Terstruktur" : "Structured Text"}</span>
            </button>
            <button
              onClick={() => setReaderView("pdf")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium ${
                readerView === "pdf" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>{lang === "id" ? "PDF Viewer" : "PDF Viewer"}</span>
            </button>
          </div>

          {/* Download PDF button */}
          {pdfUrl && (
            <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1">
              <a href={pdfUrl} download>
                <Download className="h-3.5 w-3.5" />
                <span>{lang === "id" ? "Unduh PDF" : "Download PDF"}</span>
              </a>
            </Button>
          )}

          {/* Quiz Shortcut */}
          <Button size="sm" asChild className="h-8 text-xs gap-1.5 shadow-sm">
            <Link href="/quizzes">
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>{lang === "id" ? "Kuis Latihan" : "Practice Quiz"}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* DUAL-PANE STUDY WORKSPACE */}
      <div className="grid gap-4 lg:grid-cols-12 min-h-[75vh]">
        {/* LEFT PANE: Document Content (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          {readerView === "chunks" ? (
            <Card className="flex-1 border-border/80 flex flex-col overflow-hidden bg-card">
              {/* Toolbar */}
              <CardHeader className="p-3 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xs font-semibold truncate">
                    {currentChunk?.sectionHeading || (lang === "id" ? "Modul Materi" : "Material Module")}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center border rounded-md px-1 bg-background">
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                      className="h-6 w-6"
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <span className="text-[10px] font-mono px-1">{zoomLevel}%</span>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                      className="h-6 w-6"
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Page Selector */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="iconSm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="h-7 w-7"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-[11px] font-mono px-1.5">
                      {currentPage} / {material?.pageCount || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="iconSm"
                      onClick={() => setCurrentPage((p) => Math.min(material?.pageCount || 1, p + 1))}
                      disabled={currentPage >= (material?.pageCount || 1)}
                      className="h-7 w-7"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Chunk Content Body */}
              <CardContent className="p-6 flex-1 overflow-y-auto" style={{ fontSize: `${zoomLevel}%` }}>
                {currentChunk ? (
                  <div className="space-y-4 leading-relaxed text-foreground select-text">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-base font-bold text-foreground">
                        {currentChunk.sectionHeading}
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {lang === "id" ? `Halaman ${currentChunk.pageNumber}` : `Page ${currentChunk.pageNumber}`}
                      </Badge>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {currentChunk.content}
                    </p>

                    {/* Highlight and Actions bar */}
                    <div className="pt-4 flex items-center gap-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const sel = window.getSelection()?.toString() || currentChunk.sectionHeading || "Materi Kunci";
                          setHighlightSelection(sel);
                          handleExplainText(sel);
                        }}
                        className="text-xs flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Feynman AI Explain</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const sel = window.getSelection()?.toString();
                          if (sel) {
                            setHighlightSelection(sel);
                            setNoteContent(lang === "id" ? `Catatan untuk: "${sel.substring(0, 50)}..."\n` : `Note for: "${sel.substring(0, 50)}..."\n`);
                          }
                        }}
                        className="text-xs flex items-center gap-1.5"
                      >
                        <Highlighter className="h-3.5 w-3.5" />
                        <span>{lang === "id" ? "Kutip Teks" : "Quote Text"}</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-12">
                    {lang === "id" ? "Tidak ada teks sub-bab pada halaman ini." : "No text chunks found on this page."}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            /* PDF Embedded Viewer */
            <Card className="flex-1 border-border/80 flex flex-col overflow-hidden bg-muted/20">
              <CardHeader className="p-3 border-b bg-card flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  <CardTitle className="text-xs font-semibold truncate">
                    {material?.name} ({lang === "id" ? "PDF Asli" : "Original PDF"})
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                      <span>{lang === "id" ? "Tab Baru" : "New Tab"}</span>
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                    <a href={pdfUrl} download>
                      <Download className="h-3 w-3" />
                      <span>{lang === "id" ? "Unduh" : "Download"}</span>
                    </a>
                  </Button>
                </div>
              </CardHeader>

              <div className="flex-1 w-full h-[650px] bg-card relative">
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=1&view=FitH`}
                    className="w-full h-full border-none"
                    title={material?.name || "PDF Viewer"}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    {lang === "id" ? "Memuat PDF..." : "Loading PDF..."}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT PANE: Active Notes & Feynman AI Explainer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <Tabs defaultValue="notes" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 w-full h-9 bg-muted/60">
              <TabsTrigger value="notes" className="text-xs flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>{lang === "id" ? `Catatan Studi (${notes.length})` : `Study Notes (${notes.length})`}</span>
              </TabsTrigger>
              <TabsTrigger value="explainer" className="text-xs flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Feynman AI Tutor</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Notes & Highlights */}
            <TabsContent value="notes" className="flex-1 flex flex-col space-y-3 mt-3">
              <Card className="p-3.5 flex-1 flex flex-col border-border/80 shadow-sm">
                <form onSubmit={handleAddNote} className="space-y-2">
                  {highlightSelection && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                      <strong>{lang === "id" ? "Kutipan:" : "Quote:"}</strong> &ldquo;{highlightSelection.substring(0, 90)}...&rdquo;
                    </div>
                  )}
                  <textarea
                    placeholder={lang === "id" ? "Tulis ringkasan, rumus penting, atau wawasan belajar..." : "Write definitions, code snippets, or key insights..."}
                    className="w-full h-20 p-2.5 rounded-lg border border-input bg-transparent text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={isSavingNote} className="text-xs h-7 px-3">
                      <Plus className="h-3 w-3 mr-1" /> {lang === "id" ? "Simpan Catatan" : "Save Note"}
                    </Button>
                  </div>
                </form>

                <div className="border-t my-3" />

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px]">
                  {notes.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      {lang === "id" ? "Belum ada catatan studi untuk materi ini." : "No study notes logged for this material yet."}
                    </p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg border bg-muted/20 text-xs space-y-1">
                        {n.highlightText && (
                          <div className="text-[10px] text-primary font-mono italic pl-1.5 border-l-2 border-primary">
                            &ldquo;{n.highlightText}&rdquo;
                          </div>
                        )}
                        <p className="text-foreground leading-relaxed">{n.noteMarkdown}</p>
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          {lang === "id" ? `Halaman ${n.pageNumber || 1}` : `Page ${n.pageNumber || 1}`} • {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Tab 2: AI Explainer Drawer */}
            <TabsContent value="explainer" className="flex-1 flex flex-col mt-3">
              <Card className="p-4 flex-1 flex flex-col border-border/80 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Feynman Concept Simplifier</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    Grounded AI
                  </Badge>
                </div>

                {isExplaining ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary animate-pulse" />
                    {lang === "id" ? "Menganalisis dan menyusun analogi intuitif..." : "Analyzing and synthesizing intuitive analogy..."}
                  </div>
                ) : aiExplanation ? (
                  <div className="space-y-3 text-xs overflow-y-auto max-h-[420px]">
                    <div>
                      <span className="font-bold text-foreground block text-sm">{aiExplanation.concept}</span>
                      <p className="text-muted-foreground leading-relaxed mt-1">{aiExplanation.explanation}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
                      <span className="font-semibold text-primary block text-[11px]">{lang === "id" ? "Analogi Intuitif:" : "Intuitive Analogy:"}</span>
                      <p className="text-foreground/90">{aiExplanation.analogyOrExample}</p>
                    </div>

                    {aiExplanation.keyFormulaOrRule && (
                      <div className="p-2 rounded-lg bg-muted font-mono text-[11px] text-foreground">
                        <strong>{lang === "id" ? "Rumus / Aturan:" : "Formula / Invariant:"}</strong> {aiExplanation.keyFormulaOrRule}
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 space-y-1">
                      <span className="font-semibold text-[11px]">{lang === "id" ? "Pertanyaan Uji Pemahaman:" : "Understanding Check Question:"}</span>
                      <p>{aiExplanation.feynmanCheckQuestion}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    <HelpCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground">{lang === "id" ? "Pilih atau sorot teks konsep" : "Select or highlight concept text"}</p>
                    <p className="mt-1 max-w-xs mx-auto">
                      {lang === "id" ? "Klik tombol \"Feynman AI Explain\" pada potongan materi untuk menyusun analogi pemahaman." : "Click \"Feynman AI Explain\" on any chunk or highlighted text to generate simplified analogies."}
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
