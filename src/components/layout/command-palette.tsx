"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderSync,
  CalendarDays,
  Timer,
  FileQuestion,
  AlertCircle,
  TrendingUp,
  Settings,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
  { title: "Curriculum & Topics", href: "/curriculum", icon: BookOpen, category: "Knowledge" },
  { title: "Materials Hub", href: "/materials", icon: FolderSync, category: "Knowledge" },
  { title: "Study Planner", href: "/planner", icon: CalendarDays, category: "Planning" },
  { title: "Focus Study Hub", href: "/session", icon: Timer, category: "Study" },
  { title: "Quizzes & Active Recall", href: "/quizzes", icon: FileQuestion, category: "Practice" },
  { title: "Mistake Bank", href: "/mistakes", icon: AlertCircle, category: "Practice" },
  { title: "Mastery Analytics", href: "/analytics", icon: TrendingUp, category: "Insights" },
  { title: "Settings & Preferences", href: "/settings", icon: Settings, category: "Configuration" },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const filteredItems = NAV_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden shadow-2xl border-border/80">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Command Search</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b px-3 bg-muted/30">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            placeholder="Type a command or jump to page... (e.g. 'materials', 'mistakes')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-base h-12 bg-transparent"
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No matching pages found.
            </p>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-muted text-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
