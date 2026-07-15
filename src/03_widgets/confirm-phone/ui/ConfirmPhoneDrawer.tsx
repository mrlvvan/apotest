"use client";

import { useRef, useState } from "react";
import { formatPhone } from "@shared/lib/phone";
import Button from "@shared/ui/Button";
import DrawerHeader from "@shared/ui/DrawerHeader";
import { cn } from "@shared/lib/utils/css";

interface ConfirmPhoneDrawerProps {
  phone: string;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ConfirmPhoneDrawer({
  phone,
  onBack,
  onConfirm,
}: ConfirmPhoneDrawerProps) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [hasError, setHasError] = useState(false);
  const joinedCode = code.join("");
  const canSubmit = joinedCode.length === 4 && !hasError;
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function updateCode(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setCode((current) => current.map((item, i) => (i === index ? "" : item)));
      return;
    }

    setCode((current) => {
      const next = [...current];
      const chars = digits.slice(0, 4 - index).split("");
      chars.forEach((char, offset) => {
        next[index + offset] = char;
      });
      return next;
    });
    setHasError(false);

    const nextIndex = Math.min(index + digits.length, 3);
    inputsRef.current[nextIndex]?.focus();
  }

  function submitCode() {
    if (joinedCode === "1111") {
      onConfirm();
      return;
    }

    setHasError(true);
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8 pt-12">
      <DrawerHeader title="Подтвердить номер" back onBack={onBack} onClose={onBack} />

      <div className="mx-auto mt-8 grid w-[220px] justify-items-center gap-8 text-center">
        <p className="text-l leading-[1.35] text-symb-primary">
          Отправили код подтверждения на номер {formatPhone(phone || "+79986732134")}
        </p>

        <div className="flex gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              value={digit}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              onChange={(event) => updateCode(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !code[index] && index > 0) {
                  inputsRef.current[index - 1]?.focus();
                }
              }}
              className={cn(
                "size-14 rounded-m border bg-background-none text-center text-h1 outline-none transition-colors",
                hasError
                  ? "border-stroke-error text-symb-error"
                  : "border-stroke-med text-symb-primary focus:border-stroke-active",
              )}
            />
          ))}
        </div>

        <Button
          className="w-full"
          disabled={!canSubmit}
          size="M"
          variant="primary"
          onClick={submitCode}
        >
          Подтвердить
        </Button>

        {hasError ? (
          <Button className="w-full" disabled size="M" variant="tertiary">
            Отправить код снова&nbsp; 02:56
          </Button>
        ) : null}
      </div>
    </div>
  );
}
