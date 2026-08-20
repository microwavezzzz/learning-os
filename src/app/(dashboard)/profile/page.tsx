"use client";

import * as React from "react";
import {
  User,
  Mail,
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  Flame,
  CheckCircle2,
  Sparkles,
  Edit3,
  Save,
  ShieldCheck,
  Calendar,
  Layers,
  BrainCircuit,
  Target,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/language-context";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
];

const ACHIEVEMENTS = [
  {
    id: "bmsd_explorer",
    title: "BMSD Pioneer",
    desc: "Terhubung penuh ke Bank Materi Sains Data Google Drive",
    icon: "🌟",
    color: "from-amber-400 to-orange-500",
    unlocked: true,
  },
  {
    id: "feynman_thinker",
    title: "Feynman Apprentice",
    desc: "Memahami konsep kuliah menggunakan analogi AI",
    icon: "🧠",
    color: "from-purple-500 to-indigo-600",
    unlocked: true,
  },
  {
    id: "active_recall",
    title: "Recall Master",
    desc: "Menyelesaikan simulasi kuis terarah",
    icon: "🎯",
    color: "from-cyan-400 to-teal-500",
    unlocked: true,
  },
  {
    id: "mistake_slayer",
    title: "Error Diagnostician",
    desc: "Menganalisis root-cause kelemahan di Bank Kesalahan",
    icon: "🛡️",
    color: "from-rose-500 to-pink-600",
    unlocked: true,
  },
  {
    id: "fsrs_guardian",
    title: "Memory Architect",
    desc: "Memanfaatkan algoritma FSRS untuk retensi jangka panjang",
    icon: "💡",
    color: "from-emerald-400 to-green-600",
    unlocked: true,
  },
  {
    id: "streak_champ",
    title: "Daily Discipline",
    desc: "Mempertahankan fokus belajar harian konsisten",
    icon: "🔥",
    color: "from-red-500 to-amber-500",
    unlocked: true,
  },
];

export default function ProfilePage() {
  const { user, updateUserPreferences } = useAuth();
  const { t, lang } = useLanguage();

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || "Alex Rivera",
    email: user?.email || "alex.learner@learningos.dev",
    nim: "12345678",
    major: "Sains Data (Data Science)",
    university: "Institut Teknologi",
    bio: "Mahasiswa Sains Data yang berfokus pada Machine Learning, Statistik Inferensial, dan Rekayasa Data.",
    avatarUrl: user?.avatarUrl || AVATAR_PRESETS[0],
  });

  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || AVATAR_PRESETS[0],
      }));
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        avatarUrl: formData.avatarUrl,
      };
      localStorage.setItem("learning_os_auth_user", JSON.stringify(updatedUser));
      // Trigger preference update to refresh context
      updateUserPreferences({});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      setIsEditOpen(false);
    }
  };

  const initials = (formData.name || "Alex")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up">
      {/* ── HERO PROFILE HEADER ────────────────────────────────────────── */}
      <div className="glass-subcard rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/60 dark:border-white/10 shadow-xl">
        {/* Ambient Top Corner Gradient Glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Glow Ring */}
            <div className="relative group">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl border-2 border-white/80 dark:border-white/20 shadow-2xl">
                <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                <AvatarFallback className="bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 text-white font-black text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 border-2 border-background flex items-center justify-center text-white text-xs shadow-md">
                ✓
              </div>
            </div>

            {/* User Meta Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {formData.name}
                </h1>
                <Badge variant="default" className="text-xs px-3 py-1 font-bold shadow-md bg-gradient-to-r from-primary to-indigo-500 text-white">
                  {lang === "id" ? "Mahasiswa Aktif" : "Active Student"}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span>{formData.major} • {formData.university}</span>
              </p>

              <div className="flex items-center gap-4 text-xs text-foreground/60 flex-wrap pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  {formData.email}
                </span>
                <span>•</span>
                <span className="font-mono">NIM: {formData.nim}</span>
              </div>
            </div>
          </div>

          {/* Quick Edit Profile Action */}
          <div className="shrink-0 flex items-center gap-2">
            <Button
              onClick={() => setIsEditOpen(true)}
              className="btn-gradient-magenta rounded-2xl h-10 px-5 text-xs font-bold text-white shadow-lg flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>{lang === "id" ? "Edit Profil" : "Edit Profile"}</span>
            </Button>
          </div>
        </div>

        {/* Bio Status */}
        <div className="mt-6 pt-5 border-t border-white/40 dark:border-white/10 text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-3xl">
          <p className="italic">"{formData.bio}"</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in-up">
          <CheckCircle2 className="h-4 w-4" />
          <span>{lang === "id" ? "Profil berhasil diperbarui!" : "Profile updated successfully!"}</span>
        </div>
      )}

      {/* ── ACADEMIC STATISTICS CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="glass-subcard rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground/70 font-semibold">
            <span>{lang === "id" ? "Mata Kuliah" : "Enrolled Courses"}</span>
            <div className="h-7 w-7 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-foreground block font-mono">
            39
          </span>
          <span className="text-[11px] text-foreground/60 block font-medium">
            Semester 1 - 6 (BMSD)
          </span>
        </Card>

        <Card className="glass-subcard rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground/70 font-semibold">
            <span>{lang === "id" ? "Total Beban SKS" : "Total Credits"}</span>
            <div className="h-7 w-7 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-foreground block font-mono">
            110 <span className="text-sm font-sans font-bold text-foreground/60">SKS</span>
          </span>
          <span className="text-[11px] text-foreground/60 block font-medium">
            Kurikulum Sains Data
          </span>
        </Card>

        <Card className="glass-subcard rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground/70 font-semibold">
            <span>{lang === "id" ? "Streak Belajar" : "Study Streak"}</span>
            <div className="h-7 w-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-foreground block font-mono">
            0 <span className="text-sm font-sans font-bold text-foreground/60">Hari</span>
          </span>
          <span className="text-[11px] text-foreground/60 block font-medium">
            {lang === "id" ? "Siap mulai hari ini" : "Ready to start today"}
          </span>
        </Card>

        <Card className="glass-subcard rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground/70 font-semibold">
            <span>{lang === "id" ? "Retensi FSRS" : "FSRS Retention"}</span>
            <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-foreground block font-mono">
            100%
          </span>
          <span className="text-[11px] text-foreground/60 block font-medium">
            Optimal Spacing Engine
          </span>
        </Card>
      </div>

      {/* ── ACHIEVEMENTS & BADGES GRID ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>{lang === "id" ? "Badge & Pencapaian Belajar" : "Badges & Achievements"}</span>
            </h2>
            <p className="text-xs text-foreground/60 mt-0.5">
              {lang === "id" ? "Penghargaan atas dedikasi dan eksplorasi materi perkuliahan." : "Honors earned through active recall and study discipline."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.id}
              className="glass-subcard rounded-3xl p-4 sm:p-5 flex items-start gap-4 transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${ach.color} shadow-md flex items-center justify-center text-xl shrink-0 group-hover:rotate-6 transition-transform`}>
                {ach.icon}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground truncate">
                    {ach.title}
                  </h3>
                  <Badge variant="outline" className="text-[9px] px-2 py-0 bg-white/40 dark:bg-slate-800/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    Unlocked
                  </Badge>
                </div>
                <p className="text-[11px] text-foreground/60 leading-relaxed">
                  {ach.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ─────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {lang === "id" ? "Edit Profil Pengguna" : "Edit User Profile"}
            </DialogTitle>
            <DialogDescription>
              {lang === "id" ? "Perbarui informasi identitas dan avatar akun belajar Anda." : "Update your identity information and learning avatar."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            {/* Avatar Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                {lang === "id" ? "Pilih Avatar" : "Choose Avatar"}
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: url })}
                    className={`relative rounded-2xl p-0.5 shrink-0 transition-transform ${
                      formData.avatarUrl === url
                        ? "ring-2 ring-primary scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={url} />
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {lang === "id" ? "Nama Lengkap" : "Full Name"}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">NIM</label>
                <Input
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "id" ? "Program Studi" : "Major"}
                </label>
                <Input
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Bio / Status Belajar
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl h-10 text-xs"
              >
                {lang === "id" ? "Batal" : "Cancel"}
              </Button>
              <Button
                type="submit"
                className="btn-gradient-magenta text-white font-bold rounded-xl h-10 px-5 text-xs shadow-md"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {lang === "id" ? "Simpan Perubahan" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
