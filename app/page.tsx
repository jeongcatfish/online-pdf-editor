"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Edit3,
  FileText,
  FileUp,
  Files,
  Image,
  Layers,
  Lock,
  PenTool,
  ShieldCheck,
  Sparkles,
  UploadCloud
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePdfFiles } from "@/app/providers";

const features = [
  {
    title: "PDF 편집",
    description: "텍스트, 이미지, 링크를 브라우저에서 바로 수정하세요.",
    icon: Edit3
  },
  {
    title: "Word로 변환",
    description: "레이아웃을 유지한 채 DOCX로 빠르게 변환합니다.",
    icon: FileText
  },
  {
    title: "이미지 추출",
    description: "PDF 속 모든 이미지를 일괄 추출해 저장합니다.",
    icon: Image
  },
  {
    title: "페이지 병합",
    description: "여러 문서를 한 번에 드래그해 병합하세요.",
    icon: Layers
  },
  {
    title: "서명 추가",
    description: "전자 서명을 올려 클릭 한 번에 승인합니다.",
    icon: PenTool
  },
  {
    title: "암호 설정",
    description: "문서 암호화와 접근 권한을 간편하게 관리합니다.",
    icon: Lock
  },
  {
    title: "페이지 분할",
    description: "필요한 페이지만 추출해 새 문서를 만듭니다.",
    icon: Files
  },
  {
    title: "보안 검증",
    description: "민감한 파일도 안전하게 처리하는 보안 설계.",
    icon: ShieldCheck
  }
];

const steps = [
  {
    title: "업로드",
    description: "PDF 파일을 바로 끌어다 놓으세요.",
    icon: UploadCloud
  },
  {
    title: "편집",
    description: "필요한 도구를 선택해 즉시 편집합니다.",
    icon: Sparkles
  },
  {
    title: "완료 및 다운로드",
    description: "완성된 파일을 안전하게 저장하세요.",
    icon: FileUp
  }
];

const faqs = [
  {
    question: "구독제가 있나요?",
    answer: "구독 없이 기본 기능을 무료로 제공하며, 대용량/배치 작업은 단건 결제로 이용할 수 있습니다."
  },
  {
    question: "업로드한 파일은 안전한가요?",
    answer: "전송 구간 암호화와 자동 삭제 정책으로 파일을 안전하게 보호합니다."
  },
  {
    question: "모바일에서도 이용할 수 있나요?",
    answer: "모바일과 태블릿에서도 동일한 편집 경험을 제공합니다."
  },
  {
    question: "팀 협업이 가능한가요?",
    answer: "공유 링크와 버전 히스토리를 통해 팀원과 협업할 수 있습니다."
  }
];

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const { setFiles } = usePdfFiles();

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    const incoming = Array.from(fileList).filter(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );

    if (!incoming.length) {
      return;
    }

    const [first] = incoming;
    setFileName(first.name);
    setFileSize(`${(first.size / 1024 / 1024).toFixed(2)} MB`);
    setFileCount(incoming.length);
    setFiles(incoming);
    router.push("/editor");
  };

  const dropZoneLabel = useMemo(() => {
    if (fileName) {
      if (fileCount > 1) {
        return `${fileName} 외 ${fileCount - 1}개 · ${fileSize}`;
      }

      return `${fileName} · ${fileSize}`;
    }

    return "PDF 파일을 놓으세요";
  }, [fileName, fileSize, fileCount]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-15%] top-[-20%] h-[420px] w-[420px] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%)]" />
        <div className="absolute inset-0 bg-grid opacity-70" />
      </div>

      <header className="sticky top-4 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex w-full items-center justify-between rounded-full border border-slate-200/70 bg-white/85 px-4 py-3 shadow-soft-md backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">PDF Pro</span>
            </div>
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              <a className="transition hover:text-slate-900" href="#how">
                작동 방식
              </a>
              <a className="transition hover:text-slate-900" href="#usage">
                이용 방식
              </a>
              <a className="transition hover:text-slate-900" href="#tools">
                도구
              </a>
              <a className="transition hover:text-slate-900" href="#faq">
                자주 묻는 질문
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
              <Button size="sm" asChild>
                <Link href="/editor">
                  무료로 시작하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 pb-20 pt-10 md:pt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex w-full max-w-3xl flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand shadow-soft-md">
              <Sparkles className="h-4 w-4" />
              온라인 PDF 도구
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
              온라인에서 간단하게 PDF 작업
            </h1>
            <p className="text-lg text-slate-600">
              PDF 병합, 서명, 변환을 브라우저에서 처리하세요.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              {["구독 없음", "설치 없음", "대용량 지원"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 shadow-soft-md"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex w-full max-w-3xl flex-col gap-6"
          >
            <div className="rounded-[28px] bg-gradient-to-r from-sky-200/80 via-blue-200/70 to-cyan-200/80 p-[1px] shadow-soft-lg">
              <div
                className={cn(
                  "relative flex min-h-[240px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-[26px] border-2 border-dashed bg-white/95 p-8 text-center transition",
                  isDragging ? "border-brand/70 bg-brand/5" : "border-slate-200"
                )}
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFiles(event.dataTransfer.files);
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold text-slate-900">{dropZoneLabel}</p>
                  <p className="text-sm text-slate-500">클릭하거나 드래그 앤 드롭으로 업로드</p>
                </div>
                <Button className="mt-2" size="lg">
                  PDF 업로드하기
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "페이지 병합", desc: "페이지 순서 변경 가능" },
                { label: "서명 추가", desc: "원하는 위치에 적용" },
                { label: "변환/추출", desc: "Word 변환, 이미지 추출" }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="tools" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand">주요 기능</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">PDF를 위한 올인원 도구 세트</h2>
                <p className="mt-2 text-slate-600">
                  편집부터 보안까지, 필요한 모든 작업을 한 번에 해결하세요.
                </p>
              </div>
              <Button variant="outline" className="hidden md:inline-flex">
                더 많은 기능
              </Button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-soft-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section id="usage" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-soft-lg"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand">이용 방식</p>
                <h2 className="text-3xl font-bold text-slate-900">필요한 만큼 사용</h2>
                <p className="text-slate-600">
                  기본 도구는 무료로, 대용량/배치 작업은 단건 결제로 제공합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">이용 안내</Button>
                <Button asChild>
                  <Link href="/editor">무료로 시작하기</Link>
                </Button>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "무료 기본",
                  price: "₩0",
                  desc: "편집, 병합, 서명 등 핵심 기능"
                },
                {
                  title: "단건 결제",
                  price: "작업당 과금",
                  desc: "대용량/배치 작업이 필요한 경우"
                },
                {
                  title: "팀/대량",
                  price: "맞춤형",
                  desc: "정산·관리 기능이 필요한 팀"
                }
              ].map((plan) => (
                <div key={plan.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-sm font-semibold text-slate-500">{plan.title}</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{plan.price}</p>
                  <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-soft-lg"
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand">작동 방식</p>
              <h2 className="text-3xl font-bold text-slate-900">세 단계로 끝나는 PDF 처리</h2>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand">혜택</p>
              <h2 className="text-3xl font-bold text-slate-900">PDF Pro를 선택하는 이유</h2>
              <p className="text-base text-slate-600">
                필요한 작업을 빠르게 처리하고, 보안과 사용성을 함께 제공합니다.
              </p>
              <div className="space-y-4">
                {[
                  "브라우저 기반으로 설치 없이 즉시 사용",
                  "문서 버전 관리와 협업 히스토리 제공",
                  "자주 쓰는 작업을 빠르게 이어주는 템플릿 제공"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/editor">바로 시작</Link>
                </Button>
                <Button variant="outline">데모 보기</Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-6 -top-6 h-24 w-24 rounded-3xl bg-brand/10" />
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-3xl bg-sky-200/60" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">작업 흐름</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">문서 작업을 간단하게 정리합니다</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    { label: "업로드 대기 시간", value: "1.2s" },
                    { label: "평균 편집 완료", value: "3분" },
                    { label: "반복 사용률", value: "94%" }
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-600">{stat.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="grid gap-10 lg:grid-cols-[1fr_1.1fr]"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">자주 묻는 질문</h2>
              <p className="mt-3 text-slate-600">
                PDF Pro 사용 전 궁금한 점을 빠르게 확인하세요.
              </p>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 bg-white/90 px-6">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900">PDF Pro</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">© 2025 PDF Pro. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <select className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <option>한국어</option>
              <option>English</option>
              <option>日本語</option>
            </select>
            <a className="transition hover:text-slate-900" href="#">
              서비스 약관
            </a>
            <a className="transition hover:text-slate-900" href="#">
              개인정보처리방침
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
