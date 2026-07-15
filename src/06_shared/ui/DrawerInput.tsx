"use client";

import { cn } from "@shared/lib/utils/css";

interface DrawerInputProps {
  value: string;
  placeholder?: string;
  error?: string;
  inputMode?: "text" | "numeric";
  maxLength?: number;
  pattern?: string;
  normalizeValue?: (value: string) => string;
  onChange: (value: string) => void;
}

export default function DrawerInput({
  value,
  placeholder,
  error,
  inputMode = "text",
  maxLength,
  pattern,
  normalizeValue,
  onChange,
}: DrawerInputProps) {
  return (
    <label className="grid gap-1">
      <input
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={pattern}
        onChange={(event) =>
          onChange(normalizeValue?.(event.target.value) ?? event.target.value)
        }
        className={cn(
          "h-12 rounded-m border bg-background-none px-4 text-l text-symb-primary outline-none transition-colors placeholder:text-symb-secondary",
          error ? "border-stroke-error" : "border-stroke-med focus:border-stroke-active",
        )}
      />
      {error ? <span className="text-m text-symb-error">{error}</span> : null}
    </label>
  );
}
