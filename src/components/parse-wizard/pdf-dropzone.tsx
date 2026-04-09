"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type PdfDropzoneProps = {
  id?: string;
  disabled?: boolean;
  accept?: string;
  descriptionId?: string;
  onPickFile: (file: File) => void;
  onInvalidFile: (message: string) => void;
};

function isPdfFile(file: File) {
  if (file.type === "application/pdf") return true;
  return file.name.toLowerCase().endsWith(".pdf");
}

export function PdfDropzone({
  id = "pdf-file-input",
  disabled = false,
  accept = "application/pdf",
  descriptionId,
  onPickFile,
  onInvalidFile,
}: PdfDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const pick = React.useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-xl border bg-card/50 p-5 text-center transition-colors",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isDragOver ? "border-primary/60 bg-primary/5" : "border-border",
          disabled && "pointer-events-none opacity-60",
        )}
        style={{ borderStyle: "dashed" }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={descriptionId}
        onClick={pick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (disabled) return;
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (disabled) return;
          const f = e.dataTransfer.files?.[0];
          if (!f) return;
          if (!isPdfFile(f)) {
            onInvalidFile("Please drop a PDF file.");
            return;
          }
          onPickFile(f);
        }}
      >
        <div className="text-sm font-medium">Drag & drop your PDF here</div>
        <div className="mt-1 text-xs text-muted-foreground">
          or{" "}
          <span className="font-medium text-primary underline underline-offset-4">choose a file</span>
        </div>
      </div>

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (!isPdfFile(f)) {
            onInvalidFile("Please choose a PDF file.");
            e.target.value = "";
            return;
          }
          onPickFile(f);
        }}
      />
    </div>
  );
}
