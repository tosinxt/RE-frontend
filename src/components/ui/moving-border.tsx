"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MovingBorderButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  containerClassName?: string;
};

export function MovingBorderButton({
  className,
  containerClassName,
  children,
  ...props
}: MovingBorderButtonProps) {
  const id = useId();

  return (
    <div className={cn("relative inline-flex", containerClassName)}>
      <motion.div
        aria-hidden="true"
        className="absolute -inset-[1px] rounded-[var(--radius-sm)] opacity-90"
        style={{
          background:
            "linear-gradient(90deg, rgba(83,58,253,0.0), rgba(83,58,253,0.9), rgba(249,107,238,0.65), rgba(83,58,253,0.0))",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPositionX: ["0%", "200%"] }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      <button
        {...props}
        className={cn(
          "relative z-10 inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--brand-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        data-moving-border={id}
      >
        {children}
      </button>
    </div>
  );
}

