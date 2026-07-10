import { cn } from "@shared/lib/utils/css";

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
}

export default function Icon({ name, className, fill = false }: IconProps) {
  return (
    <span aria-hidden className={cn("icon text-[20px]", fill && "icon-fill", className)}>
      {name}
    </span>
  );
}
