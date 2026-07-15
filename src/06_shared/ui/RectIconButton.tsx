"use client";

import { cn } from "@shared/lib/utils/css";

interface RectIconButtonProps {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
  iconWidth?: number;
  iconHeight?: number;
}

export default function RectIconButton({
  src,
  alt,
  onClick,
  className,
  iconWidth = 16,
  iconHeight = 16,
}: RectIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={alt}
      onClick={onClick}
      className={cn(
        "flex h-10 w-[52px] items-center justify-center rounded-m border border-stroke-med bg-background-none hover:border-stroke-max",
        className,
      )}
    >
      <img
        src={src}
        alt=""
        width={iconWidth}
        height={iconHeight}
        aria-hidden
        className="block shrink-0"
      />
    </button>
  );
}
