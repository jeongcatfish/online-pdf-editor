"use client";

import { createContext, useContext, useMemo, useState } from "react";

type PdfFilesContextValue = {
  files: File[];
  setFiles: (files: File[]) => void;
  clearFiles: () => void;
};

const PdfFilesContext = createContext<PdfFilesContextValue | null>(null);

export function PdfFilesProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);

  const value = useMemo(
    () => ({
      files,
      setFiles,
      clearFiles: () => setFiles([])
    }),
    [files]
  );

  return <PdfFilesContext.Provider value={value}>{children}</PdfFilesContext.Provider>;
}

export function usePdfFiles() {
  const context = useContext(PdfFilesContext);
  if (!context) {
    throw new Error("usePdfFiles must be used within PdfFilesProvider");
  }
  return context;
}
