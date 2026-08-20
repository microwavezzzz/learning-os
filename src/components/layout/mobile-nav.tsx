"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Home,
  BookOpen,
  FolderSync,
  Calendar,
  Timer,
  FileQuestion,
  AlertCircle,
  TrendingUp,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { title: t("nav.dashboard"), href: "/dashboard", icon: Home, color: "from-blue-500 to-indigo-600" },
    { title: t("nav.curriculum"), href: "/curriculum", icon: BookOpen, color: "from-purple-500 to-violet-600" },
    { title: t("nav.materials"), href: "/materials", icon: FolderSync, color: "from-teal-400 to-cyan-500" },
    { title: t("nav.planner"), href: "/planner", icon: Calendar, color: "from-orange-400 to-amber-500" },
    { title: t("nav.session"), href: "/session", icon: Timer, color: "from-rose-500 to-pink-600" },
    { title: t("nav.quizzes"), href: "/quizzes", icon: FileQuestion, color: "from-amber-400 to-yellow-500" },
    { title: t("nav.mistakes"), href: "/mistakes", icon: AlertCircle, color: "from-red-500 to-rose-600" },
    { title: t("nav.analytics"), href: "/analytics", icon: TrendingUp, color: "from-emerald-400 to-teal-500" },
    { title: t("nav.settings"), href: "/settings", icon: Settings, color: "from-indigo-400 to-purple-600" },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden h-10 w-10 text-foreground bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-white/10 backdrop-blur-md rounded-2xl shadow-sm"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open navigation menu</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="fixed top-0 left-0 bottom-0 translate-x-0 translate-y-0 h-full max-w-xs w-3/4 rounded-none border-r border-white/60 dark:border-white/10 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-2xl p-0 shadow-2xl z-50 text-white">
          <DialogHeader className="p-5 border-b border-white/10">
            <DialogTitle className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center text-white font-bold text-sm">
                ✨
              </div>
              <span className="font-extrabold text-base tracking-tight">LearnSphere</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-80px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-2xl font-semibold transition-all",
                    isActive
                      ? "bg-white/20 text-white shadow-md border border-white/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className={cn("h-7 w-7 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shadow-sm shrink-0", item.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
