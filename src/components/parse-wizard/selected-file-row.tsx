"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export type SelectedFileRowProps = {
  file: File;
  disabled?: boolean;
  onRemove: () => void;
};

export function SelectedFileRow({ file, disabled = false, onRemove }: SelectedFileRowProps) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium">{file.name}</div>
          <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label="Remove selected file"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
