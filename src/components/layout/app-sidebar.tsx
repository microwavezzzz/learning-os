"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  FolderSync,
  Calendar,
  Timer,
  FileQuestion,
  AlertCircle,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/language-context";

export function AppSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    {
      title: t("nav.dashboard"),
      href: "/dashboard",
      icon: Home,
      color: "from-blue-500 to-indigo-600",
      glow: "shadow-[0_0_12px_rgba(59,130,246,0.5)]",
    },
    {
      title: t("nav.curriculum"),
      href: "/curriculum",
      icon: BookOpen,
      color: "from-purple-500 to-violet-600",
      glow: "shadow-[0_0_12px_rgba(168,85,247,0.5)]",
    },
    {
      title: t("nav.materials"),
      href: "/materials",
      icon: FolderSync,
      color: "from-teal-400 to-cyan-500",
      glow: "shadow-[0_0_12px_rgba(20,184,166,0.5)]",
    },
    {
      title: t("nav.planner"),
      href: "/planner",
      icon: Calendar,
      color: "from-orange-400 to-amber-500",
      glow: "shadow-[0_0_12px_rgba(249,115,22,0.5)]",
    },
    {
      title: t("nav.session"),
      href: "/session",
      icon: Timer,
      color: "from-rose-500 to-pink-600",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.5)]",
    },
    {
      title: t("nav.quizzes"),
      href: "/quizzes",
      icon: FileQuestion,
      color: "from-amber-400 to-yellow-500",
      glow: "shadow-[0_0_12px_rgba(234,179,8,0.5)]",
    },
    {
      title: t("nav.mistakes"),
      href: "/mistakes",
      icon: AlertCircle,
      badge: t("header.badge.mistakes"),
      color: "from-red-500 to-rose-600",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.5)]",
    },
    {
      title: t("nav.analytics"),
      href: "/analytics",
      icon: TrendingUp,
      color: "from-emerald-400 to-teal-500",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.5)]",
    },
  ];

  const BOTTOM_ITEMS = [
    {
      title: t("nav.profile"),
      href: "/profile",
      icon: User,
      color: "from-pink-500 to-rose-600",
      glow: "shadow-[0_0_10px_rgba(244,63,94,0.4)]",
    },
    {
      title: t("nav.settings"),
      href: "/settings",
      icon: Settings,
      color: "from-indigo-400 to-purple-600",
      glow: "shadow-[0_0_10px_rgba(99,102,241,0.4)]",
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col glass-panel-main rounded-3xl transition-all duration-300 relative z-30 shrink-0 select-none shadow-2xl p-3 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header with Glowing Orb Logo */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-white/40 dark:border-white/10 mb-2">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              {/* 3D Glowing Sphere Logo matching LearnSphere style */}
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-[0_0_18px_rgba(168,85,247,0.6)] group-hover:scale-105 transition-transform duration-300">
                <div className="h-full w-full rounded-[14px] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center text-white font-black text-lg">
                  ✨
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight leading-none text-foreground group-hover:text-primary transition-colors">
                  LearnSphere
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-1">
                  BMSD Learan OS
                </span>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link href="/dashboard" className="mx-auto group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-[0_0_18px_rgba(168,85,247,0.6)] group-hover:scale-110 transition-transform duration-300">
                <div className="h-full w-full rounded-[14px] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center text-white font-black text-lg">
                  ✨
                </div>
              </div>
            </Link>
          )}

          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "text-muted-foreground hover:text-foreground hidden md:flex transition-all hover:bg-white/40 dark:hover:bg-white/10 rounded-xl",
              collapsed && "absolute -right-3 top-6 h-6 w-6 rounded-full border border-white/60 dark:border-white/10 bg-background shadow-md"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Primary Navigation List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-11 w-11 mx-auto rounded-2xl transition-all duration-200 relative group",
                        isActive
                          ? "bg-white/80 dark:bg-white/20 shadow-[0_4px_20px_rgba(255,255,255,0.3)] border border-white/80 dark:border-white/30 scale-105"
                          : "hover:bg-white/40 dark:hover:bg-white/10 hover:scale-105"
                      )}
                    >
                      <div className={cn(
                        "h-7 w-7 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110",
                        item.color,
                        isActive && item.glow
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {item.badge && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-background animate-pulse" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-semibold text-xs rounded-xl bg-slate-900 text-white border-white/20">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-sm font-semibold group relative overflow-hidden",
                  isActive
                    ? "bg-white/80 dark:bg-white/20 text-foreground shadow-[0_4px_20px_rgba(255,255,255,0.25)] border border-white/80 dark:border-white/30 backdrop-blur-md"
                    : "text-foreground/80 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/10"
                )}
              >
                {/* Colored Glass Icon Box */}
                <div className={cn(
                  "h-8 w-8 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-110 shrink-0",
                  item.color,
                  isActive && item.glow
                )}>
                  <Icon className="h-4 w-4" />
                </div>

                <span className="truncate">{item.title}</span>

                {item.badge && (
                  <Badge
                    variant="warning"
                    className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section: Profile & Settings */}
        <div className="pt-2 border-t border-white/40 dark:border-white/10 space-y-1 mt-auto">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            if (collapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className="flex items-center justify-center h-10 w-10 mx-auto rounded-2xl hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-semibold text-xs rounded-xl">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/10 transition-colors",
                  isActive && "text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
}
