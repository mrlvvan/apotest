"use client";

import { useState } from "react";
import { cn } from "@shared/lib/utils/css";
import Icon from "@shared/ui/Icon";

interface DrawerSelectProps {
  value: string;
  placeholder: string;
  invalid?: boolean;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
}

export default function DrawerSelect({
  value,
  placeholder,
  invalid = false,
  options,
  onSelect,
}: DrawerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-m border bg-background-none px-4 text-left text-l",
          "transition-colors duration-300 ease-in-out",
          invalid
            ? "border-stroke-error text-symb-secondary"
            : "border-stroke-med text-symb-primary hover:border-stroke-max",
          isOpen && "border-stroke-active",
        )}
      >
        <span>{value || placeholder}</span>
        <Icon
          name={isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          className="text-symb-secondary"
        />
      </button>

      {invalid ? (
        <span className="text-xs text-symb-error">Обязательное поле</span>
      ) : null}

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-44 overflow-y-auto rounded-m bg-background-none py-2 text-s text-symb-primary shadow-[0_10px_28px_rgba(8,20,35,0.08)]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex h-9 w-full items-center px-4 text-left transition-colors hover:bg-background-med",
                option.label === value && "bg-background-med",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
