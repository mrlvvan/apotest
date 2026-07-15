import { cn } from "@shared/lib/utils/css";

interface ActionIconProps {
  className?: string;
}

export function BackIcon({ className }: ActionIconProps) {
  return (
    <img
      src="/icons/back.svg"
      alt=""
      aria-hidden
      className={cn("block h-[10px] w-[14px] shrink-0", className)}
    />
  );
}

export function PlusIcon({ className }: ActionIconProps) {
  return (
    <img
      src="/icons/plus.svg"
      alt=""
      aria-hidden
      className={cn("block h-[10px] w-[10px] shrink-0", className)}
    />
  );
}

export function DeleteIcon({ className }: ActionIconProps) {
  return (
    <img
      src="/icons/delete.svg"
      alt=""
      aria-hidden
      className={cn("block h-[14px] w-[13px] shrink-0", className)}
    />
  );
}

export function ErrorIcon({ className }: ActionIconProps) {
  return (
    <img
      src="/icons/error.svg"
      alt=""
      aria-hidden
      className={cn("block h-[16px] w-[16px] shrink-0", className)}
    />
  );
}
