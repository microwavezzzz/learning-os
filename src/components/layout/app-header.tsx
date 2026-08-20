"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "@/contexts/language-context";

export function AppHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [commandOpen, setCommandOpen] = React.useState(false);

  // Dynamic breadcrumb map using translations
  const BREADCRUMB_MAP: Record<string, string> = {
    dashboard: t("breadcrumb.dashboard"),
    curriculum: t("breadcrumb.curriculum"),
    materials: t("breadcrumb.materials"),
    planner: t("breadcrumb.planner"),
    session: t("breadcrumb.session"),
    quizzes: t("breadcrumb.quizzes"),
    mistakes: t("breadcrumb.mistakes"),
    analytics: t("breadcrumb.analytics"),
    settings: t("breadcrumb.settings"),
    profile: t("breadcrumb.profile"),
  };

  // Split path for breadcrumbs
  const segments = pathname.split("/").filter(Boolean);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 px-4 md:px-6 backdrop-blur-xl shadow-[0_4px_20px_0_rgba(31,38,135,0.03)]">
        {/* Left Side: Mobile Menu & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-3">
          <MobileNav />

          <nav className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              href="/dashboard"
              className="hover:text-primary transition-colors font-medium flex items-center gap-1.5"
            >
              <span>{t("app.name")}</span>
            </Link>
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const isLast = index === segments.length - 1;
              const title =
                BREADCRUMB_MAP[segment] ||
                segment.charAt(0).toUpperCase() + segment.slice(1);

              return (
                <React.Fragment key={href}>
                  <ChevronRight className="h-3.5 w-3.5 opacity-40 text-primary" />
                  {isLast ? (
                    <span className="font-semibold text-foreground px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs">
                      {title}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className="hover:text-foreground transition-colors"
                    >
                      {title}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Command Search, Language, Theme Toggle, User Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut with Glass style */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-2 h-9 px-3 text-muted-foreground text-xs font-normal border-white/60 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 shadow-sm rounded-xl"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span>{t("header.search_placeholder")}</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-white/50 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Mobile search icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="md:hidden h-9 w-9 text-muted-foreground rounded-xl"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Language Toggle */}
          <LanguageToggle />

          <ThemeToggle />
          <UserNav />
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
