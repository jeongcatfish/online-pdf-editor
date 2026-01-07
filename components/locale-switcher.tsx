"use client";

import { useLocale } from "@/app/locale-provider";
import { localeLabels } from "@/lib/locale";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  className?: string;
};

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const isKorean = locale === "ko";
  const nextLocale = isKorean ? "en" : "ko";
  const label = locale === "ko" ? "언어 전환" : "Switch language";

  return (
    <div className={cn("flex items-center", className)}>
      <button
        type="button"
        aria-label={`${label} (${localeLabels[locale]})`}
        title={label}
        onClick={() => setLocale(nextLocale)}
        className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:text-sm"
      >
        <span className="sr-only">{label}</span>
        <span
          className={cn(
            "flex h-7 items-center rounded-full px-2 text-[10px] sm:text-xs",
            isKorean ? "bg-brand/15 text-brand" : "text-slate-500"
          )}
        >
          KO
        </span>
        <span className="h-4 w-px bg-slate-200" />
        <span
          className={cn(
            "flex h-7 items-center rounded-full px-2 text-[10px] sm:text-xs",
            isKorean ? "text-slate-500" : "bg-brand/15 text-brand"
          )}
        >
          EN
        </span>
      </button>
    </div>
  );
}
