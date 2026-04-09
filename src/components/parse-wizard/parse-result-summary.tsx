"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ParsedPdf = {
  text: string;
  totalPages: number;
  source: "embedded-text" | "ocr" | "none";
};

function pillTone(source: ParsedPdf["source"]) {
  switch (source) {
    case "embedded-text":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "ocr":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "none":
      return "bg-muted text-muted-foreground";
  }
}

function sourceLabel(source: ParsedPdf["source"]) {
  switch (source) {
    case "embedded-text":
      return "Embedded text";
    case "ocr":
      return "OCR";
    case "none":
      return "No text";
  }
}

export function ParseResultSummary({ result }: { result: ParsedPdf }) {
  const chars = result.text?.length ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full border border-border bg-background px-2.5 py-1 tabular-nums">
        Pages: {result.totalPages}
      </span>
      <span className={cn("rounded-full px-2.5 py-1", pillTone(result.source))}>
        {sourceLabel(result.source)}
      </span>
      <span className="rounded-full border border-border bg-background px-2.5 py-1 tabular-nums">
        Chars: {chars.toLocaleString("en-US")}
      </span>
    </div>
  );
}
