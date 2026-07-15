"use client";

import type { ReactNode } from "react";
import { cn } from "@shared/lib/utils/css";

interface RectIconButtonProps {
  alt: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

export default function RectIconButton({
  alt,
  onClick,
  className,
  children,
}: RectIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={alt}
      onClick={onClick}
      className={cn(
        "flex h-10 w-[52px] items-center justify-center rounded-m border border-stroke-med bg-background-none text-symb-secondary hover:border-stroke-max",
        className,
      )}
    >
      {children}
    </button>
  );
}
