"use client";

import * as React from "react";
import { useLanguage, type Language } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const LANG_LABELS: Record<Language, { flag: string; label: string; short: string }> = {
  id: { flag: "🇮🇩", label: "Bahasa Indonesia", short: "ID" },
  en: { flag: "🇬🇧", label: "English", short: "EN" },
};

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const current = LANG_LABELS[lang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 px-2.5 text-xs font-medium border-input text-muted-foreground hover:text-foreground"
          title="Switch Language"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{current.flag}</span>
          <span className="font-semibold">{current.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {(Object.entries(LANG_LABELS) as [Language, (typeof LANG_LABELS)[Language]][]).map(
          ([code, meta]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLang(code)}
              className={`gap-2 cursor-pointer text-sm ${
                lang === code ? "bg-accent font-semibold" : ""
              }`}
            >
              <span className="text-base">{meta.flag}</span>
              <span>{meta.label}</span>
              {lang === code && (
                <span className="ml-auto text-[10px] text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
