"use client";

import { formatPhone } from "@shared/lib/phone";
import Icon from "@shared/ui/Icon";

interface PhonePreviewProps {
  phone: string;
  verified: boolean;
  onClick?: () => void;
}

export default function PhonePreview({ phone, verified, onClick }: PhonePreviewProps) {
  const displayPhone = formatPhone(phone);

  if (verified) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="h-12 w-full rounded-m bg-background-med px-4 text-left text-s text-symb-secondary transition-colors hover:bg-neutral-min"
      >
        {displayPhone}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group grid w-full gap-1 overflow-hidden rounded-m text-left text-s"
    >
      <span className="flex h-12 items-center justify-between rounded-m bg-background-error px-4 text-symb-primary transition-colors group-hover:bg-neutral-min">
        <span>{displayPhone}</span>
        <Icon name="info" className="text-[18px] text-symb-primary" />
      </span>
      <span className="rounded-m bg-background-med px-4 py-2 text-s text-symb-primary transition-colors group-hover:bg-neutral-min">
        Требуется подтверждение
      </span>
    </button>
  );
}
