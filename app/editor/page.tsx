"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  CheckCircle2,
  Download,
  FilePlus2,
  FileUp,
  GripVertical,
  Layers,
  PenTool,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";
import { usePdfFiles } from "@/app/providers";
import { useLocale } from "@/app/locale-provider";
import { editorCopy } from "@/lib/copy";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Size = {
  width: number;
  height: number;
};

type PageInfo = {
  pageSize: Size;
  renderSize: Size;
};

type StoredFile = {
  key: string;
  file: File;
  bytes: Uint8Array;
  pageCount: number;
};

type PageItem = {
  id: string;
  fileKey: string;
  fileName: string;
  pageIndex: number;
  pageNumber: number;
  thumbUrl: string | null;
};

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const element = ref.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function createFileKey(file: File) {
  const randomId =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${file.name}-${file.size}-${file.lastModified}-${randomId}`;
}

async function renderPageThumbnail(pdf: any, pageNumber: number, targetWidth = 140) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (!context) {
    return null;
  }

  canvas.width = scaledViewport.width * dpr;
  canvas.height = scaledViewport.height * dpr;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, scaledViewport.width, scaledViewport.height);
  await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

  return canvas.toDataURL("image/png");
}

function bytesToPdfBlob(bytes: Uint8Array) {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new Blob([buffer as BlobPart], { type: "application/pdf" });
}

function calculateSignatureBox({
  placement,
  pageInfo,
  signatureScale,
  signatureRatio
}: {
  placement: { pdfX: number; pdfY: number };
  pageInfo: PageInfo;
  signatureScale: number;
  signatureRatio: number;
}) {
  const sigWidth = pageInfo.pageSize.width * signatureScale;
  const sigHeight = sigWidth * signatureRatio;

  let drawX = placement.pdfX - sigWidth / 2;
  let drawY = placement.pdfY - sigHeight / 2;

  drawX = clamp(drawX, 0, pageInfo.pageSize.width - sigWidth);
  drawY = clamp(drawY, 0, pageInfo.pageSize.height - sigHeight);

  const canvasWidth = (sigWidth / pageInfo.pageSize.width) * pageInfo.renderSize.width;
  const canvasHeight = (sigHeight / pageInfo.pageSize.height) * pageInfo.renderSize.height;
  const canvasLeft = (drawX / pageInfo.pageSize.width) * pageInfo.renderSize.width;
  const canvasTop =
    (1 - (drawY + sigHeight) / pageInfo.pageSize.height) * pageInfo.renderSize.height;

  return {
    drawX,
    drawY,
    sigWidth,
    sigHeight,
    canvasLeft,
    canvasTop,
    canvasWidth,
    canvasHeight
  };
}

function PdfCanvas({
  data,
  pageNumber = 1,
  onPageInfo,
  onCanvasClick,
  className,
  overlay,
  fit = "width",
  canvasClassName
}: {
  data: Uint8Array | null;
  pageNumber?: number;
  onPageInfo?: (info: PageInfo) => void;
  onCanvasClick?: (event: MouseEvent<HTMLCanvasElement>) => void;
  className?: string;
  overlay?: React.ReactNode;
  fit?: "width" | "height" | "contain";
  canvasClassName?: string;
}) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const onPageInfoRef = useRef<typeof onPageInfo>(null);

  useEffect(() => {
    onPageInfoRef.current = onPageInfo;
  }, [onPageInfo]);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!data || !size.width || !canvasRef.current) {
        return;
      }

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy();
        loadingTaskRef.current = null;
      }

      const dataCopy = data.slice();
      const loadingTask = getDocument({ data: dataCopy });
      loadingTaskRef.current = loadingTask;
      const pdf = await loadingTask.promise;

      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const widthScale = size.width / viewport.width;
        const heightScale = size.height ? size.height / viewport.height : widthScale;
        const scale =
          fit === "height"
            ? heightScale
            : fit === "contain"
              ? Math.min(widthScale, heightScale)
              : widthScale;
        const scaledViewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        if (!context) {
          return;
        }

        canvas.width = scaledViewport.width * dpr;
        canvas.height = scaledViewport.height * dpr;
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, scaledViewport.width, scaledViewport.height);

        const renderTask = page.render({ canvasContext: context, viewport: scaledViewport });
        renderTaskRef.current = renderTask;
        try {
          await renderTask.promise;
        } catch (err) {
          if ((err as { name?: string }).name !== "RenderingCancelledException") {
            throw err;
          }
        }

        if (!cancelled) {
          onPageInfoRef.current?.({
            pageSize: { width: viewport.width, height: viewport.height },
            renderSize: { width: scaledViewport.width, height: scaledViewport.height }
          });
        }
      } finally {
        await pdf.destroy();
        loadingTaskRef.current = null;
        renderTaskRef.current = null;
      }
    };

    void render().catch(() => {});

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy();
        loadingTaskRef.current = null;
      }
    };
  }, [data, pageNumber, size.width, size.height, fit]);

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <canvas
        ref={canvasRef}
        onClick={onCanvasClick}
        className={cn(
          "block w-full rounded-2xl border border-slate-200 bg-white shadow-soft-md",
          canvasClassName
        )}
      />
      {overlay}
    </div>
  );
}

function SignaturePad({ onChange }: { onChange: (value: string | null) => void }) {
  const { locale } = useLocale();
  const copy = editorCopy[locale];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const hasInkRef = useRef(false);

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(ratio, ratio);
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#0f172a";
  }, []);

  useEffect(() => {
    resetCanvas();
    window.addEventListener("resize", resetCanvas);
    return () => window.removeEventListener("resize", resetCanvas);
  }, [resetCanvas]);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    drawing.current = true;
    const point = getPoint(event);
    lastPoint.current = point;

    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(point.x + 0.1, point.y + 0.1);
        context.stroke();
      }
    }

    hasInkRef.current = true;
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !canvasRef.current) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context || !lastPoint.current) {
      return;
    }

    const point = getPoint(event);
    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();

    lastPoint.current = point;
    hasInkRef.current = true;
  };

  const handlePointerUp = () => {
    if (!canvasRef.current) {
      return;
    }

    drawing.current = false;
    lastPoint.current = null;
    if (hasInkRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clearPad = () => {
    resetCanvas();
    hasInkRef.current = false;
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <canvas
          ref={canvasRef}
          className="h-36 w-full touch-none rounded-xl bg-slate-50"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{copy.signaturePad.hint}</span>
        <Button type="button" variant="ghost" size="sm" onClick={clearPad}>
          {copy.signaturePad.clear}
        </Button>
      </div>
    </div>
  );
}

function MergeTool({ initialFiles = [] }: { initialFiles?: File[] }) {
  const { locale } = useLocale();
  const copy = editorCopy[locale];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [mergeUrl, setMergeUrl] = useState<string | null>(null);
  const [mergeBytes, setMergeBytes] = useState<Uint8Array | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageDragIndex, setPageDragIndex] = useState<number | null>(null);
  const [pageDragOverIndex, setPageDragOverIndex] = useState<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (mergeUrl) {
        URL.revokeObjectURL(mergeUrl);
      }
    };
  }, [mergeUrl]);

  useEffect(() => {
    if (!pages.length) {
      setPreviewPage(1);
      return;
    }

    setPreviewPage((current) => clamp(current, 1, pages.length));
  }, [pages.length]);

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  const addFileArray = useCallback(async (incomingFiles: File[]) => {
    const validFiles = incomingFiles.filter(isPdfFile);
    if (!validFiles.length) {
      setError(copy.errors.invalidFile);
      return;
    }

    setIsLoadingPages(true);
    setError(null);
    setMergeUrl(null);
    setMergeBytes(null);
    setIsPreviewOpen(false);

    for (const file of validFiles) {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const previewBytes = bytes.slice();
        const pdf = await getDocument({ data: previewBytes }).promise;
        const fileKey = createFileKey(file);
        const entry: StoredFile = {
          key: fileKey,
          file,
          bytes,
          pageCount: pdf.numPages
        };

        setFiles((prev) => [...prev, entry]);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const thumbUrl = await renderPageThumbnail(pdf, pageNumber);
          setPages((prev) => [
            ...prev,
            {
              id: `${fileKey}-${pageNumber}`,
              fileKey,
              fileName: file.name,
              pageIndex: pageNumber - 1,
              pageNumber,
              thumbUrl
            }
          ]);
        }

        await pdf.destroy();
      } catch (err) {
        setError(copy.errors.loadPdfRetry);
      }
    }

    setIsLoadingPages(false);
  }, [copy.errors.invalidFile, copy.errors.loadPdfRetry]);

  useEffect(() => {
    if (initialFiles.length && !initializedRef.current) {
      initializedRef.current = true;
      void addFileArray(initialFiles);
    }
  }, [initialFiles, addFileArray]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    void addFileArray(Array.from(fileList));
  };

  const movePage = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }

    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setMergeUrl(null);
    setMergeBytes(null);
    setIsPreviewOpen(false);
  }, []);

  const removeFile = (key: string) => {
    setFiles((prev) => prev.filter((entry) => entry.key !== key));
    setPages((prev) => prev.filter((page) => page.fileKey !== key));
    setMergeUrl(null);
    setMergeBytes(null);
    setIsPreviewOpen(false);
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id));
    setMergeUrl(null);
    setMergeBytes(null);
    setIsPreviewOpen(false);
  };

  const handleMerge = async () => {
    if (!pages.length) {
      setError(copy.errors.noMergePages);
      return;
    }

    setIsMerging(true);
    setError(null);

    try {
      const merged = await PDFDocument.create();
      const sourceMap = new Map<string, PDFDocument>();

      for (const entry of files) {
        sourceMap.set(entry.key, await PDFDocument.load(entry.bytes));
      }

      for (const page of pages) {
        const source = sourceMap.get(page.fileKey);
        if (!source) {
          continue;
        }

        const [copiedPage] = await merged.copyPages(source, [page.pageIndex]);
        merged.addPage(copiedPage);
      }

      const mergedBytes = await merged.save();
      const blob = bytesToPdfBlob(mergedBytes);
      const url = URL.createObjectURL(blob);
      setMergeBytes(mergedBytes);
      setMergeUrl(url);
      setIsPreviewOpen(true);
    } catch (err) {
      setError(copy.errors.mergeFail);
    } finally {
      setIsMerging(false);
    }
  };

  const totalLabel = useMemo(() => {
    if (!files.length) {
      return copy.merge.emptyTotal;
    }

    const fileLabel = locale === "ko" ? `${files.length}개 파일` : `${files.length} files`;
    const pageLabel = locale === "ko" ? `${pages.length}페이지` : `${pages.length} pages`;
    return `${fileLabel} · ${pageLabel}`;
  }, [files.length, pages.length, locale, copy.merge.emptyTotal]);

  const pagesCountLabel = useMemo(() => {
    return locale === "ko" ? `${pages.length} 페이지` : `${pages.length} pages`;
  }, [pages.length, locale]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{copy.merge.pickFiles}</p>
            <p className="text-xs text-slate-500">{copy.merge.pickHint}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {copy.merge.addFiles}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <div
          className={cn(
            "mt-4 flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition",
            isDragging ? "border-brand/70 bg-brand/5" : "border-slate-200"
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <FilePlus2 className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">{copy.merge.dropTitle}</p>
          <p className="text-xs text-slate-500">{copy.merge.dropHint}</p>
        </div>

        <div className="mt-5 text-sm text-slate-500">{totalLabel}</div>

        <div className="mt-4 space-y-3">
          {files.length ? (
            files.map((entry) => (
              <div
                key={entry.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{entry.file.name}</p>
                  <p className="text-xs text-slate-500">
                    {entry.pageCount}p · {(entry.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600"
                  onClick={() => removeFile(entry.key)}
                  aria-label={copy.merge.aria.removeFile}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">
              {copy.merge.emptyFiles}
            </p>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{copy.merge.pageOrder}</p>
              <p className="text-xs text-slate-500">{copy.merge.pageOrderHint}</p>
            </div>
            <span className="text-xs text-slate-500">{pagesCountLabel}</span>
          </div>

          {isLoadingPages ? <p className="mt-3 text-xs text-slate-500">{copy.merge.loadingPages}</p> : null}

          <div className="mt-4 space-y-3">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition",
                  pageDragOverIndex === index ? "border-brand/60 bg-brand/5" : "border-slate-200"
                )}
                draggable
                onDragStart={() => setPageDragIndex(index)}
                onDragEnd={() => {
                  setPageDragIndex(null);
                  setPageDragOverIndex(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDragEnter={() => {
                  if (pageDragIndex !== null && pageDragIndex !== index) {
                    setPageDragOverIndex(index);
                  }
                }}
                onDragLeave={() => {
                  if (pageDragOverIndex === index) {
                    setPageDragOverIndex(null);
                  }
                }}
                onDrop={() => {
                  if (pageDragIndex === null) {
                    return;
                  }

                  movePage(pageDragIndex, index);
                  setPageDragIndex(null);
                  setPageDragOverIndex(null);
                }}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <div className="flex h-24 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {page.thumbUrl ? (
                      <img src={page.thumbUrl} alt={`${page.fileName} ${page.pageNumber}`} />
                    ) : (
                      <span className="text-[10px] text-slate-400">{page.pageNumber}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{page.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {locale === "ko" ? `페이지 ${page.pageNumber}` : `Page ${page.pageNumber}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600 disabled:opacity-40"
                    onClick={() => movePage(index, Math.max(index - 1, 0))}
                    aria-label={copy.merge.aria.moveUp}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600 disabled:opacity-40"
                    onClick={() => movePage(index, Math.min(index + 1, pages.length - 1))}
                    aria-label={copy.merge.aria.moveDown}
                    disabled={index === pages.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600"
                    onClick={() => removePage(page.id)}
                    aria-label={copy.merge.aria.removePage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!pages.length && !isLoadingPages ? (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">
              {copy.merge.emptyPages}
            </p>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleMerge} disabled={isMerging || isLoadingPages || !pages.length}>
            {isMerging ? copy.merge.previewLoading : copy.merge.previewIdle}
          </Button>
          {mergeUrl ? (
            <Button asChild variant="outline">
              <a href={mergeUrl} download="merged.pdf">
                {copy.merge.downloadMerged}
                <Download className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {isPreviewOpen && mergeBytes ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-soft-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{copy.merge.previewTitle}</p>
                <p className="text-xs text-slate-500">{copy.merge.previewHint}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewPage((current) => Math.max(current - 1, 1))}
                  disabled={previewPage <= 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span>
                  {previewPage} / {pages.length}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewPage((current) => Math.min(current + 1, pages.length))}
                  disabled={previewPage >= pages.length}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                  {copy.merge.close}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-50 p-6">
              <div className="flex h-[70vh] items-center justify-center md:h-[72vh]">
                <div className="h-full w-full max-w-3xl">
                  <PdfCanvas
                  data={mergeBytes}
                  pageNumber={previewPage}
                  fit="contain"
                  className="h-full"
                  canvasClassName="mx-auto"
                />
              </div>
            </div>
          </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SignTool({ initialFile }: { initialFile?: File | null }) {
  const { locale } = useLocale();
  const copy = editorCopy[locale];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureRatio, setSignatureRatio] = useState(0.3);
  const [signatureScale, setSignatureScale] = useState(0.25);
  const [placementByPage, setPlacementByPage] = useState<
    Record<number, { pdfX: number; pdfY: number } | null>
  >({});
  const [isSigning, setIsSigning] = useState(false);
  const [history, setHistory] = useState<Uint8Array[]>([]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [outputUrl]);

  useEffect(() => {
    if (initialFile && !pdfBytes) {
      void handlePdfSelect(initialFile);
    }
  }, [initialFile, pdfBytes]);

  useEffect(() => {
    if (!pageCount) {
      return;
    }

    setActivePage((current) => clamp(current, 1, pageCount));
  }, [pageCount]);

  useEffect(() => {
    if (!activePage) {
      return;
    }

    setOutputUrl(null);
    setPageInfo(null);
  }, [activePage]);

  useEffect(() => {
    if (!signatureDataUrl) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      if (image.width > 0 && image.height > 0) {
        setSignatureRatio(image.height / image.width);
      }
    };
    image.src = signatureDataUrl;
  }, [signatureDataUrl]);

  const currentPlacement = placementByPage[activePage] ?? null;

  const signatureBox = useMemo(() => {
    if (!currentPlacement || !pageInfo) {
      return null;
    }

    return calculateSignatureBox({
      placement: currentPlacement,
      pageInfo,
      signatureScale,
      signatureRatio
    });
  }, [currentPlacement, pageInfo, signatureScale, signatureRatio]);

  const canApplySignature = Boolean(pdfBytes && signatureDataUrl && signatureBox && pageInfo);
  const canUndoSignature = history.length > 0;

  const handlePdfSelect = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!isPdfFile(file)) {
      setError(copy.errors.invalidFile);
      return;
    }

    setIsLoadingPages(true);

    const bytes = new Uint8Array(await file.arrayBuffer());
    setPdfBytes(bytes);
    setPdfName(file.name);
    setOutputUrl(null);
    setPlacementByPage({});
    setActivePage(1);
    setPageCount(0);
    setHistory([]);
    setError(null);

    try {
      const previewBytes = bytes.slice();
      const pdf = await getDocument({ data: previewBytes }).promise;
      setPageCount(pdf.numPages);
      setActivePage(1);
      await pdf.destroy();
    } catch (err) {
      setError(copy.errors.loadPdf);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!pageInfo) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pdfX = (x / pageInfo.renderSize.width) * pageInfo.pageSize.width;
    const pdfY =
      pageInfo.pageSize.height -
      (y / pageInfo.renderSize.height) * pageInfo.pageSize.height;

    setPlacementByPage((prev) => ({ ...prev, [activePage]: { pdfX, pdfY } }));
    setOutputUrl(null);
    setError(null);
  };

  const handleApplySignature = async () => {
    if (!pdfBytes || !signatureDataUrl || !signatureBox || !pageInfo) {
      setError(copy.errors.signMissing);
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      const snapshot = pdfBytes.slice();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[activePage - 1];
      const signatureImage = await pdfDoc.embedPng(signatureDataUrl);

      page.drawImage(signatureImage, {
        x: signatureBox.drawX,
        y: signatureBox.drawY,
        width: signatureBox.sigWidth,
        height: signatureBox.sigHeight
      });

      const updatedBytes = await pdfDoc.save();
      const blob = bytesToPdfBlob(updatedBytes);
      const url = URL.createObjectURL(blob);

      setHistory((prev) => [...prev, snapshot]);
      setPdfBytes(updatedBytes);
      setOutputUrl(url);
    } catch (err) {
      setError(copy.errors.signFail);
    } finally {
      setIsSigning(false);
    }
  };

  const handleUndoSignature = () => {
    if (!history.length) {
      return;
    }

    setHistory((prev) => {
      const next = [...prev];
      const previous = next.pop();
      if (previous) {
        const url = URL.createObjectURL(bytesToPdfBlob(previous));
        setPdfBytes(previous);
        setOutputUrl(next.length ? url : null);
        setError(null);
      }
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] landscape-stack">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{copy.sign.uploadTitle}</p>
            <p className="text-xs text-slate-500">{copy.sign.uploadHint}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {copy.sign.selectPdf}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(event) => {
              handlePdfSelect(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          {pdfName
            ? locale === "ko"
              ? `선택된 파일: ${pdfName}`
              : `Selected file: ${pdfName}`
            : copy.sign.emptyPdf}
        </div>

        {pageCount > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            <span>{copy.sign.pageSelect}</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActivePage((current) => Math.max(current - 1, 1))}
                disabled={activePage <= 1 || isLoadingPages}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs">
                {activePage} / {pageCount}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActivePage((current) => Math.min(current + 1, pageCount))}
                disabled={activePage >= pageCount || isLoadingPages}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <select
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
                value={activePage}
                onChange={(event) => setActivePage(Number(event.target.value))}
                disabled={isLoadingPages}
              >
                {Array.from({ length: pageCount }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {locale === "ko" ? `${index + 1} 페이지` : `Page ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {isLoadingPages ? <p className="mt-3 text-xs text-slate-500">{copy.sign.loadingPages}</p> : null}

        <div className="mt-5">
          {pdfBytes ? (
            <PdfCanvas
              data={pdfBytes}
              pageNumber={activePage}
              onPageInfo={(info) => setPageInfo(info)}
              onCanvasClick={handleCanvasClick}
              overlay={
                <>
                  {signatureBox ? (
                    <div
                      className="pointer-events-none absolute rounded-xl border-2 border-dashed border-brand"
                      style={{
                        left: signatureBox.canvasLeft,
                        top: signatureBox.canvasTop,
                        width: signatureBox.canvasWidth,
                        height: signatureBox.canvasHeight
                      }}
                    />
                  ) : null}
                  {signatureDataUrl && !currentPlacement ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-soft-md">
                        {copy.sign.previewHint}
                      </div>
                    </div>
                  ) : null}
                </>
              }
            />
          ) : (
            <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
              <FileUp className="h-8 w-8 text-slate-400" />
              {copy.sign.emptyPreview}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start landscape-unset">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft-md">
          <p className="text-sm font-semibold text-slate-900">{copy.sign.stepsTitle}</p>
          <p className="mt-2 text-xs text-slate-500">{copy.sign.stepsHint}</p>
          <div className="mt-4 space-y-3 text-xs text-slate-600">
            {[
              { label: copy.sign.steps[0], done: Boolean(pdfBytes) },
              { label: copy.sign.steps[1], done: Boolean(signatureDataUrl) },
              { label: copy.sign.steps[2], done: Boolean(currentPlacement) }
            ].map((step, index) => (
              <div
                key={step.label}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-2",
                  step.done ? "border-brand/40 bg-brand/5 text-slate-900" : "border-slate-200"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-slate-500 shadow-soft-md">
                  {step.done ? <CheckCircle2 className="h-4 w-4 text-brand" /> : index + 1}
                </div>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft-md">
          <p className="text-sm font-semibold text-slate-900">{copy.sign.createTitle}</p>
          <p className="mt-2 text-xs text-slate-500">{copy.sign.createHint}</p>
          <div className="mt-4">
            <SignaturePad onChange={setSignatureDataUrl} />
          </div>
          {signatureDataUrl ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <img src={signatureDataUrl} alt={copy.signaturePad.previewAlt} className="h-10 w-auto" />
              <span className="text-xs text-slate-500">{copy.signaturePad.saved}</span>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft-md">
          <p className="text-sm font-semibold text-slate-900">{copy.sign.settingsTitle}</p>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {copy.sign.sizeLabel}
              </p>
              <input
                type="range"
                min={0.15}
                max={0.45}
                step={0.01}
                value={signatureScale}
                onChange={(event) => setSignatureScale(Number(event.target.value))}
                className="mt-2 w-full accent-brand"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {copy.sign.positionLabel}
              </p>
              <p className="mt-2 text-sm text-slate-500">{copy.sign.positionHint}</p>
            </div>
          </div>

          {!canApplySignature && !error ? (
            <p className="mt-4 text-xs text-slate-500">
              {copy.sign.guidance}
            </p>
          ) : null}
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={handleApplySignature} disabled={isSigning || !canApplySignature}>
              {isSigning ? copy.sign.applyLoading : copy.sign.applyIdle}
              <PenTool className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUndoSignature}
              disabled={!canUndoSignature || isSigning}
            >
              {copy.sign.undo}
            </Button>
            {outputUrl ? (
              <Button asChild variant="outline">
                <a
                  href={outputUrl}
                  download={pdfName ? `${pdfName.replace(/\.pdf$/i, "")}-signed.pdf` : "signed.pdf"}
                >
                  {copy.sign.downloadSigned}
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const { files: queuedFiles, clearFiles } = usePdfFiles();
  const [prefillFiles, setPrefillFiles] = useState<File[]>([]);
  const [activeTool, setActiveTool] = useState<"merge" | "sign">("merge");
  const didSetInitialTool = useRef(false);
  const { locale } = useLocale();
  const copy = editorCopy[locale];

  useEffect(() => {
    if (queuedFiles.length) {
      setPrefillFiles(queuedFiles);
      clearFiles();
    }
  }, [queuedFiles, clearFiles]);

  useEffect(() => {
    if (!didSetInitialTool.current && prefillFiles.length) {
      setActiveTool("merge");
      didSetInitialTool.current = true;
    }
  }, [prefillFiles.length]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute left-[-20%] top-[-15%] h-[360px] w-[360px] rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[360px] w-[360px] rounded-full bg-sky-200/40 blur-3xl" />

      <header className="relative z-10 border-b border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {copy.header.back}
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Layers className="h-4 w-4 text-brand" />
            {copy.header.title}
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher className="shrink-0" />
            <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
              {copy.header.subtitle}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">{copy.hero.eyebrow}</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {copy.hero.title}
          </h1>
          <p className="text-base text-slate-600">{copy.hero.description}</p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 landscape-stack">
          {[
            { id: "merge", ...copy.tools.merge },
            { id: "sign", ...copy.tools.sign }
          ].map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={cn(
                "rounded-2xl border px-5 py-4 text-left transition",
                activeTool === tool.id
                  ? "border-brand bg-white shadow-soft-md"
                  : "border-slate-200 bg-white/70 hover:border-brand/50"
              )}
              onClick={() => setActiveTool(tool.id as "merge" | "sign")}
            >
              <p className="text-sm font-semibold text-slate-900">{tool.label}</p>
              <p className="text-xs text-slate-500">{tool.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {activeTool === "merge" ? (
            <MergeTool initialFiles={prefillFiles} />
          ) : (
            <SignTool initialFile={prefillFiles[0] ?? null} />
          )}
        </div>
      </main>
    </div>
  );
}
