"use client";

import * as React from "react";
import {
  Settings,
  FolderSync,
  Sparkles,
  User,
  Clock,
  Shield,
  CheckCircle2,
  ExternalLink,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage, type Language } from "@/contexts/language-context";

export default function SettingsPage() {
  const { user, updateUserPreferences } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [dailyTarget, setDailyTarget] = React.useState(user?.preferences?.dailyTargetMinutes || 90);
  const [pomodoroWork, setPomodoroWork] = React.useState(user?.preferences?.pomodoroWorkMinutes || 25);
  const [pomodoroBreak, setPomodoroBreak] = React.useState(user?.preferences?.pomodoroBreakMinutes || 5);
  const [aiProvider, setAiProvider] = React.useState("rule_based");
  const [aiModel, setAiModel] = React.useState("gemini-2.5-flash");
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserPreferences({
      dailyTargetMinutes: Number(dailyTarget),
      pomodoroWorkMinutes: Number(pomodoroWork),
      pomodoroBreakMinutes: Number(pomodoroBreak),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-border/60">
        <h1 className="text-2xl font-bold tracking-tight">{t("settings.system_title")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("settings.system_subtitle")}
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {t("settings.saved_success")}
        </div>
      )}

      {/* 0. Language Settings Card */}
      <Card className="border-border/80">
        <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              {t("settings.language")}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {lang === "id" ? t("settings.active_id") : t("settings.active_en")}
          </Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            {t("settings.choose_language")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setLang("id")}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                lang === "id"
                  ? "border-primary bg-primary/10 text-foreground font-semibold shadow-sm"
                  : "border-border/70 hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <span className="text-2xl">🇮🇩</span>
              <div>
                <p className="font-semibold text-foreground text-sm">Bahasa Indonesia</p>
                <p className="text-[11px] text-muted-foreground">{t("settings.default_translation")}</p>
              </div>
              {lang === "id" && <CheckCircle2 className="h-4 w-4 text-primary ml-auto flex-shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setLang("en")}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                lang === "en"
                  ? "border-primary bg-primary/10 text-foreground font-semibold shadow-sm"
                  : "border-border/70 hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <span className="text-2xl">🇬🇧</span>
              <div>
                <p className="font-semibold text-foreground text-sm">English</p>
                <p className="text-[11px] text-muted-foreground">{t("settings.international_translation")}</p>
              </div>
              {lang === "en" && <CheckCircle2 className="h-4 w-4 text-primary ml-auto flex-shrink-0" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 1. Google Drive Integration Card */}
      <Card className="border-border/80">
        <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderSync className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">{t("settings.drive_source")}</CardTitle>
          </div>
          <Badge variant="success" className="text-[10px]">{t("settings.connected_readonly")}</Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/20 border space-y-1">
            <span className="font-semibold text-foreground block">Primary Connected Folder:</span>
            <p className="font-mono text-primary">Bank Materi Sains Data (BMSD)</p>
            <p className="font-mono text-muted-foreground text-[11px]">{t("settings.folder_id")} 1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP</p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {t("settings.drive_description")}
          </p>

          <Button variant="outline" size="sm" asChild className="text-xs">
            <a
              href="https://drive.google.com/drive/folders/1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <span>{t("settings.view_drive")}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* 2. AI Gateway & Model Router Configuration */}
      <Card className="border-border/80">
        <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">{t("settings.ai_router")}</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px]">{t("settings.prompt_guard")}</Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-3 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Learan OS uses an internal AI provider abstraction. The application routes quiz generation, semantic evaluations, and concept simplifications through sanitized boundaries (<code>&lt;untrusted_material_content&gt;</code>) to prevent prompt injection.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="font-semibold text-foreground block">{t("settings.provider")}</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
              >
                <option value="rule_based">Built-in Semantic Engine (Zero API Key)</option>
                <option value="gemini">Google Gemini 2.5 Flash</option>
                <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="local">Local Ollama / vLLM</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground block">{t("settings.model_architecture")}</label>
              <Input
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Study Session & Pomodoro Preferences */}
      <Card className="border-border/80">
        <CardHeader className="p-5 pb-3 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">{t("settings.session_preferences")}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground block">{t("settings.daily_target")}</label>
                <Input
                  type="number"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="h-8 text-xs font-mono"
                  min={15}
                  max={600}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground block">{t("settings.work_interval")}</label>
                <Input
                  type="number"
                  value={pomodoroWork}
                  onChange={(e) => setPomodoroWork(Number(e.target.value))}
                  className="h-8 text-xs font-mono"
                  min={5}
                  max={120}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground block">{t("settings.break_interval")}</label>
                <Input
                  type="number"
                  value={pomodoroBreak}
                  onChange={(e) => setPomodoroBreak(Number(e.target.value))}
                  className="h-8 text-xs font-mono"
                  min={1}
                  max={30}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" className="text-xs">
                Save Preferences
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
