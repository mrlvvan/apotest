import type { CSSProperties } from "react";
import { cn } from "@shared/lib/utils/css";

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
  style?: CSSProperties;
  size?: number;
}

export default function Icon({
  name,
  className,
  fill = false,
  style,
  size,
}: IconProps) {
  const sizeStyle =
    size !== undefined
      ? {
          fontSize: size,
          width: size,
          height: size,
          ...style,
        }
      : style;

  return (
    <span
      aria-hidden
      style={sizeStyle}
      className={cn("icon", size === undefined && "text-[20px]", fill && "icon-fill", className)}
    >
      {name}
    </span>
  );
}
