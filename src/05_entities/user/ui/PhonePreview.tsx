"use client";

import { formatPhone } from "@shared/lib/phone";
import { ErrorIcon } from "@shared/ui/ActionIcons";
import Icon from "@shared/ui/Icon";

interface PhonePreviewProps {
  phone: string;
  verified: boolean;
  onClick?: () => void;
}

function PhoneChevron() {
  return (
    <span className="absolute flex size-8 items-center justify-center rounded-s bg-background-none opacity-0 transition-opacity group-hover:opacity-100">
      <Icon name="chevron_right" className="text-[20px] text-symb-primary" />
    </span>
  );
}

export default function PhonePreview({ phone, verified, onClick }: PhonePreviewProps) {
  const displayPhone = formatPhone(phone);

  if (verified) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex h-12 w-full items-center justify-between rounded-m bg-background-med px-4 text-left text-s text-symb-secondary transition-colors hover:bg-neutral-min"
      >
        <span>{displayPhone}</span>
        <span className="relative ml-4 flex size-8 shrink-0 items-center justify-center">
          <PhoneChevron />
        </span>
      </button>
    );
  }

  return (
    <div className="grid w-full gap-1">
      <button
        type="button"
        onClick={onClick}
        className="group flex h-12 w-full items-center justify-between rounded-m bg-background-error px-4 text-left text-s text-symb-primary transition-colors hover:bg-neutral-min"
      >
        <span>{displayPhone}</span>
        <span className="relative ml-4 flex size-8 shrink-0 items-center justify-center">
          <span className="absolute opacity-100 transition-opacity group-hover:opacity-0">
            <ErrorIcon />
          </span>
          <PhoneChevron />
        </span>
      </button>
      <div className="rounded-m bg-background-med px-4 py-2 text-s text-symb-primary">
        Требуется подтверждение
      </div>
    </div>
  );
}
