"use client";

import { useId } from "react";

import { useLocale } from "@/app/locale-provider";
import { LOCALES, localeLabels, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  className?: string;
};

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const selectId = useId();
  const label = locale === "ko" ? "언어" : "Language";

  return (
    <div className={cn("flex items-center", className)}>
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {localeLabels[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
