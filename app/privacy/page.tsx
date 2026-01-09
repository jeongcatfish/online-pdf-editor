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

const privacyCopy: Record<Locale, LegalCopy> = {
  ko: {
    title: "개인정보처리방침",
    updatedLabel: "최종 업데이트",
    updated: "2025-01-07",
    intro: "PDF Now는 서비스 제공을 위해 최소한의 정보만 수집/이용합니다.",
    backLabel: "홈으로",
    sections: [
      {
        title: "수집하는 정보",
        points: [
          "회원가입 없이 이용 가능합니다.",
          "서비스 이용 기록(접속 일시, 브라우저/기기 정보, IP, 오류 로그)이 수집될 수 있습니다.",
          "언어 설정을 위해 쿠키를 사용합니다.",
          "업로드한 파일은 브라우저에서 처리되며 서버로 전송/저장하지 않습니다."
        ]
      },
      {
        title: "이용 목적",
        points: [
          "서비스 제공 및 품질 개선",
          "보안/오류 대응",
          "이용 통계 분석(집계/익명 처리)"
        ]
      },
      {
        title: "보관 및 파기",
        points: [
          "목적 달성 시 지체 없이 파기합니다.",
          "법령상 보관 의무가 있는 경우 해당 기간 동안 보관합니다."
        ]
      },
      {
        title: "제3자 제공 및 처리위탁",
        points: [
          "원칙적으로 외부에 제공하지 않습니다.",
          "분석 도구(Google Tag Manager 등) 사용 시 쿠키/익명 통계가 수집될 수 있습니다."
        ]
      },
      {
        title: "이용자 권리",
        points: [
          "수집 정보 열람/삭제 요청이 가능합니다.",
          "브라우저 설정에서 쿠키를 차단/삭제할 수 있습니다."
        ]
      },
      {
        title: "문의",
        points: ["문의: jeongcatfish@gmail.com", "정책 변경 시 본 페이지에 공지합니다."]
      }
    ]
  },
  en: {
    title: "Privacy Policy",
    updatedLabel: "Last updated",
    updated: "2025-01-07",
    intro: "PDF Now collects only the minimum information needed to operate the Service.",
    backLabel: "Back to home",
    sections: [
      {
        title: "Information we collect",
        points: [
          "No signup is required.",
          "Usage logs (access time, browser/device info, IP, error logs) may be collected.",
          "We use cookies to remember language preferences.",
          "Uploaded files are processed in your browser and are not transmitted or stored on our servers."
        ]
      },
      {
        title: "How we use information",
        points: ["Provide and improve the Service.", "Security and error response.", "Aggregated analytics."]
      },
      {
        title: "Retention",
        points: [
          "We retain data only as long as necessary and delete it afterward.",
          "We keep data longer when required by law."
        ]
      },
      {
        title: "Sharing and processors",
        points: [
          "We do not share personal data with third parties.",
          "Analytics tools (for example, Google Tag Manager) may set cookies and collect aggregated stats."
        ]
      },
      {
        title: "Your choices",
        points: [
          "You can request access or deletion of collected information.",
          "You can block or delete cookies in your browser settings."
        ]
      },
      {
        title: "Contact",
        points: ["Contact: jeongcatfish@gmail.com", "We will post updates on this page."]
      }
    ]
  }
};

export default function PrivacyPage() {
  const { locale } = useLocale();
  const copy = privacyCopy[locale];

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
