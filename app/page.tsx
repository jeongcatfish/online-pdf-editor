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
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useLocale } from "@/app/locale-provider";
import { cn } from "@/lib/utils";
import { usePdfFiles } from "@/app/providers";
import { homeCopy } from "@/lib/copy";

const featureIcons = [Edit3, FileText, Image, Layers, PenTool, Lock, Files, ShieldCheck];
const stepIcons = [UploadCloud, Sparkles, FileUp];

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const { setFiles } = usePdfFiles();
  const { locale } = useLocale();
  const copy = homeCopy[locale];

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
        return locale === "ko"
          ? `${fileName} 외 ${fileCount - 1}개 · ${fileSize}`
          : `${fileName} + ${fileCount - 1} more · ${fileSize}`;
      }

      return `${fileName} · ${fileSize}`;
    }

    return copy.upload.emptyLabel;
  }, [fileName, fileSize, fileCount, locale, copy.upload.emptyLabel]);

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
                {copy.nav.how}
              </a>
              <a className="transition hover:text-slate-900" href="#usage">
                {copy.nav.usage}
              </a>
              <a className="transition hover:text-slate-900" href="#tools">
                {copy.nav.tools}
              </a>
              <a className="transition hover:text-slate-900" href="#faq">
                {copy.nav.faq}
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <LocaleSwitcher className="shrink-0" />
              <Button size="sm" asChild>
                <Link href="/editor">
                  {copy.cta.startFree}
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
              {copy.hero.badge}
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
              {copy.hero.title}
            </h1>
            <p className="text-lg text-slate-600">{copy.hero.subtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              {copy.hero.chips.map((item) => (
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
                  <p className="text-sm text-slate-500">{copy.upload.hint}</p>
                </div>
                <Button className="mt-2" size="lg">
                  {copy.upload.button}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {copy.quickCards.map((item) => (
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
                <p className="text-sm font-semibold uppercase tracking-wide text-brand">
                  {copy.toolsSection.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">{copy.toolsSection.title}</h2>
                <p className="mt-2 text-slate-600">{copy.toolsSection.description}</p>
              </div>
              <Button variant="outline" className="hidden md:inline-flex">
                {copy.toolsSection.button}
              </Button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {copy.features.map((feature, index) => {
                const Icon = featureIcons[index];
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
                      {Icon ? <Icon className="h-5 w-5" /> : null}
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
                <p className="text-sm font-semibold uppercase tracking-wide text-brand">
                  {copy.usageSection.eyebrow}
                </p>
                <h2 className="text-3xl font-bold text-slate-900">{copy.usageSection.title}</h2>
                <p className="text-slate-600">{copy.usageSection.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">{copy.usageSection.secondaryCta}</Button>
                <Button asChild>
                  <Link href="/editor">{copy.usageSection.primaryCta}</Link>
                </Button>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {copy.usageSection.cards.map((plan) => (
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
              <p className="text-sm font-semibold uppercase tracking-wide text-brand">
                {copy.howSection.eyebrow}
              </p>
              <h2 className="text-3xl font-bold text-slate-900">{copy.howSection.title}</h2>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {copy.howSection.steps.map((step, index) => {
                const Icon = stepIcons[index];
                return (
                  <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                        {Icon ? <Icon className="h-5 w-5" /> : null}
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
              <p className="text-sm font-semibold uppercase tracking-wide text-brand">
                {copy.benefits.eyebrow}
              </p>
              <h2 className="text-3xl font-bold text-slate-900">{copy.benefits.title}</h2>
              <p className="text-base text-slate-600">{copy.benefits.description}</p>
              <div className="space-y-4">
                {copy.benefits.bullets.map((item) => (
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
                  <Link href="/editor">{copy.benefits.primaryCta}</Link>
                </Button>
                <Button variant="outline">{copy.benefits.secondaryCta}</Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-6 -top-6 h-24 w-24 rounded-3xl bg-brand/10" />
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-3xl bg-sky-200/60" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {copy.workflow.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{copy.workflow.title}</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {copy.workflow.stats.map((stat) => (
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
              <p className="text-sm font-semibold uppercase tracking-wide text-brand">{copy.faq.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">{copy.faq.title}</h2>
              <p className="mt-3 text-slate-600">{copy.faq.description}</p>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 bg-white/90 px-6">
              {copy.faq.items.map((faq) => (
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
            <a className="transition hover:text-slate-900" href="#">
              {copy.footer.terms}
            </a>
            <a className="transition hover:text-slate-900" href="#">
              {copy.footer.privacy}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
