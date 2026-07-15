"use client";

import Image from "next/image";
import { cn } from "@shared/lib/utils/css";

interface RectIconButtonProps {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
  iconSize?: number;
}

export default function RectIconButton({
  src,
  alt,
  onClick,
  className,
  iconSize = 16,
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
      <Image src={src} alt="" width={iconSize} height={iconSize} aria-hidden />
    </button>
  );
}
