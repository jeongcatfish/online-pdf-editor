"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { useLocale } from "@/app/locale-provider";
import type { Locale } from "@/lib/locale";

type LegalSection = {
  title: string;
  points: string[];
};

type LegalCopy = {
  title: string;
  updatedLabel: string;
  updated: string;
  intro: string;
  backLabel: string;
  sections: LegalSection[];
};

const termsCopy: Record<Locale, LegalCopy> = {
  ko: {
    title: "서비스 약관",
    updatedLabel: "최종 업데이트",
    updated: "2025-01-07",
    intro: "PDF Now(이하 \"서비스\") 이용과 관련된 기본 약관입니다.",
    backLabel: "홈으로",
    sections: [
      {
        title: "서비스 제공",
        points: [
          "PDF 편집, 병합, 서명 등 기능을 브라우저에서 제공합니다.",
          "파일은 기본적으로 사용자 기기에서 처리되며 서버에 저장하지 않습니다.",
          "기능과 정책은 개선을 위해 변경될 수 있습니다."
        ]
      },
      {
        title: "이용자 의무",
        points: [
          "불법/유해 콘텐츠 업로드, 타인의 권리 침해를 금지합니다.",
          "서비스 안정성을 해치는 과도한 트래픽이나 자동화 접근을 금지합니다.",
          "관련 법령과 본 약관을 준수해야 합니다."
        ]
      },
      {
        title: "지식재산권",
        points: [
          "서비스와 브랜드에 대한 권리는 운영사에 있습니다.",
          "사용자가 업로드한 파일 및 결과물의 권리는 사용자에게 남습니다."
        ]
      },
      {
        title: "서비스 변경 및 중단",
        points: [
          "서비스는 사전 고지 후 변경될 수 있습니다.",
          "불가피한 사유가 있는 경우 즉시 중단될 수 있습니다."
        ]
      },
      {
        title: "면책 및 책임 제한",
        points: [
          "무료 제공되는 서비스로, 결과물의 정확성/완전성을 보장하지 않습니다.",
          "데이터 손실, 작업 지연 등 간접 손해에 대한 책임을 제한합니다."
        ]
      },
      {
        title: "문의",
        points: ["문의: jeongcatfish@gmail.com", "본 약관은 대한민국 법령을 따릅니다."]
      }
    ]
  },
  en: {
    title: "Terms of Service",
    updatedLabel: "Last updated",
    updated: "2025-01-07",
    intro: "These terms govern your use of PDF Now (the \"Service\").",
    backLabel: "Back to home",
    sections: [
      {
        title: "Service overview",
        points: [
          "We provide PDF editing, merging, and signing tools in the browser.",
          "Files are processed on your device and are not stored on our servers.",
          "Features and policies may change as we improve the Service."
        ]
      },
      {
        title: "User responsibilities",
        points: [
          "Do not upload illegal or harmful content or infringe third-party rights.",
          "Do not attempt abusive traffic or automated access that harms stability.",
          "Comply with applicable laws and these terms."
        ]
      },
      {
        title: "Intellectual property",
        points: [
          "The Service and brand assets are owned by the operator.",
          "You retain rights to your files and exported results."
        ]
      },
      {
        title: "Changes and interruptions",
        points: [
          "We may change the Service with prior notice when possible.",
          "The Service may be suspended immediately for unavoidable reasons."
        ]
      },
      {
        title: "Disclaimers and liability",
        points: [
          "The Service is provided free of charge without guarantees of accuracy.",
          "We limit liability for indirect damages such as data loss or delays."
        ]
      },
      {
        title: "Contact",
        points: ["Contact: jeongcatfish@gmail.com", "These terms are governed by Korean law."]
      }
    ]
  }
};

export default function TermsPage() {
  const { locale } = useLocale();
  const copy = termsCopy[locale];

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-15%] top-[-20%] h-[360px] w-[360px] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[360px] w-[360px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-70" />
      </div>

      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">PDF Now</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
              {copy.backLabel}
            </Link>
            <LocaleSwitcher className="hidden sm:flex" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft-lg sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {copy.updatedLabel} - {copy.updated}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{copy.title}</h1>
          <p className="mt-3 text-sm text-slate-600">{copy.intro}</p>
          <div className="mt-8 space-y-8">
            {copy.sections.map((section, sectionIndex) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <ul className="space-y-2 text-sm text-slate-600">
                  {section.points.map((point, pointIndex) => (
                    <li key={`${sectionIndex}-${pointIndex}`} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/80" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
