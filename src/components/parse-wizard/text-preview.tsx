"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TextPreviewProps = {
  text: string;
  defaultCollapsed?: boolean;
  previewChars?: number;
  className?: string;
};

export function TextPreview({
  text,
  defaultCollapsed = true,
  previewChars = 2000,
  className,
}: TextPreviewProps) {
  const [expanded, setExpanded] = React.useState(!defaultCollapsed);
  const effectiveText = expanded ? text : text.slice(0, previewChars);
  const isTruncated = text.length > previewChars;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(effectiveText);
          }}
        >
          Copy {expanded ? "text" : "preview"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "extracted.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download text
        </Button>
        {isTruncated && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        )}
      </div>

      <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-background p-3 text-xs leading-5 whitespace-pre-wrap text-foreground/80">
        {effectiveText}
        {!expanded && isTruncated ? "\n\n…(preview truncated)" : ""}
      </pre>
    </div>
  );
}
