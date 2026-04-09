"use client";

import React from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

// Lightweight Spotlight background (Aceternity-inspired).
export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  return (
    <svg
      className={cn("pointer-events-none absolute z-0", className)}
      width="100%"
      height="100%"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="spotlight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fill} stopOpacity="0.25" />
          <stop offset="40%" stopColor={fill} stopOpacity="0.08" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="1000" fill="url(#spotlight)" />
    </svg>
  );
}

