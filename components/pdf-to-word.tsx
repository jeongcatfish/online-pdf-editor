"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDocument } from "pdfjs-dist";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import { Download, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PDFJS_OPTIONS } from "@/lib/pdf-config";
import type { HomeCopy } from "@/lib/copy";

const PDF_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type ConversionStatus = "idle" | "extracting" | "packing" | "success" | "error";

type PdfToWordCopy = HomeCopy["conversion"];

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function formatFileSize(size: number) {
  const megabytes = size / 1024 / 1024;
  return `${megabytes.toFixed(2)} MB`;
}

type PdfTextContentItem = {
  str?: string;
  transform?: number[];
};

const LINE_BREAK_THRESHOLD = 8;

async function extractPdfText(file: File): Promise<string[][]> {
  const rawBytes = await file.arrayBuffer();
  const loadingTask = getDocument({ data: rawBytes, ...PDFJS_OPTIONS });
  const pdf = await loadingTask.promise;

  try {
    const pageTexts: string[][] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let currentLine = "";
      let lastY: number | null = null;

      const flushLine = () => {
        const trimmed = currentLine.replace(/\s+/g, " ").trim();
        if (trimmed.length > 0) {
          lines.push(trimmed);
        }
        currentLine = "";
      };

      for (const item of content.items as PdfTextContentItem[]) {
        const str = item.str?.replace(/\s+/g, " ") ?? "";
        if (!str) {
          continue;
        }

        const y = item.transform?.[5] ?? 0;
        if (lastY !== null && Math.abs(y - lastY) > LINE_BREAK_THRESHOLD && currentLine.length) {
          flushLine();
        }

        if (currentLine && !currentLine.endsWith(" ") && !str.startsWith(" ")) {
          currentLine += " ";
        }

        currentLine += str;
        lastY = y;
      }

      if (currentLine.length) {
        flushLine();
      }

      pageTexts.push(lines);
    }

    return pageTexts;
  } finally {
    pdf.destroy();
  }
}

async function buildDocxFromPages(pageTexts: string[][], copy: PdfToWordCopy) {
  const children = pageTexts.flatMap((lines, index) => {
    const heading = new Paragraph({
      heading: HeadingLevel.HEADING_4,
      pageBreakBefore: index > 0,
      text: `${copy.pageLabel} ${index + 1}`
    });

    const paragraphs =
      lines.length > 0
        ? lines.map(
            (line) =>
              new Paragraph({
                spacing: { after: 150 },
                text: line
              })
          )
        : [
            new Paragraph({
              spacing: { after: 150 },
              text: copy.emptyPageLabel
            })
          ];

    return [heading, ...paragraphs];
  });

  if (!children.length) {
    children.push(
      new Paragraph({
        text: copy.emptyPageLabel
      })
    );
  }

  const document = new Document({
    sections: [
      {
        children
      }
    ]
  });

  return Packer.toBuffer(document);
}

export function PdfToWordConverter({ copy }: { copy: PdfToWordCopy }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevUrlRef.current && prevUrlRef.current !== downloadUrl) {
      URL.revokeObjectURL(prevUrlRef.current);
    }
    prevUrlRef.current = downloadUrl;

    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [downloadUrl]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) {
        return;
      }

      const [first] = Array.from(files);

      if (!isPdfFile(first)) {
        setSelectedFile(null);
        setStatus("error");
        setErrorMessage(copy.invalidFile);
        setDownloadUrl(null);
        return;
      }

      setSelectedFile(first);
      setStatus("idle");
      setErrorMessage(null);
      setDownloadUrl(null);
    },
    [copy.invalidFile]
  );

  const convertToWord = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    setStatus("extracting");
    setErrorMessage(null);

    try {
      const pages = await extractPdfText(selectedFile);
      setStatus("packing");
      const buffer = await buildDocxFromPages(pages, copy);
      const blob = new Blob([buffer], { type: PDF_MIME_TYPE });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus("success");
    } catch (error) {
      console.error("PDF to Word conversion failed", error);
      setStatus("error");
      setErrorMessage(copy.statusError);
    }
  }, [copy, selectedFile]);

  const dropLabel = useMemo(() => {
    if (!selectedFile) {
      return copy.dropLabelDefault;
    }

    return `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`;
  }, [copy.dropLabelDefault, selectedFile]);

  const message = useMemo(() => {
    if (status === "extracting") {
      return copy.statusExtracting;
    }
    if (status === "packing") {
      return copy.statusPacking;
    }
    if (status === "success") {
      return copy.statusSuccess;
    }
    if (status === "error") {
      return errorMessage || copy.statusError;
    }
    return copy.dropHint;
  }, [status, copy, errorMessage]);

  const statusTone = status === "error" ? "text-rose-600" : status === "success" ? "text-emerald-600" : "text-slate-500";

  const buttonLabel = status === "extracting" ? copy.statusExtracting : status === "packing" ? copy.statusPacking : copy.button;

  const downloadName = useMemo(() => {
    const baseName = selectedFile ? selectedFile.name.replace(/\.pdf$/i, "") : "converted";
    return `${baseName}.docx`;
  }, [selectedFile]);

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-soft-lg">
      <div
        className={`relative flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed bg-slate-50 text-center transition ${
          isDragging ? "border-brand bg-brand/5" : "border-slate-200"
        }`}
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
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="text-base font-semibold text-slate-900">{dropLabel}</p>
        <p className="text-sm text-slate-500">{copy.dropHint}</p>
      </div>

      <p className={`mt-4 text-sm ${statusTone}`} aria-live="polite">
        {message}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          className="min-w-[180px]"
          size="lg"
          onClick={convertToWord}
          disabled={!selectedFile || status === "extracting" || status === "packing"}
        >
          {buttonLabel}
        </Button>
        {downloadUrl && (
          <Button variant="outline" size="lg" asChild className="min-w-[180px]">
            <a download={downloadName} href={downloadUrl}>
              <Download className="h-4 w-4" />
              {copy.downloadLabel}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
