"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, PointerEvent, UIEvent } from "react";
import { motion } from "framer-motion";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import { getDocument } from "pdfjs-dist";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FilePlus2,
  FileUp,
  GripVertical,
  Layers,
  PenTool,
  Type,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";
import { usePdfFiles } from "@/app/providers";
import { useLocale } from "@/app/locale-provider";
import { editorCopy } from "@/lib/copy";
import type { Locale } from "@/lib/locale";
import { PDFJS_OPTIONS } from "@/lib/pdf-config";

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

type TextAlign = "left" | "center" | "right";

type PdfFontName = "Helvetica" | "TimesRoman" | "Courier";

type TextOverlay = {
  id: string;
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
  font: PdfFontName;
  size: number;
  color: string;
  align: TextAlign;
};

type OverlayTool = "signature" | "text";

const TEXT_LINE_HEIGHT = 1.2;
const DEFAULT_TEXT_WIDTH_RATIO = 0.35;
const DEFAULT_TEXT_SIZE = 24;
const TEXT_BOX_HORIZONTAL_PADDING_RATIO = 0.35;
const TEXT_BOX_VERTICAL_PADDING_RATIO = 0.2;
const TEXT_BOX_SIZE_BUFFER_RATIO = 0.08;

type TextDragState = {
  id: string;
  page: number;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
  pointerId: number;
};

const FONT_OPTIONS: { id: PdfFontName; label: string }[] = [
  { id: "Helvetica", label: "Helvetica" },
  { id: "TimesRoman", label: "Times Roman" },
  { id: "Courier", label: "Courier" }
];

const FONT_FAMILY_BY_ID: Record<PdfFontName, string> = {
  Helvetica: '"Helvetica Neue", Arial, sans-serif',
  TimesRoman: '"Times New Roman", Times, serif',
  Courier: '"Courier New", Courier, monospace'
};

function useElementSize<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) {
      return;
    }

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
  }, [element]);

  return { ref, size, element };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

const TEXT_PAGE_SIZE = { width: 595.28, height: 841.89 };
const TEXT_PAGE_MARGIN = 40;
const TEXT_FONT_SIZE = 12;
const TEXT_LINE_HEIGHT_PDF = 16;
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"];
const TEXT_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".log"];

class UnsupportedFileError extends Error {
  constructor(public file: File) {
    super("Unsupported file");
  }
}

function hasExtension(file: File, extensions: string[]) {
  const lowerName = file.name.toLowerCase();
  return extensions.some((ext) => lowerName.endsWith(ext));
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || hasExtension(file, IMAGE_EXTENSIONS);
}

function isTextFile(file: File) {
  return file.type.startsWith("text/") || hasExtension(file, TEXT_EXTENSIONS);
}

async function convertFileToPdf(file: File) {
  if (isPdfFile(file)) {
    return new Uint8Array(await file.arrayBuffer());
  }

  if (isImageFile(file)) {
    return convertImageFileToPdf(file);
  }

  if (isTextFile(file)) {
    return convertTextFileToPdf(file);
  }

  throw new UnsupportedFileError(file);
}

async function convertImageFileToPdf(file: File) {
  const image = await loadImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width || 1;
  canvas.height = image.naturalHeight || image.height || 1;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas not available");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Image conversion failed"));
      }
    }, "image/png");
  });

  const pngBytes = new Uint8Array(await blob.arrayBuffer());
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(pngBytes);
  const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: pngImage.width,
    height: pngImage.height
  });
  return pdfDoc.save();
}

async function loadImageElement(file: File) {
  const url = URL.createObjectURL(file);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load image"));
    };
    image.src = url;
  });
}

async function convertTextFileToPdf(file: File) {
  const content = await file.text();
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pageSize = TEXT_PAGE_SIZE;
  let page = pdfDoc.addPage([pageSize.width, pageSize.height]);
  let cursorY = pageSize.height - TEXT_PAGE_MARGIN;
  const maxWidth = pageSize.width - TEXT_PAGE_MARGIN * 2;

  const lines = content.split(/\r\n|\r|\n/);
  for (const rawLine of lines) {
    const segments = wrapTextLine(rawLine, font, TEXT_FONT_SIZE, maxWidth);
    for (const segment of segments) {
      if (cursorY - TEXT_LINE_HEIGHT_PDF < TEXT_PAGE_MARGIN) {
        page = pdfDoc.addPage([pageSize.width, pageSize.height]);
        cursorY = pageSize.height - TEXT_PAGE_MARGIN;
      }
      if (segment.trim()) {
        page.drawText(segment, {
          x: TEXT_PAGE_MARGIN,
          y: cursorY,
          size: TEXT_FONT_SIZE,
          font,
          lineHeight: TEXT_LINE_HEIGHT_PDF
        });
      }
      cursorY -= TEXT_LINE_HEIGHT_PDF;
    }
  }

  return pdfDoc.save();
}

function wrapTextLine(line: string, font: PDFFont, fontSize: number, maxWidth: number) {
  if (!line.trim()) {
    return [""];
  }

  const tokens = line.split(" ");
  const segments: string[] = [];
  let current = "";

  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
      segments.push(current);
      current = token;
    } else {
      current = candidate;
    }
  }

  if (current) {
    segments.push(current);
  }

  return segments;
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

function createOverlayId() {
  const randomId =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `overlay-${randomId}`;
}

function getTextLines(text: string) {
  return text.split("\n");
}

function getTextLineHeight(size: number) {
  return size * TEXT_LINE_HEIGHT;
}

function getTextHeight(size: number, text: string) {
  return getTextLines(text).length * getTextLineHeight(size);
}

function getTextBoxHorizontalPadding(size: number) {
  return Math.max(2, size * TEXT_BOX_HORIZONTAL_PADDING_RATIO);
}

function getTextBoxVerticalPadding(size: number) {
  return Math.max(2, size * TEXT_BOX_VERTICAL_PADDING_RATIO);
}

function getTextBoxSizeBuffer(size: number) {
  return Math.max(2, size * TEXT_BOX_SIZE_BUFFER_RATIO);
}

function getTextBoxHeight(size: number, text: string) {
  return getTextHeight(size, text) + getTextBoxVerticalPadding(size) * 2 + getTextBoxSizeBuffer(size);
}

function hexToRgb(color: string) {
  const normalized = color.replace("#", "");
  if (normalized.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  return { r, g, b };
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

// Overlay coordinates are stored in PDF units with a top-left origin.
function canvasPointToPdfTopLeft(x: number, y: number, pageInfo: PageInfo) {
  return {
    x: (x / pageInfo.renderSize.width) * pageInfo.pageSize.width,
    y: (y / pageInfo.renderSize.height) * pageInfo.pageSize.height
  };
}

function pdfTopLeftToCanvasPoint(x: number, y: number, pageInfo: PageInfo) {
  return {
    x: (x / pageInfo.pageSize.width) * pageInfo.renderSize.width,
    y: (y / pageInfo.pageSize.height) * pageInfo.renderSize.height
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
      const loadingTask = getDocument({ data: dataCopy, ...PDFJS_OPTIONS });
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
  const [pagePreviewItem, setPagePreviewItem] = useState<PageItem | null>(null);
  const { ref: previewScrollRef, size: previewScrollSize, element: previewScrollElement } =
    useElementSize<HTMLDivElement>();
  const previewScrollRafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unsupportedFile, setUnsupportedFile] = useState<File | null>(null);
  const [pageDragIndex, setPageDragIndex] = useState<number | null>(null);
  const [pageDragOverIndex, setPageDragOverIndex] = useState<number | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const pageDragIndexRef = useRef<number | null>(null);
  const pageDragOverIndexRef = useRef<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragOffsetRef = useRef(0);
  const dragStartClientYRef = useRef<number | null>(null);
  const dragRafRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (mergeUrl) {
        URL.revokeObjectURL(mergeUrl);
      }
    };
  }, [mergeUrl]);

  useEffect(() => {
    return () => {
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
      }
    };
  }, []);

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

    setPreviewPage(1);
    if (previewScrollElement) {
      previewScrollElement.scrollTop = 0;
    }
  }, [isPreviewOpen, previewScrollElement]);

  useEffect(() => {
    return () => {
      if (previewScrollRafRef.current) {
        cancelAnimationFrame(previewScrollRafRef.current);
        previewScrollRafRef.current = null;
      }
    };
  }, []);

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
    if (!incomingFiles.length) {
      return;
    }

    setIsLoadingPages(true);
    setError(null);
    setMergeUrl(null);
    setMergeBytes(null);
    setIsPreviewOpen(false);
    setUnsupportedFile(null);

    for (const file of incomingFiles) {
      let bytes: Uint8Array;
      try {
        bytes = await convertFileToPdf(file);
      } catch (err) {
        if (err instanceof UnsupportedFileError) {
          setUnsupportedFile(err.file);
        }
        setError(copy.errors.invalidFile);
        continue;
      }

      try {
        const previewBytes = bytes.slice();
        const pdf = await getDocument({ data: previewBytes, ...PDFJS_OPTIONS }).promise;
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
        if (err instanceof UnsupportedFileError) {
          setUnsupportedFile(err.file);
          setError(copy.errors.invalidFile);
          continue;
        }
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

  const handlePointerDragStart = useCallback(
    (event: PointerEvent<HTMLElement>, index: number) => {
      if (event.pointerType === "mouse") {
        return;
      }

      event.preventDefault();
      dragPointerIdRef.current = event.pointerId;
      pageDragIndexRef.current = index;
      pageDragOverIndexRef.current = index;
      setPageDragIndex(index);
      setPageDragOverIndex(index);
      dragStartClientYRef.current = event.clientY;
      dragOffsetRef.current = 0;
      setDragOffsetY(0);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    []
  );

  const handlePointerDragMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const startY = dragStartClientYRef.current ?? event.clientY;
    const nextOffset = event.clientY - startY;
    dragOffsetRef.current = nextOffset;
    if (dragRafRef.current === null) {
      dragRafRef.current = requestAnimationFrame(() => {
        dragRafRef.current = null;
        setDragOffsetY(dragOffsetRef.current);
      });
    }
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const row = element?.closest<HTMLElement>("[data-page-row]");
    if (!row) {
      if (pageDragOverIndexRef.current !== null) {
        pageDragOverIndexRef.current = null;
        setPageDragOverIndex(null);
      }
      return;
    }

    const nextIndex = Number(row.dataset.pageRow);
    if (Number.isNaN(nextIndex)) {
      return;
    }

    if (nextIndex !== pageDragOverIndexRef.current) {
      pageDragOverIndexRef.current = nextIndex;
      setPageDragOverIndex(nextIndex);
    }
  }, []);

  const handlePointerDragEnd = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (dragPointerIdRef.current !== event.pointerId) {
        return;
      }

      event.preventDefault();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const fromIndex = pageDragIndexRef.current;
      const toIndex = pageDragOverIndexRef.current;

      dragPointerIdRef.current = null;
      pageDragIndexRef.current = null;
      pageDragOverIndexRef.current = null;
      setPageDragIndex(null);
      setPageDragOverIndex(null);
      dragStartClientYRef.current = null;
      dragOffsetRef.current = 0;
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      setDragOffsetY(0);

      if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
        movePage(fromIndex, toIndex);
      }
    },
    [movePage]
  );

  const removeFile = (key: string) => {
    setFiles((prev) => prev.filter((entry) => entry.key !== key));
    setPages((prev) => prev.filter((page) => page.fileKey !== key));
    setMergeUrl(null);
    setMergeBytes(null);
    setIsPreviewOpen(false);
    setPagePreviewItem((current) => (current?.fileKey === key ? null : current));
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id));
    setMergeUrl(null);
    setMergeBytes(null);
    setIsPreviewOpen(false);
    setPagePreviewItem((current) => (current?.id === id ? null : current));
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

  const pagePreviewSource = useMemo(() => {
    if (!pagePreviewItem) {
      return null;
    }

    return files.find((entry) => entry.key === pagePreviewItem.fileKey) ?? null;
  }, [files, pagePreviewItem]);

  useEffect(() => {
    if (isPreviewOpen) {
      setPagePreviewItem(null);
    }
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!pagePreviewItem) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPagePreviewItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pagePreviewItem]);

  useEffect(() => {
    if (pagePreviewItem && !pagePreviewSource) {
      setPagePreviewItem(null);
    }
  }, [pagePreviewItem, pagePreviewSource]);

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

  const previewItemHeight = useMemo(() => {
    return previewScrollSize.height || 0;
  }, [previewScrollSize.height]);

  const handlePreviewScroll = useCallback(
    (_event: UIEvent<HTMLDivElement>) => {
      if (!pages.length) {
        return;
      }

      if (previewScrollRafRef.current) {
        return;
      }

      previewScrollRafRef.current = requestAnimationFrame(() => {
        previewScrollRafRef.current = null;
        const container = previewScrollElement;
        if (!container) {
          return;
        }

        const midpoint = container.scrollTop + container.clientHeight / 2;
        const items = Array.from(
          container.querySelectorAll<HTMLElement>("[data-preview-page]")
        );
        for (const item of items) {
          if (midpoint <= item.offsetTop + item.offsetHeight) {
            const page = Number(item.dataset.previewPage);
            if (Number.isFinite(page)) {
              setPreviewPage(page);
            }
            return;
          }
        }

        setPreviewPage(pages.length);
      });
    },
    [pages.length, previewScrollElement]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft-md sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 break-words">{entry.file.name}</p>
                  <p className="text-xs text-slate-500 break-words">
                    {entry.pageCount}p · {(entry.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  className="self-start rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600 sm:self-auto"
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{copy.merge.pageOrder}</p>
              <p className="text-xs text-slate-500">{copy.merge.pageOrderHint}</p>
            </div>
            <span className="text-xs text-slate-500">{pagesCountLabel}</span>
          </div>

          {isLoadingPages ? <p className="mt-3 text-xs text-slate-500">{copy.merge.loadingPages}</p> : null}

          <div className="mt-4 space-y-3">
            {pages.map((page, index) => {
              const previewLabel =
                locale === "ko"
                  ? `${copy.merge.aria.previewPage} (${page.fileName} ${page.pageNumber}페이지)`
                  : `${copy.merge.aria.previewPage} (${page.fileName} page ${page.pageNumber})`;
              const isPointerDragging =
                dragPointerIdRef.current !== null && pageDragIndex === index;

              return (
                <motion.div
                  key={page.id}
                  data-page-row={index}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between",
                    pageDragOverIndex === index ? "border-brand/60 bg-brand/5" : "border-slate-200",
                    isPointerDragging &&
                      "pointer-events-none relative z-20 bg-white shadow-soft-md ring-2 ring-brand/40 transition-none"
                  )}
                  style={isPointerDragging ? { y: dragOffsetY } : undefined}
                  layout
                  transition={{ layout: { type: "spring", stiffness: 520, damping: 42, mass: 0.7 } }}
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
                  <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                    <button
                      type="button"
                      className="touch-none cursor-grab rounded-full p-1 text-slate-400 transition hover:bg-white hover:text-slate-600 active:cursor-grabbing"
                      aria-label={copy.merge.pageOrderHint}
                      title={copy.merge.pageOrderHint}
                      onPointerDown={(event) => handlePointerDragStart(event, index)}
                      onPointerMove={handlePointerDragMove}
                      onPointerUp={handlePointerDragEnd}
                      onPointerCancel={handlePointerDragEnd}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="flex h-20 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-24 sm:w-20"
                      onClick={() => setPagePreviewItem(page)}
                      aria-label={previewLabel}
                      title={previewLabel}
                    >
                      {page.thumbUrl ? (
                        <img
                          src={page.thumbUrl}
                          alt={`${page.fileName} ${page.pageNumber}`}
                          draggable={false}
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">{page.pageNumber}</span>
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 break-words">{page.fileName}</p>
                      <p className="text-xs text-slate-500 break-words">
                        {locale === "ko" ? `페이지 ${page.pageNumber}` : `Page ${page.pageNumber}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 self-start sm:self-auto">
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
                </motion.div>
              );
            })}
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

      {pagePreviewItem && pagePreviewSource ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setPagePreviewItem(null)}
        >
          <div
            className="flex h-[85vh] w-[92vw] max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-soft-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{copy.merge.pagePreviewTitle}</p>
                <p className="text-xs text-slate-500">
                  {locale === "ko"
                    ? `${pagePreviewItem.fileName} · ${pagePreviewItem.pageNumber}페이지`
                    : `${pagePreviewItem.fileName} · Page ${pagePreviewItem.pageNumber}`}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setPagePreviewItem(null)}>
                {copy.merge.close}
              </Button>
            </div>
            <div className="flex-1 bg-slate-50 p-4 sm:p-6">
              <div className="h-full w-full">
                <PdfCanvas
                  data={pagePreviewSource.bytes}
                  pageNumber={pagePreviewItem.pageNumber}
                  fit="contain"
                  className="h-full"
                  canvasClassName="mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  {previewPage} / {pages.length}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                  {copy.merge.close}
                </Button>
              </div>
            </div>
            <div
              ref={previewScrollRef}
              className="flex-1 overflow-y-auto bg-slate-50 overscroll-contain"
              onScroll={handlePreviewScroll}
            >
              <div className="mx-auto flex w-full max-w-3xl flex-col">
                {Array.from({ length: pages.length }, (_, index) => (
                  <div
                    key={index + 1}
                    data-preview-page={index + 1}
                    className="flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6"
                    style={previewItemHeight ? { height: previewItemHeight } : undefined}
                  >
                    <div className="h-full w-full">
                      <PdfCanvas
                        data={mergeBytes}
                        pageNumber={index + 1}
                        fit="contain"
                        className="h-full"
                        canvasClassName="mx-auto"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {unsupportedFile ? (
        <UnsupportedFileModal
          file={unsupportedFile}
          copy={copy.unsupportedFile}
          onClose={() => setUnsupportedFile(null)}
        />
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
  const [unsupportedFile, setUnsupportedFile] = useState<File | null>(null);
  const [textByPage, setTextByPage] = useState<Record<number, TextOverlay[]>>({});
  const [activeOverlayTool, setActiveOverlayTool] = useState<OverlayTool>("signature");
  const [selectedText, setSelectedText] = useState<{ id: string; page: number } | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; page: number } | null>(null);
  const [hiddenTextGuides, setHiddenTextGuides] = useState<Record<string, boolean>>({});
  const [textDefaults, setTextDefaults] = useState({
    font: "Helvetica" as PdfFontName,
    size: DEFAULT_TEXT_SIZE,
    color: "#0f172a",
    align: "left" as TextAlign
  });
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const textMeasureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStateRef = useRef<TextDragState | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const textEditRef = useRef<HTMLTextAreaElement | null>(null);

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
    setSelectedText(null);
    setEditingText(null);
    setDraggingTextId(null);
    dragStateRef.current = null;
  }, [activePage]);

  useEffect(() => {
    if (!editingText || editingText.page !== activePage) {
      return;
    }

    const raf = requestAnimationFrame(() => {
      textEditRef.current?.focus();
      textEditRef.current?.select();
    });

    return () => cancelAnimationFrame(raf);
  }, [editingText, activePage]);

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

  const activeTextItems = textByPage[activePage] ?? [];
  const selectedTextItem =
    selectedText && selectedText.page === activePage
      ? activeTextItems.find((item) => item.id === selectedText.id) ?? null
      : null;
  const overlayScale = pageInfo ? pageInfo.renderSize.width / pageInfo.pageSize.width : 1;
  const canApplySignature = Boolean(signatureDataUrl && signatureBox && pageInfo);
  const hasAnyTextOverlays = Object.values(textByPage).some((items) => items.length > 0);
  const canApplyEdits = Boolean(
    pdfBytes && (canApplySignature || hasAnyTextOverlays)
  );
  const canUndoSignature = history.length > 0;
  const canDownload = Boolean(outputUrl || canApplyEdits);
  const downloadName = pdfName ? `${pdfName.replace(/\.pdf$/i, "")}-edited.pdf` : "edited.pdf";
  const activeTextStyle = selectedTextItem
    ? {
        font: selectedTextItem.font,
        size: selectedTextItem.size,
        color: selectedTextItem.color,
        align: selectedTextItem.align
      }
    : textDefaults;
  const showTextOverlayPanel = Boolean(
    pageInfo && (activeOverlayTool === "text" || selectedTextItem)
  );

  const measureTextWidthPx = useCallback(
    (text: string, font: PdfFontName, fontSizePx: number) => {
      const fallbackWidth = Math.max(
        fontSizePx,
        fontSizePx * 0.6 * Math.max(1, text.length)
      );
      if (typeof document === "undefined") {
        return fallbackWidth;
      }

      const canvas = textMeasureCanvasRef.current ?? document.createElement("canvas");
      textMeasureCanvasRef.current = canvas;
      const context = canvas.getContext("2d");
      if (!context) {
        return fallbackWidth;
      }

      context.font = `${fontSizePx}px ${FONT_FAMILY_BY_ID[font]}`;
      const lines = getTextLines(text);
      const maxWidth = Math.max(
        ...lines.map((line) => context.measureText(line || " ").width),
        fontSizePx
      );
      return maxWidth;
    },
    []
  );

  const getTextWidthPdf = useCallback(
    (text: string, font: PdfFontName, size: number) => {
      if (!pageInfo || overlayScale === 0) {
        return Math.max(size * 2, DEFAULT_TEXT_WIDTH_RATIO * (pageInfo?.pageSize.width ?? 400));
      }

      const fontSizePx = size * overlayScale;
      const textWidthPx = measureTextWidthPx(text, font, fontSizePx);
      const bufferPx = Math.max(2, fontSizePx * TEXT_BOX_SIZE_BUFFER_RATIO);
      const paddingPdf = getTextBoxHorizontalPadding(size);
      return (textWidthPx + bufferPx) / overlayScale + paddingPdf * 2;
    },
    [measureTextWidthPx, overlayScale, pageInfo]
  );

  const triggerDownload = useCallback(
    (url: string) => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadName;
      anchor.rel = "noopener";
      anchor.click();
    },
    [downloadName]
  );

  const handlePdfSelect = async (file: File | null) => {
    if (!file) {
      return;
    }

    setUnsupportedFile(null);
    setIsLoadingPages(true);

    let bytes: Uint8Array;
    try {
      bytes = await convertFileToPdf(file);
    } catch (err) {
      if (err instanceof UnsupportedFileError) {
        setUnsupportedFile(err.file);
      }
      setError(copy.errors.invalidFile);
      setIsLoadingPages(false);
      return;
    }

    setPdfBytes(bytes);
    setPdfName(file.name);
    setOutputUrl(null);
    setPlacementByPage({});
    setTextByPage({});
    setSelectedText(null);
    setEditingText(null);
    setHiddenTextGuides({});
    setActiveOverlayTool("signature");
    setActivePage(1);
    setPageCount(0);
    setHistory([]);
    setError(null);

    try {
      const previewBytes = bytes.slice();
      const pdf = await getDocument({ data: previewBytes, ...PDFJS_OPTIONS }).promise;
      setPageCount(pdf.numPages);
      setActivePage(1);
      await pdf.destroy();
    } catch (err) {
      setError(copy.errors.loadPdf);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleSignaturePlacement = useCallback(
    (clientX: number, clientY: number) => {
      if (!pageInfo || !overlayRef.current) {
        return;
      }

      const rect = overlayRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const pdfX = (x / pageInfo.renderSize.width) * pageInfo.pageSize.width;
      const pdfY =
        pageInfo.pageSize.height -
        (y / pageInfo.renderSize.height) * pageInfo.pageSize.height;

      setPlacementByPage((prev) => ({ ...prev, [activePage]: { pdfX, pdfY } }));
      setOutputUrl(null);
      setError(null);
    },
    [activePage, pageInfo]
  );

  const handleOverlayPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!pageInfo) {
      return;
    }

    if (activeOverlayTool === "text") {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const { x: pdfX, y: pdfY } = canvasPointToPdfTopLeft(x, y, pageInfo);
      const textValue = copy.sign.textPlaceholder;
      const width = getTextWidthPdf(textValue, textDefaults.font, textDefaults.size);
      const boxHeight = getTextBoxHeight(textDefaults.size, textValue);
      const newItem: TextOverlay = {
        id: createOverlayId(),
        page: activePage,
        text: textValue,
        x: clamp(pdfX, 0, Math.max(0, pageInfo.pageSize.width - width)),
        y: clamp(pdfY, 0, Math.max(0, pageInfo.pageSize.height - boxHeight)),
        width,
        font: textDefaults.font,
        size: textDefaults.size,
        color: textDefaults.color,
        align: textDefaults.align
      };

      setTextByPage((prev) => ({
        ...prev,
        [activePage]: [...(prev[activePage] ?? []), newItem]
      }));
      setSelectedText({ id: newItem.id, page: activePage });
      setEditingText({ id: newItem.id, page: activePage });
      setOutputUrl(null);
      setError(null);
      return;
    }

    handleSignaturePlacement(event.clientX, event.clientY);
  };

  const handleOverlayPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pageInfo) {
      return;
    }

    const dragState = dragStateRef.current;
    if (dragState && dragState.pointerId === event.pointerId) {
      event.preventDefault();
      const scaleX = pageInfo.pageSize.width / pageInfo.renderSize.width;
      const scaleY = pageInfo.pageSize.height / pageInfo.renderSize.height;
      const deltaX = (event.clientX - dragState.startClientX) * scaleX;
      const deltaY = (event.clientY - dragState.startClientY) * scaleY;

      setTextByPage((prev) => {
        const items = prev[dragState.page] ?? [];
        const nextItems = items.map((item) => {
          if (item.id !== dragState.id) {
            return item;
          }
          const height = getTextBoxHeight(item.size, item.text);
          const maxX = Math.max(0, pageInfo.pageSize.width - item.width);
          const maxY = Math.max(0, pageInfo.pageSize.height - height);
          return {
            ...item,
            x: clamp(dragState.originX + deltaX, 0, maxX),
            y: clamp(dragState.originY + deltaY, 0, maxY)
          };
        });
        return { ...prev, [dragState.page]: nextItems };
      });

      setOutputUrl(null);
      setError(null);
      return;
    }

  };

  const handleOverlayPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!pageInfo) {
      return;
    }

    const dragState = dragStateRef.current;
    if (dragState && dragState.pointerId === event.pointerId) {
      dragStateRef.current = null;
      setDraggingTextId(null);
      return;
    }

  };

  const handleTextPointerDown = (event: PointerEvent<HTMLElement>, item: TextOverlay) => {
    event.stopPropagation();
    if (editingText?.id === item.id) {
      return;
    }
    event.preventDefault();
    setHiddenTextGuides((prev) => {
      if (!prev[item.id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    setActiveOverlayTool("text");
    setSelectedText({ id: item.id, page: activePage });
    setEditingText(null);
    setDraggingTextId(item.id);
    dragStateRef.current = {
      id: item.id,
      page: activePage,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: item.x,
      originY: item.y,
      pointerId: event.pointerId
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTextDoubleClick = (event: MouseEvent<HTMLDivElement>, item: TextOverlay) => {
    event.stopPropagation();
    setHiddenTextGuides((prev) => {
      if (!prev[item.id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    setSelectedText({ id: item.id, page: activePage });
    setEditingText({ id: item.id, page: activePage });
    setActiveOverlayTool("text");
  };

  const updateSelectedText = (updates: Partial<TextOverlay>) => {
    if (selectedText && selectedText.page === activePage) {
      setTextByPage((prev) => {
        const items = prev[selectedText.page] ?? [];
        const nextItems = items.map((item) => {
          if (item.id !== selectedText.id) {
            return item;
          }
          const nextItem = { ...item, ...updates };
          const nextWidth = getTextWidthPdf(nextItem.text, nextItem.font, nextItem.size);
          const nextHeight = getTextBoxHeight(nextItem.size, nextItem.text);
          if (!pageInfo) {
            return { ...nextItem, width: nextWidth };
          }
          const maxX = Math.max(0, pageInfo.pageSize.width - nextWidth);
          const maxY = Math.max(0, pageInfo.pageSize.height - nextHeight);
          return {
            ...nextItem,
            width: nextWidth,
            x: clamp(nextItem.x, 0, maxX),
            y: clamp(nextItem.y, 0, maxY)
          };
        });
        return { ...prev, [selectedText.page]: nextItems };
      });
    }

    setTextDefaults((prev) => ({ ...prev, ...updates }));
    setOutputUrl(null);
    setError(null);
  };

  const handleTextChange = (itemId: string, value: string) => {
    setTextByPage((prev) => {
      const items = prev[activePage] ?? [];
      const nextItems = items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const nextWidth = getTextWidthPdf(value, item.font, item.size);
        const nextHeight = getTextBoxHeight(item.size, value);
        if (!pageInfo) {
          return { ...item, text: value, width: nextWidth };
        }
        const maxX = Math.max(0, pageInfo.pageSize.width - nextWidth);
        const maxY = Math.max(0, pageInfo.pageSize.height - nextHeight);
        return {
          ...item,
          text: value,
          width: nextWidth,
          x: clamp(item.x, 0, maxX),
          y: clamp(item.y, 0, maxY)
        };
      });
      return { ...prev, [activePage]: nextItems };
    });
    setOutputUrl(null);
    setError(null);
  };

  const handleDeleteText = (itemId: string) => {
    setTextByPage((prev) => {
      const items = prev[activePage] ?? [];
      const nextItems = items.filter((item) => item.id !== itemId);
      return { ...prev, [activePage]: nextItems };
    });

    setHiddenTextGuides((prev) => {
      if (!prev[itemId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[itemId];
      return next;
    });

    if (selectedText?.id === itemId && selectedText.page === activePage) {
      setSelectedText(null);
    }
    if (editingText?.id === itemId && editingText.page === activePage) {
      setEditingText(null);
    }
    if (draggingTextId === itemId) {
      setDraggingTextId(null);
      dragStateRef.current = null;
    }

    setOutputUrl(null);
    setError(null);
  };

  const handleToolToggle = (tool: OverlayTool) => {
    setActiveOverlayTool((current) => (current === tool ? "signature" : tool));
    setEditingText(null);
  };

  const handleApplySignature = async () => {
    if (!pdfBytes || !pageInfo) {
      setError(copy.errors.signMissing);
      return;
    }

    if (!canApplySignature) {
      setError(copy.errors.signMissing);
      return;
    }

    setIsSigning(true);
    setError(null);
    setOutputUrl(null);

    try {
      const snapshot = pdfBytes.slice();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[activePage - 1];

      if (signatureDataUrl && signatureBox) {
        const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
        page.drawImage(signatureImage, {
          x: signatureBox.drawX,
          y: signatureBox.drawY,
          width: signatureBox.sigWidth,
          height: signatureBox.sigHeight
        });
      }

      const updatedBytes = await pdfDoc.save();
      setHistory((prev) => [...prev, snapshot]);
      setPdfBytes(updatedBytes);
    } catch (err) {
      setError(copy.errors.signFail);
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownloadEdits = async () => {
    if (outputUrl) {
      triggerDownload(outputUrl);
      return;
    }

    if (!canApplyEdits) {
      setError(copy.errors.signMissing);
      return;
    }

    if (!pdfBytes) {
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const exportScale = 2;

      for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        const pageNumber = index + 1;
        const { height: pageHeight } = page.getSize();

        const textItems = textByPage[pageNumber] ?? [];
        for (const item of textItems) {
          const lines = getTextLines(item.text);
          if (!lines.length || (lines.length === 1 && !lines[0])) {
            continue;
          }

          const boxHeight = getTextBoxHeight(item.size, item.text);
          const paddingXPdf = getTextBoxHorizontalPadding(item.size);
          const paddingYPdf = getTextBoxVerticalPadding(item.size);
          const paddingXPx = paddingXPdf * exportScale;
          const paddingYPx = paddingYPdf * exportScale;
          const pixelWidth = Math.max(1, Math.ceil(item.width * exportScale));
          const pixelHeight = Math.max(1, Math.ceil(boxHeight * exportScale));
          const contentWidthPx = Math.max(0, pixelWidth - paddingXPx * 2);

          if (typeof document === "undefined") {
            continue;
          }

          const canvas = document.createElement("canvas");
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
          const context = canvas.getContext("2d");
          if (!context) {
            continue;
          }

          context.clearRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = item.color;
          context.textBaseline = "top";
          context.font = `${item.size * exportScale}px ${FONT_FAMILY_BY_ID[item.font]}`;
          const lineHeightPx = getTextLineHeight(item.size) * exportScale;

          lines.forEach((line, lineIndex) => {
            const lineWidth = context.measureText(line).width;
            let drawX = paddingXPx;
            if (item.align === "center") {
              drawX = paddingXPx + (contentWidthPx - lineWidth) / 2;
            } else if (item.align === "right") {
              drawX = paddingXPx + (contentWidthPx - lineWidth);
            }
            const maxX = paddingXPx + Math.max(0, contentWidthPx - lineWidth);
            drawX = clamp(drawX, paddingXPx, maxX);
            context.fillText(line, drawX, paddingYPx + lineIndex * lineHeightPx);
          });

          const dataUrl = canvas.toDataURL("image/png");
          const textImage = await pdfDoc.embedPng(dataUrl);
          page.drawImage(textImage, {
            x: item.x,
            y: pageHeight - (item.y + boxHeight),
            width: item.width,
            height: boxHeight
          });
        }
      }

      const updatedBytes = await pdfDoc.save();
      const url = URL.createObjectURL(bytesToPdfBlob(updatedBytes));
      setOutputUrl(url);
      triggerDownload(url);
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
        setPdfBytes(previous);
        setOutputUrl(null);
        setError(null);
      }
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] landscape-stack">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft-md sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          <Button
            type="button"
            variant={activeOverlayTool === "signature" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolToggle("signature")}
            disabled={!pdfBytes || isLoadingPages}
          >
            {copy.sign.signatureToolbar}
            <PenTool className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={activeOverlayTool === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolToggle("text")}
            disabled={!pdfBytes || isLoadingPages}
          >
            {copy.sign.textToolbar}
            <Type className="h-4 w-4" />
          </Button>
        </div>

        {showTextOverlayPanel ? (
          <div
            className="mt-3 flex w-full flex-nowrap items-center gap-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
            title={copy.sign.textSettingsHint}
          >
            <span className="shrink-0 text-[11px] font-semibold text-slate-500">
              {copy.sign.textSettingsTitle}
            </span>
            <select
              className="h-8 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
              value={activeTextStyle.font}
              onChange={(event) =>
                updateSelectedText({ font: event.target.value as PdfFontName })
              }
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                {copy.sign.textSizeLabel}
              </span>
              <input
                type="range"
                min={10}
                max={64}
                step={1}
                value={activeTextStyle.size}
                onChange={(event) => updateSelectedText({ size: Number(event.target.value) })}
                className="w-24 accent-brand"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                {copy.sign.textColorLabel}
              </span>
              <input
                type="color"
                value={activeTextStyle.color}
                onChange={(event) => updateSelectedText({ color: event.target.value })}
                className="h-8 w-10 rounded-md border border-slate-200 bg-white"
              />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant={activeTextStyle.align === "left" ? "default" : "outline"}
                size="sm"
                className="h-7 px-2"
                onClick={() => updateSelectedText({ align: "left" })}
                aria-label={copy.sign.textAlignLeft}
                title={copy.sign.textAlignLeft}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={activeTextStyle.align === "center" ? "default" : "outline"}
                size="sm"
                className="h-7 px-2"
                onClick={() => updateSelectedText({ align: "center" })}
                aria-label={copy.sign.textAlignCenter}
                title={copy.sign.textAlignCenter}
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={activeTextStyle.align === "right" ? "default" : "outline"}
                size="sm"
                className="h-7 px-2"
                onClick={() => updateSelectedText({ align: "right" })}
                aria-label={copy.sign.textAlignRight}
                title={copy.sign.textAlignRight}
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            {!selectedTextItem ? (
              <span className="ml-auto shrink-0 text-[11px] text-slate-500">
                {copy.sign.textSelectHint}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5">
          {pdfBytes ? (
            <PdfCanvas
              data={pdfBytes}
              pageNumber={activePage}
              onPageInfo={(info) => setPageInfo(info)}
              overlay={
                <div
                  ref={overlayRef}
                  className={cn(
                    "absolute inset-0",
                    activeOverlayTool === "text" ? "cursor-text" : "cursor-crosshair"
                  )}
                  onPointerDown={handleOverlayPointerDown}
                  onPointerMove={handleOverlayPointerMove}
                  onPointerUp={handleOverlayPointerUp}
                  onPointerCancel={handleOverlayPointerUp}
                >
                  {pageInfo
                    ? activeTextItems.map((item) => {
                        const { x, y } = pdfTopLeftToCanvasPoint(item.x, item.y, pageInfo);
                        const isSelected = selectedText?.id === item.id && selectedText.page === activePage;
                        const isEditing = editingText?.id === item.id && editingText.page === activePage;
                        const isGuideHidden = Boolean(hiddenTextGuides[item.id]);
                        const boxHeight = getTextBoxHeight(item.size, item.text);
                        const paddingX = getTextBoxHorizontalPadding(item.size) * overlayScale;
                        const paddingY = getTextBoxVerticalPadding(item.size) * overlayScale;
                        return (
                          <div
                            key={item.id}
                            onPointerDown={(event) => handleTextPointerDown(event, item)}
                            onDoubleClick={(event) => handleTextDoubleClick(event, item)}
                            className={cn(
                              "absolute z-20 box-border rounded-md group",
                              isGuideHidden
                                ? "border border-transparent bg-transparent"
                                : "border border-slate-300/70 bg-white/5",
                              isEditing ? "cursor-text" : "cursor-move",
                              !isGuideHidden && isSelected ? "border-brand/70 ring-2 ring-brand/40" : null,
                              !isGuideHidden ? "hover:border-brand/50" : null,
                              draggingTextId === item.id ? "opacity-80" : null
                            )}
                            style={{
                              left: x,
                              top: y,
                              width: item.width * overlayScale,
                              height: boxHeight * overlayScale,
                              padding: `${paddingY}px ${paddingX}px`,
                              color: item.color,
                              fontFamily: FONT_FAMILY_BY_ID[item.font],
                              fontSize: item.size * overlayScale,
                              lineHeight: `${getTextLineHeight(item.size) * overlayScale}px`,
                              textAlign: item.align,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word"
                            }}
                          >
                            {!isGuideHidden ? (
                              <div
                                className={cn(
                                  "absolute left-1/2 top-0 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-0.5 shadow-sm transition",
                                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}
                              >
                                <button
                                  type="button"
                                  onPointerDown={(event) => {
                                    event.stopPropagation();
                                    handleTextPointerDown(event, item);
                                  }}
                                  className="flex h-6 w-6 cursor-grab items-center justify-center rounded-full text-slate-500 transition hover:text-slate-700 active:cursor-grabbing"
                                  aria-label={copy.sign.textMoveAria}
                                >
                                  <GripVertical className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(event) => event.stopPropagation()}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setHiddenTextGuides((prev) => ({
                                      ...prev,
                                      [item.id]: true
                                    }));
                                    if (selectedText?.id === item.id && selectedText.page === activePage) {
                                      setSelectedText(null);
                                    }
                                    if (editingText?.id === item.id && editingText.page === activePage) {
                                      setEditingText(null);
                                    }
                                  }}
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-700"
                                  aria-label={copy.sign.textHideAria}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(event) => event.stopPropagation()}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteText(item.id);
                                  }}
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-700"
                                  aria-label={copy.sign.textDeleteAria}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : null}
                            {isEditing ? (
                              <textarea
                                ref={textEditRef}
                                value={item.text}
                                rows={getTextLines(item.text).length}
                                onChange={(event) => handleTextChange(item.id, event.target.value)}
                                onPointerDown={(event) => event.stopPropagation()}
                                onBlur={() => setEditingText(null)}
                                onKeyDown={(event) => {
                                  if (event.key === "Escape") {
                                    setEditingText(null);
                                  }
                                }}
                                className="h-full w-full resize-none rounded-sm border-0 bg-white/80 p-0 outline-none shadow-none overflow-hidden"
                                style={{
                                  color: item.color,
                                  fontFamily: FONT_FAMILY_BY_ID[item.font],
                                  fontSize: item.size * overlayScale,
                                  lineHeight: `${getTextLineHeight(item.size) * overlayScale}px`,
                                  textAlign: item.align,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word"
                                }}
                              />
                            ) : (
                              <div className="pointer-events-none">{item.text}</div>
                            )}
                          </div>
                        );
                      })
                    : null}

                  {signatureBox ? (
                    <div
                      className="pointer-events-none absolute z-30 rounded-xl border-2 border-dashed border-brand"
                      style={{
                        left: signatureBox.canvasLeft,
                        top: signatureBox.canvasTop,
                        width: signatureBox.canvasWidth,
                        height: signatureBox.canvasHeight
                      }}
                    />
                  ) : null}
                  {signatureDataUrl && !currentPlacement ? (
                    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                      <div className="rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-soft-md">
                        {copy.sign.previewHint}
                      </div>
                    </div>
                  ) : null}
                </div>
              }
            />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500 sm:h-[420px]">
              <FileUp className="h-8 w-8 text-slate-400" />
              {copy.sign.emptyPreview}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start landscape-unset">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft-md sm:p-6">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft-md sm:p-6">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft-md sm:p-6">
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

          {!canApplyEdits && !error ? (
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
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDownloadEdits()}
              disabled={!canDownload || isSigning}
            >
              {copy.sign.downloadSigned}
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {unsupportedFile ? (
        <UnsupportedFileModal
          file={unsupportedFile}
          copy={copy.unsupportedFile}
          onClose={() => setUnsupportedFile(null)}
        />
      ) : null}
    </div>
  );
}

type UnsupportedFileCopy = (typeof editorCopy)[Locale]["unsupportedFile"];

function UnsupportedFileModal({
  file,
  copy,
  onClose
}: {
  file: File;
  copy: UnsupportedFileCopy;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-labelledby="unsupported-file-title"
      aria-describedby="unsupported-file-description"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft-lg">
        <p id="unsupported-file-title" className="text-sm font-semibold text-slate-900">
          {copy.title}
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{file.name}</p>
        <p id="unsupported-file-description" className="mt-3 text-sm text-slate-600">
          {copy.description}
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
          {copy.supportedFormats}
        </p>
        <div className="mt-6 flex justify-end">
          <Button size="sm" onClick={onClose}>
            {copy.action}
          </Button>
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
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {copy.header.back}
              </Link>
            </Button>
          </div>
          <div className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-900 sm:w-auto">
            <Layers className="h-4 w-4 text-brand" />
            {copy.header.title}
            <LocaleSwitcher className="ml-2 sm:hidden" />
          </div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <LocaleSwitcher className="hidden shrink-0 sm:flex" />
            <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
              {copy.header.subtitle}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">{copy.hero.eyebrow}</p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
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
