"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { PdfToWordConverter } from "@/components/pdf-to-word";
import { useLocale } from "@/app/locale-provider";
import { homeCopy } from "@/lib/copy";

export default function ConvertPage() {
  const { locale } = useLocale();
  const copy = homeCopy[locale].conversion;
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">{copy.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">{copy.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{copy.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">{locale === "ko" ? "홈으로" : "Back home"}</Link>
            </Button>
            <LocaleSwitcher />
          </div>
        </div>
        <PdfToWordConverter copy={copy} />
      </div>
    </div>
  );
}
