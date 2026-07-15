"use client";

import { normalizeTimeInput } from "@shared/lib/schedule";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeInput({ value, onChange }: TimeInputProps) {
  return (
    <input
      value={value}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={5}
      onChange={(event) => onChange(normalizeTimeInput(event.target.value))}
      className="h-10 w-16 rounded-m border border-stroke-med bg-background-none px-2 text-center text-l text-symb-primary outline-none transition-colors focus:border-stroke-active"
    />
  );
}
