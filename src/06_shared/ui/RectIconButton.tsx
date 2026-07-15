"use client";

import type { ReactNode } from "react";
import { cn } from "@shared/lib/utils/css";

interface RectIconButtonProps {
  alt: string;
  onClick?: () => void;
  className?: string;
  width?: number;
  height?: number;
  children: ReactNode;
}

export default function RectIconButton({
  alt,
  onClick,
  className,
  width = 52,
  height = 40,
  children,
}: RectIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={alt}
      onClick={onClick}
      style={{ width, height }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-m border border-stroke-med bg-background-none text-symb-secondary hover:border-stroke-max",
        className,
      )}
    >
      {children}
    </button>
  );
}
