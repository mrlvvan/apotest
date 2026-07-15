"use client";

import type { ReactNode } from "react";
import { cn } from "@shared/lib/utils/css";

const sizeClasses = {
  back: "h-[36px] w-[44px] bg-background-med",
  action: "h-[40px] w-[52px] bg-background-none",
} as const;

type RectIconButtonSize = keyof typeof sizeClasses;

interface RectIconButtonProps {
  alt: string;
  onClick?: () => void;
  className?: string;
  size?: RectIconButtonSize;
  children: ReactNode;
}

export default function RectIconButton({
  alt,
  onClick,
  className,
  size = "action",
  children,
}: RectIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={alt}
      onClick={onClick}
      className={cn(
        "box-border flex shrink-0 items-center justify-center rounded-m border border-stroke-med p-0 text-symb-secondary hover:border-stroke-max",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
