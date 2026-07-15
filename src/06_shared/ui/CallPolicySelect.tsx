"use client";

import { useState } from "react";
import { cn } from "@shared/lib/utils/css";
import Icon from "@shared/ui/Icon";

interface CallPolicySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CallPolicySelect({ value, onChange }: CallPolicySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["Не беспокоить", "Можно звонить"];

  return (
    <div className="relative w-full min-w-0 max-w-48">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-m bg-background-med px-3 text-left text-s text-symb-primary",
          "transition-colors duration-300 ease-in-out hover:bg-neutral-min",
          isOpen && "bg-background-med",
        )}
      >
        <span className="min-w-0 truncate">{value}</span>
        <Icon
          name={isOpen ? "unfold_less" : "unfold_more"}
          className="text-symb-secondary"
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-m bg-background-none py-1 shadow-[0_10px_28px_rgba(8,20,35,0.08)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={cn(
                "flex h-9 w-full items-center px-4 text-left text-s text-symb-primary hover:bg-background-med",
                option === value && "bg-background-med",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
